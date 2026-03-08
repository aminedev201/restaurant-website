'use client';

import { useEffect, useState } from 'react';
import {
  Users, ShoppingBag, DollarSign, UtensilsCrossed,
  LayoutGrid, ChefHat, CalendarCheck, MessageSquare,
  Star, RefreshCw, TrendingUp,
} from 'lucide-react';

import { statsApi, type DashboardStats } from '@/lib/adminServiceApi';

import StatCard from '@/components/admin/dashboard/StatCard';
import RevenueChart from '@/components/admin/dashboard/RevenueChart';
import DonutChart from '@/components/admin/dashboard/DonutChart';
import UsersChart from '@/components/admin/dashboard/UsersChart';
import TopPlatesTable from '@/components/admin/dashboard/TopPlatesTable';
import RecentOrdersTable from '@/components/admin/dashboard/RecentOrdersTable';
import RecentReservationsTable from '@/components/admin/dashboard/RecentReservationsTable';

// ── Skeleton ────────────────────────────────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800 ${className}`} />
  );
}

function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
        {Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Skeleton className="h-72 lg:col-span-2" />
        <Skeleton className="h-72" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-56" />)}
      </div>
    </div>
  );
}

// ── Main ────────────────────────────────────────────────────────────────────
export default function AdminDashboardClient() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await statsApi.get();
      setStats(res.data);
      setLastUpdated(new Date());
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load dashboard stats.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <TrendingUp size={24} className="text-amber-500" />
            Dashboard
          </h1>
          {lastUpdated && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Updated {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium ring-1 ring-gray-200 dark:ring-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-all"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-xl bg-red-50 dark:bg-red-950/30 ring-1 ring-red-200 dark:ring-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && !stats && <SkeletonDashboard />}

      {/* Content */}
      {stats && (
        <div className="space-y-6">

          {/* ── Stat cards ───────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
            <StatCard title="Total Revenue" value={`$${stats.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={DollarSign} color="amber" subtitle="Paid orders" />
            <StatCard title="Total Orders" value={stats.total_orders} icon={ShoppingBag} color="blue" />
            <StatCard title="Total Users" value={stats.total_users} icon={Users} color="emerald" />
            <StatCard title="Reservations" value={stats.total_reservations} icon={CalendarCheck} color="violet" />
            <StatCard title="Plates" value={stats.total_plates} icon={UtensilsCrossed} color="orange" subtitle={`${stats.total_categories} categories`} />
            <StatCard title="Chefs" value={stats.total_chefs} icon={ChefHat} color="cyan" />
            <StatCard title="Categories" value={stats.total_categories} icon={LayoutGrid} color="rose" />
            <StatCard title="Unread Messages" value={stats.unread_messages} icon={MessageSquare} color="pink" badge={stats.unread_messages > 0 ? 'New' : undefined} />
            <StatCard title="Pending Reviews" value={stats.pending_testimonials} icon={Star} color="amber" badge={stats.pending_testimonials > 0 ? 'Action' : undefined} />
          </div>

          {/* ── Revenue chart + Order status donut ─────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <RevenueChart data7={stats.revenue_last_7_days} data30={stats.revenue_last_30_days} />
            </div>
            <DonutChart
              title="Orders by Status"
              subtitle="All time breakdown"
              data={stats.orders_by_status}
              colors={['#f59e0b', '#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#ef4444']}
            />
          </div>

          {/* ── Secondary charts row ──────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <UsersChart data={stats.new_users_last_7_days} />
            <DonutChart
              title="Reservations by Status"
              data={stats.reservations_by_status}
              colors={['#f59e0b', '#10b981', '#ef4444']}
            />
            <DonutChart
              title="Payment Methods"
              subtitle="COD vs Stripe"
              data={stats.payment_methods}
              colors={['#f59e0b', '#6366f1']}
            />
          </div>

          {/* ── Tables row ───────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TopPlatesTable data={stats.top_plates} />
            <RecentOrdersTable data={stats.recent_orders} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <RecentReservationsTable data={stats.recent_reservations} />

            {/* Plates active/inactive mini card */}
            <div className="rounded-2xl bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-800 p-5">
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">Plate Availability</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">Active vs inactive menu items</p>
              <div className="flex gap-4">
                {[
                  { label: 'Active', value: stats.plates_by_status.active, color: 'bg-emerald-500' },
                  { label: 'Inactive', value: stats.plates_by_status.inactive, color: 'bg-gray-300 dark:bg-gray-700' },
                ].map(item => {
                  const total = stats.plates_by_status.active + stats.plates_by_status.inactive || 1;
                  return (
                    <div key={item.label} className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{item.label}</span>
                        <span className="text-sm font-black text-gray-900 dark:text-white">{item.value}</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800">
                        <div
                          className={`h-2 rounded-full ${item.color} transition-all duration-700`}
                          style={{ width: `${(item.value / total) * 100}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-1">
                        {((item.value / total) * 100).toFixed(0)}%
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Payment status breakdown */}
              <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Payment Status</h4>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(stats.orders_by_payment_status).map(([status, count]) => (
                    <div
                      key={status}
                      className={`flex-1 min-w-[80px] rounded-xl p-3 text-center ${status === 'paid' ? 'bg-emerald-50 dark:bg-emerald-950/30 ring-1 ring-emerald-200 dark:ring-emerald-800' :
                          status === 'failed' ? 'bg-red-50 dark:bg-red-950/30 ring-1 ring-red-200 dark:ring-red-800' :
                            'bg-yellow-50 dark:bg-yellow-950/30 ring-1 ring-yellow-200 dark:ring-yellow-800'
                        }`}
                    >
                      <p className="text-lg font-black text-gray-900 dark:text-white">{count}</p>
                      <p className={`text-[10px] font-semibold uppercase tracking-wider capitalize ${status === 'paid' ? 'text-emerald-600 dark:text-emerald-400' :
                          status === 'failed' ? 'text-red-600 dark:text-red-400' :
                            'text-yellow-600 dark:text-yellow-400'
                        }`}>{status}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}