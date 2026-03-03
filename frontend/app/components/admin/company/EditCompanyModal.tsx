'use client';

import { useEffect, useRef, useState } from 'react';
import { X, ImageIcon, Loader2, Plus, Trash2 } from 'lucide-react';
import { companyApi, Company } from '@/lib/adminServiceApi';
import { parseApiErrors } from '@/lib/parseApiErrors';
import { useCompany } from '@/context/CompanyContext';

interface Props {
  open: boolean;
  company: Company | null;
  onClose: () => void;
  onSuccess: () => void;
}

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_LABELS: Record<string, string> = {
  mon: 'Mon', tue: 'Tue', wed: 'Wed',
  thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun',
};

type DaySchedule = { open: string; close: string; closed: boolean };
type Schedule    = Record<string, DaySchedule>;

const defaultSchedule = (): Schedule =>
  Object.fromEntries(
    DAYS.map(d => [d, { open: '09:00', close: '22:00', closed: false }])
  );

// ✅ NEW: safely parse whether API returns a string or already-parsed object
const parseWorkingDatetime = (raw: unknown): Schedule | null => {
  if (!raw) return null;
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (typeof parsed === 'object' && parsed !== null) return parsed as Schedule;
  } catch {
    // malformed JSON
  }
  return null;
};

export default function EditCompanyModal({ open, company, onClose, onSuccess }: Props) {
  const [name, setName]               = useState('');
  const [address, setAddress]         = useState('');
  const [locationUrl, setLocationUrl] = useState('');
  const [phones, setPhones]           = useState<string[]>(['']);
  const [emails, setEmails]           = useState<string[]>(['']);
  const [schedule, setSchedule]       = useState<Schedule>(defaultSchedule());
  const [logo, setLogo]               = useState<File | null>(null);
  const [preview, setPreview]         = useState<string | null>(null);
  const [errors, setErrors]           = useState<Record<string, string>>({});
  const [loading, setLoading]         = useState(false);
  const fileRef                       = useRef<HTMLInputElement>(null);
  const { refreshCompany }            = useCompany(); 

  useEffect(() => {
    if (!open) return;
    if (company) {
      setName(company.name ?? '');
      setAddress(company.address ?? '');
      setLocationUrl(company.location_url ?? '');
      setPhones(company.phones?.length ? company.phones : ['']);
      setEmails(company.emails?.length ? company.emails : ['']);
      setPreview(company.logo_url ?? null);

      // ✅ FIXED: parse working_datetime safely (handles both string & object)
      const parsedSchedule = parseWorkingDatetime(company.working_datetime);
      setSchedule(
        parsedSchedule
          ? Object.fromEntries(
              DAYS.map(d => [
                d,
                parsedSchedule[d] ?? { open: '09:00', close: '22:00', closed: false },
              ])
            ) as Schedule
          : defaultSchedule()
      );
    } else {
      setName(''); setAddress(''); setLocationUrl('');
      setPhones(['']); setEmails(['']);
      setPreview(null); setSchedule(defaultSchedule());
    }
    setLogo(null); setErrors({});
  }, [open, company]);

  if (!open) return null;

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!name.trim())
      errs.name = 'Company name is required.';
    else if (name.length > 255)
      errs.name = 'Company name must not exceed 255 characters.';
    if (address.length > 1000)
      errs.address = 'Address must not exceed 1000 characters.';
    if (locationUrl.length > 2000)
      errs.location_url = 'Location URL must not exceed 2000 characters.';
    if (logo && logo.size > 2 * 1024 * 1024)
      errs.logo = 'Logo may not be larger than 2MB.';
    phones.forEach((p, i) => {
      if (p.trim() && p.length > 30)
        errs[`phones.${i}`] = `Phone ${i + 1} must not exceed 30 characters.`;
    });
    emails.forEach((e, i) => {
      if (!e.trim()) return;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))
        errs[`emails.${i}`] = `Email ${i + 1} is not a valid email address.`;
      else if (e.length > 255)
        errs[`emails.${i}`] = `Email ${i + 1} must not exceed 255 characters.`;
    });
    return errs;
  };

  const handleLogo = (file: File) => {
    setLogo(file);
    setPreview(URL.createObjectURL(file));
    if (errors.logo) setErrors(p => ({ ...p, logo: '' }));
  };

  const updatePhone = (i: number, val: string) => {
    setPhones(p => p.map((x, idx) => (idx === i ? val : x)));
    setErrors(p => ({ ...p, [`phones.${i}`]: '' }));
  };
  const addPhone    = () => setPhones(p => [...p, '']);
  const removePhone = (i: number) => {
    setPhones(p => p.filter((_, idx) => idx !== i));
    setErrors(p => { const n = { ...p }; delete n[`phones.${i}`]; return n; });
  };

  const updateEmail = (i: number, val: string) => {
    setEmails(p => p.map((x, idx) => (idx === i ? val : x)));
    setErrors(p => ({ ...p, [`emails.${i}`]: '' }));
  };
  const addEmail    = () => setEmails(p => [...p, '']);
  const removeEmail = (i: number) => {
    setEmails(p => p.filter((_, idx) => idx !== i));
    setErrors(p => { const n = { ...p }; delete n[`emails.${i}`]; return n; });
  };

  const updateDay = (day: string, field: keyof DaySchedule, value: string | boolean) =>
    setSchedule(s => ({ ...s, [day]: { ...s[day], [field]: value } }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', name);
      fd.append('address', address);
      fd.append('location_url', locationUrl);
      if (logo) fd.append('logo', logo);
      phones.filter(Boolean).forEach((p, i) => fd.append(`phones[${i}]`, p));
      emails.filter(Boolean).forEach((e, i) => fd.append(`emails[${i}]`, e));
      fd.append('working_datetime', JSON.stringify(schedule));
      await companyApi.save(fd);
      onSuccess();
      refreshCompany();
    } catch (err: unknown) {
      setErrors(parseApiErrors(err));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => { setErrors({}); onClose(); };

  const inputCls = (err?: string) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none transition-colors
    ${err ? 'border-red-400 focus:border-red-400' : 'border-gray-200 dark:border-gray-700 focus:border-brand-500 dark:focus:border-brand-400'}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

        <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh]">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">
              {company ? 'Edit Company Info' : 'Setup Company Info'}
            </h2>
            <button onClick={handleClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto flex-1">
            <form onSubmit={handleSubmit} id="edit-company-form" className="p-6 space-y-6">
              {errors.api && (
                <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">{errors.api}</p>
              )}

              {/* Logo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Logo</label>
                <div
                  onClick={() => fileRef.current?.click()}
                  onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith('image/')) handleLogo(f); }}
                  onDragOver={e => e.preventDefault()}
                  className={`cursor-pointer rounded-xl border-2 border-dashed bg-gray-50 dark:bg-gray-800/50 transition-colors
                    ${errors.logo ? 'border-red-400' : 'border-gray-200 dark:border-gray-700 hover:border-brand-400 dark:hover:border-brand-500'}`}
                >
                  {preview ? (
                    <div className="relative h-32 rounded-xl overflow-hidden flex items-center justify-center">
                      <img src={preview} alt="preview" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <p className="text-white text-sm font-medium">Click to change</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 gap-2">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                        <ImageIcon size={22} className="text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-medium text-brand-600 dark:text-brand-400">Click to upload</span> or drag & drop
                      </p>
                      <p className="text-xs text-gray-400">PNG, JPG, WEBP up to 2MB</p>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleLogo(f); }} />
                </div>
                {errors.logo && <p className="text-xs text-red-500 mt-1">{errors.logo}</p>}
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input type="text" value={name}
                  onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })); }}
                  placeholder="e.g. My Restaurant" className={inputCls(errors.name)} />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Address</label>
                <textarea value={address}
                  onChange={e => { setAddress(e.target.value); setErrors(p => ({ ...p, address: '' })); }}
                  rows={2} placeholder="123 Main St, City, Country"
                  className={inputCls(errors.address) + ' resize-none'} />
                {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
              </div>

              {/* Location URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Google Maps Embed URL
                  <span className="ml-1.5 text-xs text-gray-400 font-normal">(iframe src)</span>
                </label>
                <input type="text" value={locationUrl}
                  onChange={e => { setLocationUrl(e.target.value); setErrors(p => ({ ...p, location_url: '' })); }}
                  placeholder="https://www.google.com/maps/embed?pb=..."
                  className={inputCls(errors.location_url)} />
                {errors.location_url && <p className="text-xs text-red-500 mt-1">{errors.location_url}</p>}
              </div>

              {/* Phones */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Numbers</label>
                  <button type="button" onClick={addPhone}
                    className="flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium">
                    <Plus size={13} /> Add
                  </button>
                </div>
                <div className="space-y-2">
                  {phones.map((p, i) => (
                    <div key={i} className="flex gap-2">
                      <div className="flex-1">
                        <input type="text" value={p} onChange={e => updatePhone(i, e.target.value)}
                          placeholder={`Phone ${i + 1}`} className={inputCls(errors[`phones.${i}`])} />
                        {errors[`phones.${i}`] && <p className="text-xs text-red-500 mt-1">{errors[`phones.${i}`]}</p>}
                      </div>
                      {phones.length > 1 && (
                        <button type="button" onClick={() => removePhone(i)}
                          className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors self-start">
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Emails */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Addresses</label>
                  <button type="button" onClick={addEmail}
                    className="flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium">
                    <Plus size={13} /> Add
                  </button>
                </div>
                <div className="space-y-2">
                  {emails.map((e, i) => (
                    <div key={i} className="flex gap-2">
                      <div className="flex-1">
                        <input type="email" value={e} onChange={ev => updateEmail(i, ev.target.value)}
                          placeholder={`email${i + 1}@example.com`} className={inputCls(errors[`emails.${i}`])} />
                        {errors[`emails.${i}`] && <p className="text-xs text-red-500 mt-1">{errors[`emails.${i}`]}</p>}
                      </div>
                      {emails.length > 1 && (
                        <button type="button" onClick={() => removeEmail(i)}
                          className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors self-start">
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Working Hours */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Working Hours</label>
                <div className="space-y-2">
                  {DAYS.map(day => (
                    <div key={day} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                      <span className="w-10 text-xs font-semibold text-gray-600 dark:text-gray-400 shrink-0">{DAY_LABELS[day]}</span>

                      <button type="button" onClick={() => updateDay(day, 'closed', !schedule[day].closed)}
                        className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${schedule[day].closed ? 'bg-gray-300 dark:bg-gray-600' : 'bg-brand-500'}`}>
                        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${schedule[day].closed ? 'translate-x-0' : 'translate-x-4'}`} />
                      </button>

                      {schedule[day].closed ? (
                        <span className="text-xs text-gray-400 italic">Closed</span>
                      ) : (
                        <div className="flex items-center gap-2 flex-1">
                          <input type="time" value={schedule[day].open}
                            onChange={e => updateDay(day, 'open', e.target.value)}
                            className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-brand-500" />
                          <span className="text-xs text-gray-400">to</span>
                          <input type="time" value={schedule[day].close}
                            onChange={e => updateDay(day, 'close', e.target.value)}
                            className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-brand-500" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </form>
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
            <button type="button" onClick={handleClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Cancel
            </button>
            <button type="submit" form="edit-company-form" disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-colors disabled:opacity-60">
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}