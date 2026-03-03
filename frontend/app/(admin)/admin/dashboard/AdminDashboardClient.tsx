'use client';

import { TrendingUp, Users, CalendarCheck, ShoppingBag, ArrowUp, ArrowDown, Circle } from 'lucide-react';

const stats = [
  { label: 'Revenue Today', value: 'MAD 4,280', change: '+12%', up: true, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { label: 'Reservations', value: '24', change: '+3', up: true, icon: CalendarCheck, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { label: 'Active Orders', value: '8', change: '-2', up: false, icon: ShoppingBag, color: 'text-brand-500', bg: 'bg-brand-50 dark:bg-brand-900/20' },
  { label: 'Total Users', value: '1,248', change: '+18', up: true, icon: Users, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
];

const recentOrders = [
  { id: 'ORD-042', customer: 'Sofia Benali', items: 3, total: 450, status: 'preparing', time: '10 min ago' },
  { id: 'ORD-041', customer: 'Ahmed Tahiri', items: 2, total: 275, status: 'ready', time: '25 min ago' },
  { id: 'ORD-040', customer: 'Lena Moussaoui', items: 4, total: 610, status: 'delivered', time: '1h ago' },
  { id: 'ORD-039', customer: 'Marc Dupuis', items: 1, total: 185, status: 'delivered', time: '1.5h ago' },
];

const upcoming = [
  { time: '19:00', name: 'Johnson Party', guests: 6, table: 5 },
  { time: '19:30', name: 'Benali × 2', guests: 2, table: 3 },
  { time: '20:00', name: 'Tahiri Family', guests: 8, table: 10 },
  { time: '20:30', name: 'Moussaoui', guests: 4, table: 7 },
];

const orderStatus = (s: string) => ({
  preparing: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  ready: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  delivered: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
}[s] ?? '');

export default function AdminDashboardClient() {
  return (
    <div className="">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map(({ label, value, change, up, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center`}>
                <Icon size={20} className={color} />
              </div>
              <span className={`flex items-center gap-1 text-xs font-semibold ${up ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                {up ? <ArrowUp size={12} /> : <ArrowDown size={12} />} {change}
              </span>
            </div>
            <p className="text-2xl font-bold font-display text-gray-900 dark:text-white">{value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid xl:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="xl:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <h2 className="font-display font-bold text-gray-900 dark:text-white mb-4">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-gray-800">
                  <th className="pb-3 font-medium">Order</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium hidden sm:table-cell">Items</th>
                  <th className="pb-3 font-medium">Total</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {recentOrders.map(o => (
                  <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="py-3 font-medium text-gray-700 dark:text-gray-300">{o.id}</td>
                    <td className="py-3 text-gray-600 dark:text-gray-400">{o.customer}</td>
                    <td className="py-3 text-gray-500 hidden sm:table-cell">{o.items}</td>
                    <td className="py-3 font-medium text-gray-900 dark:text-white">MAD {o.total}</td>
                    <td className="py-3">
                      <span className={`badge capitalize ${orderStatus(o.status)}`}>{o.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming reservations */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <h2 className="font-display font-bold text-gray-900 dark:text-white mb-4">Tonight&apos;s Reservations</h2>
          <div className="space-y-3">
            {upcoming.map(r => (
              <div key={r.time} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="w-2 h-2 bg-brand-500 rounded-full shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{r.name}</p>
                  <p className="text-xs text-gray-400">{r.guests} guests · Table {r.table}</p>
                </div>
                <span className="text-sm font-semibold text-brand-600 dark:text-brand-400 shrink-0">{r.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}