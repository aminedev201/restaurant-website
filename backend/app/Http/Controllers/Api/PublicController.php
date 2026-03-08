<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ContactMessageRequest;
use App\Models\Category;
use App\Models\Chef;
use App\Models\Company;
use App\Models\ContactMessage;
use App\Models\Plate;
use App\Models\Setting;
use App\Models\Testimonial;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class PublicController extends Controller
{
        /**
     * GET /public/testimonials
     * Returns the 9 most recent approved testimonials.
     */
    public function testimonials(): JsonResponse
    {
        $testimonials = Testimonial::where('status', true)
            ->with('user:id,fullname,avatar_path')
            ->latest()
            ->take(9)
            ->get()
            ->map(fn ($t) => [
                'id'         => $t->id,
                'rating'     => $t->rating,
                'comment'    => $t->comment,
                'created_at' => $t->created_at,
                'user' => [
                    'id'         => $t->user->id,
                    'fullname'   => $t->user->fullname,
                    'avatar_url' => $t->user->avatar_path ? config('app.url') . Storage::url($t->user->avatar_path) : null,
                ],
            ]);

        return response()->json([
            'status'  => true,
            'message' => 'Testimonials retrieved successfully.',
            'data'    => $testimonials,
        ]);
    }
    /**
     * GET /public/chefs
     */
    public function chefs(): JsonResponse
    {
        $chefs = Chef::where('status', true)
            ->latest()
            ->get()
            ->map(fn ($chef) => [
                'id'           => $chef->id,
                'fullname'     => $chef->fullname,
                'position'     => $chef->position,
                'image_url'    => $chef->image_url,
                'short_desc'   => $chef->short_desc,
                'social_media' => $chef->social_media,
            ]);

        return response()->json([
            'status'  => true,
            'message' => 'Chefs retrieved successfully.',
            'data'    => $chefs,
        ]);
    }

    /**
     * GET /public/company
     */
    public function getCompanyInfo(): JsonResponse
    {
        $company = Company::first();

        return response()->json([
            'status'  => true,
            'message' => 'Company info retrieved successfully.',
            'data'    => $company,
        ]);
    }

    /**
     * POST /public/contact
     */
    public function storeContactMessage(ContactMessageRequest $request): JsonResponse
    {
        $message = ContactMessage::create($request->validated());

        return response()->json([
            'status'  => true,
            'message' => 'Your message has been sent successfully.',
            'data'    => $message,
        ], 201);
    }

    /**
     * GET /public/settings
     */
    public function showSettings(): JsonResponse
    {
        return response()->json([
            'status'  => true,
            'message' => 'Settings retrieved successfully.',
            'data'    => Setting::instance(),
        ]);
    }

    /**
     * GET /public/menu
     * All active categories with their active plates.
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
     * GET /public/menu/{id}
     * Single active plate with its category.
     */
    public function getPlateDetails(int $id): JsonResponse
    {
        $plate = Plate::where('status', true)
            ->with('category')
            ->find($id);

        if (!$plate) {
            return response()->json([
                'status'  => false,
                'message' => 'Plate not found.',
            ], 404);
        }

        return response()->json([
            'status'  => true,
            'message' => 'Plate retrieved successfully.',
            'data'    => $plate,
        ]);
    }

    /**
     * GET /public/categories
     * All active categories (no plates — lightweight for nav/home).
     */
    public function getCategories(): JsonResponse
    {
        $categories = Category::where('status', true)
            ->orderBy('name')
            ->get();

        return response()->json([
            'status'  => true,
            'message' => 'Categories retrieved successfully.',
            'data'    => $categories,
        ]);
    }

    /**
     * GET /public/plates/latest
     * 6 most recently added active plates with their category.
     */
    public function getLatestPlates(): JsonResponse
    {
        $plates = Plate::where('status', true)
            ->with('category')
            ->latest()
            ->take(6)
            ->get();

        return response()->json([
            'status'  => true,
            'message' => 'Latest plates retrieved successfully.',
            'data'    => $plates,
        ]);
    }
}