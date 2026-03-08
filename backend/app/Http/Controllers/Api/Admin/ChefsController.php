<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreChefRequest;
use App\Http\Requests\Admin\UpdateChefRequest;
use App\Models\Chef;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ChefsController extends Controller
{
    // ─── List all chefs ───────────────────────────────────────────────────────

    /**
     * GET /admin/chefs
     */
    public function index(): JsonResponse
    {
        $chefs = Chef::latest()->get();

        return response()->json([
            'status'  => true,
            'message' => 'Chefs retrieved successfully.',
            'data'    => $chefs,
        ]);
    }

    // ─── Show single chef ─────────────────────────────────────────────────────

    /**
     * GET /admin/chefs/{chef}
     */
    public function show(Chef $chef): JsonResponse
    {
        return response()->json([
            'status'  => true,
            'message' => 'Chef retrieved successfully.',
            'data'    => $chef,
        ]);
    }

    // ─── Create chef ──────────────────────────────────────────────────────────

    /**
     * POST /admin/chefs
     */
    public function store(StoreChefRequest $request): JsonResponse
    {
        $data = $request->validated();

        // Store image
        $data['image_path'] = $this->storeImage($request);

        // Normalize social_media — keep only non-empty values
        $data['social_media'] = $this->normalizeSocialMedia($data['social_media'] ?? null);

        $data['status'] = $request->boolean('status', true);

        $chef = Chef::create($data);

        return response()->json([
            'status'  => true,
            'message' => 'Chef created successfully.',
            'data'    => $chef,
        ], 201);
    }

    // ─── Update chef ──────────────────────────────────────────────────────────

    /**
     * POST /admin/chefs/{chef}   (_method=PUT)
     */
    public function update(UpdateChefRequest $request, Chef $chef): JsonResponse
    {
        $data = $request->validated();

        // Replace image only if a new one was uploaded
        if ($request->hasFile('image')) {
            Storage::disk('public')->delete($chef->image_path);
            $data['image_path'] = $this->storeImage($request);
        }

        $data['social_media'] = $this->normalizeSocialMedia($data['social_media'] ?? null);
        $data['status']       = $request->boolean('status', $chef->status);

        $chef->update($data);

        return response()->json([
            'status'  => true,
            'message' => 'Chef updated successfully.',
            'data'    => $chef->fresh(),
        ]);
    }

    // ─── Delete chef ──────────────────────────────────────────────────────────

    /**
     * DELETE /admin/chefs/{chef}
     */
    public function destroy(Chef $chef): JsonResponse
    {
        Storage::disk('public')->delete($chef->image_path);
        $chef->delete();

        return response()->json([
            'status'  => true,
            'message' => 'Chef deleted successfully.',
            'data'    => null,
        ]);
    }

    // ─── Delete selected ──────────────────────────────────────────────────────

    /**
     * DELETE /admin/chefs/selected
     * Body: { ids: number[] }
     */
    public function destroySelected(\Illuminate\Http\Request $request): JsonResponse
    {
        $request->validate(['ids' => 'required|array', 'ids.*' => 'integer|exists:chefs,id']);

        $chefs = Chef::whereIn('id', $request->ids)->get();

        foreach ($chefs as $chef) {
            Storage::disk('public')->delete($chef->image_path);
            $chef->delete();
        }

        return response()->json([
            'status'  => true,
            'message' => count($request->ids) . ' chefs deleted.',
            'data'    => ['deleted_count' => count($request->ids)],
        ]);
    }

    // ─── Delete all ───────────────────────────────────────────────────────────

    /**
     * DELETE /admin/chefs/all
     */
    public function destroyAll(): JsonResponse
    {
        $chefs = Chef::all();

        foreach ($chefs as $chef) {
            Storage::disk('public')->delete($chef->image_path);
        }

        Chef::truncate();

        return response()->json([
            'status'  => true,
            'message' => 'All chefs deleted.',
            'data'    => null,
        ]);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private function storeImage(\Illuminate\Http\Request $request): string
    {
        $file     = $request->file('image');
        $filename = Str::uuid() . '_' . time() . '.' . $file->getClientOriginalExtension();
        return $file->storeAs('chefs', $filename, 'public');
    }

    private function normalizeSocialMedia(?array $social): ?array
    {
        if (!$social) return null;
        $filtered = array_filter($social, fn($v) => !empty(trim((string) $v)));
        return empty($filtered) ? null : $filtered;
    }
}