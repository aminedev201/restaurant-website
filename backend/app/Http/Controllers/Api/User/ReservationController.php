<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreReservationRequest;
use App\Models\Reservation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    /**
     * GET /guest/reservations
     * Authenticated user's own reservations.
     */
    public function index(Request $request): JsonResponse
    {
        $reservations = Reservation::where('user_id', $request->user()->id)
            ->orderByDesc('date')
            ->orderByDesc('time')
            ->get();

        return response()->json([
            'status' => true,
            'data'   => $reservations,
        ]);
    }

    /**
     * POST /guest/reservations
     */
    public function store(StoreReservationRequest $request): JsonResponse
    {
        $reservation = Reservation::create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
            'status'  => 'pending',
        ]);

        return response()->json([
            'status'  => true,
            'message' => 'Reservation submitted successfully. We will confirm shortly.',
            'data'    => $reservation,
        ], 201);
    }

    /**
     * DELETE /guest/reservations/{reservation}
     * User can only cancel their own pending reservations.
     */
    public function destroy(Request $request, Reservation $reservation): JsonResponse
    {
        if ($reservation->user_id !== $request->user()->id) {
            return response()->json(['status' => false, 'message' => 'Unauthorized.'], 403);
        }

        if ($reservation->status === 'confirmed') {
            return response()->json([
                'status'  => false,
                'message' => 'Confirmed reservations cannot be cancelled. Please contact us.',
            ], 422);
        }

        $reservation->update(['status' => 'canceled']);

        return response()->json([
            'status'  => true,
            'message' => 'Reservation cancelled successfully.',
        ]);
    }
}
