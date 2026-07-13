// js/tables.js
// Table management module for Alpine.js

import api from './api.js';

export const createTablesModule = () => ({
    // Table Management Functions
    addTable() {
        this.editingTable = null;
        this.tableForm = {
            id: null,
            number: this.tables.length + 1,
            capacity: 4,
            status: 'available',
            location: '',
            notes: '',
            reservationTime: null,
            customerName: '',
            customerPhone: ''
        };
        this.showTableForm = true;
    },

    editTable(table) {
        this.editingTable = table;
        this.tableForm = { ...table };
        this.showTableForm = true;
    },

    async saveTable() {
        try {
            let response;
            if (this.editingTable) {
                // Update existing table
                response = await api.updateTable(this.tableForm.id, this.tableForm);
            } else {
                // Add new table
                response = await api.createTable(this.tableForm);
            }

            if (response.success) {
                // Update local state
                if (this.editingTable) {
                    const index = this.tables.findIndex(t => t.id === this.tableForm.id);
                    if (index !== -1) {
                        this.tables[index] = response.data;
                    }
                } else {
                    this.tables.push(response.data);
                }

                // Save to localStorage as fallback
                localStorage.setItem('restaurant_tables', JSON.stringify(this.tables));
                
                this.showTableForm = false;
                this.editingTable = null;
                this.resetTableForm();
            } else {
                alert('Error saving table: ' + (response.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error saving table:', error);
            alert('Error saving table. Please try again.');
        }
    },

    async deleteTable(id) {
        if (confirm('Are you sure you want to delete this table?')) {
            try {
                const response = await api.deleteTable(id);
                if (response.success) {
                    this.tables = this.tables.filter(table => table.id !== id);
                    localStorage.setItem('restaurant_tables', JSON.stringify(this.tables));
                } else {
                    alert('Error deleting table: ' + (response.message || 'Unknown error'));
                }
            } catch (error) {
                console.error('Error deleting table:', error);
                alert('Error deleting table. Please try again.');
            }
        }
    },

    resetTableForm() {
        this.tableForm = {
            id: null,
            number: '',
            capacity: 4,
            status: 'available',
            location: '',
            notes: '',
            reservationTime: null,
            customerName: '',
            customerPhone: ''
        };
    },

    selectTable(tableNumber) {
        this.currentOrder.tableNumber = tableNumber;
        this.selectedTable = tableNumber;
    },

    async makeReservation(tableId) {
        try {
            const table = this.tables.find(t => t.id === tableId);
            if (table) {
                const response = await api.request('post', `/tables/${tableId}/reservation`, {
                    customer_name: table.customerName,
                    customer_phone: table.customerPhone,
                    reservation_time: table.reservationTime
                });

                if (response.success) {
                    table.status = 'reserved';
                    localStorage.setItem('restaurant_tables', JSON.stringify(this.tables));
                }
            }
        } catch (error) {
            console.error('Error making reservation:', error);
        }
    },

    async cancelReservation(tableId) {
        try {
            const table = this.tables.find(t => t.id === tableId);
            if (table) {
                const response = await api.request('patch', `/tables/${tableId}/cancel-reservation`);
                
                if (response.success) {
                    table.status = 'available';
                    table.reservationTime = null;
                    table.customerName = '';
                    table.customerPhone = '';
                    localStorage.setItem('restaurant_tables', JSON.stringify(this.tables));
                }
            }
        } catch (error) {
            console.error('Error canceling reservation:', error);
        }
    },

    getTableRevenue(tableNumber) {
        const tableOrders = this.orders.filter(order => 
            order.tableNumber === tableNumber && order.status === 'completed'
        );
        return tableOrders.reduce((sum, order) => sum + order.total, 0);
    },

    getTableAverageOrder(tableNumber) {
        const tableOrders = this.orders.filter(order => 
            order.tableNumber === tableNumber && order.status === 'completed'
        );
        if (tableOrders.length === 0) return 0;
        const totalRevenue = tableOrders.reduce((sum, order) => sum + order.total, 0);
        return totalRevenue / tableOrders.length;
    },

    getTableOccupancyTime(tableNumber) {
        const tableOrders = this.orders.filter(order => 
            order.tableNumber === tableNumber
        );
        if (tableOrders.length === 0) return 0;
        
        // Calculate total time from first order to last completion
        const firstOrder = tableOrders.reduce((earliest, order) => 
            order.timestamp < earliest.timestamp ? order : earliest
        );
        const lastOrder = tableOrders.reduce((latest, order) => 
            order.timestamp > latest.timestamp ? order : latest
        );
        
        return Math.round((lastOrder.timestamp - firstOrder.timestamp) / (1000 * 60)); // minutes
    },

    getTableOrders(tableNumber) {
        return this.orders.filter(order => 
            order.tableNumber === tableNumber && 
            ['new', 'preparing', 'ready'].includes(order.status)
        );
    },

    async closeTable(tableNumber) {
        try {
            const response = await api.request('patch', `/tables/${tableNumber}/close`);
            
            if (response.success) {
                // Complete all orders for this table
                this.orders = this.orders.filter(order => order.tableNumber !== tableNumber);
                localStorage.setItem('restaurant_orders', JSON.stringify(this.orders));
                
                // Mark table as available
                const table = this.tables.find(t => t.number === tableNumber);
                if (table) {
                    table.status = 'available';
                    localStorage.setItem('restaurant_tables', JSON.stringify(this.tables));
                }
                
                // Clear current order if it's for this table
                if (this.currentOrder.tableNumber === tableNumber) {
                    this.currentOrder = {
                        items: [],
                        subtotal: 0,
                        tax: 0,
                        total: 0,
                        tableNumber: null,
                        deliveryFee: 0
                    };
                    this.selectedTable = null;
                }
            }
        } catch (error) {
            console.error('Error closing table:', error);
        }
    },

    getTableStatusColor(status) {
        switch(status) {
            case 'available': return 'bg-green-100 text-green-800';
            case 'occupied': return 'bg-red-100 text-red-800';
            case 'reserved': return 'bg-yellow-100 text-yellow-800';
            case 'cleaning': return 'bg-blue-100 text-blue-800';
            case 'maintenance': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    },

    // Table analytics and statistics
    getTableStats(tableNumber) {
        const tableOrders = this.orders.filter(order => 
            order.tableNumber === tableNumber
        );
        
        const completedOrders = tableOrders.filter(order => order.status === 'completed');
        const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total, 0);
        const averageOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;
        
        return {
            totalOrders: tableOrders.length,
            completedOrders: completedOrders.length,
            totalRevenue: totalRevenue,
            averageOrderValue: averageOrderValue,
            occupancyTime: this.getTableOccupancyTime(tableNumber)
        };
    },

    // Table filtering and search
    getFilteredTables() {
        let filteredTables = [...this.tables];
        
        // Filter by status
        const statusFilter = document.getElementById('tableStatusFilter')?.value;
        if (statusFilter && statusFilter !== 'all') {
            filteredTables = filteredTables.filter(table => table.status === statusFilter);
        }
        
        // Filter by location
        const locationFilter = document.getElementById('tableLocationFilter')?.value;
        if (locationFilter && locationFilter !== 'all') {
            filteredTables = filteredTables.filter(table => table.location === locationFilter);
        }
        
        // Search by table number or notes
        const searchTerm = document.getElementById('tableSearch')?.value;
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filteredTables = filteredTables.filter(table => 
                table.number.toString().includes(searchLower) ||
                (table.notes && table.notes.toLowerCase().includes(searchLower)) ||
                (table.location && table.location.toLowerCase().includes(searchLower))
            );
        }
        
        // Sort by table number
        filteredTables.sort((a, b) => a.number - b.number);
        
        return filteredTables;
    },

    // Table locations
    getTableLocations() {
        const locations = [...new Set(this.tables.map(table => table.location).filter(Boolean))];
        return locations.sort();
    },

    // Available tables for selection
    getAvailableTables() {
        return this.tables.filter(table => 
            table.status === 'available' || table.status === 'cleaning'
        ).sort((a, b) => a.number - b.number);
    },

    // Table capacity groups
    getTablesByCapacity() {
        const capacityGroups = {};
        this.tables.forEach(table => {
            if (!capacityGroups[table.capacity]) {
                capacityGroups[table.capacity] = [];
            }
            capacityGroups[table.capacity].push(table);
        });
        return capacityGroups;
    },

    // Table status summary
    getTableStatusSummary() {
        const summary = {
            available: 0,
            occupied: 0,
            reserved: 0,
            cleaning: 0,
            maintenance: 0
        };
        
        this.tables.forEach(table => {
            if (summary.hasOwnProperty(table.status)) {
                summary[table.status]++;
            }
        });
        
        return summary;
    },

    // Table utilization rate
    getTableUtilizationRate() {
        const totalTables = this.tables.length;
        if (totalTables === 0) return 0;
        
        const occupiedTables = this.tables.filter(table => 
            table.status === 'occupied'
        ).length;
        
        return Math.round((occupiedTables / totalTables) * 100);
    },

    // Table turnover time (average time a table is occupied)
    getAverageTableTurnoverTime() {
        const completedOrders = this.orders.filter(order => 
            order.status === 'completed' && order.tableNumber
        );
        
        if (completedOrders.length === 0) return 0;
        
        let totalTime = 0;
        let tableCount = 0;
        
        // Group orders by table and calculate average time
        const tableOrders = {};
        completedOrders.forEach(order => {
            if (!tableOrders[order.tableNumber]) {
                tableOrders[order.tableNumber] = [];
            }
            tableOrders[order.tableNumber].push(order);
        });
        
        Object.values(tableOrders).forEach(orders => {
            if (orders.length > 1) {
                const firstOrder = orders.reduce((earliest, order) => 
                    order.timestamp < earliest.timestamp ? order : earliest
                );
                const lastOrder = orders.reduce((latest, order) => 
                    order.timestamp > latest.timestamp ? order : latest
                );
                
                const timeDiff = (lastOrder.timestamp - firstOrder.timestamp) / (1000 * 60); // minutes
                totalTime += timeDiff;
                tableCount++;
            }
        });
        
        return tableCount > 0 ? Math.round(totalTime / tableCount) : 0;
    }
}); 