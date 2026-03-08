'use client';

import type { TopPlate } from '@/lib/adminServiceApi';

interface TopPlatesTableProps {
    data: TopPlate[];
}

export default function TopPlatesTable({ data }: TopPlatesTableProps) {
    const max = Math.max(...data.map(p => p.total_quantity), 1);

    return (
        <div className="rounded-2xl bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-800 p-5">
            <div className="mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white">Top Selling Plates</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">By total quantity ordered</p>
            </div>
            {data.length === 0 ? (
                <p className="text-sm text-center text-gray-400 dark:text-gray-600 py-8">No data yet</p>
            ) : (
                <div className="space-y-3">
                    {data.map((plate, i) => (
                        <div key={plate.name}>
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-[10px] font-bold flex items-center justify-center">
                                        {i + 1}
                                    </span>
                                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{plate.name}</span>
                                </div>
                                <div className="flex-shrink-0 flex items-center gap-3 text-right">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{plate.total_quantity}x</span>
                                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">${plate.total_revenue.toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                                <div
                                    className="h-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-700"
                                    style={{ width: `${(plate.total_quantity / max) * 100}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}