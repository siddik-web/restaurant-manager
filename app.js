document.addEventListener('alpine:init', () => {
    Alpine.data('app', () => ({
        // App state
        currentTab: 'pos',
        language: 'en',
        direction: 'ltr',
        orderType: 'dine-in',
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
        kdsView: 'all', // all, new, preparing, ready
        kdsFilter: 'all', // all, dine-in, takeaway, delivery
        kdsSort: 'time', // time, priority, table
        showKdsSettings: false,
        kdsAutoRefresh: true,
        kdsSoundEnabled: true,
        kdsNotifications: true,
        kdsRefreshInterval: 30, // seconds
        kdsPriorityOrders: [],
        kdsUrgentOrders: [],
        kdsRefreshTimer: null,
        
        // Sample data
        currentOrder: {
            items: [],
            subtotal: 0,
            tax: 0,
            total: 0,
            tableNumber: null,
            deliveryFee: 0
        },
        
        // Settings
        settings: {
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
        },
        
        // Tables
        tables: [],
        showTableForm: false,
        editingTable: null,
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
        
        // Reports data
        reports: {
            dailySales: [],
            monthlySales: [],
            topItems: [],
            categorySales: []
        },
        
        // Form data
        recipeForm: {
            id: null,
            name: '',
            category: '',
            price: 0,
            basePortions: 4,
            ingredients: [
                {name: '', quantity: 0, unit: ''}
            ],
            instructions: ''
        },
        
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
            
            // Enhanced KDS
            kdsSettings: 'KDS Settings',
            kdsView: 'KDS View',
            kdsFilter: 'Filter Orders',
            kdsSort: 'Sort Orders',
            kdsAutoRefresh: 'Auto Refresh',
            kdsSoundEnabled: 'Sound Notifications',
            kdsNotifications: 'Browser Notifications',
            kdsRefreshInterval: 'Refresh Interval (seconds)',
            kdsPriorityOrders: 'Priority Orders',
            kdsUrgentOrders: 'Urgent Orders',
            kdsOrderTimer: 'Order Timer',
            kdsPrepTime: 'Prep Time',
            kdsEstimatedTime: 'Estimated Time',
            kdsActualTime: 'Actual Time',
            kdsTimeRemaining: 'Time Remaining',
            kdsOverdue: 'Overdue',
            kdsOnTime: 'On Time',
            kdsEarly: 'Early',
            kdsLate: 'Late',
            kdsOrderNotes: 'Order Notes',
            kdsSpecialInstructions: 'Special Instructions',
            kdsAllergenInfo: 'Allergen Information',
            kdsModifications: 'Modifications',
            kdsUrgent: 'Urgent',
            kdsPriority: 'Priority',
            kdsNormal: 'Normal',
            kdsLow: 'Low',
            kdsOrderAge: 'Order Age',
            kdsTimeInQueue: 'Time in Queue',
            kdsAveragePrepTime: 'Average Prep Time',
            kdsKitchenStats: 'Kitchen Statistics',
            kdsOrdersPerHour: 'Orders per Hour',
            kdsEfficiency: 'Efficiency',
            kdsBottleneck: 'Bottleneck Items',
            kdsPerformance: 'Performance',
            kdsFullScreen: 'Full Screen',
            kdsCompactView: 'Compact View',
            kdsDetailedView: 'Detailed View',
            kdsPrintOrder: 'Print Order',
            kdsAssignChef: 'Assign Chef',
            kdsChefName: 'Chef Name',
            kdsStation: 'Station',
            kdsStation1: 'Station 1',
            kdsStation2: 'Station 2',
            kdsStation3: 'Station 3',
            kdsStation4: 'Station 4',
            kdsAssignOrder: 'Assign Order',
            kdsUnassignOrder: 'Unassign Order',
            kdsOrderAssigned: 'Order Assigned',
            kdsOrderUnassigned: 'Order Unassigned',
            kdsMarkUrgent: 'Mark Urgent',
            kdsUnmarkUrgent: 'Unmark Urgent',
            kdsAddNote: 'Add Note',
            kdsOrderNotes: 'Order Notes',
            kdsPrepProgress: 'Prep Progress',
            kdsKitchenEfficiency: 'Kitchen Efficiency',
            kdsOnTimeDelivery: 'On-Time Delivery',
            kdsUrgentOrders: 'Urgent Orders',
            kdsPriorityOrders: 'Priority Orders',
            kdsOrderProgress: 'Order Progress',
            kdsTimeTracking: 'Time Tracking',
            kdsPerformanceMetrics: 'Performance Metrics',
            kdsRealTimeUpdates: 'Real-Time Updates',
            kdsOrderQueue: 'Order Queue',
            kdsKitchenFlow: 'Kitchen Flow',
            kdsOrderManagement: 'Order Management',
            kdsChefAssignment: 'Chef Assignment',
            kdsStationManagement: 'Station Management',
            kdsOrderPrioritization: 'Order Prioritization',
            kdsTimeManagement: 'Time Management',
            kdsQualityControl: 'Quality Control',
            kdsKitchenAnalytics: 'Kitchen Analytics',
            
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
            addTable: 'Add Table',
            editTable: 'Edit Table',
            deleteTable: 'Delete Table',
            tableNumber: 'Table Number',
            capacity: 'Capacity',
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
            reserved: 'Reserved',
            cleaning: 'Cleaning',
            maintenance: 'Maintenance',
            
            // Receipt & Print
            receipt: 'Receipt',
            printReceipt: 'Print Receipt',
            printOptions: 'Print Options',
            print: 'Print',
            cancel: 'Cancel',
            receiptNumber: 'Receipt #',
            date: 'Date',
            time: 'Time',
            server: 'Server',
            customer: 'Customer',
            items: 'Items',
            qty: 'Qty',
            price: 'Price',
            amount: 'Amount',
            deliveryFee: 'Delivery Fee',
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
            
            // Settings
            settings: 'الإعدادات',
            taxRate: 'نسبة الضريبة (%)',
            deliveryFee: 'رسوم التوصيل',
            currency: 'العملة',
            saveSettings: 'حفظ الإعدادات',
            
            // Tables
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
            addTable: 'إضافة طاولة',
            editTable: 'تعديل الطاولة',
            deleteTable: 'حذف الطاولة',
            tableNumber: 'رقم الطاولة',
            capacity: 'السعة',
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
            reserved: 'محجوزة',
            cleaning: 'تنظيف',
            maintenance: 'صيانة',
            
            // Receipt & Print
            receipt: 'الإيصال',
            printReceipt: 'طباعة الإيصال',
            printOptions: 'خيارات الطباعة',
            print: 'طباعة',
            cancel: 'إلغاء',
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
            
            // Reports
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
            averageOrder: 'متوسط الطلب',
            
            // Backup & Settings
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
            fontSize: 'حجم الخط (نقطة)'
        },
        
        // Initialize app
        initApp() {
            // Load data from localStorage
            this.loadRecipes();
            this.loadOrders();
            this.loadSettings();
            this.loadTables();
            
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
            
            // Listen for storage events to sync between tabs
            window.addEventListener('storage', (e) => {
                if (e.key === 'restaurant_recipes') {
                    this.recipes = JSON.parse(e.newValue || '[]');
                }
                if (e.key === 'restaurant_orders') {
                    this.orders = JSON.parse(e.newValue || '[]');
                }
                if (e.key === 'restaurant_settings') {
                    this.settings = JSON.parse(e.newValue || '{}');
                }
                if (e.key === 'restaurant_tables') {
                    this.tables = JSON.parse(e.newValue || '[]');
                }
            });
        },
        
        // Load recipes from localStorage
        loadRecipes() {
            const savedRecipes = localStorage.getItem('restaurant_recipes');
            this.recipes = savedRecipes ? JSON.parse(savedRecipes) : [
                {
                    id: 1,
                    name: 'Margherita Pizza',
                    category: 'Pizza',
                    price: 12.99,
                    basePortions: 2,
                    ingredients: [
                        {name: 'Pizza Dough', quantity: 1, unit: 'pc'},
                        {name: 'Tomato Sauce', quantity: 150, unit: 'g'},
                        {name: 'Mozzarella', quantity: 200, unit: 'g'},
                        {name: 'Basil', quantity: 5, unit: 'leaves'}
                    ],
                    instructions: '1. Preheat oven to 250°C\n2. Spread sauce on dough\n3. Add cheese and basil\n4. Bake for 10-12 minutes'
                },
                {
                    id: 2,
                    name: 'Caesar Salad',
                    category: 'Salad',
                    price: 8.99,
                    basePortions: 1,
                    ingredients: [
                        {name: 'Romaine Lettuce', quantity: 1, unit: 'head'},
                        {name: 'Croutons', quantity: 50, unit: 'g'},
                        {name: 'Parmesan', quantity: 30, unit: 'g'},
                        {name: 'Caesar Dressing', quantity: 60, unit: 'ml'}
                    ],
                    instructions: '1. Wash and chop lettuce\n2. Add croutons and dressing\n3. Toss to combine\n4. Top with parmesan'
                }
            ];
        },
        
        // Save recipes to localStorage
        saveRecipes() {
            localStorage.setItem('restaurant_recipes', JSON.stringify(this.recipes));
            // Dispatch event to sync across tabs
            window.dispatchEvent(new Event('storage'));
        },
        
        // Load orders from localStorage
        loadOrders() {
            const savedOrders = localStorage.getItem('restaurant_orders');
            this.orders = savedOrders ? JSON.parse(savedOrders) : [];
        },
        
        // Save orders to localStorage
        saveOrders() {
            localStorage.setItem('restaurant_orders', JSON.stringify(this.orders));
            // Dispatch event to sync across tabs
            window.dispatchEvent(new Event('storage'));
        },
        
        // Load settings from localStorage
        loadSettings() {
            const savedSettings = localStorage.getItem('restaurant_settings');
            this.settings = savedSettings ? JSON.parse(savedSettings) : {
                taxRate: 10,
                deliveryFee: 5,
                currency: 'USD'
            };
        },
        
        // Save settings to localStorage
        saveSettings() {
            localStorage.setItem('restaurant_settings', JSON.stringify(this.settings));
            window.dispatchEvent(new Event('storage'));
        },
        
        // Load tables from localStorage
        loadTables() {
            const savedTables = localStorage.getItem('restaurant_tables');
            this.tables = savedTables ? JSON.parse(savedTables) : [
                {id: 1, number: 1, capacity: 4, status: 'available', location: 'Window', notes: ''},
                {id: 2, number: 2, capacity: 6, status: 'available', location: 'Center', notes: ''},
                {id: 3, number: 3, capacity: 2, status: 'available', location: 'Bar', notes: 'High-top table'},
                {id: 4, number: 4, capacity: 8, status: 'available', location: 'Patio', notes: 'Outdoor seating'}
            ];
        },
        
        // Save tables to localStorage
        saveTables() {
            localStorage.setItem('restaurant_tables', JSON.stringify(this.tables));
            window.dispatchEvent(new Event('storage'));
        },
        
        // Change language
        changeLanguage(lang) {
            this.language = lang;
            this.direction = lang === 'ar' ? 'rtl' : 'ltr';
            localStorage.setItem('restaurant_lang', lang);
            
            // Update translations
            if (lang === 'ar') {
                this.translations = this.arTranslations;
            } else {
                this.translations = {
                    // Reset to English translations
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
                    receipt: 'Receipt',
                    printReceipt: 'Print Receipt',
                    printOptions: 'Print Options',
                    print: 'Print',
                    cancel: 'Cancel',
                    receiptNumber: 'Receipt #',
                    date: 'Date',
                    time: 'Time',
                    server: 'Server',
                    customer: 'Customer',
                    items: 'Items',
                    qty: 'Qty',
                    price: 'Price',
                    amount: 'Amount',
                    deliveryFee: 'Delivery Fee',
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
                    fontSize: 'Font Size (pt)',
                    restaurantName: 'Restaurant Name',
                    address: 'Address',
                    phone: 'Phone',
                    email: 'Email',
                    website: 'Website',
                    printHeader: 'Print Header',
                    printFooter: 'Print Footer',
                    addTable: 'Add Table',
                    editTable: 'Edit Table',
                    deleteTable: 'Delete Table',
                    tableNumber: 'Table Number',
                    capacity: 'Capacity',
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
                    reserved: 'Reserved',
                    cleaning: 'Cleaning',
                    maintenance: 'Maintenance'
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
        
        // POS Functions
        addToOrder(recipe) {
            // Check if item already exists in order
            const existingItem = this.currentOrder.items.find(item => item.id === recipe.id);
            
            if (existingItem) {
                existingItem.quantity++;
            } else {
                this.currentOrder.items.push({
                    id: recipe.id,
                    name: recipe.name,
                    price: recipe.price,
                    quantity: 1
                });
            }
            
            this.calculateOrderTotals();
        },
        
        updateItemQuantity(index, newQuantity) {
            if (newQuantity < 1) {
                this.currentOrder.items.splice(index, 1);
            } else {
                this.currentOrder.items[index].quantity = newQuantity;
            }
            this.calculateOrderTotals();
        },
        
        removeItem(index) {
            this.currentOrder.items.splice(index, 1);
            this.calculateOrderTotals();
        },
        
        calculateOrderTotals() {
            this.currentOrder.subtotal = this.currentOrder.items.reduce(
                (sum, item) => sum + (item.price * item.quantity), 0
            );
            
            // Apply tax rate from settings
            this.currentOrder.tax = this.currentOrder.subtotal * (this.settings.taxRate / 100);
            
            // Apply delivery fee if delivery order
            this.currentOrder.deliveryFee = this.orderType === 'delivery' ? this.settings.deliveryFee : 0;
            
            this.currentOrder.total = this.currentOrder.subtotal + this.currentOrder.tax + this.currentOrder.deliveryFee;
        },
        
        placeOrder() {
            const newOrder = {
                id: Date.now(),
                type: this.orderType,
                tableNumber: this.currentOrder.tableNumber,
                items: [...this.currentOrder.items],
                subtotal: this.currentOrder.subtotal,
                tax: this.currentOrder.tax,
                deliveryFee: this.currentOrder.deliveryFee,
                total: this.currentOrder.total,
                status: 'new',
                timestamp: Date.now()
            };
            
            this.orders.push(newOrder);
            this.saveOrders();
            
            // Update table status if dine-in
            if (this.orderType === 'dine-in' && this.currentOrder.tableNumber) {
                const table = this.tables.find(t => t.number === this.currentOrder.tableNumber);
                if (table) {
                    table.status = 'occupied';
                    this.saveTables();
                }
            }
            
                                // Play sound for new order
                    this.playKdsSound();
                    
                    // Show notification
                    this.showKdsNotification(newOrder);
                    
                    // Generate receipt
                    this.generateReceipt(newOrder);
            
            // Reset current order
            this.currentOrder = {
                items: [],
                subtotal: 0,
                tax: 0,
                total: 0,
                tableNumber: null,
                deliveryFee: 0
            };
            
            // Switch to KDS view
            this.currentTab = 'kds';
        },
        
        // KDS Functions
        updateOrderStatus(orderId, status) {
            const order = this.orders.find(o => o.id === orderId);
            if (order) {
                order.status = status;
                this.saveOrders();
            }
        },
        
        completeOrder(orderId) {
            this.orders = this.orders.filter(o => o.id !== orderId);
            this.saveOrders();
        },
        
        // Enhanced KDS Functions
        getFilteredOrders() {
            let filteredOrders = this.orders.filter(order => 
                ['new', 'preparing', 'ready'].includes(order.status)
            );
            
            // Apply filter
            if (this.kdsFilter !== 'all') {
                filteredOrders = filteredOrders.filter(order => order.type === this.kdsFilter);
            }
            
            // Apply view filter
            if (this.kdsView !== 'all') {
                filteredOrders = filteredOrders.filter(order => order.status === this.kdsView);
            }
            
            // Apply sorting
            switch(this.kdsSort) {
                case 'time':
                    filteredOrders.sort((a, b) => a.timestamp - b.timestamp);
                    break;
                case 'priority':
                    filteredOrders.sort((a, b) => this.getOrderPriority(b) - this.getOrderPriority(a));
                    break;
                case 'table':
                    filteredOrders.sort((a, b) => (a.tableNumber || 0) - (b.tableNumber || 0));
                    break;
            }
            
            return filteredOrders;
        },
        
        getOrderPriority(order) {
            const age = Date.now() - order.timestamp;
            const ageMinutes = age / (1000 * 60);
            
            // Priority based on order age and type
            let priority = 1;
            
            if (ageMinutes > 30) priority = 5; // Very urgent
            else if (ageMinutes > 20) priority = 4; // Urgent
            else if (ageMinutes > 15) priority = 3; // High
            else if (ageMinutes > 10) priority = 2; // Medium
            
            // Boost priority for delivery orders
            if (order.type === 'delivery') priority += 1;
            
            // Boost priority for large orders
            if (order.items.length > 5) priority += 1;
            
            return priority;
        },
        
        getOrderAge(order) {
            const age = Date.now() - order.timestamp;
            const minutes = Math.floor(age / (1000 * 60));
            const seconds = Math.floor((age % (1000 * 60)) / 1000);
            return { minutes, seconds };
        },
        
        getOrderAgeText(order) {
            const age = this.getOrderAge(order);
            if (age.minutes > 0) {
                return `${age.minutes}m ${age.seconds}s`;
            }
            return `${age.seconds}s`;
        },
        
        getOrderStatusColor(order) {
            const age = this.getOrderAge(order);
            const priority = this.getOrderPriority(order);
            
            if (priority >= 5 || age.minutes > 30) return 'bg-red-100 text-red-800 border-red-300';
            if (priority >= 4 || age.minutes > 20) return 'bg-orange-100 text-orange-800 border-orange-300';
            if (priority >= 3 || age.minutes > 15) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            return 'bg-blue-100 text-blue-800 border-blue-300';
        },
        
        getEstimatedPrepTime(order) {
            // Calculate estimated prep time based on items
            let totalTime = 0;
            order.items.forEach(item => {
                const recipe = this.recipes.find(r => r.id === item.id);
                if (recipe) {
                    // Base time per item (could be stored in recipe)
                    totalTime += 5 * item.quantity; // 5 minutes per item
                }
            });
            return Math.max(5, Math.min(45, totalTime)); // Between 5-45 minutes
        },
        
        getPrepTimeStatus(order) {
            const age = this.getOrderAge(order);
            const estimated = this.getEstimatedPrepTime(order);
            
            if (age.minutes > estimated + 5) return 'overdue';
            if (age.minutes > estimated) return 'late';
            if (age.minutes < estimated - 5) return 'early';
            return 'on-time';
        },
        
        assignOrderToChef(orderId, chefName, station) {
            const order = this.orders.find(o => o.id === orderId);
            if (order) {
                order.assignedChef = chefName;
                order.assignedStation = station;
                order.assignedTime = Date.now();
                this.saveOrders();
            }
        },
        
        unassignOrder(orderId) {
            const order = this.orders.find(o => o.id === orderId);
            if (order) {
                delete order.assignedChef;
                delete order.assignedStation;
                delete order.assignedTime;
                this.saveOrders();
            }
        },
        
        getKitchenStats() {
            const todayOrders = this.orders.filter(order => {
                const orderDate = new Date(order.timestamp).toDateString();
                const today = new Date().toDateString();
                return orderDate === today;
            });
            
            const completedOrders = todayOrders.filter(order => order.status === 'completed');
            const avgPrepTime = completedOrders.length > 0 ? 
                completedOrders.reduce((sum, order) => {
                    const prepTime = order.completedTime ? 
                        (order.completedTime - order.timestamp) / (1000 * 60) : 0;
                    return sum + prepTime;
                }, 0) / completedOrders.length : 0;
            
            return {
                totalOrders: todayOrders.length,
                completedOrders: completedOrders.length,
                pendingOrders: todayOrders.filter(o => ['new', 'preparing'].includes(o.status)).length,
                avgPrepTime: Math.round(avgPrepTime),
                efficiency: completedOrders.length > 0 ? 
                    Math.round((completedOrders.length / todayOrders.length) * 100) : 0
            };
        },
        
        startKdsAutoRefresh() {
            if (this.kdsAutoRefresh && this.currentTab === 'kds') {
                // Clear any existing interval
                if (this.kdsRefreshTimer) {
                    clearInterval(this.kdsRefreshTimer);
                }
                
                this.kdsRefreshTimer = setInterval(() => {
                    if (this.currentTab === 'kds') {
                        // Force Alpine.js to re-render
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
        
        playKdsSound() {
            if (this.kdsSoundEnabled) {
                const audio = document.getElementById('newOrderSound');
                if (audio) {
                    audio.play().catch(e => console.log('Audio play failed:', e));
                }
            }
        },
        
        showKdsNotification(order) {
            if (this.kdsNotifications && 'Notification' in window && Notification.permission === 'granted') {
                new Notification('New Order', {
                    body: `Order #${order.id} - ${order.items.length} items`,
                    icon: '/favicon.ico'
                });
            }
        },
        
        // Additional KDS Features
        markOrderUrgent(orderId) {
            const order = this.orders.find(o => o.id === orderId);
            if (order) {
                order.urgent = true;
                order.urgentTime = Date.now();
                this.saveOrders();
            }
        },
        
        unmarkOrderUrgent(orderId) {
            const order = this.orders.find(o => o.id === orderId);
            if (order) {
                order.urgent = false;
                delete order.urgentTime;
                this.saveOrders();
            }
        },
        
        addOrderNote(orderId, note) {
            const order = this.orders.find(o => o.id === orderId);
            if (order) {
                if (!order.notes) order.notes = [];
                order.notes.push({
                    text: note,
                    timestamp: Date.now(),
                    type: 'kitchen'
                });
                this.saveOrders();
            }
        },
        
        getOrderNotes(orderId) {
            const order = this.orders.find(o => o.id === orderId);
            return order?.notes || [];
        },
        
        getOrderPrepProgress(orderId) {
            const order = this.orders.find(o => o.id === orderId);
            if (!order) return 0;
            
            const age = Date.now() - order.timestamp;
            const estimated = this.getEstimatedPrepTime(order) * 60 * 1000; // Convert to milliseconds
            const progress = (age / estimated) * 100;
            return Math.min(100, Math.max(0, progress));
        },
        
        getKitchenEfficiency() {
            const todayOrders = this.orders.filter(order => {
                const orderDate = new Date(order.timestamp).toDateString();
                const today = new Date().toDateString();
                return orderDate === today;
            });
            
            const completedOrders = todayOrders.filter(order => order.status === 'completed');
            const onTimeOrders = completedOrders.filter(order => {
                const prepTime = order.completedTime ? 
                    (order.completedTime - order.timestamp) / (1000 * 60) : 0;
                const estimated = this.getEstimatedPrepTime(order);
                return prepTime <= estimated;
            });
            
            return completedOrders.length > 0 ? 
                Math.round((onTimeOrders.length / completedOrders.length) * 100) : 0;
        },
        
        // Recipe Functions
        editRecipe(recipe) {
            this.editingRecipe = recipe;
            this.recipeForm = {...recipe};
            this.showRecipeForm = true;
        },
        
        saveRecipe() {
            if (this.editingRecipe) {
                // Update existing recipe
                const index = this.recipes.findIndex(r => r.id === this.recipeForm.id);
                if (index !== -1) {
                    this.recipes[index] = {...this.recipeForm};
                }
            } else {
                // Add new recipe
                this.recipeForm.id = Date.now();
                this.recipes.push({...this.recipeForm});
            }
            
            this.saveRecipes();
            this.showRecipeForm = false;
            this.editingRecipe = null;
            this.recipeForm = {
                id: null,
                name: '',
                category: '',
                price: 0,
                basePortions: 4,
                ingredients: [
                    {name: '', quantity: 0, unit: ''}
                ],
                instructions: ''
            };
        },
        
        deleteRecipe(id) {
            if (confirm(this.translations.deleteRecipeConfirm)) {
                this.recipes = this.recipes.filter(recipe => recipe.id !== id);
                this.saveRecipes();
                this.selectedRecipe = null;
            }
        },
        
        calculateScaledQuantity(quantity, portions, basePortions) {
            return (quantity * portions / basePortions).toFixed(2);
        },
        
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
        
        saveTable() {
            if (this.editingTable) {
                // Update existing table
                const index = this.tables.findIndex(t => t.id === this.tableForm.id);
                if (index !== -1) {
                    this.tables[index] = { ...this.tableForm };
                }
            } else {
                // Add new table
                this.tableForm.id = Date.now();
                this.tables.push({ ...this.tableForm });
            }
            
            this.saveTables();
            this.showTableForm = false;
            this.editingTable = null;
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
        
        deleteTable(id) {
            if (confirm('Are you sure you want to delete this table?')) {
                this.tables = this.tables.filter(table => table.id !== id);
                this.saveTables();
            }
        },
        
        selectTable(tableNumber) {
            this.currentOrder.tableNumber = tableNumber;
            this.selectedTable = tableNumber;
        },
        
        makeReservation(tableId) {
            const table = this.tables.find(t => t.id === tableId);
            if (table) {
                table.status = 'reserved';
                this.saveTables();
            }
        },
        
        cancelReservation(tableId) {
            const table = this.tables.find(t => t.id === tableId);
            if (table) {
                table.status = 'available';
                table.reservationTime = null;
                table.customerName = '';
                table.customerPhone = '';
                this.saveTables();
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
        
        closeTable(tableNumber) {
            // Complete all orders for this table
            this.orders = this.orders.filter(order => order.tableNumber !== tableNumber);
            this.saveOrders();
            
            // Mark table as available
            const table = this.tables.find(t => t.number === tableNumber);
            if (table) {
                table.status = 'available';
                this.saveTables();
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
        
        // Receipt & Print Functions
        generateReceipt(order) {
            this.currentReceipt = {
                ...order,
                receiptNumber: 'R' + Date.now(),
                printDate: new Date().toLocaleDateString(),
                printTime: new Date().toLocaleTimeString(),
                server: 'Server 1'
            };
            this.showReceipt = true;
            
            if (this.settings.autoPrint) {
                setTimeout(() => this.printReceipt(), 500);
            }
        },
        
        printReceipt() {
            const printWindow = window.open('', '_blank');
            const receiptContent = this.generateReceiptHTML();
            
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Receipt</title>
                    <style>
                        body { 
                            font-family: 'Courier New', monospace; 
                            margin: 0; 
                            padding: 10px; 
                            font-size: ${this.settings.fontSize}pt;
                            width: ${this.settings.receiptWidth}mm;
                        }
                        .receipt { text-align: center; }
                        .header { margin-bottom: 10px; }
                        .logo { max-width: 60px; max-height: 60px; margin: 0 auto 10px; }
                        .title { font-size: 16pt; font-weight: bold; margin: 5px 0; }
                        .info { font-size: 10pt; margin: 2px 0; }
                        .divider { border-top: 1px dashed #000; margin: 10px 0; }
                        .items { text-align: left; margin: 10px 0; }
                        .item { margin: 3px 0; }
                        .item-name { float: left; }
                        .item-qty { float: left; margin: 0 10px; }
                        .item-price { float: right; }
                        .clear { clear: both; }
                        .totals { text-align: right; margin: 10px 0; }
                        .total-line { margin: 2px 0; }
                        .grand-total { font-weight: bold; font-size: 14pt; }
                        .footer { margin-top: 15px; font-size: 10pt; }
                        @media print {
                            body { width: 100%; }
                        }
                    </style>
                </head>
                <body>
                    ${receiptContent}
                </body>
                </html>
            `);
            
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        },
        
        generateReceiptHTML() {
            const receipt = this.currentReceipt;
            let html = '<div class="receipt">';
            
            // Header
            if (this.settings.printHeader) {
                if (this.settings.printLogo && this.settings.logo) {
                    html += `<img src="${this.settings.logo}" class="logo" alt="Logo">`;
                }
                html += `<div class="title">${this.settings.restaurantName}</div>`;
                html += `<div class="info">${this.settings.address}</div>`;
                html += `<div class="info">${this.settings.phone}</div>`;
                html += `<div class="info">${this.settings.email}</div>`;
                html += '<div class="divider"></div>';
            }
            
            // Receipt Info
            html += `<div class="info">${this.translations.receiptNumber} ${receipt.receiptNumber}</div>`;
            html += `<div class="info">${this.translations.date}: ${receipt.printDate}</div>`;
            html += `<div class="info">${this.translations.time}: ${receipt.printTime}</div>`;
            if (receipt.tableNumber) {
                html += `<div class="info">${this.translations.tableNumber}: ${receipt.tableNumber}</div>`;
            }
            html += `<div class="info">${this.translations.orderType}: ${this.translations[receipt.type]}</div>`;
            html += '<div class="divider"></div>';
            
            // Items
            html += '<div class="items">';
            receipt.items.forEach(item => {
                html += `
                    <div class="item">
                        <div class="item-name">${item.name}</div>
                        <div class="item-qty">${item.quantity}</div>
                        <div class="item-price">${this.formatPrice(item.price * item.quantity)}</div>
                        <div class="clear"></div>
                    </div>
                `;
            });
            html += '</div>';
            
            html += '<div class="divider"></div>';
            
            // Totals
            html += '<div class="totals">';
            html += `<div class="total-line">${this.translations.subtotal}: ${this.formatPrice(receipt.subtotal)}</div>`;
            html += `<div class="total-line">${this.translations.tax}: ${this.formatPrice(receipt.tax)}</div>`;
            if (receipt.deliveryFee > 0) {
                html += `<div class="total-line">${this.translations.deliveryFee}: ${this.formatPrice(receipt.deliveryFee)}</div>`;
            }
            html += `<div class="total-line grand-total">${this.translations.grandTotal}: ${this.formatPrice(receipt.total)}</div>`;
            html += '</div>';
            
            // Footer
            if (this.settings.printFooter) {
                html += '<div class="divider"></div>';
                html += `<div class="footer">${this.settings.receiptFooter}</div>`;
            }
            
            html += '</div>';
            return html;
        },
        
        // Report Functions
        generateReports() {
            this.generateDailyReport();
            this.generateMonthlyReport();
            this.generateTopItems();
            this.generateCategoryReport();
        },
        
        generateDailyReport() {
            const today = new Date().toDateString();
            const todayOrders = this.orders.filter(order => 
                new Date(order.timestamp).toDateString() === today
            );
            
            this.reports.dailySales = {
                date: today,
                totalSales: todayOrders.reduce((sum, order) => sum + order.total, 0),
                totalOrders: todayOrders.length,
                averageOrder: todayOrders.length > 0 ? 
                    todayOrders.reduce((sum, order) => sum + order.total, 0) / todayOrders.length : 0
            };
        },
        
        generateMonthlyReport() {
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            const monthOrders = this.orders.filter(order => {
                const orderDate = new Date(order.timestamp);
                return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
            });
            
            this.reports.monthlySales = {
                month: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                totalSales: monthOrders.reduce((sum, order) => sum + order.total, 0),
                totalOrders: monthOrders.length,
                averageOrder: monthOrders.length > 0 ? 
                    monthOrders.reduce((sum, order) => sum + order.total, 0) / monthOrders.length : 0
            };
        },
        
        generateTopItems() {
            const itemCounts = {};
            this.orders.forEach(order => {
                order.items.forEach(item => {
                    if (itemCounts[item.name]) {
                        itemCounts[item.name] += item.quantity;
                    } else {
                        itemCounts[item.name] = item.quantity;
                    }
                });
            });
            
            this.reports.topItems = Object.entries(itemCounts)
                .map(([name, quantity]) => ({ name, quantity }))
                .sort((a, b) => b.quantity - a.quantity)
                .slice(0, 10);
        },
        
        generateCategoryReport() {
            const categorySales = {};
            this.orders.forEach(order => {
                order.items.forEach(item => {
                    const recipe = this.recipes.find(r => r.id === item.id);
                    if (recipe) {
                        if (categorySales[recipe.category]) {
                            categorySales[recipe.category] += item.price * item.quantity;
                        } else {
                            categorySales[recipe.category] = item.price * item.quantity;
                        }
                    }
                });
            });
            
            this.reports.categorySales = Object.entries(categorySales)
                .map(([category, sales]) => ({ category, sales }))
                .sort((a, b) => b.sales - a.sales);
        },
        
        // Backup & Export Functions
        exportBackup() {
            const backup = {
                recipes: this.recipes,
                orders: this.orders,
                tables: this.tables,
                settings: this.settings,
                exportDate: new Date().toISOString()
            };
            
            const dataStr = JSON.stringify(backup, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `restaurant_backup_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            URL.revokeObjectURL(url);
        },
        
        importBackup(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const backup = JSON.parse(e.target.result);
                        if (confirm('This will replace all current data. Are you sure?')) {
                            this.recipes = backup.recipes || [];
                            this.orders = backup.orders || [];
                            this.tables = backup.tables || [];
                            this.settings = { ...this.settings, ...backup.settings };
                            
                            this.saveRecipes();
                            this.saveOrders();
                            this.saveTables();
                            this.saveSettings();
                            
                            alert('Backup restored successfully!');
                        }
                    } catch (error) {
                        alert('Invalid backup file!');
                    }
                };
                reader.readAsText(file);
            }
        },
        
        exportData() {
            const data = {
                recipes: this.recipes,
                orders: this.orders,
                reports: this.reports
            };
            
            const dataStr = JSON.stringify(data, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `restaurant_data_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            URL.revokeObjectURL(url);
        }
    }));
});