<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Testimonial;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TestimonialController extends Controller
{
    /**
     * GET /admin/testimonials
     */
    public function index(): JsonResponse
    {
        $testimonials = Testimonial::with('user:id,fullname,email')
            ->latest()
            ->get()
            ->map(fn ($t) => [
                'id'         => $t->id,
                'rating'     => $t->rating,
                'comment'    => $t->comment,
                'status'     => $t->status,
                'created_at' => $t->created_at,
                'user' => [
                    'id'         => $t->user->id,
                    'fullname'   => $t->user->fullname,
                    'email'      => $t->user->email,
                    'avatar_url' => $t->user->avatar_url,
                ],
            ]);

        return response()->json([
            'status'  => true,
            'message' => 'Testimonials retrieved successfully.',
            'data'    => $testimonials,
        ]);
    }

    /**
     * PATCH /admin/testimonials/{id}/status
     * Toggle approved / pending.
     */
    public function updateStatus(Request $request, Testimonial $testimonial): JsonResponse
    {
        $request->validate([
            'status' => ['required', 'boolean'],
        ]);

        $testimonial->update(['status' => $request->status]);

        return response()->json([
            'status'  => true,
            'message' => 'Testimonial status updated.',
            'data'    => $testimonial->fresh()->load('user:id,fullname,avatar_path,email'),
        ]);
    }

    /**
     * DELETE /admin/testimonials/{id}
     */
    public function destroy(Testimonial $testimonial): JsonResponse
    {
        $testimonial->delete();

        return response()->json([
            'status'  => true,
            'message' => 'Testimonial deleted successfully.',
        ]);
    }

    /**
     * DELETE /admin/testimonials/all
     */
    public function destroyAll(): JsonResponse
    {
        Testimonial::truncate();

        return response()->json([
            'status'  => true,
            'message' => 'All testimonials deleted.',
        ]);
    }

    /**
     * DELETE /admin/testimonials/selected
     */
    public function destroySelected(Request $request): JsonResponse
    {
        $request->validate([
            'ids'   => ['required', 'array', 'min:1'],
            'ids.*' => ['required', 'integer', 'exists:testimonials,id'],
        ]);

        $count = Testimonial::whereIn('id', $request->ids)->delete();

        return response()->json([
            'status'        => true,
            'message'       => "{$count} testimonial(s) deleted.",
            'deleted_count' => $count,
        ]);
    }
}