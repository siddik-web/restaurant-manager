<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\PurchaseController;
use App\Http\Controllers\Api\WasteController;

require __DIR__.'/common.php';

Route::middleware('auth.api')->group(function () {
    // Internal endpoint used by order service (accessible to chef/cashier/admin)
    Route::middleware('role:admin,cashier,chef,inventory_manager')->group(function () {
        Route::post('inventory/internal/deduct-ingredient', [InventoryController::class, 'deductForOrder']);
    });

    // Main Inventory Manager routes
    Route::middleware('role:inventory_manager')->group(function () {
        Route::get('inventory/categories', [InventoryController::class, 'categories']);
        Route::get('inventory/alerts/low-stock', [InventoryController::class, 'lowStockAlerts']);
        Route::get('inventory/alerts/expiring', [InventoryController::class, 'expiringItems']);
        Route::post('inventory/bulk-update', [InventoryController::class, 'bulkUpdate']);
        Route::patch('inventory/{inventory}/adjust-stock', [InventoryController::class, 'adjustStock']);
        Route::get('inventory/{inventory}/transactions', [InventoryController::class, 'transactions']);
        Route::apiResource('inventory', InventoryController::class);

        Route::get('suppliers/active', [SupplierController::class, 'getActive']);
        Route::get('suppliers/performance', [SupplierController::class, 'getByPerformance']);
        Route::patch('suppliers/{supplier}/toggle-active', [SupplierController::class, 'toggleActive']);
        Route::get('suppliers/{supplier}/stats', [SupplierController::class, 'getStats']);
        Route::apiResource('suppliers', SupplierController::class);

        Route::get('purchases/alerts/overdue', [PurchaseController::class, 'getOverdue']);
        Route::get('purchases/stats', [PurchaseController::class, 'getStats']);
        Route::patch('purchases/{purchase}/status', [PurchaseController::class, 'updateStatus']);
        Route::post('purchases/{purchase}/receive-items', [PurchaseController::class, 'receiveItems']);
        Route::apiResource('purchases', PurchaseController::class);

        Route::get('waste/reasons', [WasteController::class, 'reasons']);
        Route::get('waste/categories', [WasteController::class, 'categories']);
        Route::get('waste/stats', [WasteController::class, 'getStats']);
        Route::post('waste/bulk-create', [WasteController::class, 'bulkCreate']);
        Route::apiResource('waste', WasteController::class);
    });
});
