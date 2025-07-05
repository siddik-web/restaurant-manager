// js/orders.js
// Order management module for Alpine.js

import api from './api.js';

export const createOrdersModule = (state) => ({
    // POS Functions
    addToOrder(recipe) {
        // Check if item already exists in order
        const existingItem = state.currentOrder.items.find(item => item.id === recipe.id);
        
        if (existingItem) {
            existingItem.quantity++;
        } else {
            state.currentOrder.items.push({
                id: recipe.id,
                name: recipe.name,
                price: recipe.price,
                quantity: 1
            });
        }
        
        this.calculateOrderTotals();
    },

    updateItemQuantity(index, newQuantity) {
        if (newQuantity < 1) {
            state.currentOrder.items.splice(index, 1);
        } else {
            state.currentOrder.items[index].quantity = newQuantity;
        }
        this.calculateOrderTotals();
    },

    removeItem(index) {
        state.currentOrder.items.splice(index, 1);
        this.calculateOrderTotals();
    },

    clearCurrentOrder() {
        if (confirm('Are you sure you want to clear the current order?')) {
            state.currentOrder = {
                items: [],
                subtotal: 0,
                tax: 0,
                total: 0,
                tableNumber: null,
                deliveryFee: 0
            };
        }
    },

    saveOrderAsDraft() {
        const draft = {
            ...state.currentOrder,
            id: Date.now(),
            timestamp: new Date().toISOString(),
            status: 'draft',
            type: state.orderType
        };
        
        // Save to localStorage
        const drafts = JSON.parse(localStorage.getItem('restaurant_order_drafts') || '[]');
        drafts.push(draft);
        localStorage.setItem('restaurant_order_drafts', JSON.stringify(drafts));
        
        alert('Order saved as draft successfully!');
    },

    calculateOrderTotals() {
        state.currentOrder.subtotal = state.currentOrder.items.reduce(
            (sum, item) => sum + (item.price * item.quantity), 0
        );
        
        // Apply tax rate from settings
        state.currentOrder.tax = state.currentOrder.subtotal * (state.settings.taxRate / 100);
        
        // Apply delivery fee if delivery order
        state.currentOrder.deliveryFee = state.orderType === 'delivery' ? state.settings.deliveryFee : 0;
        
        state.currentOrder.total = state.currentOrder.subtotal + state.currentOrder.tax + state.currentOrder.deliveryFee;
    },

    async placeOrder() {
        try {
            // Prepare order data for API
            const orderData = {
                type: state.orderType,
                table_number: state.currentOrder.tableNumber,
                items: state.currentOrder.items.map(item => ({
                    recipe_id: item.id,
                    quantity: item.quantity
                })),
                notes: []
            };

            const response = await api.createOrder(orderData);
            
            if (response.success) {
                const newOrder = response.data;
                state.orders.push(newOrder);
                
                // Update table status if dine-in
                if (state.orderType === 'dine-in' && state.currentOrder.tableNumber) {
                    const table = state.tables.find(t => t.number === state.currentOrder.tableNumber);
                    if (table) {
                        table.status = 'occupied';
                        localStorage.setItem('restaurant_tables', JSON.stringify(state.tables));
                    }
                }
                
                // Play sound for new order
                this.playKdsSound();
                
                // Show notification
                this.showKdsNotification(newOrder);
                
                // Generate receipt
                this.generateReceipt(newOrder);
                
                // Reset current order
                state.currentOrder = {
                    items: [],
                    subtotal: 0,
                    tax: 0,
                    total: 0,
                    tableNumber: null,
                    deliveryFee: 0
                };
                
                // Switch to KDS view
                state.currentTab = 'kds';
            } else {
                alert('Error placing order: ' + (response.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error placing order:', error);
            alert('Error placing order. Please try again.');
        }
    },

    // KDS Functions
    async updateOrderStatus(orderId, status) {
        try {
            const response = await api.request('patch', `/orders/${orderId}/status`, { status });
            if (response.success) {
                const order = state.orders.find(o => o.id === orderId);
                if (order) {
                    order.status = status;
                    localStorage.setItem('restaurant_orders', JSON.stringify(state.orders));
                }
            }
        } catch (error) {
            console.error('Error updating order status:', error);
        }
    },

    async completeOrder(orderId) {
        try {
            const response = await api.request('patch', `/orders/${orderId}/complete`);
            if (response.success) {
                const order = state.orders.find(o => o.id === orderId);
                if (order) {
                    order.status = 'completed';
                    order.completedTime = Date.now();
                    localStorage.setItem('restaurant_orders', JSON.stringify(state.orders));
                }
            }
        } catch (error) {
            console.error('Error completing order:', error);
        }
    },

    // Enhanced KDS Functions
    getFilteredOrders() {
        let filteredOrders = state.orders.filter(order => 
            ['new', 'preparing', 'ready'].includes(order.status)
        );
        
        // Apply filter
        if (state.kdsFilter !== 'all') {
            filteredOrders = filteredOrders.filter(order => order.type === state.kdsFilter);
        }
        
        // Apply view filter
        if (state.kdsView !== 'all') {
            filteredOrders = filteredOrders.filter(order => order.status === state.kdsView);
        }
        
        // Station filter
        if (state.kdsStationFilter && state.kdsStationFilter !== 'all') {
            filteredOrders = filteredOrders.filter(order => order.assignedStation === state.kdsStationFilter);
        }
        
        // Apply sorting
        switch(state.kdsSort) {
            case 'time':
                filteredOrders.sort((a, b) => a.timestamp - b.timestamp);
                break;
            case 'priority':
                filteredOrders.sort((a, b) => this.getOrderPriority(b) - this.getOrderPriority(a));
                break;
            case 'table':
                filteredOrders.sort((a, b) => (a.tableNumber || 0) - (b.tableNumber || 0));
                break;
        }
        
        return filteredOrders;
    },

    getOrderPriority(order) {
        const age = Date.now() - order.timestamp;
        const ageMinutes = age / (1000 * 60);
        
        // Priority based on order age and type
        let priority = 1;
        
        if (ageMinutes > 30) priority = 5; // Very urgent
        else if (ageMinutes > 20) priority = 4; // Urgent
        else if (ageMinutes > 15) priority = 3; // High
        else if (ageMinutes > 10) priority = 2; // Medium
        
        // Boost priority for delivery orders
        if (order.type === 'delivery') priority += 1;
        
        // Boost priority for large orders
        if (order.items.length > 5) priority += 1;
        
        return priority;
    },

    getOrderAge(order) {
        const age = Date.now() - order.timestamp;
        const minutes = Math.floor(age / (1000 * 60));
        const seconds = Math.floor((age % (1000 * 60)) / 1000);
        return { minutes, seconds };
    },

    getOrderAgeText(order) {
        const age = this.getOrderAge(order);
        if (age.minutes > 0) {
            return `${age.minutes}m ${age.seconds}s`;
        }
        return `${age.seconds}s`;
    },

    getOrderStatusColor(order) {
        const age = this.getOrderAge(order);
        const priority = this.getOrderPriority(order);
        
        if (priority >= 5 || age.minutes > 30) return 'bg-red-100 text-red-800 border-red-300';
        if (priority >= 4 || age.minutes > 20) return 'bg-orange-100 text-orange-800 border-orange-300';
        if (priority >= 3 || age.minutes > 15) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        return 'bg-blue-100 text-blue-800 border-blue-300';
    },

    getEstimatedPrepTime(order) {
        // Calculate estimated prep time based on items
        let totalTime = 0;
        order.items.forEach(item => {
            const recipe = state.recipes.find(r => r.id === item.id);
            if (recipe) {
                // Base time per item (could be stored in recipe)
                totalTime += 5 * item.quantity; // 5 minutes per item
            }
        });
        return Math.max(5, Math.min(45, totalTime)); // Between 5-45 minutes
    },

    getPrepTimeStatus(order) {
        const age = this.getOrderAge(order);
        const estimated = this.getEstimatedPrepTime(order);
        
        if (age.minutes > estimated + 5) return 'overdue';
        if (age.minutes > estimated) return 'late';
        if (age.minutes < estimated - 5) return 'early';
        return 'on-time';
    },

    async assignOrderToChef(orderId, chefName, station) {
        try {
            const response = await api.request('post', `/orders/${orderId}/assign-chef-station`, {
                assigned_chef: chefName,
                assigned_station: station
            });
            
            if (response.success) {
                const order = state.orders.find(o => o.id === orderId);
                if (order) {
                    order.assignedChef = chefName;
                    order.assignedStation = station;
                    order.assignedTime = Date.now();
                    localStorage.setItem('restaurant_orders', JSON.stringify(state.orders));
                }
            }
        } catch (error) {
            console.error('Error assigning order to chef:', error);
        }
    },

    async unassignOrder(orderId) {
        try {
            const order = state.orders.find(o => o.id === orderId);
            if (order) {
                delete order.assignedChef;
                delete order.assignedStation;
                delete order.assignedTime;
                localStorage.setItem('restaurant_orders', JSON.stringify(state.orders));
            }
        } catch (error) {
            console.error('Error unassigning order:', error);
        }
    },

    getKitchenStats() {
        const todayOrders = state.orders.filter(order => {
            const orderDate = new Date(order.timestamp).toDateString();
            const today = new Date().toDateString();
            return orderDate === today;
        });
        
        const completedOrders = todayOrders.filter(order => order.status === 'completed');
        const pendingOrders = todayOrders.filter(order => ['new', 'preparing', 'ready'].includes(order.status));
        
        // Calculate average prep time for completed orders
        let avgPrepTime = 0;
        if (completedOrders.length > 0) {
            const totalPrepTime = completedOrders.reduce((sum, order) => {
                if (order.completedTime && order.timestamp) {
                    const prepTime = (order.completedTime - order.timestamp) / (1000 * 60); // Convert to minutes
                    return sum + prepTime;
                }
                return sum;
            }, 0);
            avgPrepTime = totalPrepTime / completedOrders.length;
        }
        
        // Calculate efficiency based on on-time completion
        let efficiency = 0;
        if (completedOrders.length > 0) {
            const onTimeOrders = completedOrders.filter(order => {
                if (order.completedTime && order.timestamp) {
                    const actualPrepTime = (order.completedTime - order.timestamp) / (1000 * 60);
                    const estimatedPrepTime = this.getEstimatedPrepTime(order);
                    return actualPrepTime <= estimatedPrepTime;
                }
                return false;
            });
            efficiency = (onTimeOrders.length / completedOrders.length) * 100;
        }
        
        return {
            totalOrders: todayOrders.length,
            completedOrders: completedOrders.length,
            pendingOrders: pendingOrders.length,
            avgPrepTime: Math.round(avgPrepTime),
            efficiency: Math.round(efficiency)
        };
    },

    // Additional KDS Features
    async markOrderUrgent(orderId) {
        try {
            const response = await api.request('patch', `/orders/${orderId}/urgent`);
            if (response.success) {
                const order = state.orders.find(o => o.id === orderId);
                if (order) {
                    order.urgent = true;
                    order.urgentTime = Date.now();
                    localStorage.setItem('restaurant_orders', JSON.stringify(state.orders));
                }
            }
        } catch (error) {
            console.error('Error marking order urgent:', error);
        }
    },

    unmarkOrderUrgent(orderId) {
        const order = state.orders.find(o => o.id === orderId);
        if (order) {
            order.urgent = false;
            delete order.urgentTime;
            localStorage.setItem('restaurant_orders', JSON.stringify(state.orders));
        }
    },

    addOrderNote(orderId, note) {
        const order = state.orders.find(o => o.id === orderId);
        if (order) {
            if (!order.notes) order.notes = [];
            order.notes.push({
                text: note,
                timestamp: Date.now(),
                type: 'kitchen'
            });
            localStorage.setItem('restaurant_orders', JSON.stringify(state.orders));
        }
    },

    getOrderNotes(orderId) {
        const order = state.orders.find(o => o.id === orderId);
        return order?.notes || [];
    },

    getOrderPrepProgress(orderId) {
        const order = state.orders.find(o => o.id === orderId);
        if (!order) return 0;
        
        const age = Date.now() - order.timestamp;
        const estimated = this.getEstimatedPrepTime(order) * 60 * 1000; // Convert to milliseconds
        const progress = (age / estimated) * 100;
        return Math.min(100, Math.max(0, progress));
    },

    getKitchenEfficiency() {
        const todayOrders = state.orders.filter(order => {
            const orderDate = new Date(order.timestamp).toDateString();
            const today = new Date().toDateString();
            return orderDate === today;
        });
        
        const completedOrders = todayOrders.filter(order => order.status === 'completed');
        const onTimeOrders = completedOrders.filter(order => {
            const prepTime = order.completedTime ? 
                (order.completedTime - order.timestamp) / (1000 * 60) : 0;
            const estimated = this.getEstimatedPrepTime(order);
            return prepTime <= estimated;
        });
        
        return completedOrders.length > 0 ? 
            Math.round((onTimeOrders.length / completedOrders.length) * 100) : 0;
    },

    // KDS Sound and Notifications
    playKdsSound() {
        if (state.kdsSoundEnabled) {
            const audio = document.getElementById('newOrderSound');
            if (audio) {
                audio.play().catch(e => console.log('Audio play failed:', e));
            }
        }
    },

    showKdsNotification(order) {
        if (state.kdsNotifications && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('New Order', {
                body: `Order #${order.id} - ${order.items.length} items`,
                icon: '/favicon.ico'
            });
        }
    },

    // Receipt generation
    generateReceipt(order) {
        state.currentReceipt = {
            ...order,
            receiptNumber: 'R' + Date.now(),
            printDate: new Date().toLocaleDateString(),
            printTime: new Date().toLocaleTimeString(),
            server: 'Server 1'
        };
        state.showReceipt = true;
        
        if (state.settings.autoPrint) {
            setTimeout(() => this.printReceipt(), 500);
        }
    },

    printReceipt() {
        const printWindow = window.open('', '_blank');
        const receiptContent = this.generateReceiptHTML();
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Receipt</title>
                <style>
                    body { 
                        font-family: 'Courier New', monospace; 
                        margin: 0; 
                        padding: 10px; 
                        font-size: ${state.settings.fontSize}pt;
                        width: ${state.settings.receiptWidth}mm;
                    }
                    .receipt { text-align: center; }
                    .header { margin-bottom: 10px; }
                    .logo { max-width: 60px; max-height: 60px; margin: 0 auto 10px; }
                    .title { font-size: 16pt; font-weight: bold; margin: 5px 0; }
                    .info { font-size: 10pt; margin: 2px 0; }
                    .divider { border-top: 1px dashed #000; margin: 10px 0; }
                    .items { text-align: left; margin: 10px 0; }
                    .item { margin: 3px 0; }
                    .item-name { float: left; }
                    .item-qty { float: left; margin: 0 10px; }
                    .item-price { float: right; }
                    .clear { clear: both; }
                    .totals { text-align: right; margin: 10px 0; }
                    .total-line { margin: 2px 0; }
                    .grand-total { font-weight: bold; font-size: 14pt; }
                    .footer { margin-top: 15px; font-size: 10pt; }
                    @media print {
                        body { width: 100%; }
                    }
                </style>
            </head>
            <body>
                ${receiptContent}
            </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    },

    generateReceiptHTML() {
        const receipt = state.currentReceipt;
        if (!receipt) {
            return '<div class="receipt">No receipt data available</div>';
        }
        
        let html = '<div class="receipt">';
        
        // Header
        if (state.settings.printHeader) {
            if (state.settings.printLogo && state.settings.logo) {
                html += `<img src="${state.settings.logo}" class="logo" alt="Logo">`;
            }
            html += `<div class="title">${state.settings.restaurantName || 'Restaurant'}</div>`;
            html += `<div class="info">${state.settings.address || ''}</div>`;
            html += `<div class="info">${state.settings.phone || ''}</div>`;
            html += `<div class="info">${state.settings.email || ''}</div>`;
            html += '<div class="divider"></div>';
        }
        
        // Receipt Info
        html += `<div class="info">${state.translations.receiptNumber || 'Receipt #'} ${receipt.receiptNumber || 'N/A'}</div>`;
        html += `<div class="info">${state.translations.date || 'Date'}: ${receipt.printDate || new Date().toLocaleDateString()}</div>`;
        html += `<div class="info">${state.translations.time || 'Time'}: ${receipt.printTime || new Date().toLocaleTimeString()}</div>`;
        if (receipt.tableNumber) {
            html += `<div class="info">${state.translations.tableNumber || 'Table'}: ${receipt.tableNumber}</div>`;
        }
        html += `<div class="info">${state.translations.orderType || 'Order Type'}: ${state.translations[receipt.type] || receipt.type}</div>`;
        html += '<div class="divider"></div>';
        
        // Items
        html += '<div class="items">';
        if (receipt.items && Array.isArray(receipt.items)) {
            receipt.items.forEach(item => {
                html += `
                    <div class="item">
                        <div class="item-name">${item.name || 'Unknown Item'}</div>
                        <div class="item-qty">${item.quantity || 0}</div>
                        <div class="item-price">${state.formatPrice((item.price || 0) * (item.quantity || 0))}</div>
                        <div class="clear"></div>
                    </div>
                `;
            });
        }
        html += '</div>';
        
        html += '<div class="divider"></div>';
        
        // Totals
        html += '<div class="totals">';
        html += `<div class="total-line">${state.translations.subtotal || 'Subtotal'}: ${state.formatPrice(receipt.subtotal || 0)}</div>`;
        html += `<div class="total-line">${state.translations.tax || 'Tax'}: ${state.formatPrice(receipt.tax || 0)}</div>`;
        if (receipt.deliveryFee > 0) {
            html += `<div class="total-line">${state.translations.deliveryFee || 'Delivery Fee'}: ${state.formatPrice(receipt.deliveryFee || 0)}</div>`;
        }
        html += `<div class="total-line grand-total">${state.translations.grandTotal || 'Grand Total'}: ${state.formatPrice(receipt.total || 0)}</div>`;
        html += '</div>';
        
        // Footer
        if (state.settings.printFooter) {
            html += '<div class="divider"></div>';
            html += `<div class="footer">${state.settings.receiptFooter || 'Thank you for your business!'}</div>`;
        }
        
        html += '</div>';
        return html;
    }
}); 