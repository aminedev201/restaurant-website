'use client';

import {
  X, CalendarDays, Clock, Users, Trash2,
  User, AtSign, Phone, FileText, CheckCircle2,
  XCircle, AlertCircle,
} from 'lucide-react';
import { ReservationWithUser } from '@/lib/adminServiceApi';

interface Props {
  open: boolean;
  reservation: ReservationWithUser | null;
  onClose: () => void;
  onDelete: (r: ReservationWithUser) => void;
  onEdit: (r: ReservationWithUser) => void;
}

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   icon: AlertCircle,  cls: 'bg-amber-50  dark:bg-amber-900/20  text-amber-600  dark:text-amber-400'  },
  confirmed: { label: 'Confirmed', icon: CheckCircle2, cls: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' },
  canceled:  { label: 'Canceled',  icon: XCircle,      cls: 'bg-red-50    dark:bg-red-900/20    text-red-600    dark:text-red-400'    },
};

export default function ShowReservationModal({ open, reservation, onClose, onDelete, onEdit }: Props) {
  if (!open || !reservation) return null;

  const status = STATUS_CONFIG[reservation.status];
  const StatusIcon = status.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-2">
            <CalendarDays size={16} className="text-brand-500" />
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">Reservation Details</h2>
          </div>
          <button onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-4">

          {/* Status + ID */}
          <div className="flex items-center justify-between">
            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${status.cls}`}>
              <StatusIcon size={12} />
              {status.label}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">Reservation #{reservation.id}</span>
          </div>

          {/* Guest info */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl space-y-2.5">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Guest</p>
            {[
              { icon: User,   value: reservation.user?.fullname,  href: null },
              { icon: AtSign, value: reservation.user?.email, href: reservation.user?.email ? `mailto:${reservation.user.email}` : null },
              { icon: Phone,  value: (reservation.user as any)?.phone ?? null, href: (reservation.user as any)?.phone ? `tel:${(reservation.user as any).phone}` : null },
            ].filter(i => Boolean(i.value)).map(({ icon: Icon, value, href }) => (
              <div key={String(value)} className="flex items-center gap-2">
                <Icon size={13} className="text-gray-400 shrink-0" />
                {href ? (
                  <a href={href} className="text-sm text-gray-700 dark:text-gray-300 hover:text-brand-500 transition-colors break-all">{value}</a>
                ) : (
                  <span className="text-sm text-gray-700 dark:text-gray-300 break-words">{value}</span>
                )}
              </div>
            ))}
          </div>

          {/* Date / Time / Guests */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: CalendarDays, label: 'Date',   value: new Date(reservation.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) },
              { icon: Clock,        label: 'Time',   value: reservation.time.slice(0, 5) },
              { icon: Users,        label: 'Guests', value: String(reservation.guests) },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-center">
                <Icon size={16} className="text-brand-500 mx-auto mb-1" />
                <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{value}</p>
              </div>
            ))}
          </div>

          {/* Special requests */}
          {reservation.special_requests && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <div className="flex items-center gap-1.5 mb-2">
                <FileText size={13} className="text-gray-400" />
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Special Requests</p>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap break-words">
                {reservation.special_requests}
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
          <button onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Close
          </button>
          <button onClick={() => { onClose(); onEdit(reservation); }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-colors">
            Edit
          </button>
          <button onClick={() => { onClose(); onDelete(reservation); }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors">
            <Trash2 size={14} />
          </button>
        </div>

      </div>
    </div>
  );
}