'use client';

import { Users } from 'lucide-react';
import type { RecentReservation } from '@/lib/adminServiceApi';

interface RecentReservationsTableProps {
    data: RecentReservation[];
}

const statusStyle: Record<string, string> = {
    pending: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300',
    confirmed: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
    canceled: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
};

const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default function RecentReservationsTable({ data }: RecentReservationsTableProps) {
    return (
        <div className="rounded-2xl bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-800 p-5">
            <div className="mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white">Recent Reservations</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Latest 5 table bookings</p>
            </div>
            {data.length === 0 ? (
                <p className="text-sm text-center text-gray-400 dark:text-gray-600 py-8">No reservations yet</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-gray-800">
                                <th className="pb-2 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Customer</th>
                                <th className="pb-2 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Date & Time</th>
                                <th className="pb-2 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Guests</th>
                                <th className="pb-2 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
                            {data.map(res => (
                                <tr key={res.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                    <td className="py-2.5 pr-3">
                                        <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate max-w-[140px]">{res.user?.fullname ?? '—'}</p>
                                        <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate max-w-[140px]">{res.user?.email}</p>
                                    </td>
                                    <td className="py-2.5 pr-3">
                                        <p className="text-xs font-medium text-gray-800 dark:text-gray-200">{fmtDate(res.date)}</p>
                                        <p className="text-[10px] text-gray-400 dark:text-gray-500">{res.time?.slice(0, 5)}</p>
                                    </td>
                                    <td className="py-2.5 pr-3">
                                        <span className="flex items-center gap-1 text-xs text-gray-700 dark:text-gray-300">
                                            <Users size={12} /> {res.guests}
                                        </span>
                                    </td>
                                    <td className="py-2.5">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${statusStyle[res.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                            {res.status}
                                        </span>
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