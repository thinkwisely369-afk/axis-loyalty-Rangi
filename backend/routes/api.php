<?php

use App\Http\Controllers\UserController;
use App\Http\Controllers\SnapCashController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\WalletController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('validate.api.token')->group(function () {

    // Public routes (no user authentication required, but API token required)
    Route::post('/auth/send-otp', [AuthController::class, 'sendOtp']);
    Route::post('/auth/verify-otp', [AuthController::class, 'verifyOtp']);
    Route::post('/auth/verify-policy', [AuthController::class, 'verifyPolicy']);

    // Protected routes (require both API token AND user authentication)
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::post('/user/profile', [UserController::class, 'updateProfile']);
        Route::post('/user/policy', [UserController::class, 'addPolicy']);
        Route::post('/snapcash/analyze', [SnapCashController::class, 'analyze']);
        Route::post('/snapcash/submit', [SnapCashController::class, 'submitBill']);

        // Wallet Routes
        Route::get('/wallet', [WalletController::class, 'getBalance']);
        Route::get('/wallet/transactions', [WalletController::class, 'getTransactions']);

        // General Protected Routes
        Route::get('/privileges', [\App\Http\Controllers\AdminController::class, 'getPrivileges']);
        Route::get('/promotions/{id}', [\App\Http\Controllers\AdminController::class, 'getPromotion']);

        // Admin Management Routes
        Route::middleware('role:admin')->prefix('admin')->group(function () {
            // Dashboard
            Route::get('/stats', [\App\Http\Controllers\AdminController::class, 'getStats']);

            // User Management
            Route::get('/users', [\App\Http\Controllers\AdminController::class, 'getUsers']);
            Route::post('/users', [\App\Http\Controllers\AdminController::class, 'storeUser']);
            Route::patch('/users/{id}', [\App\Http\Controllers\AdminController::class, 'updateUser']);

            // Privilege Management
            Route::get('/privileges', [\App\Http\Controllers\AdminController::class, 'getPrivileges']);
            Route::post('/privileges', [\App\Http\Controllers\AdminController::class, 'storePrivilege']);
            Route::patch('/privileges/{id}', [\App\Http\Controllers\AdminController::class, 'updatePrivilege']);
            Route::delete('/privileges/{id}', [\App\Http\Controllers\AdminController::class, 'deletePrivilege']);

            // SnapCash Bill Management
            Route::get('/bills', [\App\Http\Controllers\AdminController::class, 'getBills']);
            Route::patch('/bills/{id}/revoke', [\App\Http\Controllers\AdminController::class, 'revokeBill']);

            // Points Management
            Route::post('/points/assign', [\App\Http\Controllers\AdminController::class, 'assignPoints']);

            // Demo Policy Reference
            Route::get('/policies/demo', [\App\Http\Controllers\AdminController::class, 'getDemoPolicies']);
            Route::post('/policies', [\App\Http\Controllers\AdminController::class, 'storePolicy']);
            Route::patch('/policies/{id}', [\App\Http\Controllers\AdminController::class, 'updatePolicy']);
            Route::delete('/policies/{id}', [\App\Http\Controllers\AdminController::class, 'deletePolicy']);
        });

    });

});
