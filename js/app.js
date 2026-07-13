// js/app.js
// Main Alpine.js app that composes all modules

import { createAppState } from './state.js';
import { createRecipesModule } from './recipes.js';
import { createOrdersModule } from './orders.js';
import { createTablesModule } from './tables.js';
import { createChefsStationsModule } from './chefs-stations.js';
import { createSettingsModule } from './settings.js';
import { createInventoryModule } from './inventory.js';
import api from './api.js';

// Register before Alpine starts (module scripts run before deferred classic scripts)
document.addEventListener('alpine:init', () => {
    Alpine.data('app', () => ({
        ...createAppState(),
        ...createRecipesModule(),
        ...createOrdersModule(),
        ...createTablesModule(),
        ...createChefsStationsModule(),
        ...createSettingsModule(),
        ...createInventoryModule(),

        async refreshAllData() {
            try {
                await this.loadAllData();
                console.log('All data refreshed successfully');
            } catch (error) {
                console.error('Error refreshing data:', error);
            }
        },

        validateData() {
            const errors = [];

            if (!Array.isArray(this.recipes)) {
                errors.push('Recipes data is invalid');
            }
            if (!Array.isArray(this.orders)) {
                errors.push('Orders data is invalid');
            }
            if (!Array.isArray(this.tables)) {
                errors.push('Tables data is invalid');
            }
            if (!this.settings || typeof this.settings !== 'object') {
                errors.push('Settings data is invalid');
            }
            if (!Array.isArray(this.inventory)) {
                errors.push('Inventory data is invalid');
            }

            return errors;
        },

        exportAllData() {
            try {
                const exportData = {
                    recipes: this.recipes,
                    orders: this.orders,
                    tables: this.tables,
                    settings: this.settings,
                    chefs: this.chefs,
                    stations: this.stations,
                    recipeCategories: this.recipeCategories,
                    inventory: this.inventory,
                    suppliers: this.suppliers,
                    purchases: this.purchases,
                    waste: this.waste,
                    exportDate: new Date().toISOString(),
                    version: '1.0'
                };

                const dataStr = JSON.stringify(exportData, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `restaurant_backup_${new Date().toISOString().split('T')[0]}.json`;
                link.click();
                URL.revokeObjectURL(url);

                return true;
            } catch (error) {
                console.error('Error exporting data:', error);
                alert('Error exporting data. Please try again.');
                return false;
            }
        },

        async importAllData(jsonData) {
            try {
                const data = JSON.parse(jsonData);

                if (!data.recipes || !data.orders || !data.tables || !data.settings) {
                    throw new Error('Invalid backup file format');
                }

                this.recipes = Array.isArray(data.recipes) ? data.recipes : [];
                this.orders = Array.isArray(data.orders) ? data.orders : [];
                this.tables = Array.isArray(data.tables) ? data.tables : [];
                this.settings = data.settings || {};
                this.chefs = Array.isArray(data.chefs) ? data.chefs : [];
                this.stations = Array.isArray(data.stations) ? data.stations : [];
                this.recipeCategories = Array.isArray(data.recipeCategories) ? data.recipeCategories : [];
                this.inventory = Array.isArray(data.inventory) ? data.inventory : [];
                this.suppliers = Array.isArray(data.suppliers) ? data.suppliers : [];
                this.purchases = Array.isArray(data.purchases) ? data.purchases : [];
                this.waste = Array.isArray(data.waste) ? data.waste : [];

                this.saveAllData();
                this.validateAndCleanData();

                alert('Data imported successfully!');
                return true;
            } catch (error) {
                console.error('Error importing data:', error);
                alert('Error importing data. Please check the file format.');
                return false;
            }
        },

        clearAllData() {
            if (!confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
                return;
            }

            try {
                localStorage.removeItem('restaurant_recipes');
                localStorage.removeItem('restaurant_orders');
                localStorage.removeItem('restaurant_tables');
                localStorage.removeItem('restaurant_settings');
                localStorage.removeItem('restaurant_chefs');
                localStorage.removeItem('restaurant_stations');
                localStorage.removeItem('restaurant_recipe_categories');
                localStorage.removeItem('restaurant_inventory');
                localStorage.removeItem('restaurant_suppliers');
                localStorage.removeItem('restaurant_purchases');
                localStorage.removeItem('restaurant_waste');

                this.recipes = [];
                this.orders = [];
                this.tables = [];
                this.chefs = [];
                this.stations = [];
                this.recipeCategories = ['Appetizer', 'Main Course', 'Dessert', 'Beverage', 'Pizza', 'Salad', 'Soup', 'Pasta', 'Seafood', 'Meat', 'Vegetarian'];
                this.inventory = [];
                this.suppliers = [];
                this.purchases = [];
                this.waste = [];

                this.settings = this.getDefaultSettings();

                this.currentOrder = {
                    items: [],
                    subtotal: 0,
                    tax: 0,
                    total: 0,
                    tableNumber: null,
                    deliveryFee: 0
                };

                this.selectedRecipe = null;
                this.selectedTable = null;
                this.showRecipeForm = false;
                this.showTableForm = false;
                this.showBackup = false;
                this.showInventoryForm = false;
                this.showPurchaseForm = false;
                this.showSupplierForm = false;
                this.showWasteForm = false;

                alert('All data has been cleared successfully.');
            } catch (error) {
                console.error('Error clearing data:', error);
                alert('Error clearing data. Please try again.');
            }
        },

        async systemHealthCheck() {
            const health = {
                online: navigator.onLine,
                localStorage: false,
                api: false,
                dataIntegrity: false,
                dataSource: this.dataSource,
            };

            try {
                localStorage.setItem('health_check', 'test');
                localStorage.removeItem('health_check');
                health.localStorage = true;
            } catch (error) {
                console.error('localStorage not available:', error);
            }

            try {
                health.api = await api.checkConnection();
            } catch (error) {
                console.error('API not available:', error);
            }

            const validationErrors = this.validateData();
            health.dataIntegrity = validationErrors.length === 0;

            return health;
        }
    }));
});
