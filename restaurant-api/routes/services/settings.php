<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\SettingController;

require __DIR__.'/common.php';

Route::get('settings/value/{key}', [SettingController::class, 'getValue']);
Route::post('settings/value/{key}', [SettingController::class, 'setValue']);
Route::get('settings/restaurant', [SettingController::class, 'getRestaurantSettings']);
Route::post('settings/restaurant', [SettingController::class, 'updateRestaurantSettings']);
Route::get('settings/types', [SettingController::class, 'getTypes']);

Route::apiResource('settings', SettingController::class);
