// js/chefs-stations.js
// Chef and Station management module for Alpine.js

import api from './api.js';

export const createChefsStationsModule = (state) => ({
    // Chef Management Functions
    async addChef() {
        if (state.newChefName && !state.chefs.some(c => c.name === state.newChefName)) {
            try {
                const response = await api.createChef({ name: state.newChefName });
                if (response.success) {
                    state.chefs.push(response.data);
                    localStorage.setItem('restaurant_chefs', JSON.stringify(state.chefs));
                    state.newChefName = '';
                } else {
                    alert('Error adding chef: ' + (response.message || 'Unknown error'));
                }
            } catch (error) {
                console.error('Error adding chef:', error);
                alert('Error adding chef. Please try again.');
            }
        }
    },

    async removeChef(idx) {
        try {
            const chef = state.chefs[idx];
            if (chef && chef.id) {
                const response = await api.deleteChef(chef.id);
                if (response.success) {
                    state.chefs.splice(idx, 1);
                    localStorage.setItem('restaurant_chefs', JSON.stringify(state.chefs));
                } else {
                    alert('Error removing chef: ' + (response.message || 'Unknown error'));
                }
            } else {
                // Fallback for chefs without IDs (localStorage only)
                state.chefs.splice(idx, 1);
                localStorage.setItem('restaurant_chefs', JSON.stringify(state.chefs));
            }
        } catch (error) {
            console.error('Error removing chef:', error);
            // Fallback to localStorage only
            state.chefs.splice(idx, 1);
            localStorage.setItem('restaurant_chefs', JSON.stringify(state.chefs));
        }
    },

    async updateChef(chefId, data) {
        try {
            const response = await api.updateChef(chefId, data);
            if (response.success) {
                const index = state.chefs.findIndex(c => c.id === chefId);
                if (index !== -1) {
                    state.chefs[index] = response.data;
                    localStorage.setItem('restaurant_chefs', JSON.stringify(state.chefs));
                }
            }
        } catch (error) {
            console.error('Error updating chef:', error);
        }
    },

    // Station Management Functions
    async addStation() {
        if (state.newStationName && !state.stations.some(s => s.name === state.newStationName)) {
            try {
                const response = await api.createStation({ name: state.newStationName });
                if (response.success) {
                    state.stations.push(response.data);
                    localStorage.setItem('restaurant_stations', JSON.stringify(state.stations));
                    state.newStationName = '';
                } else {
                    alert('Error adding station: ' + (response.message || 'Unknown error'));
                }
            } catch (error) {
                console.error('Error adding station:', error);
                alert('Error adding station. Please try again.');
            }
        }
    },

    async removeStation(idx) {
        try {
            const station = state.stations[idx];
            if (station && station.id) {
                const response = await api.deleteStation(station.id);
                if (response.success) {
                    state.stations.splice(idx, 1);
                    localStorage.setItem('restaurant_stations', JSON.stringify(state.stations));
                } else {
                    alert('Error removing station: ' + (response.message || 'Unknown error'));
                }
            } else {
                // Fallback for stations without IDs (localStorage only)
                state.stations.splice(idx, 1);
                localStorage.setItem('restaurant_stations', JSON.stringify(state.stations));
            }
        } catch (error) {
            console.error('Error removing station:', error);
            // Fallback to localStorage only
            state.stations.splice(idx, 1);
            localStorage.setItem('restaurant_stations', JSON.stringify(state.stations));
        }
    },

    async updateStation(stationId, data) {
        try {
            const response = await api.updateStation(stationId, data);
            if (response.success) {
                const index = state.stations.findIndex(s => s.id === stationId);
                if (index !== -1) {
                    state.stations[index] = response.data;
                    localStorage.setItem('restaurant_stations', JSON.stringify(state.stations));
                }
            }
        } catch (error) {
            console.error('Error updating station:', error);
        }
    },

    // Chef Assignment Functions
    async assignOrderToChefStation(orderId, chefName, stationName) {
        try {
            const response = await api.request('post', `/orders/${orderId}/assign-chef-station`, {
                assigned_chef: chefName,
                assigned_station: stationName
            });
            
            if (response.success) {
                const order = state.orders.find(o => o.id === orderId);
                if (order) {
                    order.assignedChef = chefName;
                    order.assignedStation = stationName;
                    order.assignedTime = Date.now();
                    localStorage.setItem('restaurant_orders', JSON.stringify(state.orders));
                }
                
                state.showChefAssignModal = false;
                state.chefAssignOrderId = null;
                state.chefAssignName = '';
                state.chefAssignStation = '';
            }
        } catch (error) {
            console.error('Error assigning order to chef/station:', error);
        }
    },

    async unassignOrderChefStation(orderId) {
        try {
            const order = state.orders.find(o => o.id === orderId);
            if (order) {
                delete order.assignedChef;
                delete order.assignedStation;
                delete order.assignedTime;
                localStorage.setItem('restaurant_orders', JSON.stringify(state.orders));
            }
        } catch (error) {
            console.error('Error unassigning order from chef/station:', error);
        }
    },

    // Chef and Station Statistics
    getChefStats(chefName) {
        const chefOrders = state.orders.filter(order => 
            order.assignedChef === chefName
        );
        
        const completedOrders = chefOrders.filter(order => order.status === 'completed');
        const pendingOrders = chefOrders.filter(order => 
            ['new', 'preparing', 'ready'].includes(order.status)
        );
        
        // Calculate average prep time
        let avgPrepTime = 0;
        if (completedOrders.length > 0) {
            const totalPrepTime = completedOrders.reduce((sum, order) => {
                if (order.completedTime && order.timestamp) {
                    const prepTime = (order.completedTime - order.timestamp) / (1000 * 60); // minutes
                    return sum + prepTime;
                }
                return sum;
            }, 0);
            avgPrepTime = totalPrepTime / completedOrders.length;
        }
        
        // Calculate efficiency (on-time completion rate)
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
            totalOrders: chefOrders.length,
            completedOrders: completedOrders.length,
            pendingOrders: pendingOrders.length,
            avgPrepTime: Math.round(avgPrepTime),
            efficiency: Math.round(efficiency)
        };
    },

    getStationStats(stationName) {
        const stationOrders = state.orders.filter(order => 
            order.assignedStation === stationName
        );
        
        const completedOrders = stationOrders.filter(order => order.status === 'completed');
        const pendingOrders = stationOrders.filter(order => 
            ['new', 'preparing', 'ready'].includes(order.status)
        );
        
        // Calculate average prep time
        let avgPrepTime = 0;
        if (completedOrders.length > 0) {
            const totalPrepTime = completedOrders.reduce((sum, order) => {
                if (order.completedTime && order.timestamp) {
                    const prepTime = (order.completedTime - order.timestamp) / (1000 * 60); // minutes
                    return sum + prepTime;
                }
                return sum;
            }, 0);
            avgPrepTime = totalPrepTime / completedOrders.length;
        }
        
        // Calculate efficiency
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
            totalOrders: stationOrders.length,
            completedOrders: completedOrders.length,
            pendingOrders: pendingOrders.length,
            avgPrepTime: Math.round(avgPrepTime),
            efficiency: Math.round(efficiency)
        };
    },

    // Helper method for estimated prep time
    getEstimatedPrepTime(order) {
        let totalTime = 0;
        order.items.forEach(item => {
            const recipe = state.recipes.find(r => r.id === item.id);
            if (recipe) {
                totalTime += 5 * item.quantity; // 5 minutes per item
            }
        });
        return Math.max(5, Math.min(45, totalTime)); // Between 5-45 minutes
    },

    // Get active chefs
    getActiveChefs() {
        return state.chefs.filter(chef => chef.isActive !== false);
    },

    // Get active stations
    getActiveStations() {
        return state.stations.filter(station => station.isActive !== false);
    },

    // Get chef specialties (based on most cooked recipes)
    getChefSpecialties(chefName) {
        const chefOrders = state.orders.filter(order => 
            order.assignedChef === chefName && order.status === 'completed'
        );
        
        const recipeCount = {};
        chefOrders.forEach(order => {
            order.items.forEach(item => {
                if (!recipeCount[item.name]) {
                    recipeCount[item.name] = 0;
                }
                recipeCount[item.name] += item.quantity;
            });
        });
        
        return Object.entries(recipeCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([recipe, count]) => ({ recipe, count }));
    },

    // Get station workload
    getStationWorkload(stationName) {
        const stationOrders = state.orders.filter(order => 
            order.assignedStation === stationName && 
            ['new', 'preparing'].includes(order.status)
        );
        
        return stationOrders.length;
    },

    // Get chef workload
    getChefWorkload(chefName) {
        const chefOrders = state.orders.filter(order => 
            order.assignedChef === chefName && 
            ['new', 'preparing'].includes(order.status)
        );
        
        return chefOrders.length;
    },

    // Get available chefs (not overloaded)
    getAvailableChefs() {
        return state.chefs.filter(chef => {
            const workload = this.getChefWorkload(chef.name);
            return workload < 3; // Consider available if less than 3 orders
        });
    },

    // Get available stations (not overloaded)
    getAvailableStations() {
        return state.stations.filter(station => {
            const workload = this.getStationWorkload(station.name);
            return workload < 5; // Consider available if less than 5 orders
        });
    },

    // Auto-assign order to best available chef/station
    autoAssignOrder(orderId) {
        const order = state.orders.find(o => o.id === orderId);
        if (!order) return;
        
        // Find available chef with least workload
        const availableChefs = this.getAvailableChefs();
        if (availableChefs.length === 0) return;
        
        const bestChef = availableChefs.reduce((best, chef) => {
            const bestWorkload = this.getChefWorkload(best.name);
            const chefWorkload = this.getChefWorkload(chef.name);
            return chefWorkload < bestWorkload ? chef : best;
        });
        
        // Find available station with least workload
        const availableStations = this.getAvailableStations();
        if (availableStations.length === 0) return;
        
        const bestStation = availableStations.reduce((best, station) => {
            const bestWorkload = this.getStationWorkload(best.name);
            const stationWorkload = this.getStationWorkload(station.name);
            return stationWorkload < bestWorkload ? station : best;
        });
        
        // Assign order
        this.assignOrderToChefStation(orderId, bestChef.name, bestStation.name);
    },

    // Get chef performance over time
    getChefPerformanceHistory(chefName, days = 7) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        const chefOrders = state.orders.filter(order => 
            order.assignedChef === chefName && 
            order.status === 'completed' &&
            new Date(order.timestamp) >= cutoffDate
        );
        
        // Group by day
        const dailyStats = {};
        chefOrders.forEach(order => {
            const date = new Date(order.timestamp).toDateString();
            if (!dailyStats[date]) {
                dailyStats[date] = {
                    orders: 0,
                    avgPrepTime: 0,
                    totalPrepTime: 0
                };
            }
            
            dailyStats[date].orders++;
            if (order.completedTime && order.timestamp) {
                const prepTime = (order.completedTime - order.timestamp) / (1000 * 60);
                dailyStats[date].totalPrepTime += prepTime;
            }
        });
        
        // Calculate averages
        Object.values(dailyStats).forEach(day => {
            day.avgPrepTime = day.orders > 0 ? Math.round(day.totalPrepTime / day.orders) : 0;
        });
        
        return dailyStats;
    }
}); 