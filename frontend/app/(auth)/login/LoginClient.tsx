'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import GuestRoute from '@/components/shared/GuestRoute';

interface FormErrors {
  email?: string;
  password?: string;
}

const validateEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export default function LoginClient() {
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [unverified, setUnverified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resentOk, setResentOk] = useState(false);
  const { login, resendVerification } = useAuth();
  const router = useRouter();

  const validate = (): boolean => {
    const errors: FormErrors = {};

    if (!form.email.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(form.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!form.password) {
      errors.password = 'Password is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setUnverified(false);

    if (!validate()) return;

    setLoading(true);
    try {
      const res = await login(form);
      if (res.success) {
        const role = res.data?.user.role;
        router.push(role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
      } else {
        if (res.email_verified === false) {
          setUnverified(true);
        } else {
          setError(res.message || 'Login failed');
        }
      }
    } catch (err: any) {
      const d = err?.response?.data;
      if (d?.email_verified === false) setUnverified(true);
      else setError(d?.message || 'An unexpected error occurred');
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      await resendVerification(form.email);
      setResentOk(true);
    } catch {} finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof FormErrors, value: string) => {
    setForm(p => ({ ...p, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors(p => ({ ...p, [field]: undefined }));
    }
  };

  return (
    <GuestRoute>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome back</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Sign in to access your account</p>
        </div>

        <div className="card p-8">
          {error && (
            <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl mb-5 text-sm text-red-700 dark:text-red-400">
              <AlertCircle size={16} className="shrink-0" /> {error}
            </div>
          )}

          {unverified && (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl mb-5">
              <p className="text-sm text-amber-700 dark:text-amber-400 mb-3">
                Your email is not verified. Please check your inbox or resend the verification email.
              </p>
              {resentOk ? (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium">
                  <CheckCircle size={15} /> Verification email sent!
                </div>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={loading}
                  className="text-sm text-brand-600 dark:text-brand-400 font-medium underline underline-offset-2 hover:no-underline"
                >
                  Resend verification email
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => handleChange('email', e.target.value)}
                  className={`input-field pl-10 ${fieldErrors.email ? 'border-red-400' : ''}`}
                  placeholder="you@email.com"
                />
              </div>
              {fieldErrors.email && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => handleChange('password', e.target.value)}
                  className={`input-field pl-10 pr-10 ${fieldErrors.password ? 'border-red-400' : ''}`}
                  placeholder="Your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-gray-600 dark:text-gray-400">
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={e => setForm(p => ({ ...p, remember: e.target.checked }))}
                  className="rounded border-gray-300 text-brand-500 focus:ring-brand-400"
                />
                Remember me
              </label>
              <Link href="/forgot-password" className="text-brand-600 dark:text-brand-400 hover:underline font-medium">
                Forgot password?
              </Link>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </GuestRoute>
  );
}