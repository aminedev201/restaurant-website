'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShoppingCart, Minus, Plus, Trash2, MapPin,
  CreditCard, Truck, ArrowLeft, CheckCircle2,
  AlertCircle, Loader2, UtensilsCrossed, ShieldCheck,
  X, Tag, Percent,
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { orderApi, Order, PaymentMethod } from '@/lib/userServiceApi';
import { settingsApi } from '@/lib/publicService.Api';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const ORDER_STORAGE_KEY = 'restaurant_last_order';

function saveLastOrder(order: Order) {
  try { localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(order)); } catch {}
}

// ─── Skeleton body (hero is always shown above, this is the content below) ────
function CartSkeletonBody() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 animate-pulse">
      <div className="h-4 w-28 bg-gray-200 dark:bg-gray-800 rounded mb-6" />
      <div className="h-8 w-40 bg-gray-200 dark:bg-gray-800 rounded mb-8" />

        <div className="grid lg:grid-cols-5 gap-8 items-start">
          {/* Left column */}
          <div className="lg:col-span-3 space-y-5">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-start gap-4 px-5 py-4 border-b border-gray-50 dark:border-gray-800/60 last:border-0">
                  <div className="w-16 h-16 rounded-xl bg-gray-200 dark:bg-gray-700 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-gray-700" />
                      <div className="w-6 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                      <div className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-gray-700" />
                    </div>
                    <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4">
              <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-20 w-full bg-gray-200 dark:bg-gray-700 rounded-xl" />
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4">
              <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-20 rounded-xl bg-gray-200 dark:bg-gray-700" />
                <div className="h-20 rounded-xl bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4">
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 shrink-0" />
                  <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="w-16 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              ))}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2.5">
                <div className="flex justify-between">
                  <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div className="flex justify-between">
                  <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-3 w-10 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                  <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
              <div className="h-12 w-full rounded-xl bg-gray-200 dark:bg-gray-700 mt-5" />
            </div>
          </div>
        </div>
      </div>
  );
}

// ─── Stripe payment form ──────────────────────────────────────────────────────
function StripeForm({
  onSuccess, onError, loading, setLoading,
}: {
  onSuccess: (intentId: string) => void;
  onError: (msg: string) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
}) {
  const stripe   = useStripe();
  const elements = useElements();

  const handleSubmit = async () => {
    if (!stripe || !elements) return;
    setLoading(true);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: 'if_required',
    });
    if (error) {
      onError(error.message ?? 'Payment failed.');
      setLoading(false);
    } else if (paymentIntent?.status === 'succeeded') {
      onSuccess(paymentIntent.id);
    } else {
      onError('Payment was not completed.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <PaymentElement />
      <button
        onClick={handleSubmit}
        disabled={loading || !stripe || !elements}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
        {loading ? 'Processing payment…' : 'Pay & Place Order'}
      </button>
    </div>
  );
}

