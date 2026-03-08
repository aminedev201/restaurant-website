'use client';

import { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import type { DayRevenue } from '@/lib/adminServiceApi';

interface RevenueChartProps {
  data7:  DayRevenue[];
  data30: DayRevenue[];
}

const fmt = (d: string) => {
  const dt = new Date(d);
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function RevenueChart({ data7, data30 }: RevenueChartProps) {
  const [range, setRange] = useState<'7' | '30'>('7');
  const data = range === '7' ? data7 : data30;

  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-800 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white">Revenue & Orders</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Paid orders only</p>
        </div>
        <div className="flex gap-1 rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
          {(['7', '30'] as const).map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                range === r
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {r}d
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="ordGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-100 dark:text-gray-800" />
          <XAxis dataKey="date" tickFormatter={fmt} tick={{ fontSize: 11 }} className="text-gray-500 dark:text-gray-400" />
          <YAxis yAxisId="rev" tick={{ fontSize: 11 }} className="text-gray-500 dark:text-gray-400" tickFormatter={v => `$${v}`} />
          <YAxis yAxisId="ord" orientation="right" tick={{ fontSize: 11 }} className="text-gray-500 dark:text-gray-400" />
          <Tooltip
            contentStyle={{ borderRadius: 10, fontSize: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}
            formatter={(val, name) => [
              name === 'revenue' ? `$${Number(val).toFixed(2)}` : val,
              name === 'revenue' ? 'Revenue' : 'Orders',
            ]}
            labelFormatter={(label) => fmt(String(label))}
          />
          <Area yAxisId="rev" type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2.5} fill="url(#revGrad)" dot={false} />
          <Area yAxisId="ord" type="monotone" dataKey="orders"  stroke="#3b82f6" strokeWidth={2}   fill="url(#ordGrad)"  dot={false} />
        </AreaChart>
      </ResponsiveContainer>
      <div className="mt-3 flex gap-4 justify-end text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-0.5 bg-amber-400 rounded" />Revenue</span>
        <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-0.5 bg-blue-500 rounded" />Orders</span>
      </div>
    </div>
  );
}