<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Controllers
|--------------------------------------------------------------------------
*/

use App\Http\Controllers\Api\Auth\AuthController;

use App\Http\Controllers\Api\{
    CompanyController           as PublicCompanyController,
    ContactMessageController    as PublicContactMessageController,
    MenuController              as PublicMenuController,
    SettingsController          as PublicSettingsController,
};

use App\Http\Controllers\Api\Admin\{
    AdminController,
    CategoryController,
    CompanyController,
    ContactMessageController    as AdminContactMessageController,
    OrderController             as AdminOrderController,
    PlateController,
    ProfileController,
    ReservationController       as AdminReservationController,
    SettingsController          as AdminSettingsController,
    UserController,
};

use App\Http\Controllers\Api\User\{
    FavoriteController          as UserFavoriteController,
    OrderController             as UserOrderController,
    ReservationController       as UserReservationController,
};

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::prefix('public')->group(function () {

    Route::prefix('menu')->controller(PublicMenuController::class)->group(function () {
        Route::get('/',     'getMenu');
        Route::get('/{id}', 'getPlateDetails');
    });

    Route::get('company',  [PublicCompanyController::class,       'getCompanyInfo']);
    Route::post('contact', [PublicContactMessageController::class, 'store']);
    Route::get('settings', [PublicSettingsController::class,       'show']);
});

/*
|--------------------------------------------------------------------------
| Guest Routes
|--------------------------------------------------------------------------
*/

Route::middleware('guest:sanctum')->controller(AuthController::class)->group(function () {
    Route::post('/register',             'register');
    Route::post('/login',                'login');
    Route::post('/email/check-status',   'checkVerificationStatus');
    Route::post('/email/resend',         'resendVerificationEmail')->name('verification.resend');
    Route::post('/forgot-password',      'forgotPassword');
    Route::post('/reset-password',       'resetPassword');
    Route::post('/validate-reset-token', 'validateResetToken');
});

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum', 'verified', 'user.status'])->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);

    /*
    |----------------------------------------------------------------------
    | Admin Routes
    |----------------------------------------------------------------------
    */

    Route::middleware('role:admin')->prefix('admin')->group(function () {

        // Settings
        Route::controller(AdminSettingsController::class)->prefix('settings')->group(function () {
            Route::get('/',  'show');
            Route::post('/', 'update');
        });

        // Categories
        Route::controller(CategoryController::class)->prefix('categories')->group(function () {
            Route::get('active-cats',  'getActiveCats');
            Route::delete('selected',  'destroySelected');
            Route::delete('all',       'destroyAll');
            Route::apiResource('/',     CategoryController::class);
        });

        // Plates
        Route::controller(PlateController::class)->prefix('plates')->group(function () {
            Route::delete('selected', 'destroySelected');
            Route::delete('all',      'destroyAll');
            Route::apiResource('/',    PlateController::class);
        });

        // Users
        Route::controller(UserController::class)->prefix('users')->group(function () {
            Route::get('/',                'index');
            Route::patch('/{user}/status', 'updateUserStatus');
        });

        // Admins
        Route::controller(AdminController::class)->prefix('admins')->group(function () {
            Route::get('/',                        'index');
            Route::post('/',                       'store');
            Route::get('/{user}',                  'show');
            Route::put('/{user}',                  'update');
            Route::patch('/{user}/status',         'updateUserStatus');
            Route::put('/{user}/change-password',  'changePassword');
            Route::delete('all',                   'destroyAll');
            Route::delete('selected',              'destroySelected');
            Route::delete('/{user}',               'destroy');
        });

        // Profile
        Route::controller(ProfileController::class)->prefix('profile')->group(function () {
            Route::get('/',                 'show');
            Route::put('/',                 'update');
            Route::put('/change-password',  'changePassword');
            Route::patch('/change-avatar',  'changeAvatar');
            Route::delete('/delete-avatar', 'deleteAvatar');
        });

        // Company
        Route::controller(CompanyController::class)->prefix('company')->group(function () {
            Route::get('/',        'show');
            Route::post('/',       'update');
            Route::post('/logo',   'changeLogo');
            Route::delete('/logo', 'deleteLogo');
        });

        // Contact Messages
        Route::controller(AdminContactMessageController::class)->prefix('contact-messages')->group(function () {
            Route::get('/',                       'index');
            Route::get('/{contactMessage}',       'show');
            Route::post('/{contactMessage}/read', 'read');
            Route::delete('destroy-selected',     'destroySelected');
            Route::delete('/{contactMessage}',    'destroy');
        });

        // Reservations
        Route::controller(AdminReservationController::class)->prefix('reservations')->group(function () {
            Route::get('/',                   'index');
            Route::get('/{reservation}',      'show');
            Route::patch('/{reservation}',    'update');
            Route::delete('destroy-selected', 'destroySelected');
            Route::delete('/{reservation}',   'destroy');
        });

        // Orders
        Route::controller(AdminOrderController::class)->prefix('orders')->group(function () {
            Route::get('/',                         'index');
            Route::get('/{order}',                  'show');
            Route::patch('/{order}/status',         'updateStatus');
            Route::patch('/{order}/payment-status', 'updatePaymentStatus');
        });
    });

    /*
    |----------------------------------------------------------------------
    | User Routes
    |----------------------------------------------------------------------
    */

    Route::middleware('role:user')->prefix('user')->group(function () {

        // Reservations
        Route::controller(UserReservationController::class)->prefix('reservations')->group(function () {
            Route::get('/',                 'index');
            Route::post('/',                'store');
            Route::delete('/{reservation}', 'destroy');
        });

        // Favorites
        Route::controller(UserFavoriteController::class)->prefix('favorites')->group(function () {
            Route::get('/',        'index');
            Route::post('/toggle', 'toggle');
        });

        // Orders
        Route::controller(UserOrderController::class)->prefix('orders')->group(function () {
            Route::post('/payment-intent', 'createPaymentIntent');
            Route::post('/',               'store');
            Route::get('/',                'index');
            Route::get('/{id}',            'show');
        });
    });
});
