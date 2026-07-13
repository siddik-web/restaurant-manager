<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\AuthController;

require __DIR__.'/common.php';

// Public authentication routes
Route::post('login', [AuthController::class, 'login']);
Route::get('auth/verify-token', [AuthController::class, 'verifyToken']);

Route::middleware('auth.api')->group(function () {
    // Authenticated authentication routes
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('user', [AuthController::class, 'me']);

    // Settings routes protected by admin role
    Route::middleware('role:admin')->group(function () {
        Route::get('settings/value/{key}', [SettingController::class, 'getValue']);
        Route::post('settings/value/{key}', [SettingController::class, 'setValue']);
        Route::get('settings/restaurant', [SettingController::class, 'getRestaurantSettings']);
        Route::post('settings/restaurant', [SettingController::class, 'updateRestaurantSettings']);
        Route::get('settings/types', [SettingController::class, 'getTypes']);
        Route::apiResource('settings', SettingController::class);
    });
});
