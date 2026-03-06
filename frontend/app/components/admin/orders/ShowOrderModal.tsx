'use client';

// components/admin/orders/ShowOrderModal.tsx

import { CreditCard, Truck, X } from 'lucide-react';
import { Order } from '@/lib/adminServiceApi';
import { ORDER_STATUSES, PAYMENT_STATUSES } from './orderConstants';
import StatusDropdown from './StatusDropdown';

interface ShowOrderModalProps {
  open: boolean;
  order: Order | null;
  onClose: () => void;
  onStatusUpdate: (id: number, status: string) => Promise<void>;
  onPaymentStatusUpdate: (id: number, status: string) => Promise<void>;
}

export default function ShowOrderModal({
  open, order, onClose,
  onStatusUpdate, onPaymentStatusUpdate,
}: ShowOrderModalProps) {
  if (!open || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-800">

        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between z-10">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Order</p>
            <h2 className="font-bold text-gray-900 dark:text-white font-mono">{order.order_number}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* Status row */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-400 uppercase tracking-wider">Order Status</span>
              <StatusDropdown
                order={order}
                field="status"
                options={ORDER_STATUSES}
                onUpdate={onStatusUpdate}
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-400 uppercase tracking-wider">Payment Status</span>
              <StatusDropdown
                order={order}
                field="payment_status"
                options={PAYMENT_STATUSES}
                onUpdate={onPaymentStatusUpdate}
              />
            </div>
            <div className="flex flex-col gap-1 ml-auto">
              <span className="text-xs text-gray-400 uppercase tracking-wider">Method</span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                {order.payment_method === 'stripe' ? <CreditCard size={11} /> : <Truck size={11} />}
                {order.payment_method === 'stripe' ? 'Card' : 'Cash on Delivery'}
              </span>
            </div>
          </div>

          {/* Customer + Delivery */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Customer</p>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">{order.user.fullname}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{order.user.email}</p>
              {order.user.phone && (
                <p className="text-xs text-gray-500 dark:text-gray-400">{order.user.phone}</p>
              )}
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Delivery Address</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{order.delivery_address}</p>
            </div>
          </div>

          {/* Date + Stripe intent */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
            <span>
              Placed:{' '}
              <span className="text-gray-600 dark:text-gray-300 font-medium">
                {new Date(order.created_at).toLocaleString('en-GB', {
                  day: '2-digit', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </span>
            </span>
            {order.stripe_payment_intent_id && (
              <span>
                Intent:{' '}
                <span className="font-mono text-gray-500 dark:text-gray-400">
                  {order.stripe_payment_intent_id}
                </span>
              </span>
            )}
          </div>

          {/* Items */}
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">
              Items ({order.order_plates.length})
            </p>
            <div className="space-y-2">
              {order.order_plates.map((p, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <span className="w-6 h-6 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-xs font-bold rounded-lg flex items-center justify-center shrink-0">
                    {p.quantity}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{p.plate_name}</p>
                    {p.category_name && (
                      <p className="text-xs text-gray-400">{p.category_name}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">MAD {p.total.toFixed(2)}</p>
                    {p.discount > 0 && (
                      <p className="text-xs text-red-400">-{p.discount}% off</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-1.5">
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>Subtotal</span>
              <span>MAD {(order.final_total - order.shipping).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>Shipping</span>
              <span>
                {order.shipping === 0
                  ? <span className="text-emerald-500 font-medium">Free</span>
                  : `MAD ${order.shipping.toFixed(2)}`
                }
              </span>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white pt-1 border-t border-gray-100 dark:border-gray-800">
              <span>Total</span>
              <span>MAD {order.final_total.toFixed(2)}</span>
            </div>
          </div>

          {/* Footer action */}
          <div className="flex justify-end pt-1">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Close
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}