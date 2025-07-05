# Restaurant POS System - Modular Architecture

A modern, modular restaurant Point of Sale (POS) system built with Alpine.js and Laravel API integration. The system is designed with a clean, maintainable architecture that separates concerns into distinct modules.

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
│   ├── settings.js              # Settings management module
│   └── app.js                   # Main Alpine.js component
├── restaurant-api/              # Laravel API backend
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
- **Settings & Configuration**: Restaurant settings, receipt customization, and system preferences

### Technical Features
- **API Integration**: Full Laravel API backend integration
- **Offline Support**: LocalStorage fallback when offline
- **Real-time Sync**: Cross-tab synchronization and real-time updates
- **Multi-language Support**: English and Arabic language support
- **Responsive Design**: Mobile-friendly interface
- **Modular Architecture**: Clean, maintainable code structure

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

### 7. Settings Management (`js/settings.js`)
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

### Quick Start
1. Clone the repository
2. Set up the Laravel API backend:
   ```bash
   cd restaurant-api
   composer install
   php artisan migrate
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

## 🔧 Configuration

### API Configuration
The system automatically detects the API endpoint. Update the API base URL in `js/api.js` if needed:

```javascript
const API_BASE = '/api'; // Adjust if your API is on a different base path
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

### Offline Mode
1. Data is served from localStorage
2. Changes are queued for later sync
3. Automatic sync when connection is restored

### Cross-Tab Sync
- Uses localStorage events for real-time synchronization
- All tabs stay in sync automatically
- No manual refresh required

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
    ingredients: [...],
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
    items: [...],
    subtotal: 25.98,
    tax: 2.60,
    total: 28.58,
    status: 'new',
    timestamp: 1640995200000
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

## 🔄 API Endpoints

The system integrates with the following Laravel API endpoints:

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

## 🐛 Troubleshooting

### Common Issues

1. **Module loading errors**: Ensure your web server supports ES6 modules
2. **API connection issues**: Check the API base URL and server status
3. **Data not syncing**: Verify localStorage is enabled and not full
4. **Performance issues**: Check browser console for errors

### Debug Mode
Enable debug mode by adding to browser console:
```javascript
localStorage.setItem('debug_mode', 'true');
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
- Inventory management
- Customer loyalty system 