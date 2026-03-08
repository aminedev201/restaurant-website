'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  Search, RefreshCw, AlertCircle, ChevronLeft, ChevronRight,
  ArrowUp, ArrowDown, ChevronsUpDown, Package, CreditCard, Banknote, Plus,
} from 'lucide-react';
import { orderApi, Order, OrderStatus } from '@/lib/userServiceApi';
import ShowOrderModal, { fmtPrice, orderStatusBadge, paymentBadge } from '@/components/user/orders/ShowOrderModal';

type SortKey      = 'created_at' | 'final_total' | 'order_number';
type SortDir      = 'asc' | 'desc';
type StatusFilter = 'all' | OrderStatus;
type PayFilter    = 'all' | 'pending' | 'paid' | 'failed';

const PER_PAGE_OPTIONS = [5, 10, 25, 50] as const;

function fmtDate(date: string) {
  return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown size={13} className="text-gray-300 dark:text-gray-600 ml-1 inline" />;
  return sortDir === 'asc'
    ? <ArrowUp size={13} className="text-brand-500 ml-1 inline" />
    : <ArrowDown size={13} className="text-brand-500 ml-1 inline" />;
}

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all',              label: 'All'       },
  { value: 'pending',          label: 'Pending'   },
  { value: 'confirmed',        label: 'Confirmed' },
  { value: 'preparing',        label: 'Preparing' },
  { value: 'out_for_delivery', label: 'Delivery'  },
  { value: 'delivered',        label: 'Delivered' },
  { value: 'cancelled',        label: 'Cancelled' },
];

