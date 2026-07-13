<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\RecipeController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\TableController;
use App\Http\Controllers\Api\ChefController;
use App\Http\Controllers\Api\StationController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\PurchaseController;
use App\Http\Controllers\Api\WasteController;
use App\Http\Controllers\Api\AuthController;

$serviceDomain = env('SERVICE_DOMAIN', 'monolith');

if ($serviceDomain !== 'monolith') {
    $routeFile = config("microservice.domains.{$serviceDomain}.routes");

    if ($routeFile && file_exists(base_path($routeFile))) {
        require base_path($routeFile);
    }

    return;
}

// Public Routes
Route::get('health', fn () => response()->json([
    'success' => true,
    'data' => ['service' => 'monolith', 'status' => 'ok'],
]));

Route::post('login', [AuthController::class, 'login']);
Route::get('auth/verify-token', [AuthController::class, 'verifyToken']);

// Authenticated Routes
Route::middleware('auth.api')->group(function () {
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('user', [AuthController::class, 'me']);

    // Recipe Routes (Read for all authenticated roles, Write for Admin only)
    Route::middleware('role:admin,cashier,chef,inventory_manager')->group(function () {
        Route::get('recipes', [RecipeController::class, 'index']);
        Route::get('recipes/categories', [RecipeController::class, 'categories']);
        Route::get('recipes/{recipe}', [RecipeController::class, 'show']);
    });
    Route::middleware('role:admin')->group(function () {
        Route::post('recipes', [RecipeController::class, 'store']);
        Route::put('recipes/{recipe}', [RecipeController::class, 'update']);
        Route::delete('recipes/{recipe}', [RecipeController::class, 'destroy']);
        Route::patch('recipes/{recipe}/toggle-active', [RecipeController::class, 'toggleActive']);
        Route::post('recipes/{recipe}/duplicate', [RecipeController::class, 'duplicate']);
    });

    // Order Routes (POS and KDS access)
    Route::middleware('role:cashier,chef')->group(function () {
        Route::get('orders', [OrderController::class, 'index']);
        Route::get('orders/{order}', [OrderController::class, 'show']);
        Route::patch('orders/{order}/status', [OrderController::class, 'updateStatus']);
        Route::patch('orders/{order}/complete', [OrderController::class, 'complete']);
    });
    Route::middleware('role:cashier')->group(function () {
        Route::post('orders', [OrderController::class, 'store']);
        Route::patch('orders/{order}/urgent', [OrderController::class, 'markUrgent']);
    });
    Route::middleware('role:chef')->group(function () {
        Route::post('orders/{order}/assign-chef-station', [OrderController::class, 'assignChefStation']);
    });
    Route::middleware('role:admin')->group(function () {
        Route::delete('orders/{order}', [OrderController::class, 'destroy']);
    });

    // Table Routes (Cashier only)
    Route::middleware('role:cashier')->group(function () {
        Route::apiResource('tables', TableController::class);
        Route::post('tables/{table}/reservation', [TableController::class, 'makeReservation']);
        Route::patch('tables/{table}/cancel-reservation', [TableController::class, 'cancelReservation']);
        Route::patch('tables/{table}/close', [TableController::class, 'closeTable']);
        Route::get('tables/{table}/orders', [TableController::class, 'getOrders']);
        Route::get('tables/{table}/stats', [TableController::class, 'getStats']);
        Route::get('tables/available', [TableController::class, 'getAvailable']);
        Route::get('tables/locations', [TableController::class, 'getLocations']);
    });

    // Chef & Station Routes (Chef only)
    Route::middleware('role:chef')->group(function () {
        Route::apiResource('chefs', ChefController::class);
        Route::patch('chefs/{chef}/toggle-active', [ChefController::class, 'toggleActive']);
        Route::get('chefs/{chef}/stats', [ChefController::class, 'getStats']);
        Route::get('chefs/active', [ChefController::class, 'getActive']);
        Route::get('chefs/specialties', [ChefController::class, 'getSpecialties']);

        Route::apiResource('stations', StationController::class);
        Route::patch('stations/{station}/toggle-active', [StationController::class, 'toggleActive']);
        Route::get('stations/{station}/stats', [StationController::class, 'getStats']);
        Route::get('stations/active', [StationController::class, 'getActive']);
    });

    // Setting Routes (Admin only)
    Route::middleware('role:admin')->group(function () {
        Route::get('settings/value/{key}', [SettingController::class, 'getValue']);
        Route::post('settings/value/{key}', [SettingController::class, 'setValue']);
        Route::get('settings/restaurant', [SettingController::class, 'getRestaurantSettings']);
        Route::post('settings/restaurant', [SettingController::class, 'updateRestaurantSettings']);
        Route::get('settings/types', [SettingController::class, 'getTypes']);
        Route::apiResource('settings', SettingController::class);
    });

    // Inventory, Supplier, Purchase, Waste Routes (Inventory Manager only)
    Route::middleware('role:inventory_manager')->group(function () {
        Route::apiResource('inventory', InventoryController::class)->except(['store', 'update', 'destroy']); // Keep resource verbs clean
        Route::post('inventory', [InventoryController::class, 'store']);
        Route::put('inventory/{inventory}', [InventoryController::class, 'update']);
        Route::delete('inventory/{inventory}', [InventoryController::class, 'destroy']);
        
        Route::patch('inventory/{inventory}/adjust-stock', [InventoryController::class, 'adjustStock']);
        Route::get('inventory/categories', [InventoryController::class, 'categories']);
        Route::get('inventory/alerts/low-stock', [InventoryController::class, 'lowStockAlerts']);
        Route::get('inventory/alerts/expiring', [InventoryController::class, 'expiringItems']);
        Route::get('inventory/{inventory}/transactions', [InventoryController::class, 'transactions']);
        Route::post('inventory/bulk-update', [InventoryController::class, 'bulkUpdate']);

        Route::apiResource('suppliers', SupplierController::class);
        Route::patch('suppliers/{supplier}/toggle-active', [SupplierController::class, 'toggleActive']);
        Route::get('suppliers/{supplier}/stats', [SupplierController::class, 'getStats']);
        Route::get('suppliers/active', [SupplierController::class, 'getActive']);
        Route::get('suppliers/performance', [SupplierController::class, 'getByPerformance']);

        Route::apiResource('purchases', PurchaseController::class);
        Route::patch('purchases/{purchase}/status', [PurchaseController::class, 'updateStatus']);
        Route::post('purchases/{purchase}/receive-items', [PurchaseController::class, 'receiveItems']);
        Route::get('purchases/alerts/overdue', [PurchaseController::class, 'getOverdue']);
        Route::get('purchases/stats', [PurchaseController::class, 'getStats']);

        Route::apiResource('waste', WasteController::class);
        Route::get('waste/reasons', [WasteController::class, 'reasons']);
        Route::get('waste/categories', [WasteController::class, 'categories']);
        Route::get('waste/stats', [WasteController::class, 'getStats']);
        Route::post('waste/bulk-create', [WasteController::class, 'bulkCreate']);
    });
    
    // Internal deduct-ingredient route used by order service (accessible to chef/cashier/admin)
    Route::middleware('role:admin,cashier,chef,inventory_manager')->group(function () {
        Route::post('inventory/internal/deduct-ingredient', [InventoryController::class, 'deductForOrder']);
    });

    // Report Routes (Admin only)
    Route::middleware('role:admin')->group(function () {
        Route::prefix('reports')->group(function () {
            Route::get('daily-sales', [ReportController::class, 'dailySales']);
            Route::get('monthly-sales', [ReportController::class, 'monthlySales']);
            Route::get('top-items', [ReportController::class, 'topItems']);
            Route::get('category-sales', [ReportController::class, 'categorySales']);
            Route::get('kitchen-stats', [ReportController::class, 'kitchenStats']);
            Route::get('table-stats', [ReportController::class, 'tableStats']);
            Route::get('chef-performance', [ReportController::class, 'chefPerformance']);
            Route::get('station-performance', [ReportController::class, 'stationPerformance']);
            Route::get('export', [ReportController::class, 'exportData']);
            Route::get('inventory-stock', [ReportController::class, 'inventoryStock']);
            Route::get('inventory-value', [ReportController::class, 'inventoryValue']);
            Route::get('inventory-movement', [ReportController::class, 'inventoryMovement']);
            Route::get('purchase-analysis', [ReportController::class, 'purchaseAnalysis']);
            Route::get('waste-analysis', [ReportController::class, 'wasteAnalysis']);
            Route::get('supplier-performance', [ReportController::class, 'supplierPerformance']);
        });
    });
});
