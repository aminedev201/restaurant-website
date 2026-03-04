'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  Search, Trash2, RefreshCw, AlertCircle,
  ChevronLeft, ChevronRight, ArrowUp, ArrowDown, ChevronsUpDown,
  Trash, Eye, Edit2, CalendarDays, Clock, Users,
  CheckCircle2, XCircle, AlertCircle as PendingIcon,
} from 'lucide-react';
import { ReservationApi, ReservationWithUser } from '@/lib/adminServiceApi';
import ConfirmModal from '@/components/admin/ui/ConfirmModal';
import ShowReservationModal from '@/components/admin/reservations/ShowReservationModal';
import EditReservationModal from '@/components/admin/reservations/EditReservationModal';


type SortKey = 'date' | 'time' | 'guests' | 'status';
type SortDir = 'asc' | 'desc';
type StatusFilter = 'all' | 'pending' | 'confirmed' | 'canceled';
const PER_PAGE_OPTIONS = [5, 25, 50, 100] as const;

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   icon: PendingIcon,  cls: 'bg-amber-50  dark:bg-amber-900/20  text-amber-600  dark:text-amber-400'  },
  confirmed: { label: 'Confirmed', icon: CheckCircle2, cls: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' },
  canceled:  { label: 'Canceled',  icon: XCircle,      cls: 'bg-red-50    dark:bg-red-900/20    text-red-500    dark:text-red-400'    },
};

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown size={13} className="text-gray-300 dark:text-gray-600 ml-1 inline" />;
  return sortDir === 'asc'
    ? <ArrowUp size={13} className="text-brand-500 ml-1 inline" />
    : <ArrowDown size={13} className="text-brand-500 ml-1 inline" />;
}

