<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ReportController;

require __DIR__.'/common.php';

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
