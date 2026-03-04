'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  Search, Trash2, RefreshCw, AlertCircle,
  ChevronLeft, ChevronRight, ArrowUp, ArrowDown, ChevronsUpDown,
  Trash, Eye, Mail, MailOpen,
} from 'lucide-react';
import { contactMessagesApi, ContactMessage } from '@/lib/adminServiceApi';
import ConfirmModal from '@/components/admin/ui/ConfirmModal';
import ShowContactMessageModal from '@/components/admin/contact-messages/ShowContactMessageModal';

type SortKey = 'name' | 'email' | 'subject' | 'created_at';
type SortDir = 'asc' | 'desc';
const PER_PAGE_OPTIONS = [5, 25, 50, 100] as const;

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown size={13} className="text-gray-300 dark:text-gray-600 ml-1 inline" />;
  return sortDir === 'asc'
    ? <ArrowUp size={13} className="text-brand-500 ml-1 inline" />
    : <ArrowDown size={13} className="text-brand-500 ml-1 inline" />;
}

export default function ContactMessagesClient() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState<number>(5);
  const [selected, setSelected] = useState<number[]>([]);

  // Modals
  const [showTarget, setShowTarget] = useState<ContactMessage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null);
  const [showDeleteSelected, setShowDeleteSelected] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteSelLoading, setDeleteSelLoading] = useState(false);

  // ─── Fetch ────────────────────────────────────────────────────────────────
  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await contactMessagesApi.getAll();
      setMessages(res.data);
    } catch {
      toast.error('Failed to load messages.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  // ─── Sort + Filter + Paginate ─────────────────────────────────────────────
  const processed = useMemo(() => {
    let data = [...messages];
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      data = data.filter(m => m.status === statusFilter);
    }
    data.sort((a, b) => {
      const cmp = String(a[sortKey] ?? '').localeCompare(String(b[sortKey] ?? ''), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return data;
  }, [messages, search, statusFilter, sortKey, sortDir]);

  const totalPages = Math.ceil(processed.length / perPage);
  const pageItems = processed.slice((page - 1) * perPage, page * perPage);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  };

  // ─── Selection ────────────────────────────────────────────────────────────
  const allPageSelected = pageItems.length > 0 && pageItems.every(m => selected.includes(m.id));
  const toggleAll = () => {
    if (allPageSelected) setSelected(s => s.filter(id => !pageItems.find(m => m.id === id)));
    else setSelected(s => [...new Set([...s, ...pageItems.map(m => m.id)])]);
  };
  const toggleOne = (id: number) =>
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  // ─── Delete handlers ──────────────────────────────────────────────────────
  const handleDeleteOne = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await contactMessagesApi.destroy(deleteTarget.id);
      toast.success('Message deleted.');
      setDeleteTarget(null);
      setSelected(s => s.filter(id => id !== deleteTarget.id));
      fetchMessages();
    } catch {
      toast.error('Failed to delete message.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteSelected = async () => {
    setDeleteSelLoading(true);
    try {
      await contactMessagesApi.destroySelected(selected);
      toast.success(`${selected.length} messages deleted.`);
      setSelected([]);
      setShowDeleteSelected(false);
      fetchMessages();
    } catch {
      toast.error('Failed to delete selected messages.');
    } finally {
      setDeleteSelLoading(false);
    }
  };

  const handleShow = (msg: ContactMessage) => {
    setShowTarget(msg);
    if (msg.status === 'unread') {
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: 'read' } : m));
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

  const unreadCount = messages.filter(m => m.status === 'unread').length;

  return (
    <div className="">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contact Messages</h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-brand-500 text-white text-xs font-bold">
                {unreadCount}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{messages.length} total messages</p>
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

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-2 my-2 w-full">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search by name, email, subject or message..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-brand-400 dark:focus:border-brand-500 transition-colors" />
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 shrink-0">
            {(['all', 'unread', 'read'] as const).map(s => (
              <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${statusFilter === s
                    ? s === 'unread'
                      ? 'bg-brand-500 text-white shadow-sm'
                      : s === 'read'
                        ? 'bg-gray-400 dark:bg-gray-600 text-white shadow-sm'
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
              className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none focus:border-brand-400 dark:focus:border-brand-500 transition-colors">
              {PER_PAGE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          <button onClick={fetchMessages}
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
            <p className="text-sm text-gray-400">Loading messages...</p>
          </div>
        ) : pageItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
              <AlertCircle size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">No messages found</p>
            {search && <p className="text-sm text-gray-400">Try adjusting your search query</p>}
          </div>
        ) : (
          <>
            {/* No overflow-x-auto — columns hide responsively instead */}
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  <th className="px-5 py-3.5 w-10">
                    <input type="checkbox" checked={allPageSelected} onChange={toggleAll}
                      className="rounded border-gray-300 dark:border-gray-600 text-brand-500 focus:ring-brand-400 cursor-pointer" />
                  </th>
                  <th className="px-2 py-3.5 w-4" />
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider cursor-pointer select-none" onClick={() => toggleSort('name')}>
                    Name <SortIcon col="name" sortKey={sortKey} sortDir={sortDir} />
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider cursor-pointer select-none hidden md:table-cell" onClick={() => toggleSort('email')}>
                    Email <SortIcon col="email" sortKey={sortKey} sortDir={sortDir} />
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider cursor-pointer select-none hidden lg:table-cell" onClick={() => toggleSort('subject')}>
                    Subject <SortIcon col="subject" sortKey={sortKey} sortDir={sortDir} />
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Status
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider hidden xl:table-cell cursor-pointer select-none" onClick={() => toggleSort('created_at')}>
                    Date <SortIcon col="created_at" sortKey={sortKey} sortDir={sortDir} />
                  </th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {pageItems.map(msg => (
                  <tr
                    key={msg.id}
                    onClick={() => handleShow(msg)}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors cursor-pointer
                      ${selected.includes(msg.id) ? 'bg-brand-50/50 dark:bg-brand-900/10' : ''}
                      ${msg.status === 'unread' ? 'font-semibold' : ''}`}
                  >
                    <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                      <input type="checkbox" checked={selected.includes(msg.id)} onChange={() => toggleOne(msg.id)}
                        className="rounded border-gray-300 dark:border-gray-600 text-brand-500 focus:ring-brand-400 cursor-pointer" />
                    </td>
                    <td className="px-2 py-3.5">
                      {msg.status === 'unread' && (
                        <span className="inline-block w-2 h-2 rounded-full bg-brand-500" />
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-gray-900 dark:text-white max-w-[140px] truncate">
                      {msg.name}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 max-w-[180px] truncate hidden md:table-cell">
                      {msg.email}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 dark:text-gray-300 max-w-[200px] truncate hidden lg:table-cell">
                      {msg.subject}
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <span className={`flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-lg text-xs font-medium ${msg.status === 'unread'
                          ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                        }`}>
                        {msg.status === 'unread' ? <Mail size={11} /> : <MailOpen size={11} />}
                        {msg.status === 'unread' ? 'Unread' : 'Read'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 dark:text-gray-500 text-xs hidden xl:table-cell whitespace-nowrap">
                      {new Date(msg.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => handleShow(msg)}
                          className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors" title="View">
                          <Eye size={14} />
                        </button>
                        <button onClick={() => setDeleteTarget(msg)}
                          className="p-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors" title="Delete">
                          <Trash2 size={14} />
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
                  of <span className="font-semibold text-gray-600 dark:text-gray-300">{processed.length}</span> messages
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
      <ShowContactMessageModal
        open={!!showTarget}
        message={showTarget}
        onClose={() => setShowTarget(null)}
        onDelete={msg => setDeleteTarget(msg)}
        onMarkedRead={id =>
          setMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'read' } : m))
        }
      />

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Message"
        loading={deleteLoading}
        onConfirm={handleDeleteOne}
        onClose={() => setDeleteTarget(null)}
        description={
          <>Are you sure you want to delete the message from{' '}
            <span className="font-semibold text-gray-900 dark:text-white">{deleteTarget?.name}</span>?{' '}
            This action <span className="text-red-500 font-medium">cannot be undone</span>.
          </>
        }
      />

      <ConfirmModal
        open={showDeleteSelected}
        title="Delete Selected Messages"
        loading={deleteSelLoading}
        onConfirm={handleDeleteSelected}
        onClose={() => setShowDeleteSelected(false)}
        description={
          <>Are you sure you want to delete{' '}
            <span className="font-semibold text-gray-900 dark:text-white">{selected.length} messages</span>?{' '}
            This action <span className="text-red-500 font-medium">cannot be undone</span>.
          </>
        }
      />
    </div>
  );
}