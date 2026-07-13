<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ChefController;
use App\Http\Controllers\Api\StationController;

require __DIR__.'/common.php';

Route::middleware(['auth.api', 'role:chef'])->group(function () {
    Route::get('chefs/active', [ChefController::class, 'getActive']);
    Route::get('chefs/specialties', [ChefController::class, 'getSpecialties']);
    Route::patch('chefs/{chef}/toggle-active', [ChefController::class, 'toggleActive']);
    Route::get('chefs/{chef}/stats', [ChefController::class, 'getStats']);
    Route::apiResource('chefs', ChefController::class);

    Route::get('stations/active', [StationController::class, 'getActive']);
    Route::patch('stations/{station}/toggle-active', [StationController::class, 'toggleActive']);
    Route::get('stations/{station}/stats', [StationController::class, 'getStats']);
    Route::apiResource('stations', StationController::class);
});
