'use client';

import { useEffect, useState } from 'react';
import { MapPin, Phone, Mail, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { parseApiErrors } from '@/lib/parseApiErrors';
import { Company, companyApi, contactApi } from '@/lib/publicService.Api';

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800 ${className}`} />;
}

// ── Validation ────────────────────────────────────────────────────────────────
type FormData = { name: string; email: string; subject: string; message: string };

function validateForm(form: FormData): Record<string, string> {
  const errs: Record<string, string> = {};

  if (!form.name.trim())
    errs.name = 'Name is required.';
  else if (form.name.trim().length < 2)
    errs.name = 'Name must be at least 2 characters.';
  else if (form.name.length > 255)
    errs.name = 'Name must not exceed 255 characters.';

  if (!form.email.trim())
    errs.email = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errs.email = 'Please enter a valid email address.';
  else if (form.email.length > 255)
    errs.email = 'Email must not exceed 255 characters.';

  if (!form.subject.trim())
    errs.subject = 'Subject is required.';
  else if (form.subject.trim().length < 3)
    errs.subject = 'Subject must be at least 3 characters.';
  else if (form.subject.length > 255)
    errs.subject = 'Subject must not exceed 255 characters.';

  if (!form.message.trim())
    errs.message = 'Message is required.';
  else if (form.message.trim().length < 10)
    errs.message = 'Message must be at least 10 characters.';
  else if (form.message.length > 5000)
    errs.message = 'Message must not exceed 5000 characters.';

  return errs;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ContactClient() {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<FormData>({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    companyApi.get()
      .then(res => setCompany(res.data ?? null))
      .catch(() => setCompany(null))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, subject: true, message: true });
    const errs = validateForm(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    setErrors({});
    try {
      await contactApi.send(form);
      setSent(true);
    } catch (err) {
      setErrors(parseApiErrors(err));
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = (err?: string) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors
     bg-white dark:bg-gray-800/60
     text-gray-900 dark:text-white
     placeholder-gray-400 dark:placeholder-gray-500
     ${err
      ? 'border-red-400 dark:border-red-500 focus:border-red-400'
      : 'border-gray-200 dark:border-gray-700 focus:border-brand-500 dark:focus:border-brand-400'}`;

  const phones = company?.phones?.filter(Boolean) ?? [];
  const emails = company?.emails?.filter(Boolean) ?? [];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">

      {/* ── Hero with background image ── */}
      <div className="relative bg-gray-800 text-white pb-24 pt-36 text-center overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('/imgs/contact.jpg')" }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/60 via-gray-950/40 to-gray-950/80" />
        {/* Content */}
        <div className="relative z-10">
          <p className="text-brand-400 uppercase tracking-widest text-sm mb-3 font-medium">Get In Touch</p>
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-4">Contact Us</h1>
          <p className="text-gray-300 text-base max-w-md mx-auto">
            We'd love to hear from you. Reach out for reservations, inquiries, or just to say hello.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-12">

        {/* ── Info ── */}
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-6">Visit Us</h2>

          <div className="space-y-4">

            {/* Address card */}
            {loading ? (
              <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            ) : company?.address ? (
              <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/30 rounded-lg flex items-center justify-center shrink-0">
                  <MapPin size={18} className="text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Address</p>
                  <p className="text-gray-800 dark:text-gray-200 text-sm font-medium">{company.address}</p>
                </div>
              </div>
            ) : null}

            {/* Phones — one card, all numbers listed */}
            {loading ? (
              <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
            ) : phones.length > 0 ? (
              <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/30 rounded-lg flex items-center justify-center shrink-0">
                  <Phone size={18} className="text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
                    {phones.length > 1 ? 'Phone Numbers' : 'Phone'}
                  </p>
                  <div className="space-y-1">
                    {phones.map((p, i) => (
                      <a
                        key={i}
                        href={`tel:${p}`}
                        className="block text-sm font-medium text-gray-800 dark:text-gray-200 hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
                      >
                        {p}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {/* Emails — one card, all addresses listed */}
            {loading ? (
              <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-36" />
                </div>
              </div>
            ) : emails.length > 0 ? (
              <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/30 rounded-lg flex items-center justify-center shrink-0">
                  <Mail size={18} className="text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
                    {emails.length > 1 ? 'Email Addresses' : 'Email'}
                  </p>
                  <div className="space-y-1">
                    {emails.map((em, i) => (
                      <a
                        key={i}
                        href={`mailto:${em}`}
                        className="block text-sm font-medium text-gray-800 dark:text-gray-200 hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
                      >
                        {em}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

          </div>

          {/* Map */}
          <div className="mt-6 rounded-2xl overflow-hidden h-52 border border-gray-100 dark:border-gray-800">
            {loading ? (
              <Skeleton className="w-full h-full rounded-none" />
            ) : company?.location_url ? (
              <iframe
                src={company.location_url}
                className="w-full h-full"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 gap-2">
                <MapPin size={24} />
                <span className="text-sm">No location set</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Form ── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-8">
          {sent ? (
            <div className="text-center py-12 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center">
                <CheckCircle2 size={36} className="text-brand-500" />
              </div>
              <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white">Message Sent!</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">We'll get back to you within 24 hours.</p>
              <button
                onClick={() => {
                  setSent(false);
                  setForm({ name: '', email: '', subject: '', message: '' });
                  setTouched({});
                  setErrors({});
                }}
                className="mt-2 text-sm text-brand-500 hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-2">Send a Message</h2>

              {errors.api && (
                <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
                  {errors.api}
                </p>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={form.name}
                    onChange={handleChange('name')}
                    onBlur={handleBlur('name')}
                    className={inputCls(errors.name)}
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="you@email.com"
                    value={form.email}
                    onChange={handleChange('email')}
                    onBlur={handleBlur('email')}
                    className={inputCls(errors.email)}
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="How can we help?"
                  value={form.subject}
                  onChange={handleChange('subject')}
                  onBlur={handleBlur('subject')}
                  className={inputCls(errors.subject)}
                />
                {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={5}
                  placeholder="Your message..."
                  value={form.message}
                  onChange={handleChange('message')}
                  onBlur={handleBlur('message')}
                  className={`${inputCls(errors.message)} resize-none`}
                />
                {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? (
                  <><Loader2 size={16} className="animate-spin" /> Sending…</>
                ) : (
                  <><Send size={16} /> Send Message</>
                )}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}