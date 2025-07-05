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
}); 