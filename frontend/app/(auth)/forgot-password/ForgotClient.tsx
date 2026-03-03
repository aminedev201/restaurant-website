'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import GuestRoute from '@/components/shared/GuestRoute';

const validateEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export default function ForgotClient() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { forgotPassword } = useAuth();

  const validate = (): boolean => {
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    }
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validate()) return;

    setLoading(true);
    try {
      const res = await forgotPassword(email);
      if (res.success) setSent(true);
      else setError(res.errors?.email?.join(', ') || 'Failed to send reset link');
    } catch (err: any) {
      if(err.status === 422) {
        setError(err?.response?.data?.errors?.email?.join(', ') || 'Something went wrong');
      }else {
        setError(err?.response?.data?.message || 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailError) setEmailError('');
  };

  return (
    <GuestRoute>
      <div className="w-full max-w-md">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 mb-6 transition-colors"
        >
          <ArrowLeft size={15} /> Back to Sign In
        </Link>

        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-brand-100 dark:bg-brand-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Mail size={24} className="text-brand-600 dark:text-brand-400" />
          </div>
          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-2">Forgot password?</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">No worries — enter your email and we'll send a reset link.</p>
        </div>

        <div className="card p-8">
          {sent ? (
            <div className="text-center">
              <CheckCircle2 size={40} className="text-green-500 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Email sent!</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Check <strong>{email}</strong> for a reset link. It expires in 60 minutes.
              </p>
              <Link href="/login" className="btn-primary w-full justify-center">Back to Sign In</Link>
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email address</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => handleEmailChange(e.target.value)}
                      className={`input-field pl-9 ${emailError ? 'border-red-400' : ''}`}
                      placeholder="you@email.com"
                    />
                  </div>
                  {emailError && (
                    <p className="text-xs text-red-500 mt-1">{emailError}</p>
                  )}
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </GuestRoute>
  );
}