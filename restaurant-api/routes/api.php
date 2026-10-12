<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
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

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Auth Routes
Route::post('login', [AuthController::class, 'login'])->middleware('throttle:6,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('user', [AuthController::class, 'user']);

    // Recipe Routes
    Route::get('recipes/categories', [RecipeController::class, 'categories']);
    Route::apiResource('recipes', RecipeController::class);
    Route::patch('recipes/{recipe}/toggle-active', [RecipeController::class, 'toggleActive']);
    Route::post('recipes/{recipe}/duplicate', [RecipeController::class, 'duplicate']);

    // Order Routes
    Route::apiResource('orders', OrderController::class);
    Route::patch('orders/{order}/status', [OrderController::class, 'updateStatus']);
    Route::post('orders/{order}/assign-chef-station', [OrderController::class, 'assignChefStation']);
    Route::patch('orders/{order}/urgent', [OrderController::class, 'markUrgent']);
    Route::patch('orders/{order}/complete', [OrderController::class, 'complete']);

    // Table Routes
    Route::get('tables/available', [TableController::class, 'getAvailable']);
    Route::get('tables/locations', [TableController::class, 'getLocations']);
    Route::apiResource('tables', TableController::class);
    Route::post('tables/{table}/reservation', [TableController::class, 'makeReservation']);
    Route::patch('tables/{table}/cancel-reservation', [TableController::class, 'cancelReservation']);
    Route::patch('tables/{table}/close', [TableController::class, 'closeTable']);
    Route::get('tables/{table}/orders', [TableController::class, 'getOrders']);
    Route::get('tables/{table}/stats', [TableController::class, 'getStats']);

    // Chef Routes
    Route::get('chefs/active', [ChefController::class, 'getActive']);
    Route::get('chefs/specialties', [ChefController::class, 'getSpecialties']);
    Route::apiResource('chefs', ChefController::class);
    Route::patch('chefs/{chef}/toggle-active', [ChefController::class, 'toggleActive']);
    Route::get('chefs/{chef}/stats', [ChefController::class, 'getStats']);

    // Station Routes
    Route::get('stations/active', [StationController::class, 'getActive']);
    Route::apiResource('stations', StationController::class);
    Route::patch('stations/{station}/toggle-active', [StationController::class, 'toggleActive']);
    Route::get('stations/{station}/stats', [StationController::class, 'getStats']);

    // Setting Routes
    Route::get('settings/restaurant', [SettingController::class, 'getRestaurantSettings']);
    Route::post('settings/restaurant', [SettingController::class, 'updateRestaurantSettings']);
    Route::get('settings/types', [SettingController::class, 'getTypes']);
    Route::apiResource('settings', SettingController::class);
    Route::get('settings/value/{key}', [SettingController::class, 'getValue']);
    Route::post('settings/value/{key}', [SettingController::class, 'setValue']);

    // Inventory Routes
    Route::get('inventory/categories', [InventoryController::class, 'categories']);
    Route::get('inventory/alerts/low-stock', [InventoryController::class, 'lowStockAlerts']);
    Route::get('inventory/alerts/expiring', [InventoryController::class, 'expiringItems']);
    Route::post('inventory/bulk-update', [InventoryController::class, 'bulkUpdate']);
    Route::apiResource('inventory', InventoryController::class);
    Route::patch('inventory/{inventory}/adjust-stock', [InventoryController::class, 'adjustStock']);
    Route::get('inventory/{inventory}/transactions', [InventoryController::class, 'transactions']);

    // Supplier Routes
    Route::get('suppliers/active', [SupplierController::class, 'getActive']);
    Route::get('suppliers/performance', [SupplierController::class, 'getByPerformance']);
    Route::apiResource('suppliers', SupplierController::class);
    Route::patch('suppliers/{supplier}/toggle-active', [SupplierController::class, 'toggleActive']);
    Route::get('suppliers/{supplier}/stats', [SupplierController::class, 'getStats']);

    // Purchase Routes
    Route::get('purchases/alerts/overdue', [PurchaseController::class, 'getOverdue']);
    Route::get('purchases/stats', [PurchaseController::class, 'getStats']);
    Route::apiResource('purchases', PurchaseController::class);
    Route::patch('purchases/{purchase}/status', [PurchaseController::class, 'updateStatus']);
    Route::post('purchases/{purchase}/receive-items', [PurchaseController::class, 'receiveItems']);

    // Waste Routes
    Route::get('waste/reasons', [WasteController::class, 'reasons']);
    Route::get('waste/categories', [WasteController::class, 'categories']);
    Route::get('waste/stats', [WasteController::class, 'getStats']);
    Route::post('waste/bulk-create', [WasteController::class, 'bulkCreate']);
    Route::apiResource('waste', WasteController::class);

    // Report Routes
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

        // Inventory Reports
        Route::get('inventory-stock', [ReportController::class, 'inventoryStock']);
        Route::get('inventory-value', [ReportController::class, 'inventoryValue']);
        Route::get('inventory-movement', [ReportController::class, 'inventoryMovement']);
        Route::get('purchase-analysis', [ReportController::class, 'purchaseAnalysis']);
        Route::get('waste-analysis', [ReportController::class, 'wasteAnalysis']);
        Route::get('supplier-performance', [ReportController::class, 'supplierPerformance']);
    });
});
