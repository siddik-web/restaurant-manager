// api.js — Centralized API client for Restaurant POS

import {
    denormalizeEntity,
    denormalizeSettings,
    extractList,
    normalizeResponseData,
} from './transform.js';

const API_BASE = '/api';
const LIST_PAGE_SIZE = 500;

class ApiClient {
    constructor() {
        this.queue = JSON.parse(localStorage.getItem('api_request_queue') || '[]');
        this.isOnline = navigator.onLine;
        this.connectionStatus = 'unknown';
        this.connectionMessage = '';
        this._listeners = new Set();

        window.addEventListener('online', this.handleOnline.bind(this));
        window.addEventListener('offline', this.handleOffline.bind(this));
    }

    onStatusChange(callback) {
        this._listeners.add(callback);
        return () => this._listeners.delete(callback);
    }

    _setStatus(status, message = '') {
        this.connectionStatus = status;
        this.connectionMessage = message;
        this._listeners.forEach((listener) => listener(status, message));
    }

    handleOnline() {
        this.isOnline = true;
        this.checkConnection();
        this.syncQueue();
    }

    handleOffline() {
        this.isOnline = false;
        this._setStatus('offline', 'Browser is offline. Showing cached data only.');
    }

    async checkConnection() {
        if (!navigator.onLine) {
            this._setStatus('offline', 'Browser is offline. Showing cached data only.');
            return false;
        }

        try {
            const response = await fetch(`${API_BASE}/health`, {
                method: 'GET',
                headers: { Accept: 'application/json' },
            });

            if (!response.ok) {
                throw new Error(`API health check failed (${response.status})`);
            }

            this._setStatus('connected', 'Connected to server');
            return true;
        } catch (error) {
            this._setStatus(
                'unavailable',
                'Cannot reach the API. Start the backend (Docker: docker compose up, or see README).'
            );
            return false;
        }
    }

    canUseLocalFallback() {
        return !navigator.onLine || this.connectionStatus === 'offline';
    }

