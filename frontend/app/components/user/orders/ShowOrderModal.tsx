'use client';

import { ShoppingBag, X, MapPin, CreditCard, Banknote, Package, Truck, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Order, OrderStatus, PaymentStatus } from '@/lib/userServiceApi';
import Image from 'next/image';

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function orderStatusBadge(status: OrderStatus) {
  switch (status) {
    case 'confirmed':        return { icon: <CheckCircle2 size={11} />, cls: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',             label: 'Confirmed'        };
    case 'preparing':        return { icon: <Clock size={11} />,        cls: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',         label: 'Preparing'        };
    case 'out_for_delivery': return { icon: <Truck size={11} />,        cls: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',     label: 'Out for Delivery' };
    case 'delivered':        return { icon: <CheckCircle2 size={11} />, cls: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400', label: 'Delivered'        };
    case 'cancelled':        return { icon: <XCircle size={11} />,      cls: 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400',                 label: 'Cancelled'        };
    default:                 return { icon: <Clock size={11} />,        cls: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',               label: 'Pending'          };
  }
}

export function paymentBadge(status: PaymentStatus) {
  switch (status) {
    case 'paid':   return { cls: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400', label: 'Paid'    };
    case 'failed': return { cls: 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400',                label: 'Failed'  };
    default:       return { cls: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',        label: 'Pending' };
  }
}

export function fmtPrice(n: number) {
  return n.toFixed(2) + ' MAD';
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  order: Order | null;
  open: boolean;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ShowOrderModal({ order, open, onClose }: Props) {
  if (!open || !order) return null;
  const badge    = orderStatusBadge(order.status);
  const payBadge = paymentBadge(order.payment_status);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh]">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center">
                <ShoppingBag size={17} className="text-brand-500" />
              </div>
              <div>
                <h2 className="font-bold text-base text-gray-900 dark:text-white">Order Details</h2>
                <p className="text-xs text-gray-400 font-mono">{order.order_number}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto flex-1 p-6 space-y-4">

            {/* Status + Payment */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">Order Status</p>
                <span className={`flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-lg text-xs font-semibold ${badge.cls}`}>
                  {badge.icon} {badge.label}
                </span>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">Payment</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${payBadge.cls}`}>{payBadge.label}</span>
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    {order.payment_method === 'stripe' ? <CreditCard size={11} /> : <Banknote size={11} />}
                    {order.payment_method === 'stripe' ? 'Card' : 'COD'}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery address */}
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin size={14} className="text-blue-500" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">Delivery Address</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{order.delivery_address}</p>
              </div>
            </div>

            {/* Items */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Items ({order.plates.length})
              </p>
              <div className="space-y-2">
                {order.plates.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl gap-3">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {/* Plate image or fallback icon */}
                      <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center">
                        {item.plate?.image_url ? (
                          <Image
                            src={item.plate.image_url}
                            alt={item.plate_name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package size={14} className="text-brand-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.plate_name}</p>
                        {item.category_name && (
                          <p className="text-xs text-gray-400 truncate">{item.category_name}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-400">×{item.quantity}</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{fmtPrice(item.total)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>Subtotal</span>
                <span>{fmtPrice(order.final_total - order.shipping)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>Shipping</span>
                <span>{fmtPrice(order.shipping)}</span>
              </div>
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between font-bold text-gray-900 dark:text-white">
                <span>Total</span>
                <span className="text-brand-600 dark:text-brand-400">{fmtPrice(order.final_total)}</span>
              </div>
            </div>

            {/* Date */}
            <p className="text-xs text-gray-400 text-center">
              Placed on{' '}
              {new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}{' '}
              at {new Date(order.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
            <button onClick={onClose}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}