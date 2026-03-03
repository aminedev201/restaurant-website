'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  Plus, Search, Edit2, Trash2, RefreshCw, AlertCircle,
  ChevronLeft, ChevronRight, ArrowUp, ArrowDown, ChevronsUpDown,
  Trash, ImageOff, Eye, ToggleLeft, ToggleRight,
} from 'lucide-react';
import { categoryApi, Category } from '@/lib/adminServiceApi';
import CreateCategoryModal from '@/components/admin/categories/CreateCategoryModal';
import EditCategoryModal from '@/components/admin/categories/EditCategoryModal';
import DeleteCategoryModal from '@/components/admin/categories/DeleteCategoryModal';
import ConfirmModal from '@/components/admin/ui/ConfirmModal';
import ShowCategoryModal from '@/components/admin/categories/ShowCategoryModal';

type SortKey = 'name' | 'created_at';
type SortDir = 'asc' | 'desc';
const PER_PAGE_OPTIONS = [5, 25, 50, 100] as const;

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown size={13} className="text-gray-300 dark:text-gray-600 ml-1 inline" />;
  return sortDir === 'asc'
    ? <ArrowUp size={13} className="text-brand-500 ml-1 inline" />
    : <ArrowDown size={13} className="text-brand-500 ml-1 inline" />;
}

