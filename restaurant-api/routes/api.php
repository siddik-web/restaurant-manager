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

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Recipe Routes
Route::apiResource('recipes', RecipeController::class);
Route::patch('recipes/{recipe}/toggle-active', [RecipeController::class, 'toggleActive']);
Route::post('recipes/{recipe}/duplicate', [RecipeController::class, 'duplicate']);
Route::get('recipes/categories', [RecipeController::class, 'categories']);

// Order Routes
Route::apiResource('orders', OrderController::class);
Route::patch('orders/{order}/status', [OrderController::class, 'updateStatus']);
Route::post('orders/{order}/assign-chef-station', [OrderController::class, 'assignChefStation']);
Route::patch('orders/{order}/urgent', [OrderController::class, 'markUrgent']);
Route::patch('orders/{order}/complete', [OrderController::class, 'complete']);

// Table Routes
Route::apiResource('tables', TableController::class);
Route::post('tables/{table}/reservation', [TableController::class, 'makeReservation']);
Route::patch('tables/{table}/cancel-reservation', [TableController::class, 'cancelReservation']);
Route::patch('tables/{table}/close', [TableController::class, 'closeTable']);
Route::get('tables/{table}/orders', [TableController::class, 'getOrders']);
Route::get('tables/{table}/stats', [TableController::class, 'getStats']);
Route::get('tables/available', [TableController::class, 'getAvailable']);
Route::get('tables/locations', [TableController::class, 'getLocations']);

// Chef Routes
Route::apiResource('chefs', ChefController::class);
Route::patch('chefs/{chef}/toggle-active', [ChefController::class, 'toggleActive']);
Route::get('chefs/{chef}/stats', [ChefController::class, 'getStats']);
Route::get('chefs/active', [ChefController::class, 'getActive']);
Route::get('chefs/specialties', [ChefController::class, 'getSpecialties']);

// Station Routes
Route::apiResource('stations', StationController::class);
Route::patch('stations/{station}/toggle-active', [StationController::class, 'toggleActive']);
Route::get('stations/{station}/stats', [StationController::class, 'getStats']);
Route::get('stations/active', [StationController::class, 'getActive']);

// Setting Routes
Route::apiResource('settings', SettingController::class);
Route::get('settings/value/{key}', [SettingController::class, 'getValue']);
Route::post('settings/value/{key}', [SettingController::class, 'setValue']);
Route::get('settings/restaurant', [SettingController::class, 'getRestaurantSettings']);
Route::post('settings/restaurant', [SettingController::class, 'updateRestaurantSettings']);
Route::get('settings/types', [SettingController::class, 'getTypes']);

// Inventory Routes
Route::apiResource('inventory', InventoryController::class);
Route::patch('inventory/{inventory}/adjust-stock', [InventoryController::class, 'adjustStock']);
Route::get('inventory/categories', [InventoryController::class, 'categories']);
Route::get('inventory/alerts/low-stock', [InventoryController::class, 'lowStockAlerts']);
Route::get('inventory/alerts/expiring', [InventoryController::class, 'expiringItems']);
Route::get('inventory/{inventory}/transactions', [InventoryController::class, 'transactions']);
Route::post('inventory/bulk-update', [InventoryController::class, 'bulkUpdate']);

// Supplier Routes
Route::apiResource('suppliers', SupplierController::class);
Route::patch('suppliers/{supplier}/toggle-active', [SupplierController::class, 'toggleActive']);
Route::get('suppliers/{supplier}/stats', [SupplierController::class, 'getStats']);
Route::get('suppliers/active', [SupplierController::class, 'getActive']);
Route::get('suppliers/performance', [SupplierController::class, 'getByPerformance']);

// Purchase Routes
Route::apiResource('purchases', PurchaseController::class);
Route::patch('purchases/{purchase}/status', [PurchaseController::class, 'updateStatus']);
Route::post('purchases/{purchase}/receive-items', [PurchaseController::class, 'receiveItems']);
Route::get('purchases/alerts/overdue', [PurchaseController::class, 'getOverdue']);
Route::get('purchases/stats', [PurchaseController::class, 'getStats']);

// Waste Routes
Route::apiResource('waste', WasteController::class);
Route::get('waste/reasons', [WasteController::class, 'reasons']);
Route::get('waste/categories', [WasteController::class, 'categories']);
Route::get('waste/stats', [WasteController::class, 'getStats']);
Route::post('waste/bulk-create', [WasteController::class, 'bulkCreate']);

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