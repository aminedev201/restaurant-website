'use client';

import { X, Calendar, Clock, ImageOff, Tag, AlignLeft, Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { Category } from '@/lib/adminServiceApi';

interface Props {
  open: boolean;
  category: Category | null;
  onClose: () => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export default function ShowCategoryModal({ open, category, onClose, onEdit, onDelete }: Props) {
  if (!open || !category) return null;

  const handleEdit   = () => { onClose(); onEdit(category); };
  const handleDelete = () => { onClose(); onDelete(category); };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

        {/* Modal */}
        <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh]">

          {/* Header — fixed */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">Category Details</h2>
            <button onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Image banner — fixed (never scrolls) */}
          <div className="relative h-52 bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0">
            {category.image_url ? (
              <>
                <div
                  className="absolute inset-0 scale-110 blur-md opacity-40"
                  style={{ backgroundImage: `url(${category.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                />
                <img src={category.image_url} alt={category.name} className="relative z-10 w-full h-full object-contain" />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <ImageOff size={32} className="text-gray-300 dark:text-gray-600" />
                <p className="text-sm text-gray-400">No image</p>
              </div>
            )}
            {/* Status badge */}
            <div className="absolute top-3 left-3 z-20">
              <span className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                category.status
                  ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                  : 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'
              }`}>
                {category.status ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
                {category.status ? 'Active' : 'Inactive'}
              </span>
            </div>
            {/* Floating action buttons */}
            <div className="absolute top-3 right-3 z-20 flex gap-2">
              <button onClick={handleEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-brand-600 dark:text-brand-400 text-xs font-semibold border border-white/50 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-900 shadow-sm transition-colors">
                <Edit2 size={13} /> Edit
              </button>
              <button onClick={handleDelete}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-red-500 text-xs font-semibold border border-white/50 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-900 shadow-sm transition-colors">
                <Trash2 size={13} /> Delete
              </button>
            </div>
          </div>

          {/* Scrollable body */}
          <div className="overflow-y-auto flex-1">
            <div className="p-6 space-y-4">

              {/* Name */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Tag size={16} className="text-brand-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5">Name</p>
                  <p className="font-semibold text-gray-900 dark:text-white text-base">{category.name}</p>
                </div>
              </div>

              {/* Description */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shrink-0 mt-0.5">
                  <AlignLeft size={16} className="text-purple-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5">Description</p>
                  {category.description ? (
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{category.description}</p>
                  ) : (
                    <p className="text-sm text-gray-300 dark:text-gray-600 italic">No description provided</p>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  category.status
                    ? 'bg-emerald-50 dark:bg-emerald-900/20'
                    : 'bg-red-50 dark:bg-red-900/20'
                }`}>
                  {category.status
                    ? <ToggleRight size={16} className="text-emerald-500" />
                    : <ToggleLeft size={16} className="text-red-400" />}
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5">Status</p>
                  <p className={`text-sm font-semibold ${category.status ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                    {category.status ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <Calendar size={15} className="text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Created</p>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {new Date(category.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(category.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <Clock size={15} className="text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Updated</p>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {new Date(category.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(category.updated_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer — fixed */}
          <div className="flex gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
            <button onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Close
            </button>
            <button onClick={handleDelete}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 text-sm font-semibold transition-colors">
              <Trash2 size={15} /> Delete
            </button>
            <button onClick={handleEdit}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-colors">
              <Edit2 size={15} /> Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}