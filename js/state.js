// js/state.js
// Main state management for Alpine.js app

import api from './api.js';
import { normalizeOrder, normalizeSettings } from './transform.js';

export const createAppState = () => ({
    // App state
    currentTab: 'pos',
    language: 'en',
    direction: 'ltr',
    orderType: 'dine-in',

    // API connection state
    apiStatus: 'unknown',
    apiStatusMessage: '',
    dataSource: 'unknown',
    
    // POS State Variables
    posSearchTerm: '',
    posFilterCategory: 'all',
    posSortBy: 'name',
    posQuickFilter: 'all',
    posActiveCategory: 'all',
    showRecipeForm: false,
    editingRecipe: null,
    selectedRecipe: null,
    scalePortions: 4,
    showSettings: false,
    selectedTable: null,
    showReceipt: false,
    currentReceipt: null,
    showPrintOptions: false,
    showReports: false,
    showBackup: false,
    
    // KDS State
    kdsView: 'all',
    kdsFilter: 'all',
    kdsSort: 'time',
    showKdsSettings: false,
    kdsAutoRefresh: true,
    kdsSoundEnabled: true,
    kdsNotifications: true,
    kdsRefreshInterval: 30,
    kdsPriorityOrders: [],
    kdsUrgentOrders: [],
    kdsRefreshTimer: null,
    kdsStationFilter: 'all',
    
    // Chef/Station Management
    showChefAssignModal: false,
    chefAssignOrderId: null,
    chefAssignName: '',
    chefAssignStation: '',
    showChefStationManager: false,
    chefStationTab: 'chefs',
    newChefName: '',
    newStationName: '',
    
    // Data arrays (will be populated from API/localStorage)
    recipes: [],
    orders: [],
    tables: [],
    chefs: [],
    stations: [],
    settings: {},
    reports: {
        dailySales: [],
        monthlySales: [],
        topItems: [],
        categorySales: []
    },
    
    // Current order
    currentOrder: {
        items: [],
        subtotal: 0,
        tax: 0,
        total: 0,
        tableNumber: null,
        deliveryFee: 0
    },
    
    // Recipe Management
    recipeCategories: ['Pizza', 'Salad', 'Burgers', 'Appetizers', 'Pasta', 'Seafood', 'Mexican', 'Desserts', 'Sides', 'Soups', 'Beverages'],
    showRecipeCategories: false,
    recipeSearchTerm: '',
    recipeFilterCategory: 'all',
    recipeSortBy: 'name',
    recipeSortOrder: 'asc',
    
    // Recipe form
    recipeForm: {
        id: null,
        name: '',
        category: '',
        price: 0,
        basePortions: 4,
        prepTime: 15,
        cookTime: 20,
        difficulty: 'medium',
        allergens: [],
        tags: [],
        ingredients: [{name: '', quantity: 0, unit: '', notes: ''}],
        instructions: '',
        notes: '',
        image: '',
        isActive: true,
        createdAt: null,
        updatedAt: null
    },
    
    // Table form
    tableForm: {
        id: null,
        number: '',
        capacity: 4,
        status: 'available',
        location: '',
        notes: '',
        reservationTime: null,
        customerName: '',
        customerPhone: ''
    },
    showTableForm: false,
    editingTable: null,
    
    // Translations
    translations: {
        // App
        appTitle: 'Restaurant Manager',
        
        // POS
        pos: 'POS',
        orderType: 'Order Type',
        dineIn: 'Dine-In',
        takeaway: 'Takeaway',
        delivery: 'Delivery',
        currentOrder: 'Current Order',
        item: 'Item',
        total: 'Total',
        subtotal: 'Subtotal',
        tax: 'Tax (10%)',
        placeOrder: 'Place Order',
        emptyOrder: 'Add items to your order',
        
        // KDS
        kds: 'Kitchen Display',
        newOrders: 'New Orders',
        preparing: 'Preparing',
        ready: 'Ready',
        startPreparing: 'Start Preparing',
        markReady: 'Mark as Ready',
        complete: 'Complete',
        noNewOrders: 'No new orders',
        noPreparingOrders: 'No orders in preparation',
        noReadyOrders: 'No orders ready',
        
        // Recipes
        recipes: 'Recipes',
        recipeList: 'Recipe List',
        addRecipe: 'Add Recipe',
        editRecipe: 'Edit Recipe',
        recipeName: 'Recipe Name',
        category: 'Category',
        price: 'Price',
        basePortions: 'Base Portions',
        ingredients: 'Ingredients',
        instructions: 'Instructions',
        addIngredient: 'Add Ingredient',
        saveRecipe: 'Save Recipe',
        cancel: 'Cancel',
        scaleToPortions: 'Scale to Portions',
        selectRecipe: 'Select a recipe to view details',
        noRecipes: 'No recipes found. Add your first recipe!',
        deleteRecipeConfirm: 'Are you sure you want to delete this recipe?',
        
        // Settings
        settings: 'Settings',
        taxRate: 'Tax Rate (%)',
        deliveryFee: 'Delivery Fee',
        currency: 'Currency',
        saveSettings: 'Save Settings',
        
        // Tables
        tables: 'Tables',
        tableManagement: 'Table Management',
        addTable: 'Add Table',
        tableNumber: 'Table Number',
        capacity: 'Capacity',
        status: 'Status',
        available: 'Available',
        occupied: 'Occupied',
        reserved: 'Reserved',
        selectTable: 'Select Table',
        noTables: 'No tables available',
        tableOrders: 'Table Orders',
        newOrder: 'New Order',
        viewOrders: 'View Orders',
        closeTable: 'Close Table',
        editTable: 'Edit Table',
        deleteTable: 'Delete Table',
        location: 'Location',
        notes: 'Notes',
        reservation: 'Reservation',
        customerName: 'Customer Name',
        customerPhone: 'Customer Phone',
        reservationTime: 'Reservation Time',
        makeReservation: 'Make Reservation',
        cancelReservation: 'Cancel Reservation',
        tableDetails: 'Table Details',
        tableHistory: 'Table History',
        occupancyTime: 'Occupancy Time',
        revenue: 'Revenue',
        averageOrderValue: 'Average Order Value',
        tableStatus: 'Table Status',
        cleaning: 'Cleaning',
        maintenance: 'Maintenance',
        
        // Receipt & Print
        receipt: 'Receipt',
        printReceipt: 'Print Receipt',
        printOptions: 'Print Options',
        print: 'Print',
        receiptNumber: 'Receipt #',
        date: 'Date',
        time: 'Time',
        server: 'Server',
        customer: 'Customer',
        items: 'Items',
        qty: 'Qty',
        amount: 'Amount',
        serviceCharge: 'Service Charge',
        discount: 'Discount',
        grandTotal: 'Grand Total',
        paymentMethod: 'Payment Method',
        cash: 'Cash',
        card: 'Card',
        change: 'Change',
        thankYou: 'Thank You',
        
        // Reports
        reports: 'Reports',
        salesReport: 'Sales Report',
        dailyReport: 'Daily Report',
        monthlyReport: 'Monthly Report',
        topItems: 'Top Items',
        categoryReport: 'Category Report',
        exportData: 'Export Data',
        generateReport: 'Generate Report',
        totalSales: 'Total Sales',
        totalOrders: 'Total Orders',
        completedOrders: 'Completed Orders',
        averageOrder: 'Average Order',
        
        // Backup & Settings
        backup: 'Backup & Restore',
        exportBackup: 'Export Backup',
        importBackup: 'Import Backup',
        restoreData: 'Restore Data',
        restaurantInfo: 'Restaurant Information',
        contactInfo: 'Contact Information',
        receiptSettings: 'Receipt Settings',
        printSettings: 'Print Settings',
        logoUpload: 'Upload Logo',
        receiptFooter: 'Receipt Footer',
        autoPrint: 'Auto Print',
        receiptWidth: 'Receipt Width (mm)',
        fontSize: 'Font Size (pt)'
    },
    
    // Arabic translations
    arTranslations: {
        appTitle: 'مدير المطعم',
        pos: 'نقطة البيع',
        orderType: 'نوع الطلب',
        dineIn: 'تناول في المطعم',
        takeaway: 'طلبات خارجية',
        delivery: 'توصيل',
        currentOrder: 'الطلب الحالي',
        item: 'الصنف',
        total: 'الإجمالي',
        subtotal: 'المجموع الفرعي',
        tax: 'الضريبة (10%)',
        placeOrder: 'تقديم الطلب',
        emptyOrder: 'أضف أصناف إلى طلبك',
        kds: 'شاشة المطبخ',
        newOrders: 'طلبات جديدة',
        preparing: 'قيد التحضير',
        ready: 'جاهزة',
        startPreparing: 'بدء التحضير',
        markReady: 'وضع علامة جاهز',
        complete: 'إكمال',
        noNewOrders: 'لا توجد طلبات جديدة',
        noPreparingOrders: 'لا توجد طلبات قيد التحضير',
        noReadyOrders: 'لا توجد طلبات جاهزة',
        recipes: 'الوصفات',
        recipeList: 'قائمة الوصفات',
        addRecipe: 'إضافة وصفة',
        editRecipe: 'تعديل الوصفة',
        recipeName: 'اسم الوصفة',
        category: 'الفئة',
        price: 'السعر',
        basePortions: 'الوجبات الأساسية',
        ingredients: 'المكونات',
        instructions: 'التعليمات',
        addIngredient: 'إضافة مكون',
        saveRecipe: 'حفظ الوصفة',
        cancel: 'إلغاء',
        scaleToPortions: 'تغيير الكمية للوجبات',
        selectRecipe: 'حدد وصفة لعرض التفاصيل',
        noRecipes: 'لم يتم العثور على وصفات. أضف وصفتك الأولى!',
        deleteRecipeConfirm: 'هل أنت متأكد من حذف هذه الوصفة؟',
        settings: 'الإعدادات',
        taxRate: 'نسبة الضريبة (%)',
        deliveryFee: 'رسوم التوصيل',
        currency: 'العملة',
        saveSettings: 'حفظ الإعدادات',
        tables: 'الطاولات',
        tableManagement: 'إدارة الطاولات',
        addTable: 'إضافة طاولة',
        tableNumber: 'رقم الطاولة',
        capacity: 'السعة',
        status: 'الحالة',
        available: 'متاحة',
        occupied: 'مشغولة',
        reserved: 'محجوزة',
        selectTable: 'اختر الطاولة',
        noTables: 'لا توجد طاولات متاحة',
        tableOrders: 'طلبات الطاولة',
        newOrder: 'طلب جديد',
        viewOrders: 'عرض الطلبات',
        closeTable: 'إغلاق الطاولة',
        editTable: 'تعديل الطاولة',
        deleteTable: 'حذف الطاولة',
        location: 'الموقع',
        notes: 'ملاحظات',
        reservation: 'الحجز',
        customerName: 'اسم العميل',
        customerPhone: 'هاتف العميل',
        reservationTime: 'وقت الحجز',
        makeReservation: 'إجراء حجز',
        cancelReservation: 'إلغاء الحجز',
        tableDetails: 'تفاصيل الطاولة',
        tableHistory: 'تاريخ الطاولة',
        occupancyTime: 'وقت الإشغال',
        revenue: 'الإيرادات',
        averageOrderValue: 'متوسط قيمة الطلب',
        tableStatus: 'حالة الطاولة',
        cleaning: 'تنظيف',
        maintenance: 'صيانة',
        receipt: 'الإيصال',
        printReceipt: 'طباعة الإيصال',
        printOptions: 'خيارات الطباعة',
        print: 'طباعة',
        receiptNumber: 'رقم الإيصال #',
        date: 'التاريخ',
        time: 'الوقت',
        server: 'الخادم',
        customer: 'العميل',
        items: 'الأصناف',
        qty: 'الكمية',
        price: 'السعر',
        amount: 'المبلغ',
        deliveryFee: 'رسوم التوصيل',
        serviceCharge: 'رسوم الخدمة',
        discount: 'الخصم',
        grandTotal: 'المجموع الكلي',
        paymentMethod: 'طريقة الدفع',
        cash: 'نقداً',
        card: 'بطاقة',
        change: 'المتبقي',
        thankYou: 'شكراً لك',
        reports: 'التقارير',
        salesReport: 'تقرير المبيعات',
        dailyReport: 'التقرير اليومي',
        monthlyReport: 'التقرير الشهري',
        topItems: 'أفضل الأصناف',
        categoryReport: 'تقرير الفئات',
        exportData: 'تصدير البيانات',
        generateReport: 'إنشاء تقرير',
        totalSales: 'إجمالي المبيعات',
        totalOrders: 'إجمالي الطلبات',
        completedOrders: 'الطلبات المكتملة',
        averageOrder: 'متوسط الطلب',
        backup: 'النسخ الاحتياطي والاستعادة',
        exportBackup: 'تصدير النسخة الاحتياطية',
        importBackup: 'استيراد النسخة الاحتياطية',
        restoreData: 'استعادة البيانات',
        restaurantInfo: 'معلومات المطعم',
        contactInfo: 'معلومات الاتصال',
        receiptSettings: 'إعدادات الإيصال',
        printSettings: 'إعدادات الطباعة',
        logoUpload: 'رفع الشعار',
        receiptFooter: 'تذييل الإيصال',
        autoPrint: 'الطباعة التلقائية',
        receiptWidth: 'عرض الإيصال (مم)',
        fontSize: 'حجم الخط (نقطة)',
        overdue: 'متأخر',
        late: 'متأخر',
        early: 'مبكر',
        'on-time': 'في الوقت المحدد'
    },

    // Initialize app
    async initApp() {
        try {
            api.onStatusChange((status, message) => {
                this.apiStatus = status;
                this.apiStatusMessage = message;
            });

            await this.loadAllData();

            this.validateAndCleanData();
            
            // Request notification permission
            if ('Notification' in window) {
                Notification.requestPermission();
            }
            
            // Start KDS auto-refresh if enabled
            if (this.kdsAutoRefresh) {
                this.startKdsAutoRefresh();
            }
            
            // Watch for tab changes to manage KDS auto-refresh
            this.$watch('currentTab', (newTab) => {
                if (newTab === 'kds' && this.kdsAutoRefresh) {
                    this.startKdsAutoRefresh();
                } else {
                    this.stopKdsAutoRefresh();
                }
            });
            
            // Set initial language from localStorage or browser
            const savedLang = localStorage.getItem('restaurant_lang');
            this.language = savedLang || 'en';
            this.direction = this.language === 'ar' ? 'rtl' : 'ltr';
            
            // Update translations based on language
            if (this.language === 'ar') {
                this.translations = this.arTranslations;
            }
            
            // Initialize real-time sync
            this.initRealtimeSync();
            
        } catch (error) {
            console.error('Error initializing app:', error);
            if (this.apiStatus === 'unknown') {
                this.apiStatus = 'unavailable';
                this.apiStatusMessage = error.message || 'Failed to load data from API';
            }
        }
    },

    getApiStatusLabel() {
        switch (this.apiStatus) {
            case 'connected': return this.language === 'ar' ? 'متصل بالخادم' : 'Server connected';
            case 'offline': return this.language === 'ar' ? 'غير متصل — بيانات محلية' : 'Offline — local cache';
            case 'unavailable': return this.language === 'ar' ? 'الخادم غير متاح' : 'Server unavailable';
            default: return this.language === 'ar' ? 'جاري الاتصال...' : 'Connecting...';
        }
    },

    async retryApiConnection() {
        this.apiStatus = 'unknown';
        this.apiStatusMessage = '';
        try {
            await this.loadAllData();
            this.validateAndCleanData();
        } catch (error) {
            console.error('API reconnect failed:', error);
        }
    },

    async loadAllData() {
        const connected = await api.checkConnection();

        if (!navigator.onLine) {
            this.dataSource = 'offline';
            this.loadAllFromLocalStorage(false);
            return;
        }

        if (!connected) {
            this.dataSource = 'unavailable';
            this.loadAllFromLocalStorage(false);
            throw new Error(this.apiStatusMessage || 'API unavailable');
        }

        this.dataSource = 'api';

        const recipesResponse = await api.getRecipes();
        this.recipes = api.unwrapList(recipesResponse);

        const ordersResponse = await api.getOrders();
        this.orders = api.unwrapList(ordersResponse).map(normalizeOrder);

        const tablesResponse = await api.getTables();
        this.tables = api.unwrapList(tablesResponse);

        const chefsResponse = await api.getChefs();
        this.chefs = api.unwrapList(chefsResponse);

        const stationsResponse = await api.getStations();
        this.stations = api.unwrapList(stationsResponse);

        const settingsResponse = await api.getRestaurantSettings();
        this.settings = normalizeSettings(settingsResponse.data);

        if (typeof this.loadInventory === 'function') {
            await this.loadInventory();
        }

        this.cacheAllData();
    },

    cacheAllData() {
        api.cacheToLocalStorage('restaurant_recipes', this.recipes);
        api.cacheToLocalStorage('restaurant_orders', this.orders);
        api.cacheToLocalStorage('restaurant_tables', this.tables);
        api.cacheToLocalStorage('restaurant_chefs', this.chefs);
        api.cacheToLocalStorage('restaurant_stations', this.stations);
        api.cacheToLocalStorage('restaurant_settings', this.settings);
        if (this.inventory) api.cacheToLocalStorage('restaurant_inventory', this.inventory);
        if (this.suppliers) api.cacheToLocalStorage('restaurant_suppliers', this.suppliers);
        if (this.purchases) api.cacheToLocalStorage('restaurant_purchases', this.purchases);
        if (this.waste) api.cacheToLocalStorage('restaurant_waste', this.waste);
    },

    // LocalStorage fallback — useDefaults=false avoids injecting demo data when API is down
    loadRecipesFromLocalStorage(useDefaults = true) {
        const savedRecipes = localStorage.getItem('restaurant_recipes');
        this.recipes = savedRecipes ? JSON.parse(savedRecipes) : (useDefaults ? this.getDefaultRecipes() : []);
    },

    loadOrdersFromLocalStorage(useDefaults = true) {
        const savedOrders = localStorage.getItem('restaurant_orders');
        this.orders = savedOrders ? JSON.parse(savedOrders).map(normalizeOrder) : [];
    },

    loadTablesFromLocalStorage(useDefaults = true) {
        const savedTables = localStorage.getItem('restaurant_tables');
        this.tables = savedTables ? JSON.parse(savedTables) : (useDefaults ? this.getDefaultTables() : []);
    },

    loadChefsFromLocalStorage(useDefaults = true) {
        const savedChefs = localStorage.getItem('restaurant_chefs');
        this.chefs = savedChefs ? JSON.parse(savedChefs) : (useDefaults ? this.getDefaultChefs() : []);
    },

    loadStationsFromLocalStorage(useDefaults = true) {
        const savedStations = localStorage.getItem('restaurant_stations');
        this.stations = savedStations ? JSON.parse(savedStations) : (useDefaults ? this.getDefaultStations() : []);
    },

    loadSettingsFromLocalStorage(useDefaults = true) {
        const savedSettings = localStorage.getItem('restaurant_settings');
        this.settings = savedSettings ? JSON.parse(savedSettings) : (useDefaults ? this.getDefaultSettings() : {});
    },

    loadAllFromLocalStorage(useDefaults = true) {
        this.loadRecipesFromLocalStorage(useDefaults);
        this.loadOrdersFromLocalStorage(useDefaults);
        this.loadTablesFromLocalStorage(useDefaults);
        this.loadChefsFromLocalStorage(useDefaults);
        this.loadStationsFromLocalStorage(useDefaults);
        this.loadSettingsFromLocalStorage(useDefaults);
        this.inventory = JSON.parse(localStorage.getItem('restaurant_inventory') || '[]');
        this.suppliers = JSON.parse(localStorage.getItem('restaurant_suppliers') || '[]');
        this.purchases = JSON.parse(localStorage.getItem('restaurant_purchases') || '[]');
        this.waste = JSON.parse(localStorage.getItem('restaurant_waste') || '[]');
    },

    // Default data methods
    getDefaultRecipes() {
        return [
            {
                id: 1,
                name: 'Margherita Pizza',
                category: 'Pizza',
                price: 12.99,
                basePortions: 2,
                prepTime: 10,
                cookTime: 15,
                difficulty: 'medium',
                allergens: ['gluten', 'dairy'],
                tags: ['vegetarian', 'classic'],
                ingredients: [
                    {name: 'Pizza Dough', quantity: 1, unit: 'pc', notes: 'Fresh or frozen'},
                    {name: 'Tomato Sauce', quantity: 150, unit: 'g', notes: 'Homemade or store-bought'},
                    {name: 'Mozzarella', quantity: 200, unit: 'g', notes: 'Fresh mozzarella'},
                    {name: 'Basil', quantity: 5, unit: 'leaves', notes: 'Fresh basil leaves'}
                ],
                instructions: '1. Preheat oven to 250°C\n2. Roll out pizza dough\n3. Spread tomato sauce evenly\n4. Add mozzarella cheese\n5. Add fresh basil leaves\n6. Bake for 10-12 minutes until golden',
                notes: 'Classic Italian pizza with simple, fresh ingredients',
                image: '',
                isActive: true,
                createdAt: Date.now(),
                updatedAt: Date.now()
            },
            {
                id: 2,
                name: 'Caesar Salad',
                category: 'Salad',
                price: 8.99,
                basePortions: 1,
                prepTime: 15,
                cookTime: 0,
                difficulty: 'easy',
                allergens: ['gluten', 'dairy', 'eggs'],
                tags: ['healthy', 'classic'],
                ingredients: [
                    {name: 'Romaine Lettuce', quantity: 1, unit: 'head', notes: 'Fresh and crisp'},
                    {name: 'Parmesan Cheese', quantity: 50, unit: 'g', notes: 'Freshly grated'},
                    {name: 'Croutons', quantity: 100, unit: 'g', notes: 'Homemade or store-bought'},
                    {name: 'Caesar Dressing', quantity: 60, unit: 'ml', notes: 'Homemade dressing'},
                    {name: 'Black Pepper', quantity: 1, unit: 'tsp', notes: 'Freshly ground'}
                ],
                instructions: '1. Wash and chop romaine lettuce\n2. Make Caesar dressing\n3. Toss lettuce with dressing\n4. Add croutons and parmesan\n5. Season with black pepper',
                notes: 'Classic Caesar salad with homemade dressing',
                image: '',
                isActive: true,
                createdAt: Date.now(),
                updatedAt: Date.now()
            }
        ];
    },

    getDefaultTables() {
        return [
            {id: 1, number: 1, capacity: 4, status: 'available', location: 'Window', notes: ''},
            {id: 2, number: 2, capacity: 6, status: 'available', location: 'Center', notes: ''},
            {id: 3, number: 3, capacity: 2, status: 'available', location: 'Bar', notes: 'High-top table'},
            {id: 4, number: 4, capacity: 8, status: 'available', location: 'Patio', notes: 'Outdoor seating'}
        ];
    },

    getDefaultChefs() {
        return [
            { name: 'Chef Anna' },
            { name: 'Chef Ben' },
            { name: 'Chef Carlos' }
        ];
    },

    getDefaultStations() {
        return [
            { name: 'Grill' },
            { name: 'Fry' },
            { name: 'Salad' },
            { name: 'Dessert' }
        ];
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

    // Data validation and cleanup
    validateAndCleanData() {
        this.orders = this.orders.filter((order) => {
            if (!order || !order.id) return false;
            const items = order.items || order.orderItems;
            return Array.isArray(items);
        }).map(normalizeOrder);

        this.recipes = this.recipes.filter((recipe) =>
            recipe && recipe.id && recipe.name && parseFloat(recipe.price) > 0
        );

        this.tables = this.tables.filter((table) =>
            table && table.id && table.number
        );

        if (this.dataSource === 'api') {
            this.cacheAllData();
        } else if (this.dataSource === 'offline') {
            this.saveAllData();
        }
    },

    // Save all data to localStorage (fallback)
    saveAllData() {
        try {
            localStorage.setItem('restaurant_recipes', JSON.stringify(this.recipes));
            localStorage.setItem('restaurant_orders', JSON.stringify(this.orders));
            localStorage.setItem('restaurant_tables', JSON.stringify(this.tables));
            localStorage.setItem('restaurant_chefs', JSON.stringify(this.chefs));
            localStorage.setItem('restaurant_stations', JSON.stringify(this.stations));
            localStorage.setItem('restaurant_settings', JSON.stringify(this.settings));
            localStorage.setItem('restaurant_inventory', JSON.stringify(this.inventory || []));
            localStorage.setItem('restaurant_suppliers', JSON.stringify(this.suppliers || []));
            localStorage.setItem('restaurant_purchases', JSON.stringify(this.purchases || []));
            localStorage.setItem('restaurant_waste', JSON.stringify(this.waste || []));
        } catch (error) {
            console.error('Error saving data to localStorage:', error);
        }
    },

    // Change language
    changeLanguage(lang) {
        this.language = lang;
        this.direction = lang === 'ar' ? 'rtl' : 'ltr';
        localStorage.setItem('restaurant_lang', lang);
        
        // Update translations based on language
        if (lang === 'ar') {
            this.translations = this.arTranslations;
        } else {
            // Reset to English translations
            this.translations = {
                appTitle: 'Restaurant Manager',
                pos: 'POS',
                orderType: 'Order Type',
                dineIn: 'Dine-In',
                takeaway: 'Takeaway',
                delivery: 'Delivery',
                currentOrder: 'Current Order',
                item: 'Item',
                total: 'Total',
                subtotal: 'Subtotal',
                tax: 'Tax (10%)',
                placeOrder: 'Place Order',
                emptyOrder: 'Add items to your order',
                kds: 'Kitchen Display',
                newOrders: 'New Orders',
                preparing: 'Preparing',
                ready: 'Ready',
                startPreparing: 'Start Preparing',
                markReady: 'Mark as Ready',
                complete: 'Complete',
                noNewOrders: 'No new orders',
                noPreparingOrders: 'No orders in preparation',
                noReadyOrders: 'No orders ready',
                recipes: 'Recipes',
                recipeList: 'Recipe List',
                addRecipe: 'Add Recipe',
                editRecipe: 'Edit Recipe',
                recipeName: 'Recipe Name',
                category: 'Category',
                price: 'Price',
                basePortions: 'Base Portions',
                ingredients: 'Ingredients',
                instructions: 'Instructions',
                addIngredient: 'Add Ingredient',
                saveRecipe: 'Save Recipe',
                cancel: 'Cancel',
                scaleToPortions: 'Scale to Portions',
                selectRecipe: 'Select a recipe to view details',
                noRecipes: 'No recipes found. Add your first recipe!',
                deleteRecipeConfirm: 'Are you sure you want to delete this recipe?',
                settings: 'Settings',
                taxRate: 'Tax Rate (%)',
                deliveryFee: 'Delivery Fee',
                currency: 'Currency',
                saveSettings: 'Save Settings',
                tables: 'Tables',
                tableManagement: 'Table Management',
                addTable: 'Add Table',
                tableNumber: 'Table Number',
                capacity: 'Capacity',
                status: 'Status',
                available: 'Available',
                occupied: 'Occupied',
                reserved: 'Reserved',
                selectTable: 'Select Table',
                noTables: 'No tables available',
                tableOrders: 'Table Orders',
                newOrder: 'New Order',
                viewOrders: 'View Orders',
                closeTable: 'Close Table',
                editTable: 'Edit Table',
                deleteTable: 'Delete Table',
                location: 'Location',
                notes: 'Notes',
                reservation: 'Reservation',
                customerName: 'Customer Name',
                customerPhone: 'Customer Phone',
                reservationTime: 'Reservation Time',
                makeReservation: 'Make Reservation',
                cancelReservation: 'Cancel Reservation',
                tableDetails: 'Table Details',
                tableHistory: 'Table History',
                occupancyTime: 'Occupancy Time',
                revenue: 'Revenue',
                averageOrderValue: 'Average Order Value',
                tableStatus: 'Table Status',
                cleaning: 'Cleaning',
                maintenance: 'Maintenance',
                receipt: 'Receipt',
                printReceipt: 'Print Receipt',
                printOptions: 'Print Options',
                print: 'Print',
                receiptNumber: 'Receipt #',
                date: 'Date',
                time: 'Time',
                server: 'Server',
                customer: 'Customer',
                items: 'Items',
                qty: 'Qty',
                amount: 'Amount',
                serviceCharge: 'Service Charge',
                discount: 'Discount',
                grandTotal: 'Grand Total',
                paymentMethod: 'Payment Method',
                cash: 'Cash',
                card: 'Card',
                change: 'Change',
                thankYou: 'Thank You',
                reports: 'Reports',
                salesReport: 'Sales Report',
                dailyReport: 'Daily Report',
                monthlyReport: 'Monthly Report',
                topItems: 'Top Items',
                categoryReport: 'Category Report',
                exportData: 'Export Data',
                generateReport: 'Generate Report',
                totalSales: 'Total Sales',
                totalOrders: 'Total Orders',
                completedOrders: 'Completed Orders',
                averageOrder: 'Average Order',
                backup: 'Backup & Restore',
                exportBackup: 'Export Backup',
                importBackup: 'Import Backup',
                restoreData: 'Restore Data',
                restaurantInfo: 'Restaurant Information',
                contactInfo: 'Contact Information',
                receiptSettings: 'Receipt Settings',
                printSettings: 'Print Settings',
                logoUpload: 'Upload Logo',
                receiptFooter: 'Receipt Footer',
                autoPrint: 'Auto Print',
                receiptWidth: 'Receipt Width (mm)',
                fontSize: 'Font Size (pt)'
            };
        }
    },

    // Format price with currency
    formatPrice(price) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    },

    // Format date and time
    formatDateTime(timestamp) {
        return new Date(timestamp).toLocaleTimeString();
    },

    // KDS auto-refresh methods
    startKdsAutoRefresh() {
        if (this.kdsAutoRefresh && this.currentTab === 'kds') {
            if (this.kdsRefreshTimer) {
                clearInterval(this.kdsRefreshTimer);
            }
            
            this.kdsRefreshTimer = setInterval(() => {
                if (this.currentTab === 'kds') {
                    this.$nextTick(() => {
                        // This will trigger a re-render
                    });
                }
            }, this.kdsRefreshInterval * 1000);
        }
    },

    stopKdsAutoRefresh() {
        if (this.kdsRefreshTimer) {
            clearInterval(this.kdsRefreshTimer);
            this.kdsRefreshTimer = null;
        }
    },

    // Real-time sync for cross-tab communication
    initRealtimeSync() {
        window.addEventListener('storage', (e) => {
            try {
                if (e.key === 'restaurant_orders') {
                    this.orders = JSON.parse(e.newValue || '[]');
                }
                if (e.key === 'restaurant_tables') {
                    this.tables = JSON.parse(e.newValue || '[]');
                }
                if (e.key === 'restaurant_chefs') {
                    this.chefs = JSON.parse(e.newValue || '[]');
                }
                if (e.key === 'restaurant_stations') {
                    this.stations = JSON.parse(e.newValue || '[]');
                }
                if (e.key === 'restaurant_recipes') {
                    this.recipes = JSON.parse(e.newValue || '[]');
                }
                if (e.key === 'restaurant_settings') {
                    this.settings = { ...this.settings, ...JSON.parse(e.newValue || '{}') };
                }
                if (e.key === 'restaurant_recipe_categories') {
                    this.recipeCategories = JSON.parse(e.newValue || '[]');
                }
            } catch (error) {
                console.error('Error syncing data:', error);
            }
        });
    }
}); 