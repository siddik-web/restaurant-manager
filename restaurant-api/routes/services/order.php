<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\OrderController;

require __DIR__.'/common.php';

Route::middleware('auth.api')->group(function () {
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
        Route::put('orders/{order}', [OrderController::class, 'update']);
        Route::delete('orders/{order}', [OrderController::class, 'destroy']);
    });
});
