'use client';

// app/admin/orders/OrdersClient.tsx

import { useState, useEffect, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  Search, RefreshCw,
  ChevronLeft, ChevronRight, ArrowUp, ArrowDown, ChevronsUpDown,
  Eye, Package, CreditCard, Truck,
} from 'lucide-react';
import { orderAdminApi, Order, OrderStatus, PaymentStatus } from '@/lib/adminServiceApi';
import { ORDER_STATUSES, PAYMENT_STATUSES } from '@/components/admin/orders/orderConstants';
import StatusDropdown from '@/components/admin/orders/StatusDropdown';
import ShowOrderModal from '@/components/admin/orders/ShowOrderModal';


// ─── Types ────────────────────────────────────────────────────────────────────
type SortKey = 'order_number' | 'user' | 'final_total' | 'created_at';
type SortDir = 'asc' | 'desc';
const PER_PAGE_OPTIONS = [5, 25, 50, 100] as const;

// ─── Sort icon ────────────────────────────────────────────────────────────────
function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown size={13} className="text-gray-300 dark:text-gray-600 ml-1 inline" />;
  return sortDir === 'asc'
    ? <ArrowUp size={13} className="text-brand-500 ml-1 inline" />
    : <ArrowDown size={13} className="text-brand-500 ml-1 inline" />;
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function OrdersClient() {
  const [orders, setOrders]   = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  const [statusFilter,        setStatusFilter]        = useState<'all' | OrderStatus>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'all' | PaymentStatus>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<'all' | 'cod' | 'stripe'>('all');

  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage]       = useState(1);
  const [perPage, setPerPage] = useState<number>(5);

  const [showTarget, setShowTarget] = useState<Order | null>(null);

  // ─── Fetch ──────────────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await orderAdminApi.getAll();
      setOrders(res.data);
    } catch {
      toast.error('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // ─── Status updaters ────────────────────────────────────────────────────────
  const handleStatusUpdate = useCallback(async (id: number, status: string) => {
    try {
      const res = await orderAdminApi.updateStatus(id, status as OrderStatus);
      setOrders(prev => prev.map(o => o.id === id ? res.data : o));
      setShowTarget(prev => prev?.id === id ? res.data : prev);
      toast.success('Order status updated.');
    } catch {
      toast.error('Failed to update order status.');
    }
  }, []);

  const handlePaymentStatusUpdate = useCallback(async (id: number, status: string) => {
    try {
      const res = await orderAdminApi.updatePaymentStatus(id, status as PaymentStatus);
      setOrders(prev => prev.map(o => o.id === id ? res.data : o));
      setShowTarget(prev => prev?.id === id ? res.data : prev);
      toast.success('Payment status updated.');
    } catch {
      toast.error('Failed to update payment status.');
    }
  }, []);

  // ─── Sort + Filter + Paginate ────────────────────────────────────────────────
  const processed = useMemo(() => {
    let data = [...orders];

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(o =>
        o.order_number.toLowerCase().includes(q) ||
        o.user.fullname.toLowerCase().includes(q) ||
        o.user.email.toLowerCase().includes(q) ||
        o.delivery_address.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all')        data = data.filter(o => o.status === statusFilter);
    if (paymentStatusFilter !== 'all') data = data.filter(o => o.payment_status === paymentStatusFilter);
    if (paymentMethodFilter !== 'all') data = data.filter(o => o.payment_method === paymentMethodFilter);

    data.sort((a, b) => {
      let av: string, bv: string;
      if (sortKey === 'user')             { av = a.user.fullname;       bv = b.user.fullname; }
      else if (sortKey === 'final_total') { av = String(a.final_total); bv = String(b.final_total); }
      else                                { av = String(a[sortKey] ?? ''); bv = String(b[sortKey] ?? ''); }
      const cmp = av.localeCompare(bv, undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return data;
  }, [orders, search, statusFilter, paymentStatusFilter, paymentMethodFilter, sortKey, sortDir]);

  const totalPages = Math.ceil(processed.length / perPage);
  const pageItems  = processed.slice((page - 1) * perPage, page * perPage);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  };

  const pageNumbers = useMemo(() => {
    const nums: (number | '...')[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) nums.push(i);
    } else if (page <= 3) {
      nums.push(1, 2, 3, 4, '...', totalPages);
    } else if (page >= totalPages - 2) {
      nums.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      nums.push(1, '...', page - 1, page, page + 1, '...', totalPages);
    }
    return nums;
  }, [page, totalPages]);

  const pendingCount = orders.filter(o => o.status === 'pending').length;

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="">

      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders</h1>
        {pendingCount > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-xs font-bold">
            {pendingCount}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{orders.length} total orders</p>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-3 my-2 space-y-3">

        {/* Row 1: search + perPage + refresh */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order #, customer, address…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-brand-400 dark:focus:border-brand-500 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">Show</span>
            <select
              value={perPage}
              onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}
              className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none focus:border-brand-400 transition-colors"
            >
              {PER_PAGE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm transition-colors shrink-0"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Row 2: filter pills */}
        <div className="flex flex-wrap gap-2">

          {/* Order status */}
          <div className="flex items-center gap-1 p-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-x-auto">
            <button
              onClick={() => { setStatusFilter('all'); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap
                ${statusFilter === 'all' ? 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 shadow-sm' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
            >
              All Orders
            </button>
            {ORDER_STATUSES.map(s => (
              <button
                key={s.value}
                onClick={() => { setStatusFilter(s.value); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap
                  ${statusFilter === s.value ? `${s.color} shadow-sm` : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Payment status */}
          <div className="flex items-center gap-1 p-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <button
              onClick={() => { setPaymentStatusFilter('all'); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                ${paymentStatusFilter === 'all' ? 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 shadow-sm' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
            >
              All Payments
            </button>
            {PAYMENT_STATUSES.map(s => (
              <button
                key={s.value}
                onClick={() => { setPaymentStatusFilter(s.value); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                  ${paymentStatusFilter === s.value ? `${s.color} shadow-sm` : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Payment method */}
          <div className="flex items-center gap-1 p-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            {(['all', 'cod', 'stripe'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setPaymentMethodFilter(m); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                  ${paymentMethodFilter === m ? 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 shadow-sm' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
              >
                {m === 'all' ? 'All Methods' : m === 'cod' ? 'Cash (COD)' : 'Card (Stripe)'}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <RefreshCw size={28} className="text-brand-500 animate-spin" />
            <p className="text-sm text-gray-400">Loading orders…</p>
          </div>
        ) : pageItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
              <Package size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">No orders found</p>
            {search && <p className="text-sm text-gray-400">Try adjusting your search</p>}
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                      onClick={() => toggleSort('order_number')}>
                    Order # <SortIcon col="order_number" sortKey={sortKey} sortDir={sortDir} />
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider cursor-pointer select-none hidden md:table-cell"
                      onClick={() => toggleSort('user')}>
                    Customer <SortIcon col="user" sortKey={sortKey} sortDir={sortDir} />
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Status
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Payment
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider cursor-pointer select-none hidden lg:table-cell"
                      onClick={() => toggleSort('final_total')}>
                    Total <SortIcon col="final_total" sortKey={sortKey} sortDir={sortDir} />
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider cursor-pointer select-none hidden xl:table-cell"
                      onClick={() => toggleSort('created_at')}>
                    Date <SortIcon col="created_at" sortKey={sortKey} sortDir={sortDir} />
                  </th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {pageItems.map(order => (
                  <tr
                    key={order.id}
                    onClick={() => setShowTarget(order)}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors cursor-pointer
                      ${order.status === 'pending' ? 'font-semibold' : ''}`}
                  >
                    {/* Order # */}
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs text-gray-900 dark:text-white">{order.order_number}</span>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {order.order_plates.length} item{order.order_plates.length !== 1 ? 's' : ''}
                      </p>
                    </td>

                    {/* Customer */}
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <p className="text-gray-900 dark:text-white font-medium truncate max-w-[160px]">{order.user.fullname}</p>
                      <p className="text-xs text-gray-400 truncate max-w-[160px]">{order.user.email}</p>
                    </td>

                    {/* Order status */}
                    <td className="px-5 py-3.5 hidden sm:table-cell w-fit" onClick={e => e.stopPropagation()}>
                      <StatusDropdown
                        order={order}
                        field="status"
                        options={ORDER_STATUSES}
                        onUpdate={handleStatusUpdate}
                      />
                    </td>

                    {/* Payment status + method */}
                    <td className="px-5 py-3.5 hidden lg:table-cell w-fit" onClick={e => e.stopPropagation()}>
                      <div className="space-y-1">
                        <StatusDropdown
                          order={order}
                          field="payment_status"
                          options={PAYMENT_STATUSES}
                          onUpdate={handlePaymentStatusUpdate}
                        />
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          {order.payment_method === 'stripe' ? <CreditCard size={10} /> : <Truck size={10} />}
                          {order.payment_method === 'stripe' ? 'Card' : 'COD'}
                        </span>
                      </div>
                    </td>

                    {/* Total */}
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <span className="font-bold text-gray-900 dark:text-white text-sm">
                        MAD {order.final_total.toFixed(2)}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-3.5 text-gray-400 dark:text-gray-500 text-xs hidden xl:table-cell whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString('en-GB', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => setShowTarget(order)}
                          className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                          title="View"
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-gray-400">
                  Showing{' '}
                  <span className="font-semibold text-gray-600 dark:text-gray-300">
                    {(page - 1) * perPage + 1}–{Math.min(page * perPage, processed.length)}
                  </span>{' '}
                  of{' '}
                  <span className="font-semibold text-gray-600 dark:text-gray-300">{processed.length}</span>{' '}
                  orders
                </p>
                {totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft size={15} />
                    </button>
                    {pageNumbers.map((n, i) =>
                      n === '...' ? (
                        <span key={`e-${i}`} className="px-2 text-gray-300 dark:text-gray-600 text-sm">…</span>
                      ) : (
                        <button
                          key={n}
                          onClick={() => setPage(n as number)}
                          className={`min-w-[34px] h-[34px] px-2 rounded-xl text-sm font-medium transition-colors
                            ${page === n
                              ? 'bg-brand-500 text-white shadow-sm'
                              : 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                        >
                          {n}
                        </button>
                      )
                    )}
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight size={15} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      <ShowOrderModal
        open={!!showTarget}
        order={showTarget}
        onClose={() => setShowTarget(null)}
        onStatusUpdate={handleStatusUpdate}
        onPaymentStatusUpdate={handlePaymentStatusUpdate}
      />

    </div>
  );
}