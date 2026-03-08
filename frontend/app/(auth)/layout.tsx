import AuthHeaderLogo from '@/components/auth/AuthHeaderLogo';
import ThemeToggle from '@/components/shared/ThemeToggle';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <header className="h-14 flex items-center justify-between px-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <AuthHeaderLogo />
        <ThemeToggle />
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        {children}
      </div>
    </div>
  );
}