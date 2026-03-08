'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import type { DayUsers } from '@/lib/adminServiceApi';

interface UsersChartProps {
  data: DayUsers[];
}

const fmt = (d: string) => {
  const dt = new Date(d);
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function UsersChart({ data }: UsersChartProps) {
  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-800 p-5">
      <div className="mb-4">
        <h3 className="font-bold text-gray-900 dark:text-white">New Users</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">Last 7 days registrations</p>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barSize={18}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-100 dark:text-gray-800" vertical={false} />
          <XAxis dataKey="date" tickFormatter={fmt} tick={{ fontSize: 11 }} className="text-gray-500 dark:text-gray-400" />
          <YAxis tick={{ fontSize: 11 }} className="text-gray-500 dark:text-gray-400" allowDecimals={false} />
          <Tooltip
            contentStyle={{ borderRadius: 10, fontSize: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}
            formatter={(val) => [val, 'New users']}
            labelFormatter={(label) => fmt(String(label))}
          />
          <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}