    async request(method, url, data = null, options = {}) {
        const httpMethod = method.toLowerCase();

        if (!this.isOnline) {
            const token = localStorage.getItem('restaurant_token');
            const userObj = JSON.parse(localStorage.getItem('restaurant_user') || '{}');
            const userId = userObj ? userObj.id : null;

            this.queue.push({ 
                method: httpMethod, 
                url, 
                data, 
                options, 
                timestamp: Date.now(),
                token,
                userId
            });
            localStorage.setItem('api_request_queue', JSON.stringify(this.queue));

            if (httpMethod === 'get') {
                return this.localGet(url);
            }

            return { success: false, offline: true };
        }

        try {
            const token = localStorage.getItem('restaurant_token');
            const headers = {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                ...options.headers,
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const fetchOptions = {
                method: httpMethod.toUpperCase(),
                headers,
            };

            if (data !== null && data !== undefined) {
                const payload = options.skipTransform ? data : denormalizeEntity(url, data);
                fetchOptions.body = JSON.stringify(payload);
            }

            const response = await fetch(API_BASE + url, fetchOptions);
            let result;

            try {
                result = await response.json();
            } catch {
                throw new Error(`Invalid JSON response from ${url}`);
            }

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('restaurant_token');
                    localStorage.removeItem('restaurant_user');
                    window.dispatchEvent(new CustomEvent('auth:logout'));
                }
                throw new Error(result.message || `API error (${response.status})`);
            }

            if (result.data !== undefined && !options.skipTransform) {
                result.data = normalizeResponseData(url, result.data);
            }

            if (this.connectionStatus !== 'connected') {
                this._setStatus('connected', 'Connected to server');
            }

            return result;
        } catch (error) {
            if (!navigator.onLine) {
                this._setStatus('offline', 'Browser is offline. Showing cached data only.');
                const token = localStorage.getItem('restaurant_token');
                const userObj = JSON.parse(localStorage.getItem('restaurant_user') || '{}');
                const userId = userObj ? userObj.id : null;

                this.queue.push({ 
                    method: httpMethod, 
                    url, 
                    data, 
                    options, 
                    timestamp: Date.now(),
                    token,
                    userId
                });
                localStorage.setItem('api_request_queue', JSON.stringify(this.queue));

                if (httpMethod === 'get') {
                    return this.localGet(url);
                }

                return { success: false, offline: true };
            }

            if (this.connectionStatus === 'connected') {
                this._setStatus('unavailable', error.message || 'API request failed');
            }

            throw error;
        }
    }

    async syncQueue() {
        if (!this.isOnline || !this.queue.length) return;

        const currentToken = localStorage.getItem('restaurant_token');
        const currentUserObj = JSON.parse(localStorage.getItem('restaurant_user') || '{}');
        const currentUserId = currentUserObj ? currentUserObj.id : null;

        const queueCopy = [...this.queue];
        this.queue = [];

        for (const req of queueCopy) {
            if (req.userId && req.userId !== currentUserId) {
                // Keep requests of other users in the queue
                this.queue.push(req);
                continue;
            }

            try {
                const useToken = req.token || currentToken;
                const reqOptions = {
                    ...req.options,
                    headers: {
                        ...req.options?.headers,
                        'Authorization': `Bearer ${useToken}`
                    }
                };
                await this.request(req.method, req.url, req.data, reqOptions);
            } catch {
                this.queue.push(req);
            }
        }

        localStorage.setItem('api_request_queue', JSON.stringify(this.queue));
    }

    localGet(url) {
        const read = (key, fallback) => {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        };

        if (url.startsWith('/recipes')) {
            return { success: true, offline: true, data: read('restaurant_recipes', []) };
        }
        if (url.startsWith('/orders')) {
            return { success: true, offline: true, data: read('restaurant_orders', []) };
        }
        if (url.startsWith('/tables')) {
            return { success: true, offline: true, data: read('restaurant_tables', []) };
        }
        if (url.startsWith('/chefs')) {
            return { success: true, offline: true, data: read('restaurant_chefs', []) };
        }
        if (url.startsWith('/stations')) {
            return { success: true, offline: true, data: read('restaurant_stations', []) };
        }
        if (url.startsWith('/settings')) {
            return { success: true, offline: true, data: read('restaurant_settings', {}) };
        }
        if (url.startsWith('/inventory')) {
            return { success: true, offline: true, data: read('restaurant_inventory', []) };
        }
        if (url.startsWith('/suppliers')) {
            return { success: true, offline: true, data: read('restaurant_suppliers', []) };
        }
        if (url.startsWith('/purchases')) {
            return { success: true, offline: true, data: read('restaurant_purchases', []) };
        }
        if (url.startsWith('/waste')) {
            return { success: true, offline: true, data: read('restaurant_waste', []) };
        }

        return { success: false, offline: true, data: null };
    }

    listParams(params = {}) {
        return { per_page: LIST_PAGE_SIZE, ...params };
    }

    unwrapList(response) {
        return extractList(response.data);
    }

    // Recipes
    getRecipes(params = {}) {
        return this.request('get', `/recipes?${new URLSearchParams(this.listParams(params))}`);
    }
    getRecipe(id) {
        return this.request('get', `/recipes/${id}`);
    }
    createRecipe(data) {
        return this.request('post', '/recipes', data);
    }
    updateRecipe(id, data) {
        return this.request('put', `/recipes/${id}`, data);
    }
    deleteRecipe(id) {
        return this.request('delete', `/recipes/${id}`);
    }

    // Orders
    getOrders(params = {}) {
        return this.request('get', `/orders?${new URLSearchParams(this.listParams(params))}`);
    }
    getOrder(id) {
        return this.request('get', `/orders/${id}`);
    }
    createOrder(data) {
        return this.request('post', '/orders', data);
    }
    updateOrder(id, data) {
        return this.request('put', `/orders/${id}`, data);
    }
    deleteOrder(id) {
        return this.request('delete', `/orders/${id}`);
    }

    // Tables
    getTables(params = {}) {
        return this.request('get', `/tables?${new URLSearchParams(this.listParams(params))}`);
    }
    getTable(id) {
        return this.request('get', `/tables/${id}`);
    }
    createTable(data) {
        return this.request('post', '/tables', data);
    }
    updateTable(id, data) {
        return this.request('put', `/tables/${id}`, data);
    }
    deleteTable(id) {
        return this.request('delete', `/tables/${id}`);
    }

    // Chefs
    getChefs(params = {}) {
        return this.request('get', `/chefs?${new URLSearchParams(this.listParams(params))}`);
    }
    createChef(data) {
        return this.request('post', '/chefs', data);
    }
    updateChef(id, data) {
        return this.request('put', `/chefs/${id}`, data);
    }
    deleteChef(id) {
        return this.request('delete', `/chefs/${id}`);
    }

    // Stations
    getStations(params = {}) {
        return this.request('get', `/stations?${new URLSearchParams(this.listParams(params))}`);
    }
    createStation(data) {
        return this.request('post', '/stations', data);
    }
    updateStation(id, data) {
        return this.request('put', `/stations/${id}`, data);
    }
    deleteStation(id) {
        return this.request('delete', `/stations/${id}`);
    }

    // Settings
    getRestaurantSettings() {
        return this.request('get', '/settings/restaurant');
    }
    updateSettings(data) {
        return this.request('post', '/settings/restaurant', denormalizeSettings(data), { skipTransform: true });
    }

    cacheToLocalStorage(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }
}

const api = new ApiClient();
export default api;
