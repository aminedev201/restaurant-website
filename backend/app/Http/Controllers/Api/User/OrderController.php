<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Plate;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Stripe\Stripe;
use Stripe\PaymentIntent;

class OrderController extends Controller
{
    // ─── Create Stripe Payment Intent ────────────────────────────────────────

    /**
     * POST /user/orders/payment-intent
     * Creates a Stripe PaymentIntent and returns the client_secret.
     * Body: { amount: number } (in MAD, we convert to centimes)
     */
    public function createPaymentIntent(Request $request): JsonResponse
    {
        $request->validate(['amount' => 'required|numeric|min:1']);

        Stripe::setApiKey(config('services.stripe.secret'));

        $intent = PaymentIntent::create([
            'amount'   => (int) round($request->amount * 100), // convert to smallest currency unit
            'currency' => 'mad',
            'automatic_payment_methods' => ['enabled' => true],
        ]);

        return response()->json([
            'status'        => true,
            'message'       => 'Payment intent created.',
            'data'          => ['client_secret' => $intent->client_secret],
        ]);
    }

    // ─── Place Order ─────────────────────────────────────────────────────────

    /**
     * POST /user/orders
     * Body: {
     *   delivery_address: string,
     *   payment_method: 'stripe'|'cod',
     *   stripe_payment_intent_id?: string,
     *   items: [{ plate_id, quantity }]
     * }
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'delivery_address'          => 'required|string|max:500',
            'payment_method'            => 'required|in:stripe,cod',
            'stripe_payment_intent_id'  => 'nullable|string',
            'items'                     => 'required|array|min:1',
            'items.*.plate_id'          => 'required|integer|exists:plates,id',
            'items.*.quantity'          => 'required|integer|min:1',
        ]);

        $shipping = Setting::instance()->shipping;

        DB::beginTransaction();

        try {
            $orderTotal = 0;
            $orderPlates = [];

            foreach ($request->items as $item) {
                $plate = Plate::where('status', true)->with('category')->findOrFail($item['plate_id']);
                $lineTotal = $plate->price * $item['quantity'];
                $orderTotal += $lineTotal;

                $orderPlates[] = [
                    'plate_id'        => $plate->id,
                    'plate_name'      => $plate->name,
                    'category_name'   => $plate->category?->name,
                    'plate_price'     => $plate->price,
                    'plate_old_price' => $plate->old_price,
                    'discount'        => $plate->discount,
                    'quantity'        => $item['quantity'],
                    'total'           => $lineTotal,
                ];
            }

            $finalTotal     = $orderTotal + $shipping;
            $paymentStatus  = 'pending';

            // If Stripe and a payment intent id was provided, mark as paid
            if ($request->payment_method === 'stripe' && $request->stripe_payment_intent_id) {
                $paymentStatus = 'paid';
            }

            $order = Order::create([
                'user_id'                  => Auth::id(),
                'order_number'             => Order::generateOrderNumber(),
                'delivery_address'         => $request->delivery_address,
                'payment_method'           => $request->payment_method,
                'payment_status'           => $paymentStatus,
                'stripe_payment_intent_id' => $request->stripe_payment_intent_id,
                'status'                   => 'pending',
                'shipping'                 => $shipping,
                'final_total'              => $finalTotal,
            ]);

            $order->plates()->createMany($orderPlates);

            DB::commit();

            return response()->json([
                'status'  => true,
                'message' => 'Order placed successfully.',
                'data'    => $order->load('plates'),
            ], 201);

        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'status'  => false,
                'message' => 'Failed to place order. Please try again.',
                'data'    => null,
            ], 500);
        }
    }

    // ─── List Orders ─────────────────────────────────────────────────────────

    /**
     * GET /user/orders
     */
    public function index(): JsonResponse
    {
        $orders = Order::where('user_id', Auth::id())
            ->with('plates')
            ->latest()
            ->get();

        return response()->json([
            'status'  => true,
            'message' => 'Orders retrieved successfully.',
            'data'    => $orders,
        ]);
    }

    // ─── Show Single Order ────────────────────────────────────────────────────

    /**
     * GET /user/orders/{id}
     */
    public function show(int $id): JsonResponse
    {
        $order = Order::where('user_id', Auth::id())
            ->with('plates')
            ->find($id);

        if (! $order) {
            return response()->json([
                'status'  => false,
                'message' => 'Order not found.',
                'data'    => null,
            ], 404);
        }

        return response()->json([
            'status'  => true,
            'message' => 'Order retrieved successfully.',
            'data'    => $order,
        ]);
    }
}
