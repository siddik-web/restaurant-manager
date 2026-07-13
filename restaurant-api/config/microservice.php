<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Microservice domain configuration
    |--------------------------------------------------------------------------
    |
    | When SERVICE_DOMAIN is set (menu, order, table, …), only the routes and
    | migrations listed for that domain are loaded. Leave unset or set to
    | "monolith" for the all-in-one development mode.
    |
    */

    'core_migrations' => [
        'database/migrations/0001_01_01_000001_create_cache_table.php',
        'database/migrations/0001_01_01_000002_create_jobs_table.php',
    ],

    'domains' => [
        'menu' => [
            'routes' => 'routes/services/menu.php',
            'migrations' => [
                'database/migrations/2025_07_05_174111_create_recipes_table.php',
            ],
            'seeders' => [
                \Database\Seeders\RecipeSeeder::class,
            ],
        ],

        'order' => [
            'routes' => 'routes/services/order.php',
            'migrations' => [
                'database/migrations/2025_07_05_174115_create_orders_table.php',
                'database/migrations/2025_07_05_174119_create_order_items_table.php',
            ],
            'seeders' => [],
        ],

        'table' => [
            'routes' => 'routes/services/table.php',
            'migrations' => [
                'database/migrations/2025_07_05_174129_create_tables_table.php',
            ],
            'seeders' => [
                \Database\Seeders\TableSeeder::class,
            ],
        ],

        'kitchen' => [
            'routes' => 'routes/services/kitchen.php',
            'migrations' => [
                'database/migrations/2025_07_05_174141_create_chefs_table.php',
                'database/migrations/2025_07_05_174147_create_stations_table.php',
            ],
            'seeders' => [
                \Database\Seeders\ChefSeeder::class,
                \Database\Seeders\StationSeeder::class,
            ],
        ],

        'settings' => [
            'routes' => 'routes/services/settings.php',
            'migrations' => [
                'database/migrations/2025_07_05_174153_create_settings_table.php',
            ],
            'seeders' => [
                \Database\Seeders\SettingSeeder::class,
            ],
        ],

        'inventory' => [
            'routes' => 'routes/services/inventory.php',
            'migrations' => [
                'database/migrations/2025_07_05_174200_create_suppliers_table.php',
                'database/migrations/2025_07_05_174210_create_inventory_table.php',
                'database/migrations/2025_07_05_174220_create_purchases_table.php',
                'database/migrations/2025_07_05_174230_create_purchase_items_table.php',
                'database/migrations/2025_07_05_174240_create_waste_table.php',
                'database/migrations/2025_07_05_174250_create_stock_transactions_table.php',
            ],
            'seeders' => [
                \Database\Seeders\SupplierSeeder::class,
                \Database\Seeders\InventorySeeder::class,
            ],
        ],

        'reporting' => [
            'routes' => 'routes/services/reporting.php',
            'migrations' => [],
            'seeders' => [],
        ],
    ],

];
