// API client for the Laravel backend: auth token handling, requests,
// and mapping between the API's snake_case records and the UI's camelCase objects.
(function () {
    const API_BASE = window.RESTAURANT_API_BASE || '/api';
    const TOKEN_KEY = 'restaurant_api_token';

    class ApiError extends Error {
        constructor(message, status, errors = null) {
            super(message);
            this.status = status;
            this.errors = errors;
        }

        // True when the request never reached the server (offline, DNS, CORS...)
        get isNetworkError() {
            return this.status === 0;
        }
    }

    const getToken = () => {
        try {
            return localStorage.getItem(TOKEN_KEY);
        } catch (e) {
            return null;
        }
    };

    const setToken = (token) => {
        try {
            if (token) {
                localStorage.setItem(TOKEN_KEY, token);
            } else {
                localStorage.removeItem(TOKEN_KEY);
            }
        } catch (e) {
            // Storage unavailable; the token lives only for this page load
        }
    };

    async function request(method, path, body = null) {
        const headers = { Accept: 'application/json' };
        const token = getToken();
        if (token) headers.Authorization = `Bearer ${token}`;
        if (body !== null) headers['Content-Type'] = 'application/json';

        let response;
        try {
            response = await fetch(API_BASE + path, {
                method,
                headers,
                body: body !== null ? JSON.stringify(body) : undefined,
            });
        } catch (e) {
            throw new ApiError('Cannot reach the server', 0);
        }

        const data = await response.json().catch(() => ({}));

        if (response.status === 401) {
            setToken(null);
            window.dispatchEvent(new CustomEvent('api:unauthorized'));
        }

        if (!response.ok || data.success === false) {
            const firstError = data.errors ? Object.values(data.errors).flat()[0] : null;
            throw new ApiError(firstError || data.message || `Request failed (${response.status})`, response.status, data.errors);
        }

        return data;
    }

    // Fetch every record of a list endpoint, following Laravel pagination
    async function fetchAll(path) {
        const separator = path.includes('?') ? '&' : '?';
        let page = 1;
        let records = [];

        while (true) {
            const result = await request('GET', `${path}${separator}per_page=200&page=${page}`);
            const data = result.data;
            if (Array.isArray(data)) return data;
            records = records.concat(data.data || []);
            if (!data.last_page || page >= data.last_page) return records;
            page++;
        }
    }

    const num = (value, fallback = 0) => {
        const parsed = parseFloat(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    };
    const time = (value) => (value ? Date.parse(value) : null);
    const isoTime = (value) => (value ? new Date(value).toISOString() : null);
    const day = (value) => (value ? String(value).slice(0, 10) : null);
    const blankToNull = (value) => (value === '' || value === undefined ? null : value);

    const mappers = {
        recipe: {
            fromApi: (r) => ({
                id: r.id,
                name: r.name,
                category: r.category,
                price: num(r.price),
                basePortions: r.base_portions,
                prepTime: r.prep_time,
                cookTime: r.cook_time,
                difficulty: r.difficulty,
                allergens: r.allergens || [],
                tags: r.tags || [],
                ingredients: r.ingredients || [],
                instructions: r.instructions || '',
                notes: r.notes || '',
                image: r.image || '',
                isActive: r.is_active,
                createdAt: time(r.created_at),
                updatedAt: time(r.updated_at),
            }),
            toApi: (r) => ({
                name: r.name,
                category: r.category,
                price: num(r.price),
                base_portions: parseInt(r.basePortions, 10) || 1,
                prep_time: parseInt(r.prepTime, 10) || 0,
                cook_time: parseInt(r.cookTime, 10) || 0,
                difficulty: r.difficulty || 'medium',
                allergens: r.allergens || [],
                tags: r.tags || [],
                ingredients: (r.ingredients || []).filter((i) => i.name && i.name.trim()),
                instructions: r.instructions || '-',
                notes: blankToNull(r.notes),
                image: blankToNull(r.image),
                is_active: r.isActive !== false,
            }),
        },

        order: {
            fromApi: (o) => ({
                id: o.id,
                type: o.type,
                tableNumber: o.table_number,
                items: (o.order_items || []).map((item) => ({
                    id: item.recipe_id,
                    name: item.name,
                    price: num(item.price),
                    quantity: item.quantity,
                })),
                subtotal: num(o.subtotal),
                tax: num(o.tax),
                deliveryFee: num(o.delivery_fee),
                total: num(o.total),
                status: o.status || 'new',
                timestamp: time(o.created_at),
                completedTime: time(o.completed_time),
                assignedChef: o.assigned_chef,
                assignedStation: o.assigned_station,
                assignedTime: time(o.assigned_time),
                urgent: !!o.urgent,
                urgentTime: time(o.urgent_time),
                notes: o.notes || [],
            }),
            toApiCreate: (o) => ({
                type: o.type,
                table_number: o.tableNumber || null,
                items: o.items.map((item) => ({ recipe_id: item.id, quantity: item.quantity })),
                notes: o.notes && o.notes.length ? o.notes : null,
            }),
            toApi: (o) => ({
                status: o.status,
                assigned_chef: o.assignedChef || null,
                assigned_station: o.assignedStation || null,
                urgent: !!o.urgent,
                notes: o.notes || [],
            }),
        },

        table: {
            fromApi: (t) => ({
                id: t.id,
                number: t.number,
                capacity: t.capacity,
                status: t.status,
                location: t.location || '',
                notes: t.notes || '',
                reservationTime: t.reservation_time,
                customerName: t.customer_name || '',
                customerPhone: t.customer_phone || '',
            }),
            toApi: (t) => ({
                number: parseInt(t.number, 10),
                capacity: parseInt(t.capacity, 10),
                status: t.status || 'available',
                location: blankToNull(t.location),
                notes: blankToNull(t.notes),
                customer_name: blankToNull(t.customerName),
                customer_phone: blankToNull(t.customerPhone),
                reservation_time: isoTime(t.reservationTime),
            }),
        },

        // Chefs and stations share a shape in the UI: { id, name }
        staff: {
            fromApi: (s) => ({ id: s.id, name: s.name, isActive: s.is_active }),
            toApi: (s) => ({ name: s.name, is_active: s.isActive !== false }),
        },

        supplier: {
            fromApi: (s) => ({
                id: s.id,
                name: s.name,
                contact: s.contact_person || '',
                phone: s.phone || '',
                email: s.email || '',
                address: s.address || '',
                paymentTerms: s.payment_terms || '',
                notes: s.notes || '',
            }),
            toApi: (s) => ({
                name: s.name,
                contact_person: blankToNull(s.contact),
                phone: blankToNull(s.phone),
                email: blankToNull(s.email),
                address: blankToNull(s.address),
                payment_terms: blankToNull(s.paymentTerms),
                notes: blankToNull(s.notes),
            }),
        },

        inventory: {
            fromApi: (i) => ({
                id: i.id,
                name: i.name,
                category: i.category,
                unit: i.unit,
                currentStock: num(i.current_stock),
                minStock: num(i.min_stock),
                maxStock: num(i.max_stock),
                cost: num(i.cost_per_unit),
                supplier: i.supplier ? i.supplier.name : '',
                location: i.location || '',
                expiryDate: day(i.expiry_date),
                notes: i.notes || '',
                lastUpdated: time(i.last_updated || i.updated_at),
            }),
            // supplierId is resolved by the caller from the supplier name
            toApi: (i, supplierId) => ({
                name: i.name,
                category: i.category,
                unit: i.unit,
                current_stock: num(i.currentStock),
                min_stock: num(i.minStock),
                max_stock: num(i.maxStock),
                cost_per_unit: num(i.cost),
                supplier_id: supplierId || null,
                location: blankToNull(i.location),
                expiry_date: blankToNull(i.expiryDate),
                notes: blankToNull(i.notes),
            }),
        },

        purchase: {
            fromApi: (p) => ({
                id: p.id,
                purchaseNumber: p.purchase_number,
                supplier: p.supplier ? p.supplier.name : '',
                items: (p.purchase_items || []).map((item) => ({
                    purchaseItemId: item.id,
                    inventoryId: item.inventory_id,
                    name: item.inventory ? item.inventory.name : '',
                    unit: item.inventory ? item.inventory.unit : '',
                    quantity: num(item.quantity),
                    cost: num(item.unit_cost),
                })),
                totalCost: num(p.total_amount),
                purchaseDate: day(p.order_date),
                expectedDelivery: day(p.expected_delivery),
                notes: p.notes || '',
                status: p.status === 'delivered' ? 'received' : p.status,
                receivedDate: time(p.delivery_date),
                createdAt: time(p.created_at),
            }),
            toApiCreate: (p, supplierId) => ({
                supplier_id: supplierId,
                order_date: p.purchaseDate,
                expected_delivery: blankToNull(p.expectedDelivery),
                notes: blankToNull(p.notes),
                items: p.items
                    .filter((item) => item.inventoryId)
                    .map((item) => ({
                        inventory_id: item.inventoryId,
                        quantity: num(item.quantity),
                        unit_cost: num(item.cost),
                    })),
            }),
            toApi: (p, supplierId) => ({
                supplier_id: supplierId,
                order_date: p.purchaseDate,
                expected_delivery: blankToNull(p.expectedDelivery),
                notes: blankToNull(p.notes),
            }),
        },

        waste: {
            fromApi: (w) => ({
                id: w.id,
                item: w.inventory ? w.inventory.name : w.inventory_id,
                inventoryId: w.inventory_id,
                quantity: num(w.quantity),
                reason: w.reason,
                date: day(w.waste_date),
                notes: w.notes || '',
                createdAt: time(w.created_at),
            }),
            toApi: (w) => ({
                inventory_id: w.inventoryId || w.item,
                quantity: num(w.quantity),
                reason: w.reason,
                waste_date: w.date,
                notes: blankToNull(w.notes),
            }),
        },

        settings: {
            fromApi: (s) => ({
                restaurantName: s.restaurant_name,
                address: s.address,
                phone: s.phone,
                email: s.email,
                website: s.website,
                taxRate: num(s.tax_rate),
                deliveryFee: num(s.delivery_fee),
                currency: s.currency,
                receiptFooter: s.receipt_footer,
                printHeader: !!s.print_header,
                printFooter: !!s.print_footer,
                autoPrint: !!s.auto_print,
                receiptWidth: num(s.receipt_width, 80),
                fontSize: num(s.font_size, 12),
            }),
            toApi: (s) => ({
                restaurant_name: s.restaurantName || 'Restaurant Manager',
                address: blankToNull(s.address),
                phone: blankToNull(s.phone),
                email: blankToNull(s.email),
                website: blankToNull(s.website),
                tax_rate: num(s.taxRate),
                delivery_fee: num(s.deliveryFee),
                currency: s.currency || 'USD',
                receipt_footer: blankToNull(s.receiptFooter),
                print_header: !!s.printHeader,
                print_footer: !!s.printFooter,
                auto_print: !!s.autoPrint,
                receipt_width: parseInt(s.receiptWidth, 10) || 80,
                font_size: parseInt(s.fontSize, 10) || 12,
            }),
        },
    };

    window.RestaurantApi = {
        ApiError,
        request,
        fetchAll,
        mappers,
        getToken,
        setToken,
        async login(email, password) {
            const result = await request('POST', '/login', { email, password, device_name: 'pos-web' });
            setToken(result.data.token);
            return result.data.user;
        },
        async logout() {
            try {
                await request('POST', '/logout');
            } finally {
                setToken(null);
            }
        },
        async currentUser() {
            return (await request('GET', '/user')).data;
        },
    };
})();
