<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    // ─── Shared eager-load ────────────────────────────────────────────────────

    private function baseQuery()
    {
        return Order::with([
            'user:id,fullname,email,phone',
            'orderPlates.plate',
        ]);
    }

    // ─── List all orders ──────────────────────────────────────────────────────

    /**
     * GET /admin/orders
     *
     * Optional query params:
     *   ?status=pending|confirmed|preparing|out_for_delivery|delivered|cancelled
     *   ?payment_status=pending|paid|failed
     *   ?payment_method=cod|stripe
     */
    public function index(Request $request): JsonResponse
    {
        $query = $this->baseQuery();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }

        $orders = $query->latest()->get();

        return response()->json([
            'success' => true,
            'message' => 'Orders fetched successfully.',
            'data'    => $orders,
        ]);
    }

    // ─── Show single order ────────────────────────────────────────────────────

    /**
     * GET /admin/orders/{id}
     */
    public function show(Order $order): JsonResponse
    {
        $order->load([
            'user:id,fullname,email,phone',
            'orderPlates.plate',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Order fetched successfully.',
            'data'    => $order,
        ]);
    }

    // ─── Update order status ──────────────────────────────────────────────────

    /**
     * PATCH /admin/orders/{id}/status
     *
     * Body: { "status": "confirmed" }
     */
    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:pending,confirmed,preparing,out_for_delivery,delivered,cancelled'],
        ]);

        $order->update(['status' => $validated['status']]);

        return response()->json([
            'success' => true,
            'message' => 'Order status updated successfully.',
            'data'    => $order->fresh(['user:id,fullname,email,phone', 'orderPlates.plate']),
        ]);
    }

    // ─── Update payment status ────────────────────────────────────────────────

    /**
     * PATCH /admin/orders/{id}/payment-status
     *
     * Body: { "payment_status": "paid" }
     */
    public function updatePaymentStatus(Request $request, Order $order): JsonResponse
    {
        $validated = $request->validate([
            'payment_status' => ['required', 'in:pending,paid,failed'],
        ]);

        $order->update(['payment_status' => $validated['payment_status']]);

        return response()->json([
            'success' => true,
            'message' => 'Payment status updated successfully.',
            'data'    => $order->fresh(['user:id,fullname,email,phone', 'orderPlates.plate']),
        ]);
    }

}
