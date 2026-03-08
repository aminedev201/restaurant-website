<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Controllers
|--------------------------------------------------------------------------
*/

use App\Http\Controllers\Api\Auth\AuthController;

use App\Http\Controllers\Api\PublicController;

use App\Http\Controllers\Api\Admin\{
    AdminController,
    CategoryController,
    CompanyController,
    PlateController,
    UserController,
    ChefsController             as AdminChefsController,
    OrderController             as AdminOrderController,
    ContactMessageController    as AdminContactMessageController,
    ProfileController           as AdminProfileController,
    ReservationController       as AdminReservationController,
    SettingsController          as AdminSettingsController,
    TestimonialController       as AdminTestimonialController,
    StatsController             as AdminStatsController,
};

use App\Http\Controllers\Api\User\{
    StatsController             as UserStatsController,
    ProfileController           as UserProfileController,
    FavoriteController          as UserFavoriteController,
    OrderController             as UserOrderController,
    ReservationController       as UserReservationController,
    TestimonialController       as UserTestimonialController,
};

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::prefix('public')->group(function () {
    Route::controller(PublicController::class)->group(function () {
        Route::prefix('menu')->group(function () {
            Route::get('/',     'getMenu');
            Route::get('/{id}', 'getPlateDetails');
        });
        Route::get('categories',    'getCategories');
        Route::get('plates/latest', 'getLatestPlates');
        Route::get('company',       'getCompanyInfo');
        Route::post('contact',      'storeContactMessage');
        Route::get('settings',      'showSettings');
        Route::get('chefs',         'chefs');
        Route::get('testimonials',  'testimonials');
    });
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

    Route::prefix('admin')->middleware('role:admin')->group(function () {
        // Stats
        Route::get('stats', [AdminStatsController::class, 'index']);

        // Chefs
        Route::controller(AdminChefsController::class)->prefix('chefs')->group(function () {
            Route::delete('all',      'destroyAll');
            Route::delete('selected', 'destroySelected');
        });

        Route::apiResource('chefs', AdminChefsController::class);

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
        Route::controller(AdminProfileController::class)->prefix('profile')->group(function () {
            Route::get('/',                 'show');
            Route::put('/',                 'update');
            Route::delete('/',                 'destroy');
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

        // Testimonials
        Route::prefix('testimonials')->controller(AdminTestimonialController::class)->group(function () {
            Route::get('/',                  'index');
            Route::patch('/{testimonial}/status', 'updateStatus');
            Route::delete('/all',            'destroyAll');
            Route::delete('/selected',       'destroySelected');
            Route::delete('/{testimonial}',  'destroy');
        });
    });

    /*
    |----------------------------------------------------------------------
    | User Routes
    |----------------------------------------------------------------------
    */

    Route::prefix('user')->middleware('role:user')->group(function () {

        // Testimonials
        Route::controller(UserTestimonialController::class)->prefix('testimonials')->group(function (){
            Route::post('/', 'store');
            Route::get('/mine', 'mine');
        });

        // Stats
        Route::get('stats',[UserStatsController::class,'index']);

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

        // Profile
        Route::controller(UserProfileController::class)->prefix('profile')->group(function () {
            Route::get('/',                 'show');
            Route::put('/',                 'update');
            Route::delete('/',                 'destroy');
            Route::put('/change-password',  'changePassword');
            Route::patch('/change-avatar',  'changeAvatar');
            Route::delete('/delete-avatar', 'deleteAvatar');
        });

    });
});
