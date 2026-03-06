<?php

namespace App\Http\Controllers\Api\Admin;

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

    /**
     * POST /admin/settings
     * Creates or updates the single settings row.
     * Body: { shipping: number }
     */
    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'shipping' => 'required|numeric|min:0',
        ]);

        $settings = Setting::instance();
        $settings->update(['shipping' => $request->shipping]);

        return response()->json([
            'status'  => true,
            'message' => 'Settings updated successfully.',
            'data'    => $settings,
        ]);
    }
}
