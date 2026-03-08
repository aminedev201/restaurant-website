'use client';

import {
  X, Calendar, Clock, ImageOff, Edit2, Trash2,
  ToggleLeft, ToggleRight, AlignLeft, User, Briefcase,
  Facebook, Instagram, Twitter, Youtube, Linkedin,
} from 'lucide-react';
import { Chef } from '@/lib/adminServiceApi';

interface Props {
  open: boolean;
  chef: Chef | null;
  onClose: () => void;
  onEdit: (chef: Chef) => void;
  onDelete: (chef: Chef) => void;
}

const SOCIAL_ICONS: Record<string, { icon: React.ElementType; color: string }> = {
  facebook:  { icon: Facebook,  color: 'text-blue-600' },
  instagram: { icon: Instagram, color: 'text-pink-500' },
  twitter:   { icon: Twitter,   color: 'text-sky-500'  },
  youtube:   { icon: Youtube,   color: 'text-red-500'  },
  linkedin:  { icon: Linkedin,  color: 'text-blue-700' },
};

export default function ShowChefModal({ open, chef, onClose, onEdit, onDelete }: Props) {
  if (!open || !chef) return null;

  const handleEdit   = () => { onClose(); onEdit(chef); };
  const handleDelete = () => { onClose(); onDelete(chef); };

  const socialEntries = chef.social_media
    ? Object.entries(chef.social_media).filter(([, v]) => v)
    : [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

        <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh]">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">Chef Details</h2>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Image banner */}
          <div className="relative h-52 bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0">
            {chef.image_url ? (
              <>
                <div className="absolute inset-0 scale-110 blur-md opacity-40"
                  style={{ backgroundImage: `url(${chef.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <img src={chef.image_url} alt={chef.fullname} className="relative z-10 w-full h-full object-contain" />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <ImageOff size={32} className="text-gray-300 dark:text-gray-600" />
                <p className="text-sm text-gray-400">No photo</p>
              </div>
            )}
            {/* Status badge */}
            <div className="absolute top-3 left-3 z-20">
              <span className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                chef.status
                  ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                  : 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'
              }`}>
                {chef.status ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
                {chef.status ? 'Active' : 'Inactive'}
              </span>
            </div>
            {/* Action buttons */}
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

          {/* Body */}
          <div className="overflow-y-auto flex-1">
            <div className="p-6 space-y-4">

              {/* Full name */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center shrink-0 mt-0.5">
                  <User size={16} className="text-brand-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5">Full Name</p>
                  <p className="font-semibold text-gray-900 dark:text-white text-base">{chef.fullname}</p>
                </div>
              </div>

              {/* Position */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Briefcase size={16} className="text-blue-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5">Position</p>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{chef.position}</p>
                </div>
              </div>

              {/* Short Description */}
              {chef.short_desc && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shrink-0 mt-0.5">
                    <AlignLeft size={16} className="text-purple-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5">Bio</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed break-words">{chef.short_desc}</p>
                  </div>
                </div>
              )}

              {/* Social Media */}
              {socialEntries.length > 0 && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">Social Media</p>
                  <div className="flex flex-wrap gap-2">
                    {socialEntries.map(([platform, url]) => {
                      const meta = SOCIAL_ICONS[platform];
                      if (!meta) return null;
                      const Icon = meta.icon;
                      return (
                        <a key={platform} href={url as string} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-brand-400 dark:hover:border-brand-500 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                          <Icon size={14} className={meta.color} />
                          {platform}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <Calendar size={15} className="text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Created</p>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {new Date(chef.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(chef.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <Clock size={15} className="text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Updated</p>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {new Date(chef.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(chef.updated_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
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