export default function CategoriesClient() {
  const [categories, setCategories]     = useState<Category[]>([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortKey, setSortKey]           = useState<SortKey>('created_at');
  const [sortDir, setSortDir]           = useState<SortDir>('desc');
  const [page, setPage]                 = useState(1);
  const [perPage, setPerPage]           = useState<number>(5);
  const [selected, setSelected]         = useState<number[]>([]);

  // Modals
  const [showCreate, setShowCreate]                 = useState(false);
  const [editTarget, setEditTarget]                 = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget]             = useState<Category | null>(null);
  const [showDeleteAll, setShowDeleteAll]           = useState(false);
  const [showDeleteSelected, setShowDeleteSelected] = useState(false);
  const [deleteAllLoading, setDeleteAllLoading]     = useState(false);
  const [deleteSelLoading, setDeleteSelLoading]     = useState(false);
  const [showTarget, setShowTarget]                 = useState<Category | null>(null);

  // ─── Fetch ────────────────────────────────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await categoryApi.getAll();
      setCategories(res.data);
    } catch {
      toast.error('Failed to load categories.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  // ─── Sort + Filter + Paginate ─────────────────────────────────────────────
  const processed = useMemo(() => {
    let data = [...categories];

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(c =>
        c.name.toLowerCase().includes(q) || (c.description ?? '').toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'all') {
      data = data.filter(c => statusFilter === 'active' ? c.status : !c.status);
    }

    data.sort((a, b) => {
      const cmp = String(a[sortKey] ?? '').localeCompare(String(b[sortKey] ?? ''), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return data;
  }, [categories, search, statusFilter, sortKey, sortDir]);

  const totalPages = Math.ceil(processed.length / perPage);
  const pageItems  = processed.slice((page - 1) * perPage, page * perPage);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  };

  // ─── Selection ───────────────────────────────────────────────────────────
  const allPageSelected = pageItems.length > 0 && pageItems.every(c => selected.includes(c.id));
  const toggleAll = () => {
    if (allPageSelected) setSelected(s => s.filter(id => !pageItems.find(c => c.id === id)));
    else setSelected(s => [...new Set([...s, ...pageItems.map(c => c.id)])]);
  };
  const toggleOne = (id: number) =>
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  // ─── Delete handlers ─────────────────────────────────────────────────────
  const handleDeleteSelected = async () => {
    setDeleteSelLoading(true);
    try {
      await categoryApi.deleteSelected(selected);
      toast.success(`${selected.length} categories deleted.`);
      setSelected([]);
      setShowDeleteSelected(false);
      fetchCategories();
    } catch {
      toast.error('Failed to delete selected categories.');
    } finally {
      setDeleteSelLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    setDeleteAllLoading(true);
    try {
      await categoryApi.deleteAll();
      toast.success('All categories deleted.');
      setSelected([]);
      setShowDeleteAll(false);
      fetchCategories();
    } catch {
      toast.error('Failed to delete all categories.');
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
    <div className="">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{categories.length} total categories</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {selected.length > 0 && (
            <button onClick={() => setShowDeleteSelected(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
              <Trash size={15} /> Delete ({selected.length})
            </button>
          )}
          <button onClick={() => setShowDeleteAll(true)} disabled={categories.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors disabled:opacity-50">
            <Trash2 size={15} /> Delete All
          </button>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-colors">
            <Plus size={16} /> Add Category
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-2 my-2 w-full">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search by name or description..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-brand-400 dark:focus:border-brand-500 transition-colors" />
          </div>

          {/* Status filter pills */}
          <div className="flex items-center gap-1 p-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 shrink-0">
            {(['all', 'active', 'inactive'] as const).map(s => (
              <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === s
                    ? s === 'active'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : s === 'inactive'
                        ? 'bg-gray-400 dark:bg-gray-600 text-white shadow-sm'
                        : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 shadow-sm'
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                }`}>
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          {/* Per page */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">Show</span>
            <select value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}
              className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none focus:border-brand-400 dark:focus:border-brand-500 transition-colors">
              {PER_PAGE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          {/* Refresh */}
          <button onClick={fetchCategories}
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
            <p className="text-sm text-gray-400">Loading categories...</p>
          </div>
        ) : pageItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
              <AlertCircle size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">No categories found</p>
            {search && <p className="text-sm text-gray-400">Try adjusting your search query</p>}
            <button onClick={() => setShowCreate(true)} className="mt-1 text-sm text-brand-500 hover:text-brand-600 font-medium">
              + Create a new category
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <th className="px-5 py-3.5 w-10">
                      <input type="checkbox" checked={allPageSelected} onChange={toggleAll}
                        className="rounded border-gray-300 dark:border-gray-600 text-brand-500 focus:ring-brand-400 cursor-pointer" />
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Image</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider cursor-pointer select-none" onClick={() => toggleSort('name')}>
                      Name <SortIcon col="name" sortKey={sortKey} sortDir={sortDir} />
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider hidden md:table-cell">Description</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider hidden sm:table-cell">Status</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider hidden lg:table-cell cursor-pointer select-none" onClick={() => toggleSort('created_at')}>
                      Created <SortIcon col="created_at" sortKey={sortKey} sortDir={sortDir} />
                    </th>
                    <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                  {pageItems.map(cat => (
                    <tr key={cat.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors ${selected.includes(cat.id) ? 'bg-brand-50/50 dark:bg-brand-900/10' : ''}`}>
                      <td className="px-5 py-3.5">
                        <input type="checkbox" checked={selected.includes(cat.id)} onChange={() => toggleOne(cat.id)}
                          className="rounded border-gray-300 dark:border-gray-600 text-brand-500 focus:ring-brand-400 cursor-pointer" />
                      </td>
                      {/* Image */}
                      <td className="px-5 py-3.5">
                        {cat.image_url ? (
                          <img src={cat.image_url} alt={cat.name} className="w-10 h-10 rounded-xl object-cover border border-gray-100 dark:border-gray-700" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <ImageOff size={14} className="text-gray-400" />
                          </div>
                        )}
                      </td>
                      {/* Name */}
                      <td className="px-5 py-3.5 font-semibold text-gray-900 dark:text-white max-w-[160px] truncate">{cat.name}</td>
                      {/* Description */}
                      <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 max-w-[220px] truncate hidden md:table-cell">
                        {cat.description ?? <span className="text-gray-300 dark:text-gray-600 italic">—</span>}
                      </td>
                      {/* Status */}
                      <td className="px-5 py-3.5 hidden sm:table-cell">
                        <span className={`flex items-center gap-1 w-fit px-2.5 py-1 rounded-lg text-xs font-medium ${
                          cat.status
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                        }`}>
                          {cat.status ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
                          {cat.status ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      {/* Created */}
                      <td className="px-5 py-3.5 text-gray-400 dark:text-gray-500 text-xs hidden lg:table-cell whitespace-nowrap">
                        {new Date(cat.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => setShowTarget(cat)}
                            className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors" title="View">
                            <Eye size={14} />
                          </button>
                          <button onClick={() => setEditTarget(cat)}
                            className="p-2 rounded-xl bg-brand-50 dark:bg-brand-900/20 text-brand-500 hover:bg-brand-100 dark:hover:bg-brand-900/30 transition-colors" title="Edit">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => setDeleteTarget(cat)}
                            className="p-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors" title="Delete">
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
                  of <span className="font-semibold text-gray-600 dark:text-gray-300">{processed.length}</span> categories
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

      {/* ── Modals ── */}
      <ShowCategoryModal
        open={!!showTarget} category={showTarget}
        onClose={() => setShowTarget(null)}
        onEdit={cat => setEditTarget(cat)}
        onDelete={cat => setDeleteTarget(cat)}
      />
      <CreateCategoryModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={() => { toast.success('Category created successfully!'); fetchCategories(); }}
      />
      <EditCategoryModal
        open={!!editTarget} category={editTarget}
        onClose={() => setEditTarget(null)}
        onSuccess={() => { toast.success('Category updated successfully!'); fetchCategories(); }}
      />
      <DeleteCategoryModal
        open={!!deleteTarget} category={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onSuccess={() => fetchCategories()}
      />
      <ConfirmModal
        open={showDeleteSelected} title="Delete Selected" loading={deleteSelLoading}
        onConfirm={handleDeleteSelected} onClose={() => setShowDeleteSelected(false)}
        description={<>Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">{selected.length} categories</span>? This action <span className="text-red-500 font-medium">cannot be undone</span>.</>}
      />
      <ConfirmModal
        open={showDeleteAll} title="Delete All Categories" confirmLabel="Delete All" loading={deleteAllLoading}
        onConfirm={handleDeleteAll} onClose={() => setShowDeleteAll(false)}
        description={<>Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">all {categories.length} categories</span>? This action <span className="text-red-500 font-medium">cannot be undone</span> and will remove all associated images.</>}
      />
    </div>
  );
}