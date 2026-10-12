# Restaurant POS System

A restaurant Point of Sale (POS) system with an Alpine.js frontend and a Laravel API backend, including a comprehensive **Inventory Management System**.

![image](https://github.com/user-attachments/assets/7eceeb3d-84cd-4f5a-80f3-5457bd6641a9)
![image](https://github.com/user-attachments/assets/d41b5001-a3c3-419c-bab4-7024e0435924)
![image](https://github.com/user-attachments/assets/5d823816-3210-4f5a-bbd2-c38d3aeea766)
![image](https://github.com/user-attachments/assets/6fc563fc-8043-4692-b77d-c3f2624ffc31)
![image](https://github.com/user-attachments/assets/f9a41969-2f73-44d0-aed7-6cd82c3f8e11)


## 🏗️ Architecture Overview

```
restaurant-manager/
├── index.html          # UI (Alpine.js + Tailwind), includes the login screen
├── app.js              # Alpine component: POS, KDS, recipes, tables, inventory, reports
├── api-client.js       # API requests, auth token handling, snake_case <-> camelCase mapping
└── restaurant-api/     # Laravel 12 API (Sanctum token auth)
    ├── app/Http/Controllers/Api/
    ├── app/Models/
    ├── database/migrations/ and seeders/
    └── tests/Feature/
```

The frontend keeps working copies of the data in the browser and syncs them with the API:

- After signing in, every collection (recipes, orders, tables, chefs, stations, inventory, suppliers, purchases, waste) and the restaurant settings are loaded from the server.
- Whenever the UI saves a collection, `app.js` compares it with the last version the server confirmed and sends only the creates, updates and deletes.
- Stock is owned by the server: placing an order, recording waste and receiving a purchase update stock on the server, and the UI then reloads inventory.
- If the server can't be reached, changes stay in `localStorage` and are pushed when the connection returns, even across page reloads.

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

## 🛠️ Installation & Setup

### Prerequisites
- PHP 8.2+ and Composer
- A modern browser
- Any static file server for the frontend (the examples use Python)

### Quick Start
1. Set up and start the API (http://localhost:8000):
   ```bash
   cd restaurant-api
   composer install
   cp .env.example .env
   php artisan key:generate
   touch database/database.sqlite   # default DB is SQLite
   php artisan migrate --seed
   php artisan serve
   ```
2. In another terminal, serve the frontend from the repository root (http://localhost:8080):
   ```bash
   python3 -m http.server 8080
   ```
3. Open http://localhost:8080 and sign in with the seeded admin account:
   `admin@example.com` / `password`.

Change `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `restaurant-api/.env` before seeding anything other than a local database.

### Running the API tests
```bash
cd restaurant-api
php artisan test
```

## 🔧 Configuration

### API Configuration
- **API address**: `index.html` sets `window.RESTAURANT_API_BASE` (default `http://localhost:8000/api`). Change it when the API runs elsewhere.
- **CORS**: the API only accepts browser requests from the origins in `CORS_ALLOWED_ORIGINS` in `restaurant-api/.env` (default `http://localhost:8080,http://127.0.0.1:8080`). Add the frontend's origin there.
- **Authentication**: all endpoints except `POST /api/login` require a Sanctum bearer token. The frontend stores the token in `localStorage` and returns to the login screen when it is rejected.

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

### Online
1. Signing in calls `POST /api/login` and stores the returned token.
2. All data is loaded from the API; `localStorage` is only a cache.
3. Changes are sent to the API as soon as they are saved in the UI.
4. The kitchen display polls the API for orders placed on other devices (every 30 seconds by default).

### Offline
1. A yellow banner shows that the server is unreachable.
2. Changes are kept in `localStorage`, including across reloads.
3. When the browser comes back online, pending changes are pushed and data is reloaded from the server.

### While connected
- **Import / restore backup** is disabled, since it would overwrite shared server data.
- **Clear all data** only clears this browser's cache and reloads from the server.

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

- Token authentication via Laravel Sanctum on every API route except login
- Login rate limiting (6 attempts per minute)
- CORS restricted to configured origins
- Server-side input validation
- Inventory transaction audit trail

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

### Auth
- `POST /api/login` - Exchange email/password for a bearer token
- `POST /api/logout` - Revoke the current token
- `GET /api/user` - Get the signed-in user

All other endpoints require `Authorization: Bearer <token>`.

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

1. **"Cannot reach the server" on login**: check the API is running and `window.RESTAURANT_API_BASE` in `index.html` points to it.
2. **CORS errors in the browser console**: add the frontend's origin to `CORS_ALLOWED_ORIGINS` and restart the API.
3. **Red banner after saving**: the API rejected the change; the message shows the validation error.
4. **Stuck on old data**: use *Clear all data* in the backup dialog to reload from the server.

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
