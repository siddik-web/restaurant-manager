// js/settings.js
// Settings management module for Alpine.js

import api from './api.js';

export const createSettingsModule = (state) => ({
    // Settings Management Functions
    async loadSettings() {
        try {
            const response = await api.getSettings();
            if (response.success) {
                state.settings = response.data.data || response.data;
            } else {
                this.loadSettingsFromLocalStorage();
            }
        } catch (error) {
            console.error('Error loading settings:', error);
            this.loadSettingsFromLocalStorage();
        }
    },

    loadSettingsFromLocalStorage() {
        const savedSettings = localStorage.getItem('restaurant_settings');
        state.settings = savedSettings ? JSON.parse(savedSettings) : this.getDefaultSettings();
    },

    async saveSettings() {
        try {
            const response = await api.updateSettings(state.settings);
            if (response.success) {
                // Save to localStorage as fallback
                localStorage.setItem('restaurant_settings', JSON.stringify(state.settings));
                alert('Settings saved successfully!');
            } else {
                alert('Error saving settings: ' + (response.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            // Fallback to localStorage only
            localStorage.setItem('restaurant_settings', JSON.stringify(state.settings));
            alert('Settings saved to local storage. Some features may not sync with server.');
        }
    },

    getDefaultSettings() {
        return {
            taxRate: 10,
            deliveryFee: 5,
            currency: 'USD',
            restaurantName: 'Restaurant Manager',
            address: '123 Main Street, City, State 12345',
            phone: '+1 (555) 123-4567',
            email: 'info@restaurant.com',
            website: 'www.restaurant.com',
            receiptFooter: 'Thank you for dining with us!',
            logo: '',
            printLogo: true,
            printHeader: true,
            printFooter: true,
            autoPrint: false,
            receiptWidth: 80,
            fontSize: 12
        };
    },

    // Individual setting updates
    async updateSetting(key, value) {
        try {
            const response = await api.request('post', `/settings/value/${key}`, { value });
            if (response.success) {
                state.settings[key] = value;
                localStorage.setItem('restaurant_settings', JSON.stringify(state.settings));
            }
        } catch (error) {
            console.error('Error updating setting:', error);
            // Fallback to localStorage
            state.settings[key] = value;
            localStorage.setItem('restaurant_settings', JSON.stringify(state.settings));
        }
    },

    // Restaurant information management
    async updateRestaurantInfo(info) {
        try {
            const response = await api.updateSettings({
                restaurantName: info.restaurantName,
                address: info.address,
                phone: info.phone,
                email: info.email,
                website: info.website
            });
            
            if (response.success) {
                Object.assign(state.settings, info);
                localStorage.setItem('restaurant_settings', JSON.stringify(state.settings));
                return true;
            }
        } catch (error) {
            console.error('Error updating restaurant info:', error);
            return false;
        }
    },

    // Receipt settings management
    async updateReceiptSettings(settings) {
        try {
            const response = await api.updateSettings({
                receiptFooter: settings.receiptFooter,
                printLogo: settings.printLogo,
                printHeader: settings.printHeader,
                printFooter: settings.printFooter,
                autoPrint: settings.autoPrint,
                receiptWidth: settings.receiptWidth,
                fontSize: settings.fontSize
            });
            
            if (response.success) {
                Object.assign(state.settings, settings);
                localStorage.setItem('restaurant_settings', JSON.stringify(state.settings));
                return true;
            }
        } catch (error) {
            console.error('Error updating receipt settings:', error);
            return false;
        }
    },

    // Logo upload handling
    async uploadLogo(file) {
        try {
            const formData = new FormData();
            formData.append('logo', file);
            
            const response = await fetch('/api/settings/upload-logo', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            if (result.success) {
                state.settings.logo = result.data.logo_url;
                localStorage.setItem('restaurant_settings', JSON.stringify(state.settings));
                return true;
            }
        } catch (error) {
            console.error('Error uploading logo:', error);
            return false;
        }
    },

    // Tax and delivery settings
    async updateTaxSettings(taxRate, deliveryFee) {
        try {
            const response = await api.updateSettings({
                taxRate: parseFloat(taxRate),
                deliveryFee: parseFloat(deliveryFee)
            });
            
            if (response.success) {
                state.settings.taxRate = parseFloat(taxRate);
                state.settings.deliveryFee = parseFloat(deliveryFee);
                localStorage.setItem('restaurant_settings', JSON.stringify(state.settings));
                return true;
            }
        } catch (error) {
            console.error('Error updating tax settings:', error);
            return false;
        }
    },

    // Currency settings
    async updateCurrencySettings(currency) {
        try {
            const response = await api.updateSettings({ currency });
            
            if (response.success) {
                state.settings.currency = currency;
                localStorage.setItem('restaurant_settings', JSON.stringify(state.settings));
                return true;
            }
        } catch (error) {
            console.error('Error updating currency settings:', error);
            return false;
        }
    },

    // Print settings validation
    validatePrintSettings(settings) {
        const errors = [];
        
        if (settings.receiptWidth < 50 || settings.receiptWidth > 120) {
            errors.push('Receipt width must be between 50 and 120 mm');
        }
        
        if (settings.fontSize < 8 || settings.fontSize > 16) {
            errors.push('Font size must be between 8 and 16 pt');
        }
        
        return errors;
    },

    // Settings export/import
    exportSettings() {
        const settingsData = {
            settings: state.settings,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const dataStr = JSON.stringify(settingsData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `restaurant_settings_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    },

    async importSettings(file) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            if (data.settings) {
                // Validate settings structure
                const requiredKeys = ['taxRate', 'deliveryFee', 'currency', 'restaurantName'];
                const hasRequiredKeys = requiredKeys.every(key => data.settings.hasOwnProperty(key));
                
                if (!hasRequiredKeys) {
                    throw new Error('Invalid settings file format');
                }
                
                // Update settings
                state.settings = { ...state.settings, ...data.settings };
                
                // Save to API and localStorage
                await this.saveSettings();
                
                return true;
            } else {
                throw new Error('Invalid settings file format');
            }
        } catch (error) {
            console.error('Error importing settings:', error);
            alert('Error importing settings. Please check the file format.');
            return false;
        }
    },

    // Settings reset
    async resetSettings() {
        if (confirm('Are you sure you want to reset all settings to default values? This action cannot be undone.')) {
            try {
                const defaultSettings = this.getDefaultSettings();
                const response = await api.updateSettings(defaultSettings);
                
                if (response.success) {
                    state.settings = defaultSettings;
                    localStorage.setItem('restaurant_settings', JSON.stringify(state.settings));
                    alert('Settings reset successfully!');
                } else {
                    alert('Error resetting settings: ' + (response.message || 'Unknown error'));
                }
            } catch (error) {
                console.error('Error resetting settings:', error);
                // Fallback to localStorage only
                state.settings = this.getDefaultSettings();
                localStorage.setItem('restaurant_settings', JSON.stringify(state.settings));
                alert('Settings reset to local storage. Some features may not sync with server.');
            }
        }
    },

    // Settings validation
    validateSettings(settings) {
        const errors = [];
        
        // Validate tax rate
        if (settings.taxRate < 0 || settings.taxRate > 100) {
            errors.push('Tax rate must be between 0 and 100');
        }
        
        // Validate delivery fee
        if (settings.deliveryFee < 0) {
            errors.push('Delivery fee cannot be negative');
        }
        
        // Validate receipt width
        if (settings.receiptWidth < 50 || settings.receiptWidth > 120) {
            errors.push('Receipt width must be between 50 and 120 mm');
        }
        
        // Validate font size
        if (settings.fontSize < 8 || settings.fontSize > 16) {
            errors.push('Font size must be between 8 and 16 pt');
        }
        
        // Validate email format
        if (settings.email && !this.isValidEmail(settings.email)) {
            errors.push('Invalid email format');
        }
        
        // Validate phone format
        if (settings.phone && !this.isValidPhone(settings.phone)) {
            errors.push('Invalid phone number format');
        }
        
        return errors;
    },

    // Helper methods for validation
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    },

    // Settings categories
    getSettingsCategories() {
        return {
            restaurant: {
                name: 'Restaurant Information',
                icon: '🏪',
                settings: ['restaurantName', 'address', 'phone', 'email', 'website']
            },
            financial: {
                name: 'Financial Settings',
                icon: '💰',
                settings: ['taxRate', 'deliveryFee', 'currency']
            },
            receipt: {
                name: 'Receipt Settings',
                icon: '🧾',
                settings: ['receiptFooter', 'printLogo', 'printHeader', 'printFooter', 'autoPrint', 'receiptWidth', 'fontSize']
            },
            system: {
                name: 'System Settings',
                icon: '⚙️',
                settings: ['logo']
            }
        };
    },

    // Get settings by category
    getSettingsByCategory(category) {
        const categories = this.getSettingsCategories();
        const categorySettings = categories[category];
        
        if (!categorySettings) return {};
        
        const filteredSettings = {};
        categorySettings.settings.forEach(key => {
            if (state.settings.hasOwnProperty(key)) {
                filteredSettings[key] = state.settings[key];
            }
        });
        
        return filteredSettings;
    },

    // Settings backup and restore
    async backupSettings() {
        try {
            const backupData = {
                settings: state.settings,
                timestamp: new Date().toISOString(),
                version: '1.0'
            };
            
            const response = await api.request('post', '/settings/backup', backupData);
            if (response.success) {
                alert('Settings backed up successfully!');
                return true;
            }
        } catch (error) {
            console.error('Error backing up settings:', error);
            return false;
        }
    },

    async restoreSettings(backupId) {
        try {
            const response = await api.request('post', `/settings/restore/${backupId}`);
            if (response.success) {
                state.settings = response.data.settings;
                localStorage.setItem('restaurant_settings', JSON.stringify(state.settings));
                alert('Settings restored successfully!');
                return true;
            }
        } catch (error) {
            console.error('Error restoring settings:', error);
            return false;
        }
    }
}); 