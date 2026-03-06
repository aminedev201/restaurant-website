// components/admin/orders/orderConstants.ts

import { OrderStatus, PaymentStatus } from '@/lib/adminServiceApi';

export const ORDER_STATUSES: { value: OrderStatus; label: string; color: string }[] = [
  { value: 'pending',          label: 'Pending',          color: 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' },
  { value: 'confirmed',        label: 'Confirmed',        color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' },
  { value: 'preparing',        label: 'Preparing',        color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400' },
  { value: 'out_for_delivery', label: 'Out for Delivery', color: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400' },
  { value: 'delivered',        label: 'Delivered',        color: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' },
  { value: 'cancelled',        label: 'Cancelled',        color: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400' },
];

export const PAYMENT_STATUSES: { value: PaymentStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending', color: 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' },
  { value: 'paid',    label: 'Paid',    color: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' },
  { value: 'failed',  label: 'Failed',  color: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400' },
];

export const getOrderStatus   = (v: OrderStatus)   => ORDER_STATUSES.find(s => s.value === v);
export const getPaymentStatus = (v: PaymentStatus) => PAYMENT_STATUSES.find(s => s.value === v);