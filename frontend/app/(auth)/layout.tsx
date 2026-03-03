import Link from 'next/link';
import { ChefHat } from 'lucide-react';
import ThemeToggle from '@/components/shared/ThemeToggle';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Minimal header */}
      <header className="h-14 flex items-center justify-between px-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-brand-500 rounded-full flex items-center justify-center">
            <ChefHat size={13} className="text-white" />
          </div>
          <span className="font-display font-bold text-gray-900 dark:text-white">La Maison</span>
        </Link>
        <ThemeToggle />
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        {children}
      </div>
    </div>
  );
}