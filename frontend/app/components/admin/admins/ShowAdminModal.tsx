'use client';

import { useState } from 'react';
import {
  X, Calendar, Clock, Mail, Phone, User as UserIcon,
  ToggleLeft, ToggleRight, ShieldCheck, Loader2, CheckCircle2,
  Edit2, Trash2, KeyRound,
} from 'lucide-react';
import { adminApi } from '@/lib/adminServiceApi';
import { User } from '@/types';
import AvatarZoom from '@/components/admin/ui/AvatarZoom';
import toast from 'react-hot-toast';

interface Props {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onStatusChange: (updated: User) => void;
  onEdit: (user: User) => void;
  onChangePassword: (user: User) => void;
  onDelete: (user: User) => void;
}

export default function ShowAdminModal({ open, user, onClose, onStatusChange, onEdit, onChangePassword, onDelete }: Props) {
  const [toggling, setToggling] = useState(false);

  if (!open || !user) return null;

  const handleToggleStatus = async () => {
    setToggling(true);
    try {
      const res = await adminApi.updateStatus(user.id, !user.status);
      toast.success(`Admin ${res.data.status ? 'activated' : 'deactivated'} successfully.`);
      onStatusChange(res.data);
    } catch {
      toast.error('Failed to update admin status.');
    } finally {
      setToggling(false);
    }
  };

  const initials = user.fullname
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

        <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh]">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">Admin Details</h2>
            <button onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Avatar banner */}
          <div className="relative h-44 bg-gradient-to-br from-amber-500/20 via-amber-400/10 to-transparent dark:from-amber-900/40 dark:via-amber-900/20 dark:to-transparent overflow-hidden shrink-0 flex items-center justify-center">
            <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-amber-500/10 dark:bg-amber-500/5" />
            <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-amber-500/5 dark:bg-amber-500/5" />

            {user.avatar_url ? (
              <AvatarZoom
                url={user.avatar_url}
                name={user.fullname}
                size="w-20 h-20"
                className="relative z-10 border-4 border-white dark:border-gray-800 shadow-xl"
              />
            ) : (
              <div className="relative z-10 w-20 h-20 rounded-2xl bg-amber-500 flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-xl">
                <span className="text-white text-2xl font-bold">{initials}</span>
              </div>
            )}

            {/* Status badge */}
            <div className="absolute top-3 left-3 z-20">
              <span className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${user.status
                ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                : 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'
                }`}>
                {user.status ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
                {user.status ? 'Active' : 'Inactive'}
              </span>
            </div>

            {/* Email verified badge */}
            {user.email_verified_at && (
              <div className="absolute top-3 right-3 z-20">
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                  <CheckCircle2 size={11} /> Verified
                </span>
              </div>
            )}
          </div>

          {/* Scrollable body */}
          <div className="overflow-y-auto flex-1">
            <div className="p-6 space-y-4">

              {/* Full name */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0 mt-0.5">
                  <UserIcon size={16} className="text-amber-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5">Full Name</p>
                  <p className="font-semibold text-gray-900 dark:text-white text-base">{user.fullname}</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Mail size={16} className="text-blue-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5">Email</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 break-words">{user.email}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Phone size={16} className="text-purple-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5">Phone</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{user.phone}</p>
                </div>
              </div>

              {/* Role */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck size={16} className="text-amber-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5">Role</p>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs font-semibold capitalize">
                    <ShieldCheck size={11} /> {user.role}
                  </span>
                </div>
              </div>

              {/* Status toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${user.status ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'
                    }`}>
                    {user.status
                      ? <ToggleRight size={16} className="text-emerald-500" />
                      : <ToggleLeft size={16} className="text-red-400" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Account Status</p>
                    <p className={`text-xs font-medium mt-0.5 ${user.status ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                      {user.status ? 'Active — can access the panel' : 'Inactive — access is blocked'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleToggleStatus}
                  disabled={toggling}
                  className={`relative w-11 h-6 rounded-full transition-colors disabled:opacity-60 shrink-0 ${user.status ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}>
                  {toggling ? (
                    <Loader2 size={12} className="absolute inset-0 m-auto text-white animate-spin" />
                  ) : (
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${user.status ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                  )}
                </button>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <Calendar size={15} className="text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Joined</p>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {new Date(user.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(user.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <Clock size={15} className="text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Updated</p>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {new Date(user.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(user.updated_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 shrink-0 space-y-2">
            {/* Action buttons row */}
            <div className="flex gap-2">
              <button onClick={() => onEdit(user)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800 hover:bg-brand-100 dark:hover:bg-brand-900/30 text-sm font-medium transition-colors">
                <Edit2 size={14} /> Edit
              </button>
              <button onClick={() => onChangePassword(user)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 text-sm font-medium transition-colors">
                <KeyRound size={14} /> Password
              </button>
              <button onClick={() => onDelete(user)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 text-sm font-medium transition-colors">
                <Trash2 size={14} /> Delete
              </button>
            </div>
            {/* Toggle status + close row */}
            <div className="flex gap-2">
              <button onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Close
              </button>
              <button
                onClick={handleToggleStatus}
                disabled={toggling}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 ${user.status
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-500 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30'
                  : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
                  }`}>
                {toggling
                  ? <><Loader2 size={15} className="animate-spin" /> Updating...</>
                  : user.status
                    ? <><ToggleLeft size={15} /> Deactivate</>
                    : <><ToggleRight size={15} /> Activate</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}