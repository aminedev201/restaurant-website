'use client';

import { RefreshCw, Calendar, Clock, Users, X, MessageSquare, CheckCircle2, XCircle, Hourglass, Ban } from 'lucide-react';
import { Reservation } from '@/lib/userServiceApi';

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function statusBadge(status: Reservation['status']) {
  switch (status) {
    case 'confirmed': return { icon: <CheckCircle2 size={11} />, cls: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400', label: 'Confirmed' };
    case 'canceled':  return { icon: <Ban size={11} />,          cls: 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400',               label: 'Canceled'  };
    default:          return { icon: <Hourglass size={11} />,    cls: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',       label: 'Pending'   };
  }
}

export function fmtDate(date: string) {
  return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function fmtTime(time: string) {
  const [h, m] = time.split(':');
  const d = new Date(); d.setHours(+h, +m);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  reservation: Reservation | null;
  open: boolean;
  onClose: () => void;
  onCancel: (r: Reservation) => void;
  cancelling: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ShowReservationModal({ reservation, open, onClose, onCancel, cancelling }: Props) {
  if (!open || !reservation) return null;
  const badge = statusBadge(reservation.status);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center">
                <Calendar size={17} className="text-brand-500" />
              </div>
              <div>
                <h2 className="font-bold text-base text-gray-900 dark:text-white">Reservation Details</h2>
                <p className="text-xs text-gray-400">#{reservation.id}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">

            {/* Status */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Status</span>
              <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${badge.cls}`}>
                {badge.icon} {badge.label}
              </span>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar size={13} className="text-brand-500" />
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Date</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{fmtDate(reservation.date)}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Clock size={13} className="text-purple-500" />
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Time</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{fmtTime(reservation.time)}</p>
              </div>
            </div>

            {/* Guests */}
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                <Users size={14} className="text-blue-500" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Guests</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {reservation.guests} {reservation.guests === 1 ? 'person' : 'people'}
                </p>
              </div>
            </div>

            {/* Special requests */}
            {reservation.special_requests && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="flex items-center gap-2 mb-1.5">
                  <MessageSquare size={13} className="text-amber-500" />
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Special Requests</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{reservation.special_requests}</p>
              </div>
            )}

            {/* Submitted */}
            <p className="text-xs text-gray-400 text-center">
              Submitted on{' '}
              {new Date(reservation.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800">
            <button onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Close
            </button>
            {reservation.status === 'pending' && (
              <button onClick={() => onCancel(reservation)} disabled={cancelling}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors disabled:opacity-60">
                {cancelling ? <RefreshCw size={14} className="animate-spin" /> : <XCircle size={14} />}
                {cancelling ? 'Cancelling...' : 'Cancel Reservation'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}