'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  Search, RefreshCw, AlertCircle, Trash2, Trash,
  ChevronLeft, ChevronRight, ArrowUp, ArrowDown, ChevronsUpDown,
  Star, ToggleLeft, ToggleRight, ImageOff, Eye, X,
} from 'lucide-react';
import { testimonialAdminApi, AdminTestimonial } from '@/lib/adminServiceApi';
import ConfirmModal from '@/components/admin/ui/ConfirmModal';
import TestimonialPreviewModal from '@/components/admin/testimonials/TestimonialPreviewModal';

type SortKey = 'created_at' | 'rating';
type SortDir = 'asc' | 'desc';
const PER_PAGE_OPTIONS = [5, 25, 50, 100] as const;

// ─── Sort icon ────────────────────────────────────────────────────────────────
function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown size={13} className="text-gray-300 dark:text-gray-600 ml-1 inline" />;
  return sortDir === 'asc'
    ? <ArrowUp size={13} className="text-brand-500 ml-1 inline" />
    : <ArrowDown size={13} className="text-brand-500 ml-1 inline" />;
}

// ─── Star display ─────────────────────────────────────────────────────────────
function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={12}
          className={s <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200 dark:text-gray-700'}
        />
      ))}
    </div>
  );
}

// ─── Preview modal ────────────────────────────────────────────────────────────
function PreviewModal({ testimonial, onClose }: { testimonial: AdminTestimonial; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 w-full max-w-md p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-3 mb-5">
          {testimonial.user.avatar_url ? (
            <img src={testimonial.user.avatar_url} alt={testimonial.user.fullname} className="w-12 h-12 rounded-full object-cover border border-gray-100 dark:border-gray-700" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <span className="text-amber-700 dark:text-amber-300 font-bold">{testimonial.user.fullname.charAt(0)}</span>
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">{testimonial.user.fullname}</p>
            <p className="text-xs text-gray-400">{testimonial.user.email}</p>
          </div>
        </div>

        <StarDisplay rating={testimonial.rating} />

        <p className="mt-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          &ldquo;{testimonial.comment}&rdquo;
        </p>

        <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
          <span>{new Date(testimonial.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          <span className={`px-2 py-0.5 rounded-full font-medium ${
            testimonial.status
              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
              : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
          }`}>
            {testimonial.status ? 'Approved' : 'Pending'}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function TestimonialsClient() {
  const [testimonials, setTestimonials] = useState<AdminTestimonial[]>([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [sortKey, setSortKey]           = useState<SortKey>('created_at');
  const [sortDir, setSortDir]           = useState<SortDir>('desc');
  const [page, setPage]                 = useState(1);
  const [perPage, setPerPage]           = useState<number>(5);
  const [selected, setSelected]         = useState<number[]>([]);
  const [togglingId, setTogglingId]     = useState<number | null>(null);

  // Modals
  const [previewTarget, setPreviewTarget]           = useState<AdminTestimonial | null>(null);
  const [deleteTarget, setDeleteTarget]             = useState<AdminTestimonial | null>(null);
  const [showDeleteAll, setShowDeleteAll]           = useState(false);
  const [showDeleteSelected, setShowDeleteSelected] = useState(false);
  const [deleteAllLoading, setDeleteAllLoading]     = useState(false);
  const [deleteSelLoading, setDeleteSelLoading]     = useState(false);

  // ─── Fetch ────────────────────────────────────────────────────────────────
  const fetchTestimonials = useCallback(async () => {
    setLoading(true);
    try {
      const res = await testimonialAdminApi.getAll();
      setTestimonials(res.data ?? []);
    } catch {
      toast.error('Failed to load testimonials.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTestimonials(); }, [fetchTestimonials]);

  // ─── Sort + Filter ────────────────────────────────────────────────────────
  const processed = useMemo(() => {
    let data = [...testimonials];

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((t) =>
        t.user.fullname.toLowerCase().includes(q) ||
        t.user.email.toLowerCase().includes(q) ||
        t.comment.toLowerCase().includes(q),
      );
    }

    if (statusFilter !== 'all') {
      data = data.filter((t) => statusFilter === 'approved' ? t.status : !t.status);
    }

    data.sort((a, b) => {
      const cmp = String(a[sortKey] ?? '').localeCompare(String(b[sortKey] ?? ''), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return data;
  }, [testimonials, search, statusFilter, sortKey, sortDir]);

  const totalPages = Math.ceil(processed.length / perPage);
  const pageItems  = processed.slice((page - 1) * perPage, page * perPage);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  };

  // ─── Selection ───────────────────────────────────────────────────────────
  const allPageSelected = pageItems.length > 0 && pageItems.every((t) => selected.includes(t.id));
  const toggleAll = () => {
    if (allPageSelected) setSelected((s) => s.filter((id) => !pageItems.find((t) => t.id === id)));
    else setSelected((s) => [...new Set([...s, ...pageItems.map((t) => t.id)])]);
  };
  const toggleOne = (id: number) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  // ─── Status toggle ────────────────────────────────────────────────────────
  const handleToggleStatus = async (t: AdminTestimonial) => {
    setTogglingId(t.id);
    try {
      await testimonialAdminApi.updateStatus(t.id, !t.status);
      setTestimonials((prev) =>
        prev.map((item) => (item.id === t.id ? { ...item, status: !item.status } : item)),
      );
      toast.success(`Testimonial ${!t.status ? 'approved' : 'set to pending'}.`);
    } catch {
      toast.error('Failed to update status.');
    } finally {
      setTogglingId(null);
    }
  };

  // ─── Delete handlers ──────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await testimonialAdminApi.delete(deleteTarget.id);
      toast.success('Testimonial deleted.');
      setDeleteTarget(null);
      fetchTestimonials();
    } catch {
      toast.error('Failed to delete testimonial.');
    }
  };

  const handleDeleteSelected = async () => {
    setDeleteSelLoading(true);
    try {
      await testimonialAdminApi.deleteSelected(selected);
      toast.success(`${selected.length} testimonial(s) deleted.`);
      setSelected([]);
      setShowDeleteSelected(false);
      fetchTestimonials();
    } catch {
      toast.error('Failed to delete selected.');
    } finally {
      setDeleteSelLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    setDeleteAllLoading(true);
    try {
      await testimonialAdminApi.deleteAll();
      toast.success('All testimonials deleted.');
      setSelected([]);
      setShowDeleteAll(false);
      fetchTestimonials();
    } catch {
      toast.error('Failed to delete all testimonials.');
    } finally {
      setDeleteAllLoading(false);
    }
  };

  // ─── Pagination ───────────────────────────────────────────────────────────
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

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Testimonials</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{testimonials.length} total reviews</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {selected.length > 0 && (
            <button
              onClick={() => setShowDeleteSelected(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              <Trash size={15} /> Delete ({selected.length})
            </button>
          )}
          <button
            onClick={() => setShowDeleteAll(true)}
            disabled={testimonials.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            <Trash2 size={15} /> Delete All
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-2 my-2 w-full">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email or comment..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-brand-400 dark:focus:border-brand-500 transition-colors"
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1 p-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 shrink-0">
            {(['all', 'approved', 'pending'] as const).map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === s
                    ? s === 'approved'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : s === 'pending'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 shadow-sm'
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          {/* Per page */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">Show</span>
            <select
              value={perPage}
              onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
              className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none focus:border-brand-400 transition-colors"
            >
              {PER_PAGE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          {/* Refresh */}
          <button
            onClick={fetchTestimonials}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm transition-colors shrink-0"
          >
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
            <p className="text-sm text-gray-400">Loading testimonials...</p>
          </div>
        ) : pageItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
              <AlertCircle size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">No testimonials found</p>
            {search && <p className="text-sm text-gray-400">Try adjusting your search query</p>}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <th className="px-5 py-3.5 w-10">
                      <input
                        type="checkbox"
                        checked={allPageSelected}
                        onChange={toggleAll}
                        className="rounded border-gray-300 dark:border-gray-600 text-brand-500 focus:ring-brand-400 cursor-pointer"
                      />
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider cursor-pointer select-none hidden sm:table-cell" onClick={() => toggleSort('rating')}>
                      Rating <SortIcon col="rating" sortKey={sortKey} sortDir={sortDir} />
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider hidden md:table-cell">Comment</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider hidden lg:table-cell cursor-pointer select-none" onClick={() => toggleSort('created_at')}>
                      Date <SortIcon col="created_at" sortKey={sortKey} sortDir={sortDir} />
                    </th>
                    <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                  {pageItems.map((t) => (
                    <tr
                      key={t.id}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors ${
                        selected.includes(t.id) ? 'bg-brand-50/50 dark:bg-brand-900/10' : ''
                      }`}
                    >
                      <td className="px-5 py-3.5">
                        <input
                          type="checkbox"
                          checked={selected.includes(t.id)}
                          onChange={() => toggleOne(t.id)}
                          className="rounded border-gray-300 dark:border-gray-600 text-brand-500 focus:ring-brand-400 cursor-pointer"
                        />
                      </td>

                      {/* User */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {t.user.avatar_url ? (
                            <img
                              src={t.user.avatar_url}
                              alt={t.user.fullname}
                              className="w-9 h-9 rounded-xl object-cover border border-gray-100 dark:border-gray-700 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
                              <span className="text-amber-700 dark:text-amber-300 font-bold text-xs">
                                {t.user.fullname.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-white text-xs truncate max-w-[120px]">{t.user.fullname}</p>
                            <p className="text-gray-400 text-xs truncate max-w-[120px]">{t.user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Rating */}
                      <td className="px-5 py-3.5 hidden sm:table-cell">
                        <StarDisplay rating={t.rating} />
                      </td>

                      {/* Comment */}
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <p className="text-gray-500 dark:text-gray-400 text-xs max-w-[260px] truncate">
                          {t.comment}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => handleToggleStatus(t)}
                          disabled={togglingId === t.id}
                          className={`flex items-center gap-1 w-fit px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                            t.status
                              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100'
                              : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100'
                          } disabled:opacity-50`}
                        >
                          {t.status ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
                          {t.status ? 'Approved' : 'Pending'}
                        </button>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-3.5 text-gray-400 dark:text-gray-500 text-xs hidden lg:table-cell whitespace-nowrap">
                        {new Date(t.created_at).toLocaleDateString('en-GB', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setPreviewTarget(t)}
                            className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                            title="Preview"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(t)}
                            className="p-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-gray-400">
                  Showing{' '}
                  <span className="font-semibold text-gray-600 dark:text-gray-300">
                    {(page - 1) * perPage + 1}–{Math.min(page * perPage, processed.length)}
                  </span>{' '}
                  of{' '}
                  <span className="font-semibold text-gray-600 dark:text-gray-300">{processed.length}</span> testimonials
                  {selected.length > 0 && (
                    <span className="ml-2 text-brand-500">· {selected.length} selected</span>
                  )}
                </p>
                {totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
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
                          className={`min-w-[34px] h-[34px] px-2 rounded-xl text-sm font-medium transition-colors ${
                            page === n
                              ? 'bg-brand-500 text-white shadow-sm'
                              : 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                        >
                          {n}
                        </button>
                      ),
                    )}
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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

      {/* Modals */}
     <TestimonialPreviewModal
        testimonial={previewTarget}
        onClose={() => setPreviewTarget(null)}
        />

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Testimonial"
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
        description={
          <>
            Are you sure you want to delete this review by{' '}
            <span className="font-semibold text-gray-900 dark:text-white">{deleteTarget?.user.fullname}</span>?
            This action <span className="text-red-500 font-medium">cannot be undone</span>.
          </>
        }
      />

      <ConfirmModal
        open={showDeleteSelected}
        title="Delete Selected"
        loading={deleteSelLoading}
        onConfirm={handleDeleteSelected}
        onClose={() => setShowDeleteSelected(false)}
        description={
          <>
            Are you sure you want to delete{' '}
            <span className="font-semibold text-gray-900 dark:text-white">{selected.length} testimonials</span>?
            This action <span className="text-red-500 font-medium">cannot be undone</span>.
          </>
        }
      />

      <ConfirmModal
        open={showDeleteAll}
        title="Delete All Testimonials"
        confirmLabel="Delete All"
        loading={deleteAllLoading}
        onConfirm={handleDeleteAll}
        onClose={() => setShowDeleteAll(false)}
        description={
          <>
            Are you sure you want to delete{' '}
            <span className="font-semibold text-gray-900 dark:text-white">all {testimonials.length} testimonials</span>?
            This action <span className="text-red-500 font-medium">cannot be undone</span>.
          </>
        }
      />
    </div>
  );
}