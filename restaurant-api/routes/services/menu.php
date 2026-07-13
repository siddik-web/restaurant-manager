<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\RecipeController;

require __DIR__.'/common.php';

Route::middleware('auth.api')->group(function () {
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
});