// ─── Order confirmation ───────────────────────────────────────────────────────
function OrderConfirmation({ order }: { order: Order }) {
  const router = useRouter();
  const paymentBadge: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    paid:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    failed:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-16">
      <div className="max-w-lg mx-auto px-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
          <div className="bg-emerald-500 px-6 py-8 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={36} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white font-display mb-1">Order Placed!</h1>
            <p className="text-emerald-100 text-sm">Thank you for your order</p>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
              <span className="text-sm text-gray-500 dark:text-gray-400">Order number</span>
              <span className="font-bold text-gray-900 dark:text-white font-mono text-sm">{order.order_number}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
              <span className="text-sm text-gray-500 dark:text-gray-400">Payment</span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${paymentBadge[order.payment_status] ?? ''}`}>
                {order.payment_status}
              </span>
            </div>
            <div className="flex items-start gap-2 py-3 border-b border-gray-100 dark:border-gray-800">
              <MapPin size={15} className="text-brand-400 mt-0.5 shrink-0" />
              <span className="text-sm text-gray-600 dark:text-gray-300">{order.delivery_address}</span>
            </div>

            <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
              {order.plates.map((p, i) => (
                <div key={i} className="flex items-center justify-between text-sm py-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 bg-brand-50 dark:bg-brand-900/20 text-brand-500 text-xs font-bold rounded-lg flex items-center justify-center shrink-0">
                      {p.quantity}
                    </span>
                    <span className="text-gray-700 dark:text-gray-300 truncate">{p.plate_name}</span>
                    {p.category_name && (
                      <span className="text-xs text-gray-400 shrink-0 hidden sm:inline">· {p.category_name}</span>
                    )}
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white shrink-0 ml-2">
                    MAD {p.total.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-1.5">
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>Shipping</span>
                <span>{order.shipping === 0 ? 'Free' : `MAD ${order.shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white">
                <span>Total</span>
                <span>MAD {order.final_total.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button onClick={() => router.push('/menu')}
                className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors text-sm">
                Continue Browsing
              </button>
              <button onClick={() => router.push('/user/dashboard')}
                className="w-full py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm">
                View My Orders
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main CartClient ──────────────────────────────────────────────────────────
export default function CartClient() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { items, updateQty, removeItem, clearCart, total, count } = useCart();

  const [shipping, setShipping]               = useState(0);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [address, setAddress]                 = useState('');
  const [paymentMethod, setPaymentMethod]     = useState<PaymentMethod>('cod');
  const [clientSecret, setClientSecret]       = useState<string | null>(null);
  const [stripeLoading, setStripeLoading]     = useState(false);
  const [placing, setPlacing]                 = useState(false);
  const [error, setError]                     = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder]   = useState<Order | null>(null);

  useEffect(() => {
    settingsApi.get()
      .then(res => { if (res.data) setShipping(res.data.shipping); })
      .catch(() => {})
      .finally(() => setSettingsLoading(false));
  }, []);

  const finalTotal = total + shipping;

  useEffect(() => { setClientSecret(null); }, [total, shipping]);

  const handleSelectStripe = useCallback(async () => {
    setPaymentMethod('stripe');
    if (clientSecret) return;
    if (total <= 0) return;
    setStripeLoading(true);
    setError(null);
    try {
      const res = await orderApi.createPaymentIntent(finalTotal);
      if (res.status) setClientSecret(res.data.client_secret);
    } catch {
      setError('Failed to initialize payment. Please try again.');
    } finally {
      setStripeLoading(false);
    }
  }, [clientSecret, total, finalTotal]);

  const handlePlaceCOD = async () => {
    if (!isAuthenticated) { router.push('/login'); return; }
    if (!address.trim()) { setError('Please enter a delivery address.'); return; }
    setPlacing(true);
    setError(null);
    try {
      const res = await orderApi.place({
        delivery_address: address,
        payment_method: 'cod',
        items: items.map(i => ({ plate_id: i.plate.id, quantity: i.quantity })),
      });
      if (res.status) {
        saveLastOrder(res.data);
        clearCart();
        setConfirmedOrder(res.data);
      } else {
        setError(res.message ?? 'Failed to place order.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  const handleStripeSuccess = async (intentId: string) => {
    if (!address.trim()) { setError('Please enter a delivery address.'); return; }
    setPlacing(true);
    setError(null);
    try {
      const res = await orderApi.place({
        delivery_address: address,
        payment_method: 'stripe',
        stripe_payment_intent_id: intentId,
        items: items.map(i => ({ plate_id: i.plate.id, quantity: i.quantity })),
      });
      if (res.status) {
        saveLastOrder(res.data);
        clearCart();
        setConfirmedOrder(res.data);
      } else {
        setError(res.message ?? 'Order could not be saved.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  // ── Early returns (keep confirmed order & hero-less states) ─────────────────
  if (confirmedOrder) return <OrderConfirmation order={confirmedOrder} />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* ── Hero — always visible, even while loading ── */}
      <div className="relative bg-gray-800 text-white pb-24 pt-36 text-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('/imgs/cart.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/60 via-gray-950/40 to-gray-950/80" />
        <div className="relative z-10">
          <p className="text-brand-400 uppercase tracking-widest text-sm mb-3 font-medium">Your Selection</p>
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-4">Your Order</h1>
          <p className="text-gray-300 text-base max-w-md mx-auto">
            Review your items, enter your delivery address, and choose a payment method.
          </p>
        </div>
      </div>

      {/* ── Loading skeleton ── */}
      {settingsLoading && <CartSkeletonBody />}

      {/* ── Empty cart ── */}
      {!settingsLoading && count === 0 && (
        <div className="max-w-md mx-auto px-4 text-center py-20">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <ShoppingCart size={32} className="text-gray-300 dark:text-gray-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 font-display">Your cart is empty</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            Add some delicious dishes from our menu to get started.
          </p>
          <Link href="/menu"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors">
            <UtensilsCrossed size={16} /> Browse Menu
          </Link>
        </div>
      )}

      {/* ── Main cart content ── */}
      {!settingsLoading && count > 0 && (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16">

        <Link href="/menu" className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-brand-500 font-medium mb-6 transition-colors">
          <ArrowLeft size={15} /> Back to Menu
        </Link>

        <div className="grid lg:grid-cols-5 gap-8 items-start">

          {/* ── Left: Cart items + Delivery ── */}
          <div className="lg:col-span-3 space-y-5">

            {/* Cart items */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0">
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  Items <span className="text-gray-400 font-normal text-sm ml-1">({count})</span>
                </h2>
                <button onClick={clearCart}
                  className="text-xs text-red-400 hover:text-red-500 font-medium transition-colors flex items-center gap-1">
                  <Trash2 size={12} /> Clear all
                </button>
              </div>

              <ul className="divide-y divide-gray-50 dark:divide-gray-800/60 max-h-[420px] overflow-y-auto">
                {items.map(({ plate, quantity }) => {
                  const hasDiscount = plate.discount > 0 && plate.old_price != null;
                  const lineTotal   = plate.price * quantity;

                  return (
                    <li key={plate.id} className="flex items-start gap-4 px-5 py-4">

                      {/* Image — links to detail page */}
                      <Link
                        href={`/menu/${plate.id}`}
                        className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0 ring-0 hover:ring-2 hover:ring-brand-400 transition-all"
                      >
                        {plate.image_url ? (
                          <Image src={plate.image_url} alt={plate.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <UtensilsCrossed size={20} className="text-gray-300 dark:text-gray-600" />
                          </div>
                        )}
                        {hasDiscount && (
                          <span className="absolute top-0 left-0 right-0 bg-red-500 text-white text-[9px] font-bold text-center py-0.5 flex items-center justify-center gap-px">
                            -{plate.discount}<Percent size={7} strokeWidth={3} />
                          </span>
                        )}
                      </Link>

                      {/* Details — name links to detail page */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/menu/${plate.id}`}
                          className="font-semibold text-gray-900 dark:text-white text-sm truncate hover:text-brand-500 dark:hover:text-brand-400 transition-colors block"
                        >
                          {plate.name}
                        </Link>
                        {plate.short_desc && (
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{plate.short_desc}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-bold text-brand-600 dark:text-brand-400">
                            MAD {plate.price.toFixed(2)}
                          </span>
                          {hasDiscount && (
                            <span className="text-xs text-gray-400 line-through">
                              MAD {plate.old_price!.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Qty controls */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => quantity === 1 ? removeItem(plate.id) : updateQty(plate.id, quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-6 text-center font-bold text-sm text-gray-900 dark:text-white">{quantity}</span>
                          <button
                            onClick={() => updateQty(plate.id, quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-brand-500 hover:bg-brand-600 text-white transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          MAD {lineTotal.toFixed(2)}
                        </p>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeItem(plate.id)}
                        className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors self-start"
                      >
                        <X size={14} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Delivery address */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <MapPin size={16} className="text-brand-400" /> Delivery Address
              </h2>
              <textarea
                value={address}
                onChange={e => setAddress(e.target.value)}
                rows={3}
                placeholder="Enter your full delivery address…"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-brand-400 transition-colors resize-none"
              />
            </div>

            {/* Payment method */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CreditCard size={16} className="text-brand-400" /> Payment Method
              </h2>

              <div className="grid grid-cols-2 gap-3 mb-5">
                <button onClick={() => setPaymentMethod('cod')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
                    ${paymentMethod === 'cod'
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                  <Truck size={22} className={paymentMethod === 'cod' ? 'text-brand-500' : 'text-gray-400'} />
                  <span className={`text-sm font-semibold ${paymentMethod === 'cod' ? 'text-brand-600 dark:text-brand-400' : 'text-gray-600 dark:text-gray-300'}`}>
                    Cash on Delivery
                  </span>
                </button>

                <button onClick={handleSelectStripe}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
                    ${paymentMethod === 'stripe'
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                  {stripeLoading
                    ? <Loader2 size={22} className="animate-spin text-brand-400" />
                    : <CreditCard size={22} className={paymentMethod === 'stripe' ? 'text-brand-500' : 'text-gray-400'} />
                  }
                  <span className={`text-sm font-semibold ${paymentMethod === 'stripe' ? 'text-brand-600 dark:text-brand-400' : 'text-gray-600 dark:text-gray-300'}`}>
                    Pay with Card
                  </span>
                </button>
              </div>

              {paymentMethod === 'stripe' && clientSecret && !stripeLoading && (
                <div className="pt-2">
                  <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                    <StripeForm
                      onSuccess={handleStripeSuccess}
                      onError={msg => setError(msg)}
                      loading={placing}
                      setLoading={setPlacing}
                    />
                  </Elements>
                </div>
              )}

              {paymentMethod === 'stripe' && stripeLoading && (
                <div className="flex items-center justify-center py-6 gap-2 text-gray-400">
                  <Loader2 size={18} className="animate-spin" />
                  <span className="text-sm">Loading payment form…</span>
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
                <AlertCircle size={16} className="shrink-0 mt-0.5" /> {error}
              </div>
            )}
          </div>

          {/* ── Right: Order summary ── */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 sticky top-24">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h2>

              {/* Summary items — each links to detail page */}
              <ul className="space-y-2 max-h-48 overflow-y-auto mb-4 pr-1">
                {items.map(({ plate, quantity }) => (
                  <li key={plate.id} className="flex items-center gap-2 text-xs">
                    <Link
                      href={`/menu/${plate.id}`}
                      className="relative w-8 h-8 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0 hover:ring-2 hover:ring-brand-400 transition-all"
                    >
                      {plate.image_url ? (
                        <Image src={plate.image_url} alt={plate.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <UtensilsCrossed size={10} className="text-gray-400" />
                        </div>
                      )}
                    </Link>
                    <Link
                      href={`/menu/${plate.id}`}
                      className="flex-1 text-gray-600 dark:text-gray-300 truncate hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
                    >
                      {plate.name}
                    </Link>
                    <span className="text-gray-400">×{quantity}</span>
                    <span className="font-semibold text-gray-900 dark:text-white shrink-0">
                      MAD {(plate.price * quantity).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="space-y-2.5 text-sm border-t border-gray-100 dark:border-gray-800 pt-4">
                <div className="flex justify-between text-gray-500 dark:text-gray-400">
                  <span>Subtotal ({count} items)</span>
                  <span>MAD {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500 dark:text-gray-400">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0
                      ? <span className="text-emerald-500 font-medium">Free</span>
                      : `MAD ${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-100 dark:border-gray-800">
                  <span>Total</span>
                  <span>MAD {finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {!isAuthenticated && (
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>You need to <Link href="/login" className="font-semibold underline">sign in</Link> before placing an order.</span>
                </div>
              )}

              {paymentMethod === 'cod' && (
                <button
                  onClick={handlePlaceCOD}
                  disabled={placing || !address.trim() || !isAuthenticated}
                  className="mt-5 w-full flex items-center justify-center gap-2 py-3.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
                >
                  {placing ? <Loader2 size={18} className="animate-spin" /> : <Truck size={18} />}
                  {placing ? 'Placing order…' : 'Place Order (COD)'}
                </button>
              )}

              {paymentMethod === 'stripe' && (
                <p className="mt-5 text-center text-xs text-gray-400">
                  Complete payment above to place your order.
                </p>
              )}

              <p className="mt-4 text-center text-xs text-gray-400 flex items-center justify-center gap-1">
                <ShieldCheck size={12} /> Secure & encrypted checkout
              </p>
            </div>
          </div>

        </div>
      </div>
      )}{/* end !settingsLoading && count > 0 */}

    </div>
  );
}