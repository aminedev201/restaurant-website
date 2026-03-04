<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateReservationRequest;
use App\Models\Reservation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ReservationController extends Controller
{
    /**
     * GET /admin/reservations
     */
    public function index(): JsonResponse
    {
        $reservations = Reservation::with('user:id,fullname,email,phone')
            ->orderByDesc('date')
            ->orderByDesc('time')
            ->get();

        return response()->json([
            'status' => true,
            'message' => 'Reservations fetched successfully.',
            'data'   => $reservations,
        ]);
    }

    /**
     * GET /admin/reservations/{reservation}
     */
    public function show(Reservation $reservation): JsonResponse
    {
        return response()->json([
            'status' => true,
            'message' => 'Reservation fetched successfully.',
            'data'   => $reservation->load('user:id,fullname,email'),
        ]);
    }

    /**
     * PATCH /admin/reservations/{reservation}
     * Admin can update status, date, time, guests, special_requests.
     */
    public function update(UpdateReservationRequest $request, Reservation $reservation): JsonResponse
    {
        $reservation->update($request->validated());

        return response()->json([
            'status'  => true,
            'message' => 'Reservation updated successfully.',
            'data'    => $reservation->fresh()->load('user:id,fullname,email'),
        ]);
    }

    /**
     * DELETE /admin/reservations/{reservation}
     */
    public function destroy(Reservation $reservation): JsonResponse
    {
        $reservation->delete();

        return response()->json([
            'status'  => true,
            'message' => 'Reservation deleted successfully.',
        ]);
    }

    /**
     * DELETE /admin/reservations/destroy-selected
     */
    public function destroySelected(Request $request): JsonResponse
    {
        $request->validate([
            'ids'   => ['required', 'array', 'min:1'],
            'ids.*' => ['required', 'integer', 'exists:reservations,id'],
        ]);

        $count = Reservation::whereIn('id', $request->input('ids'))->count();
        Reservation::whereIn('id', $request->input('ids'))->delete();

        return response()->json([
            'status'        => true,
            'message'       => $count . ' reservation(s) deleted successfully.',
            'deleted_count' => $count,
        ]);
    }
}
