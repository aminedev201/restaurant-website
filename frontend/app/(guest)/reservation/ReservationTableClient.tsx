'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  CalendarCheck, Users, Clock, CheckCircle2,
  Loader2, UtensilsCrossed, CalendarDays,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { parseApiErrors } from '@/lib/parseApiErrors';
import { Company, companyApi, WorkingDay } from '@/lib/publicService.Api';
import { reservationApi } from '@/lib/UserServiceApi';

// ── Day helpers ────────────────────────────────────────────────────────────────
const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
type DayKey = typeof DAY_KEYS[number];

const DAY_LABELS: Record<DayKey, string> = {
  sun: 'Sunday', mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday',
  thu: 'Thursday', fri: 'Friday', sat: 'Saturday',
};

function getDayKey(dateStr: string): DayKey {
  return DAY_KEYS[new Date(dateStr + 'T00:00:00').getDay()];
}

function parseWorkingDays(raw: Company['working_datetime']): Record<string, WorkingDay> {
  if (!raw) return {};
  if (typeof raw === 'string') {
    try { return JSON.parse(raw); } catch { return {}; }
  }
  return raw as Record<string, WorkingDay>;
}

/** Generate 30-min slots between open and close, leaving 30 min before closing */
function generateSlots(open: string, close: string): string[] {
  const slots: string[] = [];
  const [oh, om] = open.split(':').map(Number);
  const [ch, cm] = close.split(':').map(Number);
  let minutes = oh * 60 + om;
  const end = ch * 60 + cm;
  while (minutes <= end - 30) {
    const h = String(Math.floor(minutes / 60)).padStart(2, '0');
    const m = String(minutes % 60).padStart(2, '0');
    slots.push(`${h}:${m}`);
    minutes += 30;
  }
  return slots;
}

// ── Types ──────────────────────────────────────────────────────────────────────
type FormData = {
  date: string;
  time: string;
  guests: string;
  special_requests: string;
};

