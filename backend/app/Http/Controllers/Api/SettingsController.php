<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    /**
     * GET /public/settings
     * Returns current settings (public — used for shipping display on cart page).
     */
    public function show(): JsonResponse
    {
        return response()->json([
            'status'  => true,
            'message' => 'Settings retrieved successfully.',
            'data'    => Setting::instance(),
        ]);
    }
}
