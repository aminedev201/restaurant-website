<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Chef;
use App\Models\ContactMessage;
use App\Models\Order;
use App\Models\Plate;
use App\Models\Reservation;
use App\Models\Testimonial;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class StatsController extends Controller
{
    public function index(): JsonResponse
    {
        // ── Counts ────────────────────────────────────────────────────────────
        $totalUsers        = User::where('role', 'user')->count();
        $totalOrders       = Order::count();
        $totalRevenue      = Order::where('payment_status', 'paid')->sum('final_total');
        $totalPlates       = Plate::count();
        $totalCategories   = Category::count();
        $totalChefs        = Chef::count();
        $totalReservations = Reservation::count();
        $unreadMessages    = ContactMessage::where('status', 'unread')->count();
        $pendingTestimonials = Testimonial::where('status', false)->count();

        // ── Orders by status ──────────────────────────────────────────────────
        $ordersByStatus = Order::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        // ── Orders by payment status ──────────────────────────────────────────
        $ordersByPaymentStatus = Order::select('payment_status', DB::raw('count(*) as count'))
            ->groupBy('payment_status')
            ->pluck('count', 'payment_status');

        // ── Revenue last 7 days ───────────────────────────────────────────────
        $revenueLast7Days = Order::where('payment_status', 'paid')
            ->where('created_at', '>=', now()->subDays(6)->startOfDay())
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(final_total) as revenue'),
                DB::raw('COUNT(*) as orders')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn($row) => [
                'date'    => $row->date,
                'revenue' => round((float) $row->revenue, 2),
                'orders'  => (int) $row->orders,
            ]);

        // ── Revenue last 30 days (monthly view) ───────────────────────────────
        $revenueLast30Days = Order::where('payment_status', 'paid')
            ->where('created_at', '>=', now()->subDays(29)->startOfDay())
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(final_total) as revenue'),
                DB::raw('COUNT(*) as orders')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn($row) => [
                'date'    => $row->date,
                'revenue' => round((float) $row->revenue, 2),
                'orders'  => (int) $row->orders,
            ]);

        // ── New users last 7 days ─────────────────────────────────────────────
        $newUsersLast7Days = User::where('role', 'user')
            ->where('created_at', '>=', now()->subDays(6)->startOfDay())
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn($row) => [
                'date'  => $row->date,
                'count' => (int) $row->count,
            ]);

        // ── Reservations by status ────────────────────────────────────────────
        $reservationsByStatus = Reservation::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        // ── Top selling plates ────────────────────────────────────────────────
        $topPlates = DB::table('order_plates')
            ->select(
                'plate_name',
                DB::raw('SUM(quantity) as total_quantity'),
                DB::raw('SUM(total) as total_revenue')
            )
            ->groupBy('plate_name')
            ->orderByDesc('total_quantity')
            ->limit(5)
            ->get()
            ->map(fn($row) => [
                'name'          => $row->plate_name,
                'total_quantity'  => (int) $row->total_quantity,
                'total_revenue' => round((float) $row->total_revenue, 2),
            ]);

        // ── Top categories by plate count ─────────────────────────────────────
        $topCategories = Category::withCount('plates')
            ->orderByDesc('plates_count')
            ->limit(5)
            ->get(['id', 'name', 'plates_count']);

        // ── Recent orders ─────────────────────────────────────────────────────
        $recentOrders = Order::with('user:id,fullname,email')
            ->latest()
            ->limit(5)
            ->get([
                'id', 'user_id', 'order_number',
                'status', 'payment_status', 'final_total', 'created_at',
            ])
            ->map(fn($o) => [
                'id'             => $o->id,
                'order_number'   => $o->order_number,
                'status'         => $o->status,
                'payment_status' => $o->payment_status,
                'final_total'    => round((float) $o->final_total, 2),
                'created_at'     => $o->created_at,
                'user'           => $o->user ? [
                    'fullname' => $o->user->fullname,
                    'email'    => $o->user->email,
                ] : null,
            ]);

        // ── Recent reservations ───────────────────────────────────────────────
        $recentReservations = Reservation::with('user:id,fullname,email')
            ->latest()
            ->limit(5)
            ->get(['id', 'user_id', 'date', 'time', 'guests', 'status', 'created_at'])
            ->map(fn($r) => [
                'id'         => $r->id,
                'date'       => $r->date?->toDateString(),
                'time'       => $r->time,
                'guests'     => $r->guests,
                'status'     => $r->status,
                'created_at' => $r->created_at,
                'user'       => $r->user ? [
                    'fullname' => $r->user->fullname,
                    'email'    => $r->user->email,
                ] : null,
            ]);

        // ── Plates by status (active/inactive) ────────────────────────────────
        $platesByStatus = [
            'active'   => Plate::where('status', true)->count(),
            'inactive' => Plate::where('status', false)->count(),
        ];

        // ── Payment methods breakdown ─────────────────────────────────────────
        $paymentMethods = Order::select('payment_method', DB::raw('count(*) as count'))
            ->groupBy('payment_method')
            ->pluck('count', 'payment_method');

        return response()->json([
            'success' => true,
            'data'    => [
                // Summary cards
                'total_users'          => $totalUsers,
                'total_orders'         => $totalOrders,
                'total_revenue'        => round((float) $totalRevenue, 2),
                'total_plates'         => $totalPlates,
                'total_categories'     => $totalCategories,
                'total_chefs'          => $totalChefs,
                'total_reservations'   => $totalReservations,
                'unread_messages'      => $unreadMessages,
                'pending_testimonials' => $pendingTestimonials,

                // Charts & breakdowns
                'orders_by_status'          => $ordersByStatus,
                'orders_by_payment_status'  => $ordersByPaymentStatus,
                'revenue_last_7_days'       => $revenueLast7Days,
                'revenue_last_30_days'      => $revenueLast30Days,
                'new_users_last_7_days'     => $newUsersLast7Days,
                'reservations_by_status'    => $reservationsByStatus,
                'plates_by_status'          => $platesByStatus,
                'payment_methods'           => $paymentMethods,

                // Tables
                'top_plates'           => $topPlates,
                'top_categories'       => $topCategories,
                'recent_orders'        => $recentOrders,
                'recent_reservations'  => $recentReservations,
            ],
        ]);
    }
}