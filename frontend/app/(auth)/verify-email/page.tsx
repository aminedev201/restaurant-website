import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail } from 'lucide-react';

export const metadata: Metadata = { title: 'Verify Your Email' };

export default function VerifyEmailPage() {
  return (
    <div className="w-full max-w-md text-center">
      <div className="card p-10">
        <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
          <Mail size={28} className="text-brand-600 dark:text-brand-400" />
        </div>
        <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-3">Verify your email</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
          We&apos;ve sent you a verification link. Please check your inbox and click the link to activate your account.
        </p>
        <Link href="/login" className="btn-secondary w-full justify-center">Back to Sign In</Link>
      </div>
    </div>
  );
}