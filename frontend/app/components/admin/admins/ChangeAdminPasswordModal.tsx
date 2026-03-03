'use client';

import { useState } from 'react';
import { X, Loader2, Eye, EyeOff, KeyRound } from 'lucide-react';
import { adminApi } from '@/lib/adminServiceApi';
import { User } from '@/types';
import { parseApiErrors } from '@/lib/parseApiErrors';

interface Props {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSuccess: () => void;
}

// ── Constants ──────────────────────────────────────────────────────────────────
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]+$/;
const PASSWORD_HINT = 'Must be 8–30 chars with uppercase, lowercase, number & special character (@$!%*?&#).';


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

  const labels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const barColors = ['bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-lime-500', 'bg-emerald-500'];
  const textColors = ['text-red-500', 'text-orange-400', 'text-yellow-500', 'text-lime-600', 'text-emerald-600'];

  const color = barColors[score - 1] ?? 'bg-gray-200';
  const textColor = textColors[score - 1] ?? 'text-gray-400';
  const label = labels[score - 1] ?? '';

  const pills = [
    { ok: checks[0], label: '8+ chars' },
    { ok: checks[1], label: 'Uppercase' },
    { ok: checks[2], label: 'Lowercase' },
    { ok: checks[3], label: 'Number' },
    { ok: checks[4], label: 'Symbol' },
  ];

  return (
    <div className="-mt-2 space-y-1.5">
      {/* Segments */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(i => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= score ? color : 'bg-gray-200 dark:bg-gray-700'
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
              className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium transition-colors ${ok
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
export default function ChangeAdminPasswordModal({ open, user, onClose, onSuccess }: Props) {
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  if (!open || !user) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
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
      await adminApi.changePassword(user.id, password, passwordConfirm);
      onSuccess();
      handleClose();
    } catch (err: unknown) {
      setErrors(parseApiErrors(err));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPassword(''); setPasswordConfirm(''); setErrors({});
    setShowPassword(false); setShowConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

        <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
            <div>
              <h2 className="font-bold text-lg text-gray-900 dark:text-white">Change Password</h2>
              <p className="text-xs text-gray-400 mt-0.5">For: {user.fullname}</p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} id="change-admin-password-form" className="p-6 space-y-5">

            {/* API error */}
            {errors.api && (
              <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
                {errors.api}
              </p>
            )}

            {/* Info banner */}
            <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0 mt-0.5">
                <KeyRound size={14} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">Admin Password Reset</p>
                <p className="text-xs text-amber-600/80 dark:text-amber-500 mt-0.5">
                  This will immediately update the password for <strong>{user.fullname}</strong>. They will need to use the new password on their next login.
                </p>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }}
                  placeholder="e.g. Admin@1234"
                  className={`w-full px-4 py-2.5 pr-10 rounded-xl border text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none transition-colors
                    ${errors.password
                      ? 'border-red-400 focus:border-red-400'
                      : 'border-gray-200 dark:border-gray-700 focus:border-brand-500 dark:focus:border-brand-400'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            {/* Hint */}
            <p className="text-xs text-gray-400 leading-relaxed -mt-2">{PASSWORD_HINT}</p>

            {/* Strength indicator */}
            {password && <PasswordStrength password={password} />}

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={passwordConfirm}
                  onChange={e => { setPasswordConfirm(e.target.value); setErrors(p => ({ ...p, password_confirmation: '' })); }}
                  placeholder="Re-enter new password"
                  className={`w-full px-4 py-2.5 pr-10 rounded-xl border text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none transition-colors
                    ${errors.password_confirmation
                      ? 'border-red-400 focus:border-red-400'
                      : 'border-gray-200 dark:border-gray-700 focus:border-brand-500 dark:focus:border-brand-400'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password_confirmation && (
                <p className="text-xs text-red-500 mt-1">{errors.password_confirmation}</p>
              )}
            </div>
          </form>

          {/* Footer */}
          <div className="flex gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="change-admin-password-form"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-colors disabled:opacity-60"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}