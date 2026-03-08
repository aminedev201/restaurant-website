'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CalendarCheck, ShoppingBag, Clock, ArrowRight, ChefHat, RefreshCw, Banknote } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { statsApi, DashboardStats } from '@/lib/userServiceApi';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(date: string) {
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function fmtTime(time: string) {
  const [h, m] = time.split(':');
  const d = new Date();
  d.setHours(+h, +m);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function fmtPrice(v: number) {
  return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(v);
}

const statusBadge = (s: string): string => ({
  confirmed: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  completed: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
  cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  canceled:  'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  pending:   'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
})[s] ?? 'bg-gray-100 text-gray-500';

// ─── Component ────────────────────────────────────────────────────────────────

export default function UserDashboardClient() {
  const { user } = useAuth();
  const [stats, setStats]     = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    statsApi.getDashboard()
      .then(res => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const upcoming = stats?.reservations.upcoming;

  const statCards = [
    {
      label: 'Total Reservations',
      value: loading ? '—' : String(stats?.reservations.total ?? 0),
      icon: CalendarCheck,
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Active Orders',
      value: loading ? '—' : String(stats?.orders.active ?? 0),
      icon: ShoppingBag,
      color: 'text-brand-500',
      bg: 'bg-brand-50 dark:bg-brand-900/20',
    },
    {
      label: 'Total Spent',
      value: loading ? '—' : fmtPrice(stats?.orders.spent ?? 0),
      icon: Banknote,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      label: 'Upcoming Visit',
      value: loading ? '—' : upcoming ? fmtDate(upcoming.date) : 'None',
      icon: Clock,
      color: 'text-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-brand-500 to-brand-600 rounded-2xl p-7 text-white">
        <div className="flex items-center gap-3 mb-2">
          <ChefHat size={24} className="opacity-80" />
          <h1 className="font-display text-2xl font-bold">
            Welcome back, {user?.fullname?.split(' ')[0]}!
          </h1>
        </div>
        <p className="text-white/80 text-sm mb-5">
          {upcoming
            ? <>Your next visit is on <strong>{fmtDate(upcoming.date)}</strong> at <strong>{fmtTime(upcoming.time)}</strong>. We look forward to seeing you.</>
            : "You have no upcoming reservations. Book a table below!"}
        </p>
        <div className="flex gap-3">
          <Link href="/reservation" className="px-4 py-2 bg-white text-brand-600 rounded-lg text-sm font-semibold hover:bg-brand-50 transition-colors">
            New Reservation
          </Link>
          <Link href="/menu" className="px-4 py-2 bg-white/20 border border-white/30 text-white rounded-lg text-sm font-semibold hover:bg-white/30 transition-colors">
            View Menu
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-5 flex items-center gap-4">
            <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
              <Icon size={20} className={color} />
            </div>
            <div className="min-w-0">
              {loading
                ? <div className="h-7 w-16 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mb-1" />
                : <p className="text-2xl font-bold text-gray-900 dark:text-white font-display truncate">{value}</p>
              }
              <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Reservations */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-gray-900 dark:text-white text-lg">Recent Reservations</h2>
          <Link href="/user/reservations" className="text-sm text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <RefreshCw size={22} className="text-brand-500 animate-spin" />
            <p className="text-sm text-gray-400">Loading...</p>
          </div>
        ) : !stats?.reservations.recent.length ? (
          <div className="text-center py-10 text-gray-400 text-sm">No reservations yet.</div>
        ) : (
          <div className="space-y-3">
            {stats.reservations.recent.map(r => (
              <div key={r.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/30 rounded-full flex items-center justify-center">
                    <CalendarCheck size={16} className="text-brand-600 dark:text-brand-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-900 dark:text-white">
                      {fmtDate(r.date)} — {fmtTime(r.time)}
                    </p>
                    <p className="text-xs text-gray-400">{r.guests} guest{r.guests !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <span className={`badge capitalize text-xs font-semibold px-2.5 py-1 rounded-lg ${statusBadge(r.status)}`}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}