import Link from 'next/link';
import { ChefHat } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-brand-100 dark:bg-brand-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <ChefHat size={36} className="text-brand-500" />
        </div>
        <h1 className="font-display text-8xl font-bold text-brand-500 mb-4">404</h1>
        <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-3">Page not found</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Like a dish taken off the menu — this page doesn&apos;t exist.</p>
        <Link href="/" className="btn-primary">Back to Home</Link>
      </div>
    </div>
  );
}