// js/inventory.js
// Inventory management module for Alpine.js

import api from './api.js';

export const createInventoryModule = (state) => ({
    // Inventory state
    inventory: [],
    suppliers: [],
    purchases: [],
    waste: [],
    inventoryAlerts: [],
    
    // Form states
    showInventoryForm: false,
    showPurchaseForm: false,
    showSupplierForm: false,
    showWasteForm: false,
    editingInventory: null,
    editingPurchase: null,
    editingSupplier: null,
    
    // Inventory form
    inventoryForm: {
        name: '',
        category: '',
        unit: '',
        currentStock: 0,
        minStock: 0,
        maxStock: 0,
        cost: 0,
        supplier_id: '',
        location: '',
        expiryDate: null,
        notes: ''
    },
    
    // Purchase form
    purchaseForm: {
        supplier_id: '',
        items: [],
        totalCost: 0,
        purchaseDate: new Date().toISOString().split('T')[0],
        expectedDelivery: null,
        notes: ''
    },
    
    // Supplier form
    supplierForm: {
        name: '',
        contact_person: '',
        phone: '',
        email: '',
        address: '',
        payment_terms: '',
        notes: ''
    },
    
    // Waste form
    wasteForm: {
        inventory_id: '',
        quantity: 0,
        reason: '',
        waste_date: new Date().toISOString().split('T')[0],
        notes: ''
    },
    
    // Filters and search
    inventorySearchTerm: '',
    inventoryFilterCategory: 'all',
    inventorySortBy: 'name',
    inventorySortOrder: 'asc',
    
    // Load all inventory-related data from API
    async loadInventory() {
        // Inventory
        const invRes = await api.request('get', '/inventory');
        this.inventory = invRes.success ? (invRes.data.data || invRes.data) : [];
        // Suppliers
        const supRes = await api.request('get', '/suppliers');
        this.suppliers = supRes.success ? (supRes.data.data || supRes.data) : [];
        // Purchases
        const purRes = await api.request('get', '/purchases');
        this.purchases = purRes.success ? (purRes.data.data || purRes.data) : [];
        // Waste
        const wasteRes = await api.request('get', '/waste');
        this.waste = wasteRes.success ? (wasteRes.data.data || wasteRes.data) : [];
        // Alerts
        await this.updateInventoryAlerts();
    },
    
    // Inventory CRUD
    async addInventory() {
        this.editingInventory = null;
        this.resetInventoryForm();
        this.showInventoryForm = true;
    },
    async editInventory(item) {
        this.editingInventory = item;
        this.inventoryForm = { ...item };
        this.showInventoryForm = true;
    },
    async saveInventory() {
        if (this.editingInventory && this.inventoryForm.id) {
            // Update
            await api.request('put', `/inventory/${this.inventoryForm.id}`, this.inventoryForm);
        } else {
            // Create
            await api.request('post', '/inventory', this.inventoryForm);
        }
        this.showInventoryForm = false;
        this.editingInventory = null;
        this.resetInventoryForm();
        await this.loadInventory();
    },
    async deleteInventory(id) {
        if (confirm('Are you sure you want to delete this inventory item?')) {
            await api.request('delete', `/inventory/${id}`);
            await this.loadInventory();
        }
    },
    resetInventoryForm() {
        this.inventoryForm = {
            name: '',
            category: '',
            unit: '',
            currentStock: 0,
            minStock: 0,
            maxStock: 0,
            cost: 0,
            supplier_id: '',
            location: '',
            expiryDate: null,
            notes: ''
        };
    },
    
    // Stock operations
    async updateStock(id, quantity, operation = 'add', reason = 'Manual adjustment') {
        try {
            const adjustmentData = {
                quantity: quantity,
                adjustment_type: operation,
                reason: reason
            };
            
            await api.request('patch', `/inventory/${id}/adjust-stock`, adjustmentData);
            await this.loadInventory();
        } catch (error) {
            console.error('Error updating stock:', error);
            alert('Error updating stock. Please try again.');
        }
    },
    
    // Automatic stock deduction from orders
    async deductStockFromOrder(order) {
        try {
            for (const orderItem of order.items) {
                const recipe = state.recipes.find(r => r.id === orderItem.id);
                if (recipe && recipe.ingredients) {
                    for (const ingredient of recipe.ingredients) {
                        const inventoryItem = this.inventory.find(item => 
                            item.name.toLowerCase() === ingredient.name.toLowerCase()
                        );
                        
                        if (inventoryItem) {
                            const totalQuantity = ingredient.quantity * orderItem.quantity;
                            await this.updateStock(
                                inventoryItem.id, 
                                totalQuantity, 
                                'subtract', 
                                `Order #${order.id} - ${recipe.name}`
                            );
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error deducting stock from order:', error);
        }
    },
    
    // Get stock transactions
    async getStockTransactions(itemId = null) {
        try {
            if (itemId) {
                const response = await api.request('get', `/inventory/${itemId}/transactions`);
                return response.success ? (response.data.data || response.data) : [];
            } else {
                // For all transactions, we'll need to implement a general endpoint
                // For now, return empty array
                return [];
            }
        } catch (error) {
            console.error('Error getting stock transactions:', error);
            return [];
        }
    },
    
    // Purchase management
    async addPurchase() {
        this.editingPurchase = null;
        this.resetPurchaseForm();
        this.showPurchaseForm = true;
    },
    
    async editPurchase(purchase) {
        this.editingPurchase = purchase;
        this.purchaseForm = { ...purchase };
        this.showPurchaseForm = true;
    },
    
    async savePurchase() {
        try {
            if (this.editingPurchase && this.purchaseForm.id) {
                // Update
                await api.request('put', `/purchases/${this.purchaseForm.id}`, this.purchaseForm);
            } else {
                // Create
                await api.request('post', '/purchases', this.purchaseForm);
            }
            
            this.showPurchaseForm = false;
            this.editingPurchase = null;
            this.resetPurchaseForm();
            await this.loadInventory();
        } catch (error) {
            console.error('Error saving purchase:', error);
            alert('Error saving purchase. Please try again.');
        }
    },
    
    async receivePurchase(purchaseId) {
        try {
            const purchase = this.purchases.find(p => p.id === purchaseId);
            if (purchase) {
                // Update purchase status to delivered
                await api.request('patch', `/purchases/${purchaseId}/status`, {
                    status: 'delivered',
                    delivery_date: new Date().toISOString().split('T')[0]
                });
                
                await this.loadInventory();
            }
        } catch (error) {
            console.error('Error receiving purchase:', error);
            alert('Error receiving purchase. Please try again.');
        }
    },
    
    resetPurchaseForm() {
        this.purchaseForm = {
            supplier_id: '',
            items: [],
            totalCost: 0,
            purchaseDate: new Date().toISOString().split('T')[0],
            expectedDelivery: null,
            notes: ''
        };
    },
    
    addPurchaseItem() {
        this.purchaseForm.items.push({
            inventory_id: '',
            quantity: 0,
            unit_cost: 0,
            notes: ''
        });
    },
    
    removePurchaseItem(index) {
        this.purchaseForm.items.splice(index, 1);
    },
    
    calculatePurchaseTotal() {
        this.purchaseForm.totalCost = this.purchaseForm.items.reduce(
            (sum, item) => sum + (item.unit_cost * item.quantity), 0
        );
    },
    
    // Supplier management
    async addSupplier() {
        this.editingSupplier = null;
        this.resetSupplierForm();
        this.showSupplierForm = true;
    },
    
    async editSupplier(supplier) {
        this.editingSupplier = supplier;
        this.supplierForm = { ...supplier };
        this.showSupplierForm = true;
    },
    
    async saveSupplier() {
        try {
            if (this.editingSupplier && this.supplierForm.id) {
                // Update
                await api.request('put', `/suppliers/${this.supplierForm.id}`, this.supplierForm);
            } else {
                // Create
                await api.request('post', '/suppliers', this.supplierForm);
            }
            
            this.showSupplierForm = false;
            this.editingSupplier = null;
            this.resetSupplierForm();
            await this.loadInventory();
        } catch (error) {
            console.error('Error saving supplier:', error);
            alert('Error saving supplier. Please try again.');
        }
    },
    
    async deleteSupplier(id) {
        if (confirm('Are you sure you want to delete this supplier?')) {
            try {
                await api.request('delete', `/suppliers/${id}`);
                await this.loadInventory();
            } catch (error) {
                console.error('Error deleting supplier:', error);
                alert('Error deleting supplier. Please try again.');
            }
        }
    },
    
    resetSupplierForm() {
        this.supplierForm = {
            name: '',
            contact_person: '',
            phone: '',
            email: '',
            address: '',
            payment_terms: '',
            notes: ''
        };
    },
    
    // Waste management
    async addWaste() {
        this.resetWasteForm();
        this.showWasteForm = true;
    },
    
    async saveWaste() {
        try {
            await api.request('post', '/waste', this.wasteForm);
            
            this.showWasteForm = false;
            this.resetWasteForm();
            await this.loadInventory();
        } catch (error) {
            console.error('Error saving waste:', error);
            alert('Error saving waste. Please try again.');
        }
    },
    
    resetWasteForm() {
        this.wasteForm = {
            inventory_id: '',
            quantity: 0,
            reason: '',
            waste_date: new Date().toISOString().split('T')[0],
            notes: ''
        };
    },
    
    // Inventory alerts
    async updateInventoryAlerts() {
        try {
            const lowStockRes = await api.request('get', '/inventory/alerts/low-stock');
            this.inventoryAlerts = lowStockRes.success ? (lowStockRes.data.data || lowStockRes.data) : [];
        } catch (error) {
            console.error('Error updating inventory alerts:', error);
            // Fallback to local calculation
            this.inventoryAlerts = this.inventory.filter(item => 
                item.current_stock <= item.min_stock
            );
        }
    },
    
    async getLowStockItems() {
        try {
            const response = await api.request('get', '/inventory/alerts/low-stock');
            return response.success ? (response.data.data || response.data) : [];
        } catch (error) {
            console.error('Error getting low stock items:', error);
            return this.inventory.filter(item => item.current_stock <= item.min_stock);
        }
    },
    
    async getOutOfStockItems() {
        try {
            const response = await api.request('get', '/inventory?status=out_of_stock');
            return response.success ? (response.data.data || response.data) : [];
        } catch (error) {
            console.error('Error getting out of stock items:', error);
            return this.inventory.filter(item => item.current_stock <= 0);
        }
    },
    
    async getExpiringItems(days = 30) {
        try {
            const response = await api.request('get', `/inventory/alerts/expiring?days=${days}`);
            return response.success ? (response.data.data || response.data) : [];
        } catch (error) {
            console.error('Error getting expiring items:', error);
            return [];
        }
    },
    
    // Reports
    async generateInventoryReport() {
        try {
            const report = {
                totalItems: this.inventory.length,
                totalValue: this.inventory.reduce((sum, item) => sum + (item.current_stock * item.cost_per_unit), 0),
                lowStockItems: (await this.getLowStockItems()).length,
                outOfStockItems: (await this.getOutOfStockItems()).length,
                categories: this.getInventoryCategories().map(category => {
                    const items = this.inventory.filter(item => item.category === category);
                    return {
                        category,
                        count: items.length,
                        value: items.reduce((sum, item) => sum + (item.current_stock * item.cost_per_unit), 0)
                    };
                }),
                topSuppliers: await this.getTopSuppliers(),
                recentTransactions: await this.getStockTransactions()
            };
            
            return report;
        } catch (error) {
            console.error('Error generating inventory report:', error);
            return null;
        }
    },
    
    async getTopSuppliers() {
        try {
            const response = await api.request('get', '/suppliers/performance');
            return response.success ? (response.data.data || response.data) : [];
        } catch (error) {
            console.error('Error getting top suppliers:', error);
            // Fallback to local calculation
            const supplierStats = {};
            this.inventory.forEach(item => {
                if (item.supplier_id) {
                    const supplier = this.suppliers.find(s => s.id === item.supplier_id);
                    if (supplier) {
                        if (!supplierStats[supplier.name]) {
                            supplierStats[supplier.name] = { count: 0, value: 0 };
                        }
                        supplierStats[supplier.name].count++;
                        supplierStats[supplier.name].value += item.current_stock * item.cost_per_unit;
                    }
                }
            });
            
            return Object.entries(supplierStats)
                .map(([name, stats]) => ({ name, ...stats }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 5);
        }
    },
    
    // Export/Import
    async exportInventoryData() {
        try {
            const data = {
                inventory: this.inventory,
                suppliers: this.suppliers,
                purchases: this.purchases,
                waste: this.waste,
                transactions: await this.getStockTransactions(),
                exportDate: new Date().toISOString()
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `inventory_backup_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting inventory data:', error);
            alert('Error exporting data. Please try again.');
        }
    },
    
    async importInventoryData(file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                // Import data through API
                if (data.inventory) {
                    for (const item of data.inventory) {
                        await api.request('post', '/inventory', item);
                    }
                }
                if (data.suppliers) {
                    for (const supplier of data.suppliers) {
                        await api.request('post', '/suppliers', supplier);
                    }
                }
                if (data.purchases) {
                    for (const purchase of data.purchases) {
                        await api.request('post', '/purchases', purchase);
                    }
                }
                if (data.waste) {
                    for (const waste of data.waste) {
                        await api.request('post', '/waste', waste);
                    }
                }
                
                await this.loadInventory();
                alert('Inventory data imported successfully!');
            } catch (error) {
                console.error('Error importing data:', error);
                alert('Error importing data: ' + error.message);
            }
        };
        reader.readAsText(file);
    },
    
    // Default data
    getDefaultInventory() {
        return [
            {
                id: 1,
                name: 'Pizza Dough',
                category: 'Dough & Flour',
                unit: 'pc',
                currentStock: 50,
                minStock: 10,
                maxStock: 100,
                cost: 2.50,
                supplier: 'Local Bakery',
                location: 'Freezer A',
                expiryDate: null,
                notes: 'Fresh pizza dough balls',
                createdAt: Date.now(),
                lastUpdated: Date.now()
            },
            {
                id: 2,
                name: 'Tomato Sauce',
                category: 'Sauces',
                unit: 'g',
                currentStock: 5000,
                minStock: 1000,
                maxStock: 10000,
                cost: 0.05,
                supplier: 'Italian Imports',
                location: 'Pantry B',
                expiryDate: null,
                notes: 'Homemade tomato sauce',
                createdAt: Date.now(),
                lastUpdated: Date.now()
            },
            {
                id: 3,
                name: 'Mozzarella Cheese',
                category: 'Dairy',
                unit: 'g',
                currentStock: 8000,
                minStock: 2000,
                maxStock: 15000,
                cost: 0.12,
                supplier: 'Dairy Fresh',
                location: 'Refrigerator C',
                expiryDate: null,
                notes: 'Fresh mozzarella cheese',
                createdAt: Date.now(),
                lastUpdated: Date.now()
            },
            {
                id: 4,
                name: 'Ground Beef',
                category: 'Meat',
                unit: 'g',
                currentStock: 10000,
                minStock: 3000,
                maxStock: 20000,
                cost: 0.15,
                supplier: 'Premium Meats',
                location: 'Freezer D',
                expiryDate: null,
                notes: '80/20 ground beef',
                createdAt: Date.now(),
                lastUpdated: Date.now()
            },
            {
                id: 5,
                name: 'Burger Buns',
                category: 'Bread',
                unit: 'pc',
                currentStock: 100,
                minStock: 20,
                maxStock: 200,
                cost: 0.75,
                supplier: 'Local Bakery',
                location: 'Pantry A',
                expiryDate: null,
                notes: 'Sesame seed burger buns',
                createdAt: Date.now(),
                lastUpdated: Date.now()
            }
        ];
    },
    
    getDefaultSuppliers() {
        return [
            {
                id: 1,
                name: 'Local Bakery',
                contact: 'John Smith',
                phone: '(555) 123-4567',
                email: 'john@localbakery.com',
                address: '123 Main St, City, State 12345',
                paymentTerms: 'Net 30',
                notes: 'Reliable supplier for bread and dough products',
                createdAt: Date.now()
            },
            {
                id: 2,
                name: 'Italian Imports',
                contact: 'Maria Rossi',
                phone: '(555) 234-5678',
                email: 'maria@italianimports.com',
                address: '456 Oak Ave, City, State 12345',
                paymentTerms: 'Net 15',
                notes: 'Premium Italian ingredients and sauces',
                createdAt: Date.now()
            },
            {
                id: 3,
                name: 'Dairy Fresh',
                contact: 'Mike Johnson',
                phone: '(555) 345-6789',
                email: 'mike@dairyfresh.com',
                address: '789 Pine Rd, City, State 12345',
                paymentTerms: 'Net 7',
                notes: 'Fresh dairy products delivered daily',
                createdAt: Date.now()
            },
            {
                id: 4,
                name: 'Premium Meats',
                contact: 'Sarah Wilson',
                phone: '(555) 456-7890',
                email: 'sarah@premiummeats.com',
                address: '321 Elm St, City, State 12345',
                paymentTerms: 'Net 30',
                notes: 'High-quality meat products',
                createdAt: Date.now()
            }
        ];
    },
    
    // Get inventory categories
    async getInventoryCategories() {
        try {
            const response = await api.request('get', '/inventory/categories');
            return response.success ? (response.data.data || response.data) : [];
        } catch (error) {
            console.error('Error getting inventory categories:', error);
            // Fallback to local categories
            const categories = [...new Set(this.inventory.map(item => item.category))];
            return categories.sort();
        }
    },
    
    // Get waste reasons
    async getWasteReasons() {
        try {
            const response = await api.request('get', '/waste/reasons');
            return response.success ? (response.data.data || response.data) : [];
        } catch (error) {
            console.error('Error getting waste reasons:', error);
            return ['Expired', 'Damaged', 'Quality Issue', 'Overstock', 'Other'];
        }
    },
    
    // Get waste categories
    async getWasteCategories() {
        try {
            const response = await api.request('get', '/waste/categories');
            return response.success ? (response.data.data || response.data) : [];
        } catch (error) {
            console.error('Error getting waste categories:', error);
            return ['Food Waste', 'Packaging', 'Equipment', 'Other'];
        }
    },
    
    // Get purchase statistics
    async getPurchaseStats() {
        try {
            const response = await api.request('get', '/purchases/stats');
            return response.success ? (response.data.data || response.data) : {};
        } catch (error) {
            console.error('Error getting purchase stats:', error);
            return {};
        }
    },
    
    // Get waste statistics
    async getWasteStats() {
        try {
            const response = await api.request('get', '/waste/stats');
            return response.success ? (response.data.data || response.data) : {};
        } catch (error) {
            console.error('Error getting waste stats:', error);
            return {};
        }
    },
    
    // Get overdue purchases
    async getOverduePurchases() {
        try {
            const response = await api.request('get', '/purchases/alerts/overdue');
            return response.success ? (response.data.data || response.data) : [];
        } catch (error) {
            console.error('Error getting overdue purchases:', error);
            return [];
        }
    },
    
    // Get filtered inventory with API support
    async getFilteredInventory() {
        try {
            const params = new URLSearchParams();
            
            if (this.inventorySearchTerm) {
                params.append('search', this.inventorySearchTerm);
            }
            if (this.inventoryFilterCategory !== 'all') {
                params.append('category', this.inventoryFilterCategory);
            }
            params.append('sort_by', this.inventorySortBy);
            params.append('sort_order', this.inventorySortOrder);
            
            const response = await api.request('get', `/inventory?${params.toString()}`);
            return response.success ? (response.data.data || response.data) : [];
        } catch (error) {
            console.error('Error getting filtered inventory:', error);
            // Fallback to local filtering
            let filtered = this.inventory;
            
            if (this.inventorySearchTerm) {
                const search = this.inventorySearchTerm.toLowerCase();
                filtered = filtered.filter(item => 
                    item.name.toLowerCase().includes(search) ||
                    item.category.toLowerCase().includes(search)
                );
            }
            
            if (this.inventoryFilterCategory !== 'all') {
                filtered = filtered.filter(item => item.category === this.inventoryFilterCategory);
            }
            
            filtered.sort((a, b) => {
                let aVal = a[this.inventorySortBy];
                let bVal = b[this.inventorySortBy];
                
                if (this.inventorySortBy === 'name' || this.inventorySortBy === 'category') {
                    aVal = aVal.toLowerCase();
                    bVal = bVal.toLowerCase();
                }
                
                if (this.inventorySortOrder === 'asc') {
                    return aVal > bVal ? 1 : -1;
                } else {
                    return aVal < bVal ? 1 : -1;
                }
            });
            
            return filtered;
        }
    },
    
    // Initialize inventory module
    async initInventory() {
        await this.loadInventory();
        await this.updateInventoryAlerts();
    }
});

// Initialize inventory module when the page loads
document.addEventListener('DOMContentLoaded', () => {
    if (window.inventory) {
        window.inventory.initInventory();
    }
}); 