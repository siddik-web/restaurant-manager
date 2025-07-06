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
        supplier: '',
        location: '',
        expiryDate: null,
        notes: ''
    },
    
    // Purchase form
    purchaseForm: {
        supplier: '',
        items: [],
        totalCost: 0,
        purchaseDate: new Date().toISOString().split('T')[0],
        expectedDelivery: null,
        notes: ''
    },
    
    // Supplier form
    supplierForm: {
        name: '',
        contact: '',
        phone: '',
        email: '',
        address: '',
        paymentTerms: '',
        notes: ''
    },
    
    // Waste form
    wasteForm: {
        item: '',
        quantity: 0,
        reason: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
    },
    
    // Filters and search
    inventorySearchTerm: '',
    inventoryFilterCategory: 'all',
    inventorySortBy: 'name',
    inventorySortOrder: 'asc',
    
    // Load inventory data
    loadInventory() {
        const savedInventory = localStorage.getItem('restaurant_inventory');
        this.inventory = savedInventory ? JSON.parse(savedInventory) : this.getDefaultInventory();
        
        const savedSuppliers = localStorage.getItem('restaurant_suppliers');
        this.suppliers = savedSuppliers ? JSON.parse(savedSuppliers) : this.getDefaultSuppliers();
        
        const savedPurchases = localStorage.getItem('restaurant_purchases');
        this.purchases = savedPurchases ? JSON.parse(savedPurchases) : [];
        
        const savedWaste = localStorage.getItem('restaurant_waste');
        this.waste = savedWaste ? JSON.parse(savedWaste) : [];
        
        this.updateInventoryAlerts();
    },
    
    // Save inventory data
    saveInventory() {
        localStorage.setItem('restaurant_inventory', JSON.stringify(this.inventory));
        this.updateInventoryAlerts();
    },
    
    saveSuppliers() {
        localStorage.setItem('restaurant_suppliers', JSON.stringify(this.suppliers));
    },
    
    savePurchases() {
        localStorage.setItem('restaurant_purchases', JSON.stringify(this.purchases));
    },
    
    saveWaste() {
        localStorage.setItem('restaurant_waste', JSON.stringify(this.waste));
    },
    
    // Get filtered inventory
    getFilteredInventory() {
        let filtered = this.inventory;
        
        // Search filter
        if (this.inventorySearchTerm) {
            const search = this.inventorySearchTerm.toLowerCase();
            filtered = filtered.filter(item => 
                item.name.toLowerCase().includes(search) ||
                item.category.toLowerCase().includes(search) ||
                item.supplier.toLowerCase().includes(search)
            );
        }
        
        // Category filter
        if (this.inventoryFilterCategory !== 'all') {
            filtered = filtered.filter(item => item.category === this.inventoryFilterCategory);
        }
        
        // Sort
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
    },
    
    // Get inventory categories
    getInventoryCategories() {
        const categories = [...new Set(this.inventory.map(item => item.category))];
        return categories.sort();
    },
    
    // Inventory CRUD operations
    addInventory() {
        this.editingInventory = null;
        this.resetInventoryForm();
        this.showInventoryForm = true;
    },
    
    editInventory(item) {
        this.editingInventory = item;
        this.inventoryForm = { ...item };
        this.showInventoryForm = true;
    },
    
    saveInventory() {
        if (this.editingInventory) {
            // Update existing item
            const index = this.inventory.findIndex(item => item.id === this.inventoryForm.id);
            if (index !== -1) {
                this.inventory[index] = { ...this.inventoryForm };
            }
        } else {
            // Add new item
            const newItem = {
                ...this.inventoryForm,
                id: Date.now(),
                createdAt: Date.now(),
                lastUpdated: Date.now()
            };
            this.inventory.push(newItem);
        }
        
        this.saveInventory();
        this.showInventoryForm = false;
        this.editingInventory = null;
        this.resetInventoryForm();
    },
    
    deleteInventory(id) {
        if (confirm('Are you sure you want to delete this inventory item?')) {
            this.inventory = this.inventory.filter(item => item.id !== id);
            this.saveInventory();
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
            supplier: '',
            location: '',
            expiryDate: null,
            notes: ''
        };
    },
    
    // Stock operations
    updateStock(id, quantity, operation = 'add', reason = 'Manual adjustment') {
        const item = this.inventory.find(item => item.id === id);
        if (item) {
            const oldStock = item.currentStock;
            
            if (operation === 'add') {
                item.currentStock += quantity;
            } else if (operation === 'subtract') {
                item.currentStock = Math.max(0, item.currentStock - quantity);
            } else if (operation === 'set') {
                item.currentStock = quantity;
            }
            
            item.lastUpdated = Date.now();
            
            // Log the transaction
            this.logStockTransaction(item, oldStock, item.currentStock, operation, reason);
            
            this.saveInventory();
            this.updateInventoryAlerts();
        }
    },
    
    // Automatic stock deduction from orders
    deductStockFromOrder(order) {
        order.items.forEach(orderItem => {
            const recipe = state.recipes.find(r => r.id === orderItem.id);
            if (recipe && recipe.ingredients) {
                recipe.ingredients.forEach(ingredient => {
                    const inventoryItem = this.inventory.find(item => 
                        item.name.toLowerCase() === ingredient.name.toLowerCase()
                    );
                    
                    if (inventoryItem) {
                        const totalQuantity = ingredient.quantity * orderItem.quantity;
                        this.updateStock(
                            inventoryItem.id, 
                            totalQuantity, 
                            'subtract', 
                            `Order #${order.id} - ${recipe.name}`
                        );
                    }
                });
            }
        });
    },
    
    // Stock transaction logging
    logStockTransaction(item, oldStock, newStock, operation, reason) {
        const transaction = {
            id: Date.now(),
            itemId: item.id,
            itemName: item.name,
            oldStock,
            newStock,
            change: newStock - oldStock,
            operation,
            reason,
            timestamp: Date.now()
        };
        
        const transactions = JSON.parse(localStorage.getItem('restaurant_stock_transactions') || '[]');
        transactions.push(transaction);
        localStorage.setItem('restaurant_stock_transactions', JSON.stringify(transactions));
    },
    
    // Get stock transactions
    getStockTransactions(itemId = null) {
        const transactions = JSON.parse(localStorage.getItem('restaurant_stock_transactions') || '[]');
        if (itemId) {
            return transactions.filter(t => t.itemId === itemId);
        }
        return transactions;
    },
    
    // Purchase management
    addPurchase() {
        this.editingPurchase = null;
        this.resetPurchaseForm();
        this.showPurchaseForm = true;
    },
    
    editPurchase(purchase) {
        this.editingPurchase = purchase;
        this.purchaseForm = { ...purchase };
        this.showPurchaseForm = true;
    },
    
    savePurchase() {
        if (this.editingPurchase) {
            const index = this.purchases.findIndex(p => p.id === this.purchaseForm.id);
            if (index !== -1) {
                this.purchases[index] = { ...this.purchaseForm };
            }
        } else {
            const newPurchase = {
                ...this.purchaseForm,
                id: Date.now(),
                createdAt: Date.now(),
                status: 'pending'
            };
            this.purchases.push(newPurchase);
        }
        
        this.savePurchases();
        this.showPurchaseForm = false;
        this.editingPurchase = null;
        this.resetPurchaseForm();
    },
    
    receivePurchase(purchaseId) {
        const purchase = this.purchases.find(p => p.id === purchaseId);
        if (purchase) {
            purchase.status = 'received';
            purchase.receivedDate = Date.now();
            
            // Update inventory stock
            purchase.items.forEach(item => {
                this.updateStock(
                    item.inventoryId,
                    item.quantity,
                    'add',
                    `Purchase #${purchase.id} from ${purchase.supplier}`
                );
            });
            
            this.savePurchases();
        }
    },
    
    resetPurchaseForm() {
        this.purchaseForm = {
            supplier: '',
            items: [],
            totalCost: 0,
            purchaseDate: new Date().toISOString().split('T')[0],
            expectedDelivery: null,
            notes: ''
        };
    },
    
    addPurchaseItem() {
        this.purchaseForm.items.push({
            inventoryId: '',
            name: '',
            quantity: 0,
            unit: '',
            cost: 0
        });
    },
    
    removePurchaseItem(index) {
        this.purchaseForm.items.splice(index, 1);
    },
    
    calculatePurchaseTotal() {
        this.purchaseForm.totalCost = this.purchaseForm.items.reduce(
            (sum, item) => sum + (item.cost * item.quantity), 0
        );
    },
    
    // Supplier management
    addSupplier() {
        this.editingSupplier = null;
        this.resetSupplierForm();
        this.showSupplierForm = true;
    },
    
    editSupplier(supplier) {
        this.editingSupplier = supplier;
        this.supplierForm = { ...supplier };
        this.showSupplierForm = true;
    },
    
    saveSupplier() {
        if (this.editingSupplier) {
            const index = this.suppliers.findIndex(s => s.id === this.supplierForm.id);
            if (index !== -1) {
                this.suppliers[index] = { ...this.supplierForm };
            }
        } else {
            const newSupplier = {
                ...this.supplierForm,
                id: Date.now(),
                createdAt: Date.now()
            };
            this.suppliers.push(newSupplier);
        }
        
        this.saveSuppliers();
        this.showSupplierForm = false;
        this.editingSupplier = null;
        this.resetSupplierForm();
    },
    
    deleteSupplier(id) {
        if (confirm('Are you sure you want to delete this supplier?')) {
            this.suppliers = this.suppliers.filter(s => s.id !== id);
            this.saveSuppliers();
        }
    },
    
    resetSupplierForm() {
        this.supplierForm = {
            name: '',
            contact: '',
            phone: '',
            email: '',
            address: '',
            paymentTerms: '',
            notes: ''
        };
    },
    
    // Waste management
    addWaste() {
        this.resetWasteForm();
        this.showWasteForm = true;
    },
    
    saveWaste() {
        const newWaste = {
            ...this.wasteForm,
            id: Date.now(),
            createdAt: Date.now()
        };
        
        this.waste.push(newWaste);
        
        // Deduct from inventory
        const inventoryItem = this.inventory.find(item => item.id === this.wasteForm.item);
        if (inventoryItem) {
            this.updateStock(
                inventoryItem.id,
                this.wasteForm.quantity,
                'subtract',
                `Waste - ${this.wasteForm.reason}`
            );
        }
        
        this.saveWaste();
        this.showWasteForm = false;
        this.resetWasteForm();
    },
    
    resetWasteForm() {
        this.wasteForm = {
            item: '',
            quantity: 0,
            reason: '',
            date: new Date().toISOString().split('T')[0],
            notes: ''
        };
    },
    
    // Inventory alerts
    updateInventoryAlerts() {
        this.inventoryAlerts = this.inventory.filter(item => 
            item.currentStock <= item.minStock
        );
    },
    
    getLowStockItems() {
        return this.inventory.filter(item => item.currentStock <= item.minStock);
    },
    
    getOutOfStockItems() {
        return this.inventory.filter(item => item.currentStock <= 0);
    },
    
    // Reports
    generateInventoryReport() {
        const report = {
            totalItems: this.inventory.length,
            totalValue: this.inventory.reduce((sum, item) => sum + (item.currentStock * item.cost), 0),
            lowStockItems: this.getLowStockItems().length,
            outOfStockItems: this.getOutOfStockItems().length,
            categories: this.getInventoryCategories().map(category => {
                const items = this.inventory.filter(item => item.category === category);
                return {
                    category,
                    count: items.length,
                    value: items.reduce((sum, item) => sum + (item.currentStock * item.cost), 0)
                };
            }),
            topSuppliers: this.getTopSuppliers(),
            recentTransactions: this.getStockTransactions().slice(-10)
        };
        
        return report;
    },
    
    getTopSuppliers() {
        const supplierStats = {};
        this.inventory.forEach(item => {
            if (item.supplier) {
                if (!supplierStats[item.supplier]) {
                    supplierStats[item.supplier] = { count: 0, value: 0 };
                }
                supplierStats[item.supplier].count++;
                supplierStats[item.supplier].value += item.currentStock * item.cost;
            }
        });
        
        return Object.entries(supplierStats)
            .map(([name, stats]) => ({ name, ...stats }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    },
    
    // Export/Import
    exportInventoryData() {
        const data = {
            inventory: this.inventory,
            suppliers: this.suppliers,
            purchases: this.purchases,
            waste: this.waste,
            transactions: this.getStockTransactions(),
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventory_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    },
    
    importInventoryData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.inventory) this.inventory = data.inventory;
                if (data.suppliers) this.suppliers = data.suppliers;
                if (data.purchases) this.purchases = data.purchases;
                if (data.waste) this.waste = data.waste;
                
                this.saveInventory();
                this.saveSuppliers();
                this.savePurchases();
                this.saveWaste();
                
                alert('Inventory data imported successfully!');
            } catch (error) {
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
    }
}); 