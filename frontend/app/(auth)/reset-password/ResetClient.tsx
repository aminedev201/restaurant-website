'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import GuestRoute from '@/components/shared/GuestRoute';

interface FormErrors {
  password?: string;
  password_confirmation?: string;
}

const validatePassword = (pw: string) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,30}$/.test(pw);

export default function ResetClient() {
  const params = useSearchParams();
  const token = params.get('token') ?? '';
  const emailParam = params.get('email') ?? '';

  const [form, setForm] = useState({ email: emailParam, password: '', password_confirmation: '', token });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  useEffect(() => {
    setForm(p => ({ ...p, email: emailParam, token }));
  }, [emailParam, token]);

  const validate = (): boolean => {
    const errors: FormErrors = {};

    if (!form.password) {
      errors.password = 'Password is required';
    } else if (form.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!validatePassword(form.password)) {
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
      const res = await resetPassword(form);
      if (res.success) setSuccess(true);
      else setError(res.errors?.email?.join(', ') || 'Failed to reset password');
    } catch (err: any) {
      if(err.status === 422) {
        setError(err?.response?.data?.errors?.email?.join(', ') || 'Something went wrong');
      }else {
        setError(err?.response?.data?.message || 'Something went wrong');
      };
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

  return (
    <GuestRoute>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-brand-100 dark:bg-brand-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock size={24} className="text-brand-600 dark:text-brand-400" />
          </div>
          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-2">Set new password</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Must be at least 8 chars with upper, lower, number & special character.
          </p>
        </div>

        <div className="card p-8">
          {success ? (
            <div className="text-center">
              <CheckCircle2 size={40} className="text-green-500 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Password reset!</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Your password has been updated. You can now sign in.
              </p>
              <Link href="/login" className="btn-primary w-full justify-center">Sign In</Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl mb-5 text-sm text-red-700 dark:text-red-400">
                  <AlertCircle size={16} className="shrink-0" /> {error}
                </div>
              )}
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={form.password}
                      onChange={e => handleChange('password', e.target.value)}
                      className={`input-field pl-9 pr-10 ${fieldErrors.password ? 'border-red-400' : ''}`}
                      placeholder="New password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>
                  )}
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

                <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                      Resetting...
                    </span>
                  ) : 'Reset Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </GuestRoute>
  );
}