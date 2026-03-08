'use client';

import type { RecentOrder } from '@/lib/adminServiceApi';

interface RecentOrdersTableProps {
    data: RecentOrder[];
}

const orderStatusStyle: Record<string, string> = {
    pending: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300',
    confirmed: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    preparing: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
    out_for_delivery: 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300',
    delivered: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
    cancelled: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
};

const paymentStatusStyle: Record<string, string> = {
    pending: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300',
    paid: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
    failed: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
};

const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function RecentOrdersTable({ data }: RecentOrdersTableProps) {
    return (
        <div className="rounded-2xl bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-800 p-5">
            <div className="mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white">Recent Orders</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Latest 5 orders</p>
            </div>
            {data.length === 0 ? (
                <p className="text-sm text-center text-gray-400 dark:text-gray-600 py-8">No orders yet</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-gray-800">
                                <th className="pb-2 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Order</th>
                                <th className="pb-2 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Customer</th>
                                <th className="pb-2 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Status</th>
                                <th className="pb-2 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Payment</th>
                                <th className="pb-2 text-right text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
                            {data.map(order => (
                                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                    <td className="py-2.5 pr-3">
                                        <p className="font-mono text-xs font-medium text-gray-800 dark:text-gray-200">{order.order_number}</p>
                                        <p className="text-[10px] text-gray-400 dark:text-gray-500">{fmtDate(order.created_at)}</p>
                                    </td>
                                    <td className="py-2.5 pr-3">
                                        <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate max-w-[120px]">{order.user?.fullname ?? '—'}</p>
                                        <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate max-w-[120px]">{order.user?.email}</p>
                                    </td>
                                    <td className="py-2.5 pr-3">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${orderStatusStyle[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                            {order.status.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td className="py-2.5 pr-3">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${paymentStatusStyle[order.payment_status] ?? 'bg-gray-100 text-gray-600'}`}>
                                            {order.payment_status}
                                        </span>
                                    </td>
                                    <td className="py-2.5 text-right font-bold text-sm text-gray-900 dark:text-white tabular-nums">
                                        ${order.final_total.toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}