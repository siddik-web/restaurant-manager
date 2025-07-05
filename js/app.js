// js/app.js
// Main Alpine.js app that composes all modules

import { createAppState } from './state.js';
import { createRecipesModule } from './recipes.js';
import { createOrdersModule } from './orders.js';
import { createTablesModule } from './tables.js';
import { createChefsStationsModule } from './chefs-stations.js';
import { createSettingsModule } from './settings.js';

// Create the main Alpine.js component
document.addEventListener('alpine:init', () => {
    Alpine.data('app', () => {
        // Create the base state
        const state = createAppState();
        
        // Create all modules
        const recipesModule = createRecipesModule(state);
        const ordersModule = createOrdersModule(state);
        const tablesModule = createTablesModule(state);
        const chefsStationsModule = createChefsStationsModule(state);
        const settingsModule = createSettingsModule(state);
        
        // Compose all modules into a single Alpine.js component
        return {
            // Spread the state
            ...state,
            
            // Spread all module methods
            ...recipesModule,
            ...ordersModule,
            ...tablesModule,
            ...chefsStationsModule,
            ...settingsModule,
            
            // Additional utility methods that span multiple modules
            async refreshAllData() {
                try {
                    await state.loadAllData();
                    console.log('All data refreshed successfully');
                } catch (error) {
                    console.error('Error refreshing data:', error);
                }
            },
            
            // Cross-module validation
            validateData() {
                const errors = [];
                
                // Validate recipes
                if (!Array.isArray(state.recipes)) {
                    errors.push('Recipes data is invalid');
                }
                
                // Validate orders
                if (!Array.isArray(state.orders)) {
                    errors.push('Orders data is invalid');
                }
                
                // Validate tables
                if (!Array.isArray(state.tables)) {
                    errors.push('Tables data is invalid');
                }
                
                // Validate settings
                if (!state.settings || typeof state.settings !== 'object') {
                    errors.push('Settings data is invalid');
                }
                
                return errors;
            },
            
            // Export all data
            exportAllData() {
                try {
                    const exportData = {
                        recipes: state.recipes,
                        orders: state.orders,
                        tables: state.tables,
                        settings: state.settings,
                        chefs: state.chefs,
                        stations: state.stations,
                        recipeCategories: state.recipeCategories,
                        exportDate: new Date().toISOString(),
                        version: '1.0'
                    };
                    
                    const dataStr = JSON.stringify(exportData, null, 2);
                    const dataBlob = new Blob([dataStr], {type: 'application/json'});
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
            
            // Import all data
            async importAllData(jsonData) {
                try {
                    const data = JSON.parse(jsonData);
                    
                    // Validate data structure
                    if (!data.recipes || !data.orders || !data.tables || !data.settings) {
                        throw new Error('Invalid backup file format');
                    }
                    
                    // Import data with validation
                    state.recipes = Array.isArray(data.recipes) ? data.recipes : [];
                    state.orders = Array.isArray(data.orders) ? data.orders : [];
                    state.tables = Array.isArray(data.tables) ? data.tables : [];
                    state.settings = data.settings || {};
                    state.chefs = Array.isArray(data.chefs) ? data.chefs : [];
                    state.stations = Array.isArray(data.stations) ? data.stations : [];
                    state.recipeCategories = Array.isArray(data.recipeCategories) ? data.recipeCategories : [];
                    
                    // Save all imported data
                    state.saveAllData();
                    
                    // Validate and clean imported data
                    state.validateAndCleanData();
                    
                    alert('Data imported successfully!');
                    return true;
                } catch (error) {
                    console.error('Error importing data:', error);
                    alert('Error importing data. Please check the file format.');
                    return false;
                }
            },
            
            // Clear all data
            clearAllData() {
                if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
                    try {
                        // Clear all localStorage
                        localStorage.removeItem('restaurant_recipes');
                        localStorage.removeItem('restaurant_orders');
                        localStorage.removeItem('restaurant_tables');
                        localStorage.removeItem('restaurant_settings');
                        localStorage.removeItem('restaurant_chefs');
                        localStorage.removeItem('restaurant_stations');
                        localStorage.removeItem('restaurant_recipe_categories');
                        
                        // Reset all data arrays
                        state.recipes = [];
                        state.orders = [];
                        state.tables = [];
                        state.chefs = [];
                        state.stations = [];
                        state.recipeCategories = ['Appetizer', 'Main Course', 'Dessert', 'Beverage', 'Pizza', 'Salad', 'Soup', 'Pasta', 'Seafood', 'Meat', 'Vegetarian'];
                        
                        // Reset settings to defaults
                        state.settings = settingsModule.getDefaultSettings();
                        
                        // Reset current order
                        state.currentOrder = {
                            items: [],
                            subtotal: 0,
                            tax: 0,
                            total: 0,
                            tableNumber: null,
                            deliveryFee: 0
                        };
                        
                        // Reset form states
                        state.selectedRecipe = null;
                        state.selectedTable = null;
                        state.showRecipeForm = false;
                        state.showTableForm = false;
                        state.showBackup = false;
                        
                        alert('All data has been cleared successfully.');
                    } catch (error) {
                        console.error('Error clearing data:', error);
                        alert('Error clearing data. Please try again.');
                    }
                }
            },
            
            // System health check
            async systemHealthCheck() {
                const health = {
                    online: navigator.onLine,
                    localStorage: false,
                    api: false,
                    dataIntegrity: false
                };
                
                // Check localStorage
                try {
                    localStorage.setItem('health_check', 'test');
                    localStorage.removeItem('health_check');
                    health.localStorage = true;
                } catch (error) {
                    console.error('localStorage not available:', error);
                }
                
                // Check API
                try {
                    const response = await fetch('/api/health');
                    health.api = response.ok;
                } catch (error) {
                    console.error('API not available:', error);
                }
                
                // Check data integrity
                const validationErrors = this.validateData();
                health.dataIntegrity = validationErrors.length === 0;
                
                return health;
            },
            
            // Initialize the app
            async init() {
                console.log('Initializing Restaurant POS App...');
                
                // Perform health check
                const health = await this.systemHealthCheck();
                console.log('System health:', health);
                
                // Initialize app state
                await state.initApp();
                
                console.log('Restaurant POS App initialized successfully');
            }
        };
    });
}); 