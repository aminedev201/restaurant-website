'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, CalendarCheck, ShoppingBag, UserCircle, LogOut, ChefHat } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from '@/components/shared/ThemeToggle';
import { getInitials } from '@/lib/utils';

const links = [
  { href: '/user/dashboard',    label: 'Overview',     icon: LayoutDashboard },
  { href: '/user/reservations', label: 'Reservations', icon: CalendarCheck },
  { href: '/user/orders',       label: 'Orders',       icon: ShoppingBag },
  { href: '/user/profile',      label: 'Profile',      icon: UserCircle },
];

export default function UserNavbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center">
            <ChefHat size={15} className="text-white" />
          </div>
          <span className="font-display font-bold text-gray-900 dark:text-white">La Maison</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${pathname === href
                  ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-700">
            <div className="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {user?.fullname ? getInitials(user.fullname) : 'U'}
            </div>
            <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">{user?.fullname}</span>
          </div>
          <button onClick={handleLogout} title="Logout"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden flex border-t border-gray-200 dark:border-gray-800">
        {links.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className={`flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors
              ${pathname === href ? 'text-brand-600 dark:text-brand-400' : 'text-gray-500 dark:text-gray-400'}`}
          >
            <Icon size={18} />
            <span className="mt-0.5">{label}</span>
          </Link>
        ))}
      </div>
    </header>
  );
}