<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Plate;
use Illuminate\Http\JsonResponse;

class MenuController extends Controller
{
    /**
     * Return all active categories with their active plates.
     * Search & filtering is handled on the frontend.
     */
    public function getMenu(): JsonResponse
    {
        $categories = Category::where('status', true)
            ->with([
                'plates' => fn ($q) => $q->where('status', true)->orderBy('name'),
            ])
            ->orderBy('name')
            ->get();

        return response()->json([
            'status'  => true,
            'message' => 'Menu retrieved successfully.',
            'data'    => $categories,
        ]);
    }

    /**
     * Return a single plate's full details.
     */
    public function getPlateDetails(int $id): JsonResponse
    {
        $plate = Plate::where('status', true)
            ->with('category')
            ->find($id);

        if(!$plate) {
            return response()->json([
                'status'  => true,
                'message' => 'Plate not found.',
            ],404);
        }

        return response()->json([
            'status'  => true,
            'message' => 'Plate retrieved successfully.',
            'data'    => $plate,
        ]);
    }
}
