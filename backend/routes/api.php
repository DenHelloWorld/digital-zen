<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('/health', function () {
        return response()->json([
            'status' => 'ok',
            'message' => 'Backend is running',
            'timestamp' => now()->toIso8601String(),
        ]);
    });
});
