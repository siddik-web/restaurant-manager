<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\OrderController;

require __DIR__.'/common.php';

Route::apiResource('orders', OrderController::class);
Route::patch('orders/{order}/status', [OrderController::class, 'updateStatus']);
Route::post('orders/{order}/assign-chef-station', [OrderController::class, 'assignChefStation']);
Route::patch('orders/{order}/urgent', [OrderController::class, 'markUrgent']);
Route::patch('orders/{order}/complete', [OrderController::class, 'complete']);
