'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, User, Phone, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import GuestRoute from '@/components/shared/GuestRoute';

interface FormErrors {
  fullname?: string;
  email?: string;
  phone?: string;
  password?: string;
  password_confirmation?: string;
}

const validateEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

const validatePhone = (phone: string) =>
  /^\+?[0-9\s\-\(\)]{6,25}$/.test(phone.trim());

const validatePassword = (pw: string) => ({
  length: pw.length >= 8 && pw.length <= 30,
  upper: /[A-Z]/.test(pw),
  lower: /[a-z]/.test(pw),
  number: /\d/.test(pw),
  special: /[@$!%*?&#]/.test(pw),
});

export default function RegisterClient() {
  const [form, setForm] = useState({
    fullname: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
  });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { register } = useAuth();

  const pwCheck = validatePassword(form.password);
  const pwStrong = Object.values(pwCheck).every(Boolean);

  const validate = (): boolean => {
    const errors: FormErrors = {};

    if (!form.fullname.trim()) {
      errors.fullname = 'Full name is required';
    } else if (form.fullname.trim().length < 2) {
      errors.fullname = 'Full name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(form.fullname)) {
      errors.fullname = 'Full name must contain only letters and spaces';
    }

    if (!form.email.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(form.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!form.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!validatePhone(form.phone)) {
      errors.phone = 'Please enter a valid phone number (digits, spaces, +, -, parentheses)';
    }

    if (!form.password) {
      errors.password = 'Password is required';
    } else if (!pwStrong) {
      errors.password = 'Password must contain uppercase, lowercase, number & special character (@$!%*?&#)';
    }

    if (!form.password_confirmation) {
      errors.password_confirmation = 'Please confirm your password';
    } else if (form.password !== form.password_confirmation) {
      errors.password_confirmation = 'Passwords do not match';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validate()) return;

    setLoading(true);
    try {
      const res = await register(form);
      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.message || 'Registration failed');
      }
    } catch (err: any) {
      const d = err?.response?.data;
      if (d?.errors) setFieldErrors(d.errors);
      else setError(d?.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof FormErrors, value: string) => {
    setForm(p => ({ ...p, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors(p => ({ ...p, [field]: undefined }));
    }
  };

  if (success) return (
    <GuestRoute>
      <div className="w-full max-w-md text-center">
        <div className="card p-10">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 size={32} className="text-green-500" />
          </div>
          <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-3">Check Your Email!</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            We sent a verification link to <strong className="text-gray-700 dark:text-gray-300">{form.email}</strong>.
            Click it to activate your account.
          </p>
          <Link href="/login" className="btn-primary w-full justify-center">Go to Sign In</Link>
        </div>
      </div>
    </GuestRoute>
  );

  return (
    <GuestRoute>
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-2">Create an account</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Join La Maison for exclusive reservations & more</p>
        </div>

        <div className="card p-8">
          {error && (
            <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl mb-5 text-sm text-red-700 dark:text-red-400">
              <AlertCircle size={16} className="shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={form.fullname}
                    onChange={e => handleChange('fullname', e.target.value)}
                    className={`input-field pl-9 ${fieldErrors.fullname ? 'border-red-400' : ''}`}
                    placeholder="John Doe"
                  />
                </div>
                {fieldErrors.fullname && <p className="text-xs text-red-500 mt-1">{fieldErrors.fullname}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={form.phone}
                    onChange={e => handleChange('phone', e.target.value)}
                    className={`input-field pl-9 ${fieldErrors.phone ? 'border-red-400' : ''}`}
                    placeholder="+212 600..."
                  />
                </div>
                {fieldErrors.phone && <p className="text-xs text-red-500 mt-1">{fieldErrors.phone}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => handleChange('email', e.target.value)}
                  className={`input-field pl-9 ${fieldErrors.email ? 'border-red-400' : ''}`}
                  placeholder="you@email.com"
                />
              </div>
              {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => handleChange('password', e.target.value)}
                  className={`input-field pl-9 pr-10 ${fieldErrors.password ? 'border-red-400' : ''}`}
                  placeholder="Min 8 chars"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 grid grid-cols-5 gap-1">
                  {Object.values(pwCheck).map((ok, i) => (
                    <div
                      key={i}
                      className={`h-1 rounded-full transition-colors ${ok ? 'bg-amber-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                    />
                  ))}
                </div>
              )}
              {fieldErrors.password && <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password_confirmation}
                  onChange={e => handleChange('password_confirmation', e.target.value)}
                  className={`input-field pl-9 ${fieldErrors.password_confirmation ? 'border-red-400' : ''}`}
                  placeholder="Repeat password"
                />
              </div>
              {fieldErrors.password_confirmation && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.password_confirmation}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 mt-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </GuestRoute>
  );
}