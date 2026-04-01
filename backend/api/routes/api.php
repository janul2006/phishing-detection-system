<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ScanController;

Route::post('/scan-url', [ScanController::class, 'scan']);

Route::get('/test', function () {
    return "API WORKING";
});