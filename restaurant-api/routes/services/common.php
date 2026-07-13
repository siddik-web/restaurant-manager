<?php

use Illuminate\Support\Facades\Route;

Route::get('health', fn () => response()->json([
    'success' => true,
    'data' => [
        'service' => env('SERVICE_DOMAIN', 'monolith'),
        'status' => 'ok',
    ],
]));

Route::get('up', fn () => response()->json(['success' => true]));
