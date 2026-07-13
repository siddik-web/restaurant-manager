<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\RecipeController;

require __DIR__.'/common.php';

Route::get('recipes/categories', [RecipeController::class, 'categories']);
Route::patch('recipes/{recipe}/toggle-active', [RecipeController::class, 'toggleActive']);
Route::post('recipes/{recipe}/duplicate', [RecipeController::class, 'duplicate']);
Route::apiResource('recipes', RecipeController::class);