const PAY_FILTERS: { value: PayFilter; label: string; active: string }[] = [
  { value: 'all',     label: 'All',     active: 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 shadow-sm' },
  { value: 'pending', label: 'Pending', active: 'bg-amber-500 text-white shadow-sm'                                    },
  { value: 'paid',    label: 'Paid',    active: 'bg-emerald-500 text-white shadow-sm'                                  },
  { value: 'failed',  label: 'Failed',  active: 'bg-red-500 text-white shadow-sm'                                      },
];

export default function OrderClient() {
  const [orders, setOrders]             = useState<Order[]>([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [payFilter, setPayFilter]       = useState<PayFilter>('all');
  const [sortKey, setSortKey]           = useState<SortKey>('created_at');
  const [sortDir, setSortDir]           = useState<SortDir>('desc');
  const [page, setPage]                 = useState(1);
  const [perPage, setPerPage]           = useState<number>(5);
  const [showTarget, setShowTarget]     = useState<Order | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await orderApi.getAll();
      setOrders(res.data);
    } catch {
      toast.error('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const processed = useMemo(() => {
    let data = [...orders];
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(o =>
        o.order_number.toLowerCase().includes(q) ||
        o.delivery_address.toLowerCase().includes(q) ||
        o.status.includes(q)
      );
    }
    if (statusFilter !== 'all') data = data.filter(o => o.status === statusFilter);
    if (payFilter    !== 'all') data = data.filter(o => o.payment_status === payFilter);
    data.sort((a, b) => {
      const av = sortKey === 'final_total' ? a.final_total : String(a[sortKey] ?? '');
      const bv = sortKey === 'final_total' ? b.final_total : String(b[sortKey] ?? '');
      const cmp = typeof av === 'number' ? av - (bv as number) : String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return data;
  }, [orders, search, statusFilter, payFilter, sortKey, sortDir]);

  const totalPages    = Math.ceil(processed.length / perPage);
  const pageItems     = processed.slice((page - 1) * perPage, page * perPage);
  const activeFilters = (statusFilter !== 'all' ? 1 : 0) + (payFilter !== 'all' ? 1 : 0);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  };

  const pageNumbers = useMemo(() => {
    const nums: (number | '...')[] = [];
    if (totalPages <= 5) { for (let i = 1; i <= totalPages; i++) nums.push(i); }
    else if (page <= 3) nums.push(1, 2, 3, 4, '...', totalPages);
    else if (page >= totalPages - 2) nums.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    else nums.push(1, '...', page - 1, page, page + 1, '...', totalPages);
    return nums;
  }, [page, totalPages]);

  return (
    <div className="">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Orders</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{orders.length} total orders</p>
        </div>
      </div>

      {/* New Order link — right-aligned, between header and filters */}
      <div className="flex justify-end mt-2">
        <Link href="/menu"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-colors">
          <Plus size={15} />
          New Order
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-2 my-2 space-y-2">

        {/* Row 1 — search + per page + refresh */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search by order number or address..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-brand-400 dark:focus:border-brand-500 transition-colors" />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">Show</span>
            <select value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}
              className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none focus:border-brand-400 transition-colors">
              {PER_PAGE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          <button onClick={fetchOrders}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm transition-colors shrink-0">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Row 2 — order status + payment status + clear */}
        <div className="flex flex-wrap items-center gap-2 pt-1">

          {/* Order status pills */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</span>
            <div className="flex items-center gap-1 p-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-x-auto">
              {STATUS_FILTERS.map(({ value, label }) => (
                <button key={value} onClick={() => { setStatusFilter(value); setPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    statusFilter === value
                      ? value === 'delivered'        ? 'bg-emerald-500 text-white shadow-sm'
                      : value === 'cancelled'        ? 'bg-red-500 text-white shadow-sm'
                      : value === 'out_for_delivery' ? 'bg-purple-500 text-white shadow-sm'
                      : value === 'preparing'        ? 'bg-amber-500 text-white shadow-sm'
                      : value === 'confirmed'        ? 'bg-blue-500 text-white shadow-sm'
                      : value === 'pending'          ? 'bg-gray-500 text-white shadow-sm'
                      :                               'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 shadow-sm'
                      : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Payment status pills */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide whitespace-nowrap">Payment</span>
            <div className="flex items-center gap-1 p-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              {PAY_FILTERS.map(({ value, label, active }) => (
                <button key={value} onClick={() => { setPayFilter(value); setPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    payFilter === value
                      ? active
                      : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Clear all filters */}
          {activeFilters > 0 && (
            <button
              onClick={() => { setStatusFilter('all'); setPayFilter('all'); setPage(1); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              Clear filters
              <span className="w-4 h-4 rounded-full bg-brand-500 text-white text-[10px] flex items-center justify-center font-bold">{activeFilters}</span>
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <RefreshCw size={28} className="text-brand-500 animate-spin" />
            <p className="text-sm text-gray-400">Loading orders...</p>
          </div>
        ) : pageItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
              <AlertCircle size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">No orders found</p>
            {(search || activeFilters > 0) && (
              <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider cursor-pointer select-none" onClick={() => toggleSort('order_number')}>
                      Order <SortIcon col="order_number" sortKey={sortKey} sortDir={sortDir} />
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider hidden sm:table-cell">Payment</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider hidden md:table-cell">Address</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider cursor-pointer select-none" onClick={() => toggleSort('final_total')}>
                      Total <SortIcon col="final_total" sortKey={sortKey} sortDir={sortDir} />
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider hidden lg:table-cell cursor-pointer select-none" onClick={() => toggleSort('created_at')}>
                      Date <SortIcon col="created_at" sortKey={sortKey} sortDir={sortDir} />
                    </th>
                    <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                  {pageItems.map(order => {
                    const badge    = orderStatusBadge(order.status);
                    const payBadge = paymentBadge(order.payment_status);
                    return (
                      <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center shrink-0">
                              <Package size={13} className="text-brand-500" />
                            </div>
                            <span className="font-mono text-xs font-semibold text-gray-900 dark:text-white">{order.order_number}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-lg text-xs font-semibold ${badge.cls}`}>
                            {badge.icon} {badge.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 hidden sm:table-cell">
                          <div className="flex flex-col gap-1">
                            <span className={`w-fit px-2 py-0.5 rounded-md text-xs font-medium ${payBadge.cls}`}>{payBadge.label}</span>
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                              {order.payment_method === 'stripe' ? <CreditCard size={11} /> : <Banknote size={11} />}
                              {order.payment_method === 'stripe' ? 'Card' : 'Cash on Delivery'}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 max-w-[180px] truncate text-xs text-gray-500 dark:text-gray-400 hidden md:table-cell">
                          {order.delivery_address}
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                          {fmtPrice(order.final_total)}
                        </td>
                        <td className="px-5 py-3.5 text-gray-400 text-xs hidden lg:table-cell whitespace-nowrap">
                          {fmtDate(order.created_at)}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end">
                            <button onClick={() => setShowTarget(order)}
                              className="px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-900/30 text-xs font-medium transition-colors">
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-gray-400">
                  Showing <span className="font-semibold text-gray-600 dark:text-gray-300">{(page - 1) * perPage + 1}–{Math.min(page * perPage, processed.length)}</span>{' '}
                  of <span className="font-semibold text-gray-600 dark:text-gray-300">{processed.length}</span> orders
                </p>
                {totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                      className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                      <ChevronLeft size={15} />
                    </button>
                    {pageNumbers.map((n, i) =>
                      n === '...' ? (
                        <span key={`e-${i}`} className="px-2 text-gray-300 dark:text-gray-600 text-sm">…</span>
                      ) : (
                        <button key={n} onClick={() => setPage(n as number)}
                          className={`min-w-[34px] h-[34px] px-2 rounded-xl text-sm font-medium transition-colors
                            ${page === n ? 'bg-brand-500 text-white shadow-sm' : 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                          {n}
                        </button>
                      )
                    )}
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                      className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                      <ChevronRight size={15} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <ShowOrderModal
        open={!!showTarget}
        order={showTarget}
        onClose={() => setShowTarget(null)}
      />
    </div>
  );
}