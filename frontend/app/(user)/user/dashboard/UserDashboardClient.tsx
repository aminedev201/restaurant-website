'use client';

import Link from 'next/link';
import { CalendarCheck, ShoppingBag, Clock, ArrowRight, ChefHat } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const mockStats = [
  { label: 'Total Reservations', value: '8', icon: CalendarCheck, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { label: 'Active Orders', value: '2', icon: ShoppingBag, color: 'text-brand-500', bg: 'bg-brand-50 dark:bg-brand-900/20' },
  { label: 'Upcoming Visit', value: 'Mar 5', icon: Clock, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
];

const recentReservations = [
  { id: 1, date: 'March 5, 2026', time: '20:00', guests: 2, status: 'confirmed' },
  { id: 2, date: 'February 14, 2026', time: '19:30', guests: 4, status: 'completed' },
  { id: 3, date: 'January 22, 2026', time: '13:00', guests: 2, status: 'completed' },
];

const statusBadge = (s: string) => ({
  confirmed: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  completed: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
  cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  pending: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
})[s] ?? '';

export default function UserDashboardClient() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-brand-500 to-brand-600 rounded-2xl p-7 text-white">
        <div className="flex items-center gap-3 mb-2">
          <ChefHat size={24} className="opacity-80" />
          <h1 className="font-display text-2xl font-bold">Welcome back, {user?.fullname?.split(' ')[0]}!</h1>
        </div>
        <p className="text-white/80 text-sm mb-5">Your next visit is on <strong>March 5</strong>. We look forward to seeing you.</p>
        <div className="flex gap-3">
          <Link href="/booking" className="px-4 py-2 bg-white text-brand-600 rounded-lg text-sm font-semibold hover:bg-brand-50 transition-colors">
            New Reservation
          </Link>
          <Link href="/menu" className="px-4 py-2 bg-white/20 border border-white/30 text-white rounded-lg text-sm font-semibold hover:bg-white/30 transition-colors">
            View Menu
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {mockStats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-5 flex items-center gap-4">
            <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
              <Icon size={20} className={color} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white font-display">{value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent reservations */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-gray-900 dark:text-white text-lg">Recent Reservations</h2>
          <Link href="/user/reservations" className="text-sm text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="space-y-3">
          {recentReservations.map(r => (
            <div key={r.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/30 rounded-full flex items-center justify-center">
                  <CalendarCheck size={16} className="text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900 dark:text-white">{r.date} — {r.time}</p>
                  <p className="text-xs text-gray-400">{r.guests} guests</p>
                </div>
              </div>
              <span className={`badge capitalize ${statusBadge(r.status)}`}>{r.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}