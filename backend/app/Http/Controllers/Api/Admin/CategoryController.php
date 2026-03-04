<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CategoryRequest;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $categories = Category::latest()->get();

        return response()->json([
            'success' => true,
            'message' => 'Categories fetched successfully.',
            'data'    => $categories,
        ],200);
    }
    public function getActiveCats(): JsonResponse
    {
        $activeCats  = Category::where('status',true)->get();

        return response()->json([
            'success' => true,
            'message' => 'Active categories fetched successfully.',
            'data'    => $activeCats,
        ],200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CategoryRequest $request): JsonResponse
    {
        $data = $request->validated();

        // Handle image upload
        if ($request->hasFile('image')) {
            $data['image_path'] = upload_with_random_name(
                $request->file('image'),
                'categories'
            );
        }

        unset($data['image']);

        $category = Category::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Category created successfully.',
            'data'    => $category,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(?Category $category = null): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Category fetched successfully.',
            'data'    => $category,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(CategoryRequest $request, Category $category): JsonResponse
    {
        $data = $request->validated();

        // Handle image upload
        if ($request->hasFile('image')) {
            if ($category->image_path && Storage::disk('public')->exists($category->image_path)) {
                Storage::disk('public')->delete($category->image_path);
            }

            $data['image_path'] = upload_with_random_name(
                $request->file('image'),
                'categories'
            );
        }

        unset($data['image']);

        $category->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Category updated successfully.',
            'data'    => $category->fresh(),
        ]);
    }
    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category): JsonResponse
    {
        // Delete image from storage
        if ($category->image_path && Storage::disk('public')->exists($category->image_path)) {
            Storage::disk('public')->delete($category->image_path);
        }

        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Category deleted successfully.',
        ]);
    }

    /**
     * Delete all categories.
     */
    public function destroyAll(): JsonResponse
    {
        $categories = Category::all();

        foreach ($categories as $category) {
            if ($category->image_path && Storage::disk('public')->exists($category->image_path)) {
                Storage::disk('public')->delete($category->image_path);
            }
            $category->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'All categories deleted successfully.',
        ]);
    }

    /**
     * Delete selected categories by IDs.
     */
    public function destroySelected(Request $request): JsonResponse
    {
        $request->validate([
            'ids'   => ['required', 'array', 'min:1'],
            'ids.*' => ['required', 'integer', 'exists:categories,id'],
        ]);

        $categories = Category::whereIn('id', $request->input('ids'))->get();

        if ($categories->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No categories found for the given IDs.',
            ], 404);
        }

        foreach ($categories as $category) {
            if ($category->image_path && Storage::disk('public')->exists($category->image_path)) {
                Storage::disk('public')->delete($category->image_path);
            }
            $category->delete();
        }

        return response()->json([
            'success' => true,
            'message' => count($categories) . ' category(ies) deleted successfully.',
            'deleted_count' => $categories->count(),
        ]);
    }
}
