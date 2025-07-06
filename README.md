# Restaurant POS System - Modular Architecture

A modern, modular restaurant Point of Sale (POS) system built with Alpine.js and Laravel API integration. The system is designed with a clean, maintainable architecture that separates concerns into distinct modules, including a comprehensive **Inventory Management System**.

![image](https://github.com/user-attachments/assets/7eceeb3d-84cd-4f5a-80f3-5457bd6641a9)
![image](https://github.com/user-attachments/assets/d41b5001-a3c3-419c-bab4-7024e0435924)
![image](https://github.com/user-attachments/assets/5d823816-3210-4f5a-bbd2-c38d3aeea766)
![image](https://github.com/user-attachments/assets/6fc563fc-8043-4692-b77d-c3f2624ffc31)
![image](https://github.com/user-attachments/assets/f9a41969-2f73-44d0-aed7-6cd82c3f8e11)


## 🏗️ Architecture Overview

The system is built using a modular approach with the following structure:

```
pos/
├── js/                          # JavaScript modules
│   ├── api.js                   # Centralized API client
│   ├── state.js                 # Alpine.js state management
│   ├── recipes.js               # Recipe management module
│   ├── orders.js                # Order management module
│   ├── tables.js                # Table management module
│   ├── chefs-stations.js        # Chef and station management
│   ├── inventory.js             # Inventory management module
│   ├── settings.js              # Settings management module
│   └── app.js                   # Main Alpine.js component
├── restaurant-api/              # Laravel API backend
│   ├── app/Models/              # Eloquent models
│   │   ├── Inventory.php        # Inventory management
│   │   ├── Supplier.php         # Supplier management
│   │   ├── Purchase.php         # Purchase orders
│   │   ├── Waste.php            # Waste tracking
│   │   └── StockTransaction.php # Stock movement tracking
│   ├── app/Http/Controllers/Api/ # API controllers
│   │   ├── InventoryController.php
│   │   ├── SupplierController.php
│   │   ├── PurchaseController.php
│   │   └── WasteController.php
│   └── database/migrations/     # Database schema
├── index.html                   # Main HTML file
└── README.md                    # This file
```

## 🚀 Features

### Core Functionality
- **Point of Sale (POS)**: Complete order management with real-time calculations
- **Kitchen Display System (KDS)**: Real-time order tracking and kitchen management
- **Recipe Management**: Comprehensive recipe database with ingredients and instructions
- **Table Management**: Table reservations, status tracking, and analytics
- **Chef & Station Management**: Assign orders to chefs and kitchen stations
- **Inventory Management**: Complete inventory tracking, stock management, and analytics
- **Settings & Configuration**: Restaurant settings, receipt customization, and system preferences

### Inventory Management System
- **Stock Tracking**: Real-time inventory levels with automatic updates
- **Supplier Management**: Complete supplier database with performance tracking
- **Purchase Orders**: Create, track, and receive purchase orders
- **Waste Management**: Track waste and losses for cost analysis
- **Stock Transactions**: Complete audit trail of all stock movements
- **Alerts & Notifications**: Low stock, out of stock, and expiring items alerts
- **Analytics & Reporting**: Inventory value, movement tracking, and supplier performance
- **Automatic Stock Deduction**: Inventory automatically deducted when orders are placed

### Technical Features
- **API Integration**: Full Laravel API backend integration
- **Offline Support**: LocalStorage fallback when offline
- **Real-time Sync**: Cross-tab synchronization and real-time updates
- **Multi-language Support**: English and Arabic language support
- **Responsive Design**: Mobile-friendly interface
- **Modular Architecture**: Clean, maintainable code structure
- **Data Export/Import**: Backup and restore functionality

## 📦 Module Structure

### 1. API Client (`js/api.js`)
Centralized API handler for all CRUD operations:
- Online/offline detection
- Request queueing for offline operations
- Automatic sync when back online
- Error handling and retry logic

### 2. State Management (`js/state.js`)
Alpine.js state initialization and global app state:
- Data loading from API/localStorage
- Cross-tab synchronization
- Language management
- System health monitoring

### 3. Recipe Management (`js/recipes.js`)
Complete recipe management system:
- CRUD operations for recipes
- Advanced filtering and sorting
- Category management
- Ingredient scaling
- Recipe duplication and activation

### 4. Order Management (`js/orders.js`)
Comprehensive order processing:
- POS functionality
- KDS integration
- Order status tracking
- Receipt generation
- Kitchen analytics
- **Automatic inventory deduction**

### 5. Table Management (`js/tables.js`)
Table and reservation system:
- Table CRUD operations
- Reservation management
- Status tracking
- Analytics and reporting
- Capacity management

### 6. Chef & Station Management (`js/chefs-stations.js`)
Kitchen staff and station management:
- Chef and station CRUD
- Order assignment
- Performance tracking
- Workload management
- Auto-assignment logic

### 7. Inventory Management (`js/inventory.js`)
Complete inventory management system:
- **Inventory CRUD operations** with real-time stock tracking
- **Stock adjustments** (add, subtract, set) with transaction logging
- **Supplier management** with performance metrics
- **Purchase order management** with receiving workflow
- **Waste tracking** with categorization and reporting
- **Stock alerts** for low stock, out of stock, and expiring items
- **Analytics and reporting** for inventory value and movement
- **Export/Import functionality** for data backup
- **Automatic stock deduction** when orders are placed
- **Transaction logging** for complete audit trail

### 8. Settings Management (`js/settings.js`)
System configuration and preferences:
- Restaurant information
- Tax and delivery settings
- Receipt customization
- Print settings
- Backup and restore

## 🛠️ Installation & Setup

### Prerequisites
- Modern web browser with ES6 module support
- Laravel API backend (see `restaurant-api/` directory)
- Web server (Apache, Nginx, or built-in PHP server)
- PHP 8.0+ with required extensions
- Composer for PHP dependencies

### Quick Start
1. Clone the repository
2. Set up the Laravel API backend:
   ```bash
   cd restaurant-api
   composer install
   cp .env.example .env
   php artisan key:generate
   php artisan migrate --seed
   php artisan serve
   ```
3. Serve the frontend:
   ```bash
   # Using PHP built-in server
   php -S localhost:8000
   
   # Or using any web server
   # Point to the pos/ directory
   ```
4. Open `http://localhost:8000` in your browser

### Database Setup
The system includes comprehensive database migrations and seeders:

```bash
# Run all migrations
php artisan migrate

# Seed with sample data
php artisan db:seed

# Or run specific seeders
php artisan db:seed --class=InventorySeeder
php artisan db:seed --class=SupplierSeeder
```

## 🔧 Configuration

### API Configuration
The system automatically detects the API endpoint. Update the API base URL in `js/api.js` if needed:

```javascript
const API_BASE = '/api'; // Adjust if your API is on a different base path
```

### Inventory Configuration
Configure inventory settings in the Laravel backend:

```php
// In config/inventory.php (create if needed)
return [
    'low_stock_threshold' => 10,
    'expiry_alert_days' => 7,
    'default_unit' => 'pieces',
    'currency' => 'USD',
];
```

### Language Configuration
The system supports multiple languages:
- English (default)
- Arabic (RTL support)

Language can be changed via the UI or programmatically:

```javascript
// Change language
this.changeLanguage('ar'); // Arabic
this.changeLanguage('en'); // English
```

## 📊 Data Flow

### Online Mode
1. Data is fetched from the Laravel API
2. Changes are immediately synced to the server
3. Real-time updates via polling (WebSocket support planned)
4. **Inventory changes trigger automatic stock updates**

### Offline Mode
1. Data is served from localStorage
2. Changes are queued for later sync
3. Automatic sync when connection is restored
4. **Inventory operations cached for offline use**

### Cross-Tab Sync
- Uses localStorage events for real-time synchronization
- All tabs stay in sync automatically
- No manual refresh required
- **Inventory alerts shared across all tabs**

## 🎯 Usage Examples

### Adding a Recipe
```javascript
// The system provides a user-friendly interface
// Recipe data structure:
{
    id: 1,
    name: 'Margherita Pizza',
    category: 'Pizza',
    price: 12.99,
    ingredients: [
        { name: 'Fresh Tomatoes', quantity: 2, unit: 'pieces' },
        { name: 'Mozzarella Cheese', quantity: 200, unit: 'grams' },
        { name: 'Pizza Dough', quantity: 1, unit: 'piece' }
    ],
    instructions: '...',
    tags: ['vegetarian', 'classic'],
    allergens: ['gluten', 'dairy']
}
```

### Creating an Order
```javascript
// Orders are created through the POS interface
// Order data structure:
{
    id: 1234567890,
    type: 'dine-in',
    tableNumber: 5,
    items: [
        {
            recipe_id: 1,
            name: 'Margherita Pizza',
            quantity: 2,
            price: 12.99,
            total: 25.98
        }
    ],
    subtotal: 25.98,
    tax: 2.60,
    total: 28.58,
    status: 'new',
    timestamp: 1640995200000
}
// Note: Inventory is automatically deducted when order is created
```

### Managing Inventory
```javascript
// Inventory item data structure:
{
    id: 1,
    name: 'Fresh Tomatoes',
    sku: 'PROD-001',
    category: 'Fresh Produce',
    unit: 'kg',
    current_stock: 25.5,
    min_stock: 10,
    max_stock: 50,
    cost_per_unit: 2.5,
    supplier_id: 1,
    location: 'Refrigerator A',
    description: 'Fresh vine-ripened tomatoes',
    is_active: true,
    expiry_date: '2025-07-13',
    notes: 'Store in refrigerator, use within 7 days'
}

// Stock adjustment
await inventory.updateStock(1, 5, 'add', 'Purchase received');
await inventory.updateStock(1, 2, 'subtract', 'Waste - expired');

// Purchase order
{
    id: 1,
    supplier_id: 1,
    items: [
        {
            inventory_id: 1,
            quantity: 20,
            unit_cost: 2.5,
            notes: 'Fresh batch'
        }
    ],
    total_cost: 50.00,
    purchase_date: '2025-07-06',
    expected_delivery: '2025-07-07',
    status: 'pending',
    notes: 'Weekly produce order'
}
```

### Managing Tables
```javascript
// Table management through the interface
// Table data structure:
{
    id: 1,
    number: 1,
    capacity: 4,
    status: 'available', // available, occupied, reserved, cleaning, maintenance
    location: 'Window',
    notes: ''
}
```

## 🔒 Security Features

- API authentication via Laravel Sanctum
- CSRF protection
- Input validation and sanitization
- Secure localStorage usage
- Error handling and logging
- **Inventory transaction audit trail**

## 📱 Browser Support

- Chrome 61+
- Firefox 60+
- Safari 10.1+
- Edge 16+

## 🚀 Performance Features

- Lazy loading of modules
- Efficient data caching
- Optimized DOM updates
- Minimal API calls
- Responsive design
- **Inventory data pagination**
- **Real-time stock updates**

## 🔄 API Endpoints

The system integrates with the following Laravel API endpoints:

### Core Endpoints
- `GET /api/recipes` - Get all recipes
- `POST /api/recipes` - Create recipe
- `PUT /api/recipes/{id}` - Update recipe
- `DELETE /api/recipes/{id}` - Delete recipe

- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create order
- `PUT /api/orders/{id}` - Update order
- `DELETE /api/orders/{id}` - Delete order

- `GET /api/tables` - Get all tables
- `POST /api/tables` - Create table
- `PUT /api/tables/{id}` - Update table
- `DELETE /api/tables/{id}` - Delete table

- `GET /api/chefs` - Get all chefs
- `POST /api/chefs` - Create chef
- `PUT /api/chefs/{id}` - Update chef
- `DELETE /api/chefs/{id}` - Delete chef

- `GET /api/stations` - Get all stations
- `POST /api/stations` - Create station
- `PUT /api/stations/{id}` - Update station
- `DELETE /api/stations/{id}` - Delete station

- `GET /api/settings` - Get settings
- `PUT /api/settings` - Update settings

### Inventory Management Endpoints
- `GET /api/inventory` - Get all inventory items
- `POST /api/inventory` - Create inventory item
- `PUT /api/inventory/{id}` - Update inventory item
- `DELETE /api/inventory/{id}` - Delete inventory item
- `PATCH /api/inventory/{id}/adjust-stock` - Adjust stock levels
- `GET /api/inventory/categories` - Get inventory categories
- `GET /api/inventory/alerts/low-stock` - Get low stock alerts
- `GET /api/inventory/alerts/expiring` - Get expiring items
- `GET /api/inventory/{id}/transactions` - Get stock transactions

- `GET /api/suppliers` - Get all suppliers
- `POST /api/suppliers` - Create supplier
- `PUT /api/suppliers/{id}` - Update supplier
- `DELETE /api/suppliers/{id}` - Delete supplier
- `GET /api/suppliers/performance` - Get supplier performance

- `GET /api/purchases` - Get all purchase orders
- `POST /api/purchases` - Create purchase order
- `PUT /api/purchases/{id}` - Update purchase order
- `DELETE /api/purchases/{id}` - Delete purchase order
- `PATCH /api/purchases/{id}/status` - Update purchase status
- `GET /api/purchases/alerts/overdue` - Get overdue purchases
- `GET /api/purchases/stats` - Get purchase statistics

- `GET /api/waste` - Get all waste records
- `POST /api/waste` - Create waste record
- `PUT /api/waste/{id}` - Update waste record
- `DELETE /api/waste/{id}` - Delete waste record
- `GET /api/waste/reasons` - Get waste reasons
- `GET /api/waste/categories` - Get waste categories
- `GET /api/waste/stats` - Get waste statistics

## 📊 Inventory Reports

The system provides comprehensive inventory reporting:

### Stock Reports
- **Current Stock Levels**: Real-time inventory status
- **Low Stock Alerts**: Items below minimum threshold
- **Out of Stock Items**: Items with zero stock
- **Expiring Items**: Items approaching expiry date

### Value Reports
- **Inventory Value**: Total value of current stock
- **Category Analysis**: Value breakdown by category
- **Supplier Analysis**: Value by supplier

### Movement Reports
- **Stock Transactions**: Complete audit trail
- **Purchase Analysis**: Purchase order tracking
- **Waste Analysis**: Loss tracking and analysis
- **Usage Patterns**: Stock consumption trends

## 🐛 Troubleshooting

### Common Issues

1. **Module loading errors**: Ensure your web server supports ES6 modules
2. **API connection issues**: Check the API base URL and server status
3. **Data not syncing**: Verify localStorage is enabled and not full
4. **Performance issues**: Check browser console for errors
5. **Inventory sync issues**: Check database connections and API endpoints

### Debug Mode
Enable debug mode by adding to browser console:
```javascript
localStorage.setItem('debug_mode', 'true');
```

### Inventory Debugging
```javascript
// Check inventory status
console.log(window.inventory.inventory);

// Check stock transactions
console.log(await window.inventory.getStockTransactions());

// Check alerts
console.log(await window.inventory.getLowStockItems());
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the troubleshooting section
- Review the API documentation
- Open an issue on GitHub

## 🔮 Future Enhancements

- WebSocket integration for real-time updates
- Mobile app development
- Advanced analytics and reporting
- Multi-location support
- Integration with payment gateways
- **Barcode scanning for inventory**
- **Automated reorder points**
- **Supplier portal integration**
- **Advanced forecasting algorithms**
- **Integration with accounting systems**
- Customer loyalty system 
