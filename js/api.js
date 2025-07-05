// api.js
// Centralized API utility for Restaurant POS

const API_BASE = '/api'; // Adjust if your API is on a different base path

class ApiClient {
    constructor() {
        this.queue = JSON.parse(localStorage.getItem('api_request_queue') || '[]');
        this.isOnline = navigator.onLine;
        window.addEventListener('online', this.handleOnline.bind(this));
        window.addEventListener('offline', this.handleOffline.bind(this));
    }

    handleOnline() {
        this.isOnline = true;
        this.syncQueue();
    }

    handleOffline() {
        this.isOnline = false;
    }

    async request(method, url, data = null, options = {}) {
        if (!this.isOnline) {
            // Queue the request for later
            this.queue.push({ method, url, data, options, timestamp: Date.now() });
            localStorage.setItem('api_request_queue', JSON.stringify(this.queue));
            // Fallback to localStorage for GET
            if (method === 'get') {
                return this.localGet(url);
            }
            return { success: false, offline: true };
        }
        try {
            const fetchOptions = {
                method: method.toUpperCase(),
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
            };
            if (data) fetchOptions.body = JSON.stringify(data);
            const response = await fetch(API_BASE + url, fetchOptions);
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'API error');
            return result;
        } catch (error) {
            // If failed due to network, queue it
            if (!navigator.onLine) {
                this.queue.push({ method, url, data, options, timestamp: Date.now() });
                localStorage.setItem('api_request_queue', JSON.stringify(this.queue));
                return { success: false, offline: true };
            }
            throw error;
        }
    }

    async syncQueue() {
        if (!this.isOnline || !this.queue.length) return;
        const queueCopy = [...this.queue];
        this.queue = [];
        for (const req of queueCopy) {
            try {
                await this.request(req.method, req.url, req.data, req.options);
            } catch (e) {
                // If still fails, re-queue
                this.queue.push(req);
            }
        }
        localStorage.setItem('api_request_queue', JSON.stringify(this.queue));
    }

    // LocalStorage fallback for GET
    localGet(url) {
        // Map API endpoints to localStorage keys
        if (url.startsWith('/recipes')) {
            return { success: true, data: JSON.parse(localStorage.getItem('restaurant_recipes') || '[]') };
        }
        if (url.startsWith('/orders')) {
            return { success: true, data: JSON.parse(localStorage.getItem('restaurant_orders') || '[]') };
        }
        if (url.startsWith('/tables')) {
            return { success: true, data: JSON.parse(localStorage.getItem('restaurant_tables') || '[]') };
        }
        if (url.startsWith('/chefs')) {
            return { success: true, data: JSON.parse(localStorage.getItem('restaurant_chefs') || '[]') };
        }
        if (url.startsWith('/stations')) {
            return { success: true, data: JSON.parse(localStorage.getItem('restaurant_stations') || '[]') };
        }
        if (url.startsWith('/settings')) {
            return { success: true, data: JSON.parse(localStorage.getItem('restaurant_settings') || '{}') };
        }
        return { success: false, data: null };
    }

    // CRUD methods for each entity
    // Recipes
    getRecipes(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request('get', `/recipes${query ? '?' + query : ''}`);
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
        const query = new URLSearchParams(params).toString();
        return this.request('get', `/orders${query ? '?' + query : ''}`);
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
        const query = new URLSearchParams(params).toString();
        return this.request('get', `/tables${query ? '?' + query : ''}`);
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
        const query = new URLSearchParams(params).toString();
        return this.request('get', `/chefs${query ? '?' + query : ''}`);
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
        const query = new URLSearchParams(params).toString();
        return this.request('get', `/stations${query ? '?' + query : ''}`);
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
    getSettings() {
        return this.request('get', '/settings');
    }
    updateSettings(data) {
        return this.request('post', '/settings/restaurant', data);
    }
}

// Export a singleton instance
const api = new ApiClient();
export default api; 