export default function ReservationsClient() {
  const [reservations, setReservations] = useState<ReservationWithUser[]>([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortKey, setSortKey]           = useState<SortKey>('date');
  const [sortDir, setSortDir]           = useState<SortDir>('desc');
  const [page, setPage]                 = useState(1);
  const [perPage, setPerPage]           = useState<number>(5);
  const [selected, setSelected]         = useState<number[]>([]);
  const [updatingStatus, setUpdatingStatus] = useState<Record<number, boolean>>({});

  const [showTarget, setShowTarget]                 = useState<ReservationWithUser | null>(null);
  const [editTarget, setEditTarget]                 = useState<ReservationWithUser | null>(null);
  const [deleteTarget, setDeleteTarget]             = useState<ReservationWithUser | null>(null);
  const [showDeleteSelected, setShowDeleteSelected] = useState(false);
  const [deleteLoading, setDeleteLoading]           = useState(false);
  const [deleteSelLoading, setDeleteSelLoading]     = useState(false);

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ReservationApi.getAll();
      setReservations(res.data);
    } catch {
      toast.error('Failed to load reservations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReservations(); }, [fetchReservations]);

  // ── Inline status update ────────────────────────────────────────────────────
  const handleStatusChange = async (id: number, status: ReservationWithUser['status']) => {
    setUpdatingStatus(p => ({ ...p, [id]: true }));
    try {
      const res = await ReservationApi.update(id, { status });
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status: res.data.status } : r));
      toast.success('Status updated.');
    } catch {
      toast.error('Failed to update status.');
    } finally {
      setUpdatingStatus(p => ({ ...p, [id]: false }));
    }
  };

  const processed = useMemo(() => {
    let data = [...reservations];
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(r =>
        r.user?.fullname?.toLowerCase().includes(q) ||
        r.user?.email?.toLowerCase().includes(q) ||
        r.date.includes(q) ||
        r.status.includes(q)
      );
    }
    if (statusFilter !== 'all') data = data.filter(r => r.status === statusFilter);
    data.sort((a, b) => {
      const cmp = String(a[sortKey] ?? '').localeCompare(String(b[sortKey] ?? ''), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return data;
  }, [reservations, search, statusFilter, sortKey, sortDir]);

  const totalPages = Math.ceil(processed.length / perPage);
  const pageItems  = processed.slice((page - 1) * perPage, page * perPage);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  };

  const allPageSelected = pageItems.length > 0 && pageItems.every(r => selected.includes(r.id));
  const toggleAll = () => {
    if (allPageSelected) setSelected(s => s.filter(id => !pageItems.find(r => r.id === id)));
    else setSelected(s => [...new Set([...s, ...pageItems.map(r => r.id)])]);
  };
  const toggleOne = (id: number) =>
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const handleDeleteOne = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await ReservationApi.destroy(deleteTarget.id);
      toast.success('Reservation deleted.');
      setDeleteTarget(null);
      setSelected(s => s.filter(id => id !== deleteTarget.id));
      fetchReservations();
    } catch {
      toast.error('Failed to delete reservation.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteSelected = async () => {
    setDeleteSelLoading(true);
    try {
      await ReservationApi.destroySelected(selected);
      toast.success(`${selected.length} reservations deleted.`);
      setSelected([]);
      setShowDeleteSelected(false);
      fetchReservations();
    } catch {
      toast.error('Failed to delete selected reservations.');
    } finally {
      setDeleteSelLoading(false);
    }
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

  const pendingCount   = reservations.filter(r => r.status === 'pending').length;
  const confirmedCount = reservations.filter(r => r.status === 'confirmed').length;
  const canceledCount  = reservations.filter(r => r.status === 'canceled').length;

  return (
    <div className="">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reservations</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{reservations.length} total reservations</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {selected.length > 0 && (
            <button onClick={() => setShowDeleteSelected(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
              <Trash size={15} /> Delete ({selected.length})
            </button>
          )}
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3 my-2">
        {[
          { key: 'pending'   as StatusFilter, label: 'Pending',   count: pendingCount,   icon: PendingIcon,  cls: 'text-amber-500',  bg: 'bg-amber-50  dark:bg-amber-900/10',  activeBorder: 'border-amber-400'  },
          { key: 'confirmed' as StatusFilter, label: 'Confirmed', count: confirmedCount, icon: CheckCircle2, cls: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/10', activeBorder: 'border-emerald-400' },
          { key: 'canceled'  as StatusFilter, label: 'Canceled',  count: canceledCount,  icon: XCircle,      cls: 'text-red-500',    bg: 'bg-red-50    dark:bg-red-900/10',    activeBorder: 'border-red-400'    },
        ].map(({ key, label, count, icon: Icon, cls, bg, activeBorder }) => (
          <button key={key}
            onClick={() => { setStatusFilter(statusFilter === key ? 'all' : key); setPage(1); }}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer
              ${statusFilter === key
                ? `${bg} ${activeBorder}`
                : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'}`}>
            <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
              <Icon size={16} className={cls} />
            </div>
            <div className="text-left">
              <p className="text-lg font-bold text-gray-900 dark:text-white leading-none">{count}</p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-2 mb-2 w-full">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search by guest name, email or status..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-brand-400 dark:focus:border-brand-500 transition-colors" />
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 shrink-0">
            {(['all', 'pending', 'confirmed', 'canceled'] as StatusFilter[]).map(s => (
              <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === s
                    ? s === 'pending'   ? 'bg-amber-500  text-white shadow-sm'
                    : s === 'confirmed' ? 'bg-emerald-500 text-white shadow-sm'
                    : s === 'canceled'  ? 'bg-red-500     text-white shadow-sm'
                    : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 shadow-sm'
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                }`}>
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">Show</span>
            <select value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}
              className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none focus:border-brand-400 transition-colors">
              {PER_PAGE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          <button onClick={fetchReservations}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm transition-colors shrink-0">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <RefreshCw size={28} className="text-brand-500 animate-spin" />
            <p className="text-sm text-gray-400">Loading reservations...</p>
          </div>
        ) : pageItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
              <AlertCircle size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">No reservations found</p>
            {search && <p className="text-sm text-gray-400">Try adjusting your search</p>}
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  <th className="px-5 py-3.5 w-10">
                    <input type="checkbox" checked={allPageSelected} onChange={toggleAll}
                      className="rounded border-gray-300 dark:border-gray-600 text-brand-500 focus:ring-brand-400 cursor-pointer" />
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Guest</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider cursor-pointer select-none hidden sm:table-cell" onClick={() => toggleSort('date')}>
                    <span className="flex items-center gap-1"><CalendarDays size={12} /> Date <SortIcon col="date" sortKey={sortKey} sortDir={sortDir} /></span>
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider cursor-pointer select-none hidden md:table-cell" onClick={() => toggleSort('time')}>
                    <span className="flex items-center gap-1"><Clock size={12} /> Time <SortIcon col="time" sortKey={sortKey} sortDir={sortDir} /></span>
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider cursor-pointer select-none hidden md:table-cell" onClick={() => toggleSort('guests')}>
                    <span className="flex items-center gap-1"><Users size={12} /> Guests <SortIcon col="guests" sortKey={sortKey} sortDir={sortDir} /></span>
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider cursor-pointer select-none" onClick={() => toggleSort('status')}>
                    Status <SortIcon col="status" sortKey={sortKey} sortDir={sortDir} />
                  </th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {pageItems.map(r => {
                  const sc = STATUS_CONFIG[r.status];
                  return (
                    <tr key={r.id} onClick={() => setShowTarget(r)}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors cursor-pointer
                        ${selected.includes(r.id) ? 'bg-brand-50/50 dark:bg-brand-900/10' : ''}`}>
                      <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                        <input type="checkbox" checked={selected.includes(r.id)} onChange={() => toggleOne(r.id)}
                          className="rounded border-gray-300 dark:border-gray-600 text-brand-500 focus:ring-brand-400 cursor-pointer" />
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-gray-900 dark:text-white truncate max-w-[140px]">{r.user?.fullname ?? '—'}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[140px]">{r.user?.email ?? ''}</p>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600 dark:text-gray-300 hidden sm:table-cell whitespace-nowrap">
                        {new Date(r.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-3.5 text-gray-600 dark:text-gray-300 hidden md:table-cell">
                        {r.time.slice(0, 5)}
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <span className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                          <Users size={13} className="text-gray-400" /> {r.guests}
                        </span>
                      </td>

                      {/* ── Inline status dropdown ── */}
                      <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                        {updatingStatus[r.id] ? (
                          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg w-fit bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                            <RefreshCw size={12} className="animate-spin text-gray-400 dark:text-gray-500" />
                            <span className="text-xs text-gray-400 dark:text-gray-500">Saving…</span>
                          </div>
                        ) : (
                          <div className="relative w-fit">
                            <select
                              value={r.status}
                              onChange={e => handleStatusChange(r.id, e.target.value as ReservationWithUser['status'])}
                              className={`appearance-none pl-3 pr-7 py-1.5 rounded-lg text-xs font-semibold cursor-pointer outline-none transition-all
                                border bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700
                                hover:bg-gray-200 dark:hover:bg-gray-700
                                focus:ring-2 focus:ring-offset-1 focus:ring-offset-white dark:focus:ring-offset-gray-900 focus:ring-gray-300 dark:focus:ring-gray-600
                                ${r.status === 'pending'   ? 'text-yellow-500 dark:text-yellow-400'
                                : r.status === 'confirmed' ? 'text-green-500  dark:text-green-400'
                                :                           'text-red-500    dark:text-red-400'}`}
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="canceled">Canceled</option>
                            </select>
                            <ChevronsUpDown size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 dark:text-gray-500" />
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => setShowTarget(r)}
                            className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors" title="View">
                            <Eye size={14} />
                          </button>
                          <button onClick={() => setEditTarget(r)}
                            className="p-2 rounded-xl bg-brand-50 dark:bg-brand-900/20 text-brand-500 hover:bg-brand-100 dark:hover:bg-brand-900/30 transition-colors" title="Edit">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => setDeleteTarget(r)}
                            className="p-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors" title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
                  of <span className="font-semibold text-gray-600 dark:text-gray-300">{processed.length}</span> reservations
                  {selected.length > 0 && <span className="ml-2 text-brand-500">· {selected.length} selected</span>}
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

      {/* Modals */}
      <ShowReservationModal
        open={!!showTarget} reservation={showTarget}
        onClose={() => setShowTarget(null)}
        onEdit={r => setEditTarget(r)}
        onDelete={r => setDeleteTarget(r)}
      />
      <EditReservationModal
        open={!!editTarget} reservation={editTarget}
        onClose={() => setEditTarget(null)}
        onSuccess={updated => {
          toast.success('Reservation updated successfully!');
          setReservations(prev => prev.map(r => r.id === updated.id ? updated : r));
        }}
      />
      <ConfirmModal
        open={!!deleteTarget} title="Delete Reservation" loading={deleteLoading}
        onConfirm={handleDeleteOne} onClose={() => setDeleteTarget(null)}
        description={<>Are you sure you want to delete the reservation for{' '}
          <span className="font-semibold text-gray-900 dark:text-white">{deleteTarget?.user?.fullname}</span>?{' '}
          This action <span className="text-red-500 font-medium">cannot be undone</span>.</>}
      />
      <ConfirmModal
        open={showDeleteSelected} title="Delete Selected Reservations" loading={deleteSelLoading}
        onConfirm={handleDeleteSelected} onClose={() => setShowDeleteSelected(false)}
        description={<>Are you sure you want to delete{' '}
          <span className="font-semibold text-gray-900 dark:text-white">{selected.length} reservations</span>?{' '}
          This action <span className="text-red-500 font-medium">cannot be undone</span>.</>}
      />
    </div>
  );
}