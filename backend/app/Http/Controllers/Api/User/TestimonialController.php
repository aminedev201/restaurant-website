<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\TestimonialRequest;
use App\Models\Testimonial;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class TestimonialController extends Controller
{
    public function mine(): JsonResponse
    {
        $exists = Testimonial::where('user_id', Auth::id())->exists();

        return response()->json([
            'status' => true,
            'data'   => ['exists' => $exists],
        ]);
    }
    /**
     * POST /user/testimonials
     * Authenticated user submits a testimonial (pending approval).
     */
    public function store(TestimonialRequest $request): JsonResponse
    {
        $user = Auth::user();

        // One testimonial per user
        $existing = Testimonial::where('user_id', $user->id)->first();
        if ($existing) {
            return response()->json([
                'status'  => false,
                'message' => 'You have already submitted a testimonial.',
            ], 422);
        }

        $testimonial = Testimonial::create([
            'user_id' => $user->id,
            'rating'  => $request->rating,
            'comment' => $request->comment,
            'status'  => false, // pending admin approval
        ]);

        return response()->json([
            'status'  => true,
            'message' => 'Thank you! Your review has been submitted and is pending approval.',
            'data'    => $testimonial,
        ], 201);
    }
}