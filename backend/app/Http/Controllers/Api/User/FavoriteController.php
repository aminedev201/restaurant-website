<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\Plate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FavoriteController extends Controller
{
    /**
     * GET /user/favorites
     */
    public function index(): JsonResponse
    {
        $favorites = Auth::user()
            ->favoritePlates()
            ->with('category')
            ->where('status', true)
            ->get();

        return response()->json([
            'status'  => true,
            'message' => 'Favorites retrieved successfully.',
            'data'    => $favorites,
        ]);
    }

    /**
     * POST /user/favorites/toggle
     * Body: { plate_id: number }
     */
    public function toggle(Request $request): JsonResponse
    {
        $request->validate(['plate_id' => 'required|integer']);

        $plate = Plate::where('status', true)->find($request->plate_id);

        if (! $plate) {
            return response()->json([
                'status'  => false,
                'message' => 'Plate not found.',
                'data'    => null,
            ], 404);
        }

        $result     = Auth::user()->favoritePlates()->toggle($plate->id);
        $isFavorite = count($result['attached']) > 0;

        return response()->json([
            'status'  => true,
            'message' => $isFavorite ? 'Plate added to favorites.' : 'Plate removed from favorites.',
            'data'    => [
                'plate_id'    => $plate->id,
                'is_favorite' => $isFavorite,
            ],
        ]);
    }
}
