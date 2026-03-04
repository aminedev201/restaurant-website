'use client';

import { useEffect, useState } from 'react';
import { X, Loader2, CalendarDays, Clock, Users, FileText, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { ReservationApi, ReservationWithUser } from '@/lib/adminServiceApi';
import { parseApiErrors } from '@/lib/parseApiErrors';

interface Props {
  open: boolean;
  reservation: ReservationWithUser | null;
  onClose: () => void;
  onSuccess: (updated: ReservationWithUser) => void;
}

type FormData = {
  date: string;
  time: string;
  guests: string;
  status: 'pending' | 'confirmed' | 'canceled';
  special_requests: string;
};

function validateForm(form: FormData): Record<string, string> {
 const errs: Record<string, string> = {};

  const todayStr = new Date().toISOString().split('T')[0];

  if (!form.date.trim())
    errs.date = 'Date is required.';
  else if (new Date(form.date) < new Date(new Date().toDateString()))
    errs.date = 'Date must be today or in the future.';

  if (!form.time.trim()) {
    errs.time = 'Time is required.';
  } else if (!/^\d{2}:\d{2}$/.test(form.time)) {
    errs.time = 'Time must be in HH:MM format.';
  } else if (form.date === todayStr) {
    // If today is selected, time must be in the future
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [h, m] = form.time.split(':').map(Number);
    if (h * 60 + m <= currentMinutes) {
      errs.time = 'Time must be in the future for today\'s date.';
    }
  }
  
  const g = parseInt(form.guests);
  if (!form.guests.trim())
    errs.guests = 'Number of guests is required.';
  else if (isNaN(g) || g < 1)
    errs.guests = 'At least 1 guest is required.';
  else if (g > 4)
    errs.guests = 'Maximum 4 guests allowed.';

  if (!form.status)
    errs.status = 'Status is required.';

  if (form.special_requests.length > 500)
    errs.special_requests = 'Special requests may not exceed 500 characters.';

  return errs;
}

const STATUS_OPTIONS: { value: FormData['status']; label: string; icon: React.ElementType; cls: string }[] = [
  { value: 'pending',   label: 'Pending',   icon: AlertCircle,  cls: 'border-amber-300  dark:border-amber-600  bg-amber-50  dark:bg-amber-900/20  text-amber-600  dark:text-amber-400' },
  { value: 'confirmed', label: 'Confirmed', icon: CheckCircle2, cls: 'border-emerald-300 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' },
  { value: 'canceled',  label: 'Canceled',  icon: XCircle,      cls: 'border-red-300    dark:border-red-600    bg-red-50    dark:bg-red-900/20    text-red-600    dark:text-red-400' },
];

export default function EditReservationModal({ open, reservation, onClose, onSuccess }: Props) {
  const [form, setForm]         = useState<FormData>({ date: '', time: '', guests: '1', status: 'pending', special_requests: '' });
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [touched, setTouched]   = useState<Record<string, boolean>>({});
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    if (!open || !reservation) return;
    setForm({
      date:             reservation.date.slice(0, 10),
      time:             reservation.time.slice(0, 5),
      guests:           String(reservation.guests),
      status:           reservation.status,
      special_requests: reservation.special_requests ?? '',
    });
    setErrors({});
    setTouched({});
  }, [open, reservation]);

  if (!open || !reservation) return null;

  const handleChange = (key: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const val = e.target.value;
      setForm(p => ({ ...p, [key]: val }));
      if (touched[key]) {
        const errs = validateForm({ ...form, [key]: val });
        setErrors(p => ({ ...p, [key]: errs[key] ?? '' }));
      }
    };

  const handleBlur = (key: keyof FormData) => () => {
    setTouched(p => ({ ...p, [key]: true }));
    const errs = validateForm(form);
    setErrors(p => ({ ...p, [key]: errs[key] ?? '' }));
  };

  const handleStatusChange = (val: FormData['status']) => {
    setForm(p => ({ ...p, status: val }));
    setTouched(p => ({ ...p, status: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ date: true, time: true, guests: true, status: true, special_requests: true });
    const errs = validateForm(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    try {
      const res = await ReservationApi.update(reservation.id, {
        date:             form.date,
        time:             form.time,
        guests:           parseInt(form.guests),
        status:           form.status,
        special_requests: form.special_requests || undefined,
      });
      onSuccess(res.data);
      onClose();
    } catch (err) {
      setErrors(parseApiErrors(err));
    } finally {
      setSaving(false);
    }
  };

  const inputCls = (err?: string) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors
     bg-white dark:bg-gray-800
     text-gray-900 dark:text-white
     placeholder-gray-400 dark:placeholder-gray-500
     ${err ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-gray-700 focus:border-brand-500 dark:focus:border-brand-400'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-2">
            <CalendarDays size={16} className="text-brand-500" />
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">Edit Reservation</h2>
          </div>
          <button onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} noValidate className="overflow-y-auto flex-1 p-6 space-y-5">

          {errors.api && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
              {errors.api}
            </p>
          )}

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                <CalendarDays size={12} /> Date <span className="text-red-500">*</span>
              </label>
              <input type="date" value={form.date}
                onChange={handleChange('date')} onBlur={handleBlur('date')}
                className={inputCls(errors.date)} />
              {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                <Clock size={12} /> Time <span className="text-red-500">*</span>
              </label>
              <input type="time" value={form.time}
                onChange={handleChange('time')} onBlur={handleBlur('time')}
                className={inputCls(errors.time)} />
              {errors.time && <p className="text-xs text-red-500 mt-1">{errors.time}</p>}
            </div>
          </div>

          {/* Guests */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              <Users size={12} /> Guests <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map(n => (
                <button key={n} type="button"
                  onClick={() => { setForm(p => ({ ...p, guests: String(n) })); setTouched(p => ({ ...p, guests: true })); }}
                  className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                    form.guests === String(n)
                      ? 'border-brand-500 bg-brand-500 text-white'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-brand-400'
                  }`}>
                  {n}
                </button>
              ))}
            </div>
            {errors.guests && <p className="text-xs text-red-500 mt-1">{errors.guests}</p>}
          </div>

          {/* Status */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              Status <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {STATUS_OPTIONS.map(({ value, label, icon: Icon, cls }) => (
                <button key={value} type="button" onClick={() => handleStatusChange(value)}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    form.status === value
                      ? cls + ' border-current'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}>
                  <Icon size={12} /> {label}
                </button>
              ))}
            </div>
            {errors.status && <p className="text-xs text-red-500 mt-1">{errors.status}</p>}
          </div>

          {/* Special requests */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              <FileText size={12} /> Special Requests
              <span className="ml-auto text-gray-400">{form.special_requests.length}/500</span>
            </label>
            <textarea rows={3} value={form.special_requests}
              onChange={handleChange('special_requests')} onBlur={handleBlur('special_requests')}
              placeholder="Any dietary requirements, seating preferences..."
              className={`${inputCls(errors.special_requests)} resize-none`} />
            {errors.special_requests && <p className="text-xs text-red-500 mt-1">{errors.special_requests}</p>}
          </div>

        </form>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
          <button onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-colors disabled:opacity-60">
            {saving ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : 'Save Changes'}
          </button>
        </div>

      </div>
    </div>
  );
}