<?php

use App\Http\Controllers\Api\Admin\AdminController;
use App\Http\Controllers\Api\Admin\CategoryController;
use App\Http\Controllers\Api\Admin\CompanyController;
use App\Http\Controllers\Api\Admin\PlateController;
use App\Http\Controllers\Api\Admin\ProfileController;
use App\Http\Controllers\Api\Admin\UserController;
use App\Http\Controllers\Api\Auth\AuthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::middleware('guest:sanctum')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    // Resend verification email
    Route::post('/email/check-status', [AuthController::class, 'checkVerificationStatus']); // NEW ROUTE
    Route::post('/email/resend', [AuthController::class, 'resendVerificationEmail'])->name('verification.resend');

    // Forgot password && Reset password
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    Route::post('/validate-reset-token', action: [AuthController::class, 'validateResetToken']);

});

// Protected routes with authentication, email verification, and active status check
Route::middleware(['auth:sanctum', 'verified', 'user.status'])->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);

    // Admin
    Route::middleware('role:admin')->prefix('admin/')->group(function () {
        // Categories
        Route::delete('categories/selected', [CategoryController::class, 'destroySelected']);
        Route::delete('categories/all',      [CategoryController::class, 'destroyAll']);
        Route::get('categories/active-cats', [CategoryController::class, 'getActiveCats']);
        Route::apiResource('categories',      CategoryController::class);
        // Plates
        Route::delete('plates/selected', [PlateController::class, 'destroySelected']);
        Route::delete('plates/all',      [PlateController::class, 'destroyAll']);
        Route::apiResource('plates',      PlateController::class);
        //Users
        Route::get('users',                    [UserController::class, 'index']);
        Route::patch( 'users/{user}/status',    [UserController::class, 'updateUserStatus']);
        //Admins
        Route::prefix('admins')->group(function () {
            Route::get('/',                         [AdminController::class, 'index']);
            Route::post('/',                        [AdminController::class, 'store']);
            Route::get('/{user}',                   [AdminController::class, 'show']);
            Route::put('/{user}',                  [AdminController::class, 'update']);
            Route::patch('/{user}/status',          [AdminController::class, 'updateUserStatus']);
            Route::put('/{user}/change-password',   [AdminController::class, 'changePassword']);
            Route::delete('/all',                   [AdminController::class, 'destroyAll']);
            Route::delete('/selected',              [AdminController::class, 'destroySelected']);
            Route::delete('/{user}',                [AdminController::class, 'destroy']);
        });
        // Admin Profile
        Route::prefix('profile')->group(function () {
            Route::get('/',                 [ProfileController::class, 'show']);
            Route::put('/',                [ProfileController::class, 'update']);
            Route::put('/change-password',  [ProfileController::class, 'changePassword']);
            Route::patch('/change-avatar',              [ProfileController::class, 'changeAvatar']);
            Route::delete('/delete-avatar',              [ProfileController::class, 'deleteAvatar']);
        });
        // Company
        Route::prefix('company')->group(function () {
            Route::get('/',  [CompanyController::class, 'show']);
            Route::post('/', [CompanyController::class, 'update']);
            Route::post('/logo',    [CompanyController::class, 'changeLogo']);
            Route::delete('/logo',  [CompanyController::class, 'deleteLogo']);
        });
    });

});
