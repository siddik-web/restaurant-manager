<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TableController;

require __DIR__.'/common.php';

Route::middleware(['auth.api', 'role:cashier'])->group(function () {
    Route::get('tables/available', [TableController::class, 'getAvailable']);
    Route::get('tables/locations', [TableController::class, 'getLocations']);
    Route::post('tables/{table}/reservation', [TableController::class, 'makeReservation']);
    Route::patch('tables/{table}/cancel-reservation', [TableController::class, 'cancelReservation']);
    Route::patch('tables/{table}/close', [TableController::class, 'closeTable']);
    Route::get('tables/{table}/orders', [TableController::class, 'getOrders']);
    Route::get('tables/{table}/stats', [TableController::class, 'getStats']);
    Route::apiResource('tables', TableController::class);
});
