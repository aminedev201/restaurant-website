<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PlateRequest;
use App\Models\Plate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PlateController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $plates = Plate::with('category')->latest()->get();

        return response()->json([
            'success' => true,
            'message' => 'Plates fetched successfully.',
            'data'    => $plates,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(PlateRequest $request): JsonResponse
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image_path'] = upload_with_random_name(
                $request->file('image'),
                'plates'
            );
        }

        unset($data['image']);

        $plate = Plate::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Plate created successfully.',
            'data'    => $plate->load('category'),
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(?Plate $plate = null): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Plate fetched successfully.',
            'data'    => $plate->load('category'),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(PlateRequest $request, Plate $plate): JsonResponse
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            if ($plate->image_path && Storage::disk('public')->exists($plate->image_path)) {
                Storage::disk('public')->delete($plate->image_path);
            }

            $data['image_path'] = upload_with_random_name(
                $request->file('image'),
                'plates'
            );
        }

        unset($data['image']);

        $plate->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Plate updated successfully.',
            'data'    => $plate->fresh()->load('category'),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Plate $plate): JsonResponse
    {
        if ($plate->image_path && Storage::disk('public')->exists($plate->image_path)) {
            Storage::disk('public')->delete($plate->image_path);
        }

        $plate->delete();

        return response()->json([
            'success' => true,
            'message' => 'Plate deleted successfully.',
        ]);
    }

    /**
     * Delete all plates.
     */
    public function destroyAll(): JsonResponse
    {
        $plates = Plate::all();

        foreach ($plates as $plate) {
            if ($plate->image_path && Storage::disk('public')->exists($plate->image_path)) {
                Storage::disk('public')->delete($plate->image_path);
            }
            $plate->delete();
        }


        return response()->json([
            'success' => true,
            'message' => 'All plates deleted successfully.',
        ]);
    }

    /**
     * Delete selected plates by IDs.
     */
    public function destroySelected(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids'   => ['required', 'array', 'min:1'],
            'ids.*' => ['required', 'integer', 'exists:plates,id'],
        ]);

        $plates = Plate::whereIn('id', $validated['ids'])->get();

        if ($plates->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No plates found for the given IDs.',
            ], 404);
        }

        foreach ($plates as $plate) {
            if ($plate->image_path && Storage::disk('public')->exists($plate->image_path)) {
                Storage::disk('public')->delete($plate->image_path);
            }
            $plate->delete();
        }

        return response()->json([
            'success' => true,
            'message' => $plates->count() . ' plate(s) deleted successfully.',
            'deleted_count' => $plates->count(),
        ]);
    }
}
