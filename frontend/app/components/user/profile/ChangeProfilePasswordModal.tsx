'use client';

import { useState } from 'react';
import { X, Loader2, Eye, EyeOff, KeyRound } from 'lucide-react';
import { profileApi } from '@/lib/userServiceApi';
import { parseApiErrors } from '@/lib/parseApiErrors';
import toast from 'react-hot-toast';

interface Props {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]+$/;
const PASSWORD_HINT = 'Must be 8–30 chars with uppercase, lowercase, number & special character (@$!%*?&#).';


// ── Defined OUTSIDE the modal so it's never recreated on re-render ─────────────
interface PasswordInputProps {
    id: string;
    label: string;
    value: string;
    onChange: (v: string) => void;
    show: boolean;
    onToggle: () => void;
    error?: string;
    placeholder?: string;
}

function PasswordInput({ id, label, value, onChange, show, onToggle, error, placeholder }: PasswordInputProps) {
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {label} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
                <input
                    id={id}
                    type={show ? 'text' : 'password'}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={`w-full px-4 py-2.5 pr-10 rounded-xl border text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none transition-colors
            ${error
                            ? 'border-red-400 focus:border-red-400'
                            : 'border-gray-200 dark:border-gray-700 focus:border-brand-500 dark:focus:border-brand-400'
                        }`}
                />
                <button
                    type="button"
                    onClick={onToggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            </div>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
}


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

    const barColors = ['bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-lime-500', 'bg-emerald-500'];
    const textColors = ['text-red-500', 'text-orange-400', 'text-yellow-500', 'text-lime-600', 'text-emerald-600'];

    const color = barColors[score - 1] ?? 'bg-gray-200';
    const textColor = textColors[score - 1] ?? 'text-gray-400';
    const label = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'][score - 1] ?? '';

    const pills = [
        { ok: checks[0], label: '8+ chars' },
        { ok: checks[1], label: 'Uppercase' },
        { ok: checks[2], label: 'Lowercase' },
        { ok: checks[3], label: 'Number' },
        { ok: checks[4], label: 'Symbol' },
    ];

    return (
        <div className="-mt-2 space-y-1.5">
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                    <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= score ? color : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                    />
                ))}
            </div>
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


// ── Main Modal ─────────────────────────────────────────────────────────────────
export default function ChangeProfilePasswordModal({ open, onClose, onSuccess }: Props) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    if (!open) return null;

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!currentPassword)
            errs.current_password = 'Current password is required.';
        if (!password)
            errs.password = 'New password is required.';
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
            await profileApi.changePassword(currentPassword, password, passwordConfirm);
            toast.success('Password changed successfully!');
            handleClose();
            onSuccess();
        } catch (err: unknown) {
            setErrors(parseApiErrors(err));
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setCurrentPassword(''); setPassword(''); setPasswordConfirm('');
        setShowCurrent(false); setShowPassword(false); setShowConfirm(false);
        setErrors({});
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

                <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col">

                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                                <KeyRound size={17} className="text-amber-500" />
                            </div>
                            <h2 className="font-bold text-lg text-gray-900 dark:text-white">Change Password</h2>
                        </div>
                        <button onClick={handleClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Body */}
                    <form onSubmit={handleSubmit} id="change-password-form" className="p-6 space-y-5">
                        {errors.api && (
                            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
                                {errors.api}
                            </p>
                        )}

                        <PasswordInput
                            id="current_password"
                            label="Current Password"
                            value={currentPassword}
                            onChange={v => { setCurrentPassword(v); setErrors(p => ({ ...p, current_password: '' })); }}
                            show={showCurrent}
                            onToggle={() => setShowCurrent(v => !v)}
                            error={errors.current_password}
                            placeholder="Enter your current password"
                        />

                        <PasswordInput
                            id="new_password"
                            label="New Password"
                            value={password}
                            onChange={v => { setPassword(v); setErrors(p => ({ ...p, password: '' })); }}
                            show={showPassword}
                            onToggle={() => setShowPassword(v => !v)}
                            error={errors.password}
                            placeholder="e.g. MyPass@1234"
                        />

                        <p className="text-xs text-gray-400 leading-relaxed -mt-2">{PASSWORD_HINT}</p>

                        {password && <PasswordStrength password={password} />}

                        <PasswordInput
                            id="password_confirmation"
                            label="Confirm New Password"
                            value={passwordConfirm}
                            onChange={v => { setPasswordConfirm(v); setErrors(p => ({ ...p, password_confirmation: '' })); }}
                            show={showConfirm}
                            onToggle={() => setShowConfirm(v => !v)}
                            error={errors.password_confirmation}
                            placeholder="Re-enter new password"
                        />
                    </form>

                    {/* Footer */}
                    <div className="flex gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800">
                        <button type="button" onClick={handleClose}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" form="change-password-form" disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-colors disabled:opacity-60">
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            {loading ? 'Saving...' : 'Update Password'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}