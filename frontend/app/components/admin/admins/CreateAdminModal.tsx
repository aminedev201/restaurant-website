'use client';

import { useState, useRef } from 'react';
import { X, ImageIcon, Loader2, Eye, EyeOff } from 'lucide-react';
import { adminApi } from '@/lib/adminServiceApi';
import { parseApiErrors } from '@/lib/parseApiErrors';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// ── Constants ──────────────────────────────────────────────────────────────────
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]+$/;
const PASSWORD_HINT  = 'Must be 8–30 chars with uppercase, lowercase, number & special character (@$!%*?&#).';


// ── Password Strength Bar ──────────────────────────────────────────────────────
function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /\d/.test(password),
    /[@$!%*?&#]/.test(password),
  ];
  const score = checks.filter(Boolean).length;

  const labels     = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const barColors  = ['bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-lime-500', 'bg-emerald-500'];
  const textColors = ['text-red-500', 'text-orange-400', 'text-yellow-500', 'text-lime-600', 'text-emerald-600'];

  const color     = barColors[score - 1]  ?? 'bg-gray-200';
  const textColor = textColors[score - 1] ?? 'text-gray-400';
  const label     = labels[score - 1]     ?? '';

  const pills = [
    { ok: checks[0], label: '8+ chars'  },
    { ok: checks[1], label: 'Uppercase' },
    { ok: checks[2], label: 'Lowercase' },
    { ok: checks[3], label: 'Number'    },
    { ok: checks[4], label: 'Symbol'    },
  ];

  return (
    <div className="-mt-2 space-y-1.5">
      {/* Segments */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(i => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i <= score ? color : 'bg-gray-200 dark:bg-gray-700'
            }`}
          />
        ))}
      </div>

      {/* Label + pills */}
      <div className="flex items-center justify-between flex-wrap gap-1">
        <p className={`text-xs font-medium ${textColor}`}>{label}</p>
        <div className="flex flex-wrap gap-1">
          {pills.map(({ ok, label: pillLabel }) => (
            <span
              key={pillLabel}
              className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium transition-colors ${
                ok
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
              }`}
            >
              {pillLabel}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}


// ── Main Component ─────────────────────────────────────────────────────────────
export default function CreateAdminModal({ open, onClose, onSuccess }: Props) {
  const [fullname, setFullname]               = useState('');
  const [email, setEmail]                     = useState('');
  const [phone, setPhone]                     = useState('');
  const [password, setPassword]               = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [status, setStatus]                   = useState(true);
  const [avatar, setAvatar]                   = useState<File | null>(null);
  const [preview, setPreview]                 = useState<string | null>(null);
  const [showPassword, setShowPassword]       = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [errors, setErrors]                   = useState<Record<string, string>>({});
  const [loading, setLoading]                 = useState(false);
  const fileRef                               = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleAvatar = (file: File) => {
    setAvatar(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleAvatar(file);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!fullname.trim())         errs.fullname = 'Full name is required.';
    else if (fullname.length < 2) errs.fullname = 'Full name must be at least 2 characters.';
    if (!email.trim())            errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Please enter a valid email.';
    if (!phone.trim())            errs.phone = 'Phone number is required.';
    if (!password)
      errs.password = 'Password is required.';
    else if (password.length < 8)
      errs.password = 'Password must be at least 8 characters.';
    else if (password.length > 30)
      errs.password = 'Password must be at most 30 characters.';
    else if (!PASSWORD_REGEX.test(password))
      errs.password = 'Must contain uppercase, lowercase, number & special character (@$!%*?&#).';
    if (password !== passwordConfirm)
      errs.password_confirmation = 'Password confirmation does not match.';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('fullname', fullname);
      fd.append('email', email);
      fd.append('phone', phone);
      fd.append('password', password);
      fd.append('password_confirmation', passwordConfirm);
      fd.append('status', status ? '1' : '0');
      if (avatar) fd.append('avatar', avatar);
      await adminApi.create(fd);
      onSuccess();
      handleClose();
    } catch (err: unknown) {
      setErrors(parseApiErrors(err));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFullname(''); setEmail(''); setPhone(''); setPassword(''); setPasswordConfirm('');
    setStatus(true); setAvatar(null); setPreview(null); setErrors({});
    setShowPassword(false); setShowConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

        <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh]">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">Add Admin</h2>
            <button onClick={handleClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="overflow-y-auto flex-1">
            <form onSubmit={handleSubmit} id="create-admin-form" className="p-6 space-y-5">
              {errors.api && (
                <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">{errors.api}</p>
              )}

              {/* Avatar Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Avatar</label>
                <div
                  onDrop={handleDrop}
                  onDragOver={e => e.preventDefault()}
                  onClick={() => fileRef.current?.click()}
                  className="relative cursor-pointer rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-brand-400 dark:hover:border-brand-500 bg-gray-50 dark:bg-gray-800/50 transition-colors"
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
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleAvatar(f); }} />
                </div>
              </div>

              {/* Full name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input type="text" value={fullname} onChange={e => setFullname(e.target.value)}
                  placeholder="e.g. John Doe"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none transition-colors
                    ${errors.fullname ? 'border-red-400' : 'border-gray-200 dark:border-gray-700 focus:border-brand-500 dark:focus:border-brand-400'}`} />
                {errors.fullname && <p className="text-xs text-red-500 mt-1">{errors.fullname}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none transition-colors
                    ${errors.email ? 'border-red-400' : 'border-gray-200 dark:border-gray-700 focus:border-brand-500 dark:focus:border-brand-400'}`} />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input type="text" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="+1 234 567 8900"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none transition-colors
                    ${errors.phone ? 'border-red-400' : 'border-gray-200 dark:border-gray-700 focus:border-brand-500 dark:focus:border-brand-400'}`} />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }}
                    placeholder="e.g. Admin@1234"
                    className={`w-full px-4 py-2.5 pr-10 rounded-xl border text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none transition-colors
                      ${errors.password ? 'border-red-400 focus:border-red-400' : 'border-gray-200 dark:border-gray-700 focus:border-brand-500 dark:focus:border-brand-400'}`}
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
              </div>

              {/* Password hint */}
              <p className="text-xs text-gray-400 leading-relaxed -mt-2">{PASSWORD_HINT}</p>

              {/* Password strength indicator */}
              {password && <PasswordStrength password={password} />}

              {/* Password Confirmation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={passwordConfirm}
                    onChange={e => { setPasswordConfirm(e.target.value); setErrors(p => ({ ...p, password_confirmation: '' })); }}
                    placeholder="Re-enter password"
                    className={`w-full px-4 py-2.5 pr-10 rounded-xl border text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none transition-colors
                      ${errors.password_confirmation ? 'border-red-400 focus:border-red-400' : 'border-gray-200 dark:border-gray-700 focus:border-brand-500 dark:focus:border-brand-400'}`}
                  />
                  <button type="button" onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password_confirmation && <p className="text-xs text-red-500 mt-1">{errors.password_confirmation}</p>}
              </div>

              {/* Status */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</p>
                  <p className="text-xs text-gray-400 mt-0.5">Allow this admin to access the panel</p>
                </div>
                <button type="button" onClick={() => setStatus(s => !s)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${status ? 'bg-brand-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${status ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
            <button type="button" onClick={handleClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Cancel
            </button>
            <button type="submit" form="create-admin-form" disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-colors disabled:opacity-60">
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Creating...' : 'Create Admin'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}