// ── Validation ─────────────────────────────────────────────────────────────────
function validateForm(
  form: FormData,
  workingDays: Record<string, WorkingDay>,
): Record<string, string> {
  const errs: Record<string, string> = {};
  const today = new Date().toISOString().split('T')[0];

  if (!form.date.trim())
    errs.date = 'Please select a date.';
  else if (form.date < today)
    errs.date = 'Date must be today or in the future.';
  else {
    const day = workingDays[getDayKey(form.date)];
    if (day?.closed)
      errs.date = `We are closed on ${DAY_LABELS[getDayKey(form.date)]}s. Please pick another day.`;
  }

if (!form.time.trim()) {
  errs.time = 'Please select a time slot.';
} else {
  const todayStr = new Date().toISOString().split('T')[0];
  if (form.date === todayStr) {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [h, m] = form.time.split(':').map(Number);
    if (h * 60 + m <= currentMinutes) {
      errs.time = 'Please select a future time slot for today.';
    }
  }
}

  const guests = Number(form.guests);
  if (!form.guests || isNaN(guests) || guests < 1 || guests > 4)
    errs.guests = 'Guests must be between 1 and 4.';

  if (form.special_requests.length > 500)
    errs.special_requests = 'Special requests must not exceed 500 characters.';

  return errs;
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function ReservationTableClient() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [company, setCompany] = useState<Company | null>(null);
  const [companyLoading, setCompanyLoading] = useState(true);

  const [form, setForm] = useState<FormData>({ date: '', time: '', guests: '2', special_requests: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    companyApi.get()
      .then(res => setCompany(res.data ?? null))
      .catch(() => setCompany(null))
      .finally(() => setCompanyLoading(false));
  }, []);

  const workingDays = useMemo(
    () => parseWorkingDays(company?.working_datetime ?? null),
    [company],
  );

  const timeSlots = useMemo(() => {
  if (!form.date) return [];
  const day = workingDays[getDayKey(form.date)];
  if (!day || day.closed) return [];
  const slots = generateSlots(day.open, day.close);

  // If today is selected, filter out slots that are in the past
  const todayStr = new Date().toISOString().split('T')[0];
  if (form.date === todayStr) {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    return slots.filter(slot => {
      const [h, m] = slot.split(':').map(Number);
      return h * 60 + m > currentMinutes; // strictly greater so current slot isn't selectable
    });
  }

  return slots;
  }, [form.date, workingDays]);

  const selectedDayInfo = useMemo(() => {
    if (!form.date) return null;
    const key = getDayKey(form.date);
    const day = workingDays[key];
    if (!day) return null;
    return { key, label: DAY_LABELS[key], ...day };
  }, [form.date, workingDays]);

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const inputCls = (err?: string) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors
     bg-white dark:bg-gray-800/60 text-gray-900 dark:text-white
     placeholder-gray-400 dark:placeholder-gray-500
     ${err
      ? 'border-red-400 dark:border-red-500 focus:border-red-400'
      : 'border-gray-200 dark:border-gray-700 focus:border-brand-500 dark:focus:border-brand-400'}`;

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // reset time when date changes
    setForm(p => ({ ...p, date: val, time: '' }));
    if (touched.date) {
      const errs = validateForm({ ...form, date: val, time: '' }, workingDays);
      setErrors(p => ({ ...p, date: errs.date ?? '', time: '' }));
    }
  };

  const handleChange = (key: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const val = e.target.value;
      setForm(p => ({ ...p, [key]: val }));
      if (touched[key]) {
        const errs = validateForm({ ...form, [key]: val }, workingDays);
        setErrors(p => ({ ...p, [key]: errs[key] ?? '' }));
      }
    };

  const handleBlur = (key: keyof FormData) => () => {
    setTouched(p => ({ ...p, [key]: true }));
    const errs = validateForm(form, workingDays);
    setErrors(p => ({ ...p, [key]: errs[key] ?? '' }));
  };

  const handleTimeSelect = (t: string) => {
    setForm(p => ({ ...p, time: t }));
    setTouched(p => ({ ...p, time: true }));
    setErrors(p => ({ ...p, time: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    setTouched({ date: true, time: true, guests: true, special_requests: true });
    const errs = validateForm(form, workingDays);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    setErrors({});
    try {
      await reservationApi.store({
        date: form.date,
        time: form.time,
        guests: Number(form.guests),
        special_requests: form.special_requests || undefined,
      });
      setSubmitted(true);
    } catch (err) {
      setErrors(parseApiErrors(err));
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success ───────────────────────────────────────────────────────────────────
  if (submitted) return (
    <div className="pt-20 min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm max-w-md w-full p-10 text-center">
        <div className="w-16 h-16 bg-brand-50 dark:bg-brand-900/20 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={32} className="text-brand-500" />
        </div>
        <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-3">Reservation Requested!</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
          Your table for{' '}
          <strong className="text-gray-800 dark:text-gray-200">{form.guests} guest{Number(form.guests) > 1 ? 's' : ''}</strong>{' '}
          on <strong className="text-gray-800 dark:text-gray-200">{form.date}</strong>{' '}
          at <strong className="text-gray-800 dark:text-gray-200">{form.time}</strong> has been submitted.
        </p>
        <p className="text-sm text-gray-400 mb-8">We'll confirm your reservation shortly.</p>
        <button
          onClick={() => {
            setSubmitted(false);
            setForm({ date: '', time: '', guests: '2', special_requests: '' });
            setTouched({});
            setErrors({});
          }}
          className="btn-secondary w-full"
        >
          Make Another Reservation
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">

      {/* Hero */}
      <div className="relative bg-gray-800 text-white pb-24 pt-36 text-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('/imgs/reservation-table.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/60 via-gray-950/40 to-gray-950/80" />
        <div className="relative z-10">
          <p className="text-brand-400 uppercase tracking-widest text-sm mb-3 font-medium">Join Us</p>
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-4">Reserve a Table</h1>
          <p className="text-gray-300 text-base max-w-md mx-auto">
            Book your perfect dining experience. We'll take care of the rest.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-12">

        {/* ── Left ── */}
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-6">What to Expect</h2>

          <div className="space-y-4">
            {[
              { icon: CalendarCheck, label: 'Quick Confirmation', desc: 'Reservations are confirmed within a few hours of submission.' },
              { icon: Users, label: 'Up to 4 Guests', desc: 'Tables accommodate 1–4 guests. Contact us for larger groups.' },
              { icon: UtensilsCrossed, label: 'Special Requests', desc: 'Dietary needs, celebrations, seating preferences — just let us know.' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/30 rounded-lg flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">{label}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{desc}</p>
                </div>
              </div>
            ))}

            {/* Opening hours card */}
            <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
              <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/30 rounded-lg flex items-center justify-center shrink-0">
                <Clock size={18} className="text-brand-600 dark:text-brand-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Opening Hours</p>

                {companyLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex justify-between gap-4">
                        <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        <div className="h-3 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : Object.keys(workingDays).length > 0 ? (
                  <div className="space-y-1.5">
                    {DAY_KEYS.map(key => {
                      const day = workingDays[key];
                      if (!day) return null;
                      return (
                        <div key={key} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400 w-24 shrink-0">{DAY_LABELS[key]}</span>
                          {day.closed ? (
                            <span className="text-gray-400 dark:text-gray-600 italic text-xs">Closed</span>
                          ) : (
                            <span className="text-gray-800 dark:text-gray-200 font-medium tabular-nums">
                              {day.open} – {day.close}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">Hours not available.</p>
                )}
              </div>
            </div>
          </div>

          {/* Auth notice */}
          {!authLoading && !isAuthenticated && (
            <div className="mt-6 flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
              <span className="text-amber-500 text-base shrink-0 mt-0.5">⚠</span>
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Login required</p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                  You need to be logged in to make a reservation. Submitting will redirect you to the login page.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Form ── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-8">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-1">Your Reservation</h2>

            {errors.api && (
              <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
                {errors.api}
              </p>
            )}

            {/* Date + Guests */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  min={today}
                  value={form.date}
                  onChange={handleDateChange}
                  onBlur={handleBlur('date')}
                  className={inputCls(errors.date)}
                />
                {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Guests <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.guests}
                  onChange={handleChange('guests')}
                  onBlur={handleBlur('guests')}
                  className={inputCls(errors.guests)}
                >
                  {[1, 2, 3, 4].map(n => (
                    <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                  ))}
                </select>
                {errors.guests && <p className="text-xs text-red-500 mt-1">{errors.guests}</p>}
              </div>
            </div>

            {/* Selected day banner */}
            {selectedDayInfo && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border ${selectedDayInfo.closed
                ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
                : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                }`}>
                <Clock size={12} />
                {selectedDayInfo.closed
                  ? `Closed on ${selectedDayInfo.label}s — please pick another day.`
                  : `${selectedDayInfo.label}: open ${selectedDayInfo.open} – ${selectedDayInfo.close}`
                }
              </div>
            )}

            {/* Time slots */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                Preferred Time <span className="text-red-500">*</span>
              </label>

              {companyLoading ? (
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-9 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
                  ))}
                </div>
              ) : !form.date ? (
                <p className="text-xs text-gray-400 italic py-2">Select a date to see available time slots.</p>
              ) : selectedDayInfo?.closed ? (
                <p className="text-xs text-red-400 italic py-2">No slots available — we're closed on this day.</p>
              ) : timeSlots.length === 0 ? (
                <p className="text-xs text-gray-400 italic py-2">No time slots available for this day.</p>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleTimeSelect(t)}
                      className={`py-2 text-sm rounded-xl border font-medium transition-all
                        ${form.time === t
                          ? 'bg-brand-500 border-brand-500 text-white shadow-sm'
                          : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-brand-400 dark:hover:border-brand-500 bg-white dark:bg-gray-800/60'
                        }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
              {errors.time && <p className="text-xs text-red-500 mt-1">{errors.time}</p>}
            </div>

            {/* Special requests */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Special Requests <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                rows={4}
                placeholder="Allergies, celebrations, seating preferences..."
                value={form.special_requests}
                onChange={handleChange('special_requests')}
                onBlur={handleBlur('special_requests')}
                className={`${inputCls(errors.special_requests)} resize-none`}
              />
              <div className="flex items-center justify-between mt-1">
                {errors.special_requests
                  ? <p className="text-xs text-red-500">{errors.special_requests}</p>
                  : <span />
                }
                <span className={`text-xs ml-auto ${form.special_requests.length > 450 ? 'text-amber-500' : 'text-gray-400'}`}>
                  {form.special_requests.length}/500
                </span>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting
                ? <><Loader2 size={16} className="animate-spin" /> Submitting…</>
                : <><CalendarDays size={16} /> Confirm Reservation</>
              }
            </button>

            {/* Login hint */}
            {!authLoading && !isAuthenticated && (
              <p className="text-center text-xs text-gray-400">
                Not logged in?{' '}
                <button
                  type="button"
                  onClick={() => router.push('/login')}
                  className="text-brand-500 hover:underline font-medium"
                >
                  Sign in first
                </button>
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}