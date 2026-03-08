<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Reservation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StatsController extends Controller
{
    /**
     * GET /user/stats
     * Returns dashboard stats for the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        // ── Reservations ──────────────────────────────────────────────────────
        $totalReservations = Reservation::where('user_id', $userId)->count();

        $upcomingReservation = Reservation::where('user_id', $userId)
            ->whereIn('status', ['pending', 'confirmed'])
            ->where('date', '>=', now()->toDateString())
            ->orderBy('date')
            ->orderBy('time')
            ->first(['date', 'time', 'guests', 'status']);

        $recentReservations = Reservation::where('user_id', $userId)
            ->orderByDesc('date')
            ->orderByDesc('time')
            ->limit(3)
            ->get(['id', 'date', 'time', 'guests', 'status', 'special_requests']);

        // ── Orders ────────────────────────────────────────────────────────────
        $activeOrders = Order::where('user_id', $userId)
            ->whereIn('status', ['pending', 'confirmed', 'preparing', 'out_for_delivery'])
            ->count();

        $totalOrders = Order::where('user_id', $userId)->count();

        $totalSpent = Order::where('user_id', $userId)
            ->where('payment_status', 'paid')
            ->sum('final_total');

        return response()->json([
            'status'  => true,
            'message' => 'Stats retrieved successfully.',
            'data'    => [
                'reservations' => [
                    'total'    => $totalReservations,
                    'upcoming' => $upcomingReservation,
                    'recent'   => $recentReservations,
                ],
                'orders' => [
                    'active' => $activeOrders,
                    'total'  => $totalOrders,
                    'spent'  => round($totalSpent, 2),
                ],
            ],
        ]);
    }
}