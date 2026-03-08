'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, CalendarCheck, ShoppingBag, UserCircle, LogOut, ChefHat, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Company, companyApi } from '@/lib/publicServiceApi';
import ThemeToggle from '@/components/shared/ThemeToggle';
import { getInitials } from '@/lib/utils';

const links = [
  { href: '/user/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/user/reservations', label: 'Reservations', icon: CalendarCheck },
  { href: '/user/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/user/profile', label: 'Profile', icon: UserCircle },
];

export default function UserNavbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();
  const { count: cartCount } = useCart();

  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    companyApi.get()
      .then(res => setCompany(res.data ?? null))
      .catch(() => setCompany(null))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

        {/* Logo — same as GuestNavbar */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          {loading ? (
            <>
              <div className="w-14 h-14 rounded-full animate-pulse bg-gray-200 dark:bg-gray-700 shrink-0" />
              <div className="h-5 w-28 rounded-lg animate-pulse bg-gray-200 dark:bg-gray-700" />
            </>
          ) : (
            <>
              {company?.logo_url ? (
                <img
                  src={company.logo_url}
                  alt={company.name}
                  className="w-14 h-14 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center shrink-0">
                  <ChefHat size={15} className="text-white" />
                </div>
              )}
              <span className="font-display font-bold text-gray-900 dark:text-white">
                {company?.name ?? 'Restaurant'}
              </span>
            </>
          )}
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

          {/* Cart */}
          <Link
            href="/cart"
            className="relative w-9 h-9 flex items-center justify-center rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
            aria-label="Cart"
          >
            <ShoppingCart size={18} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User avatar + name */}
          <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-700">
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-brand-500 flex items-center justify-center">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.fullname}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-xs font-bold">
                  {user?.fullname ? getInitials(user.fullname) : 'U'}
                </span>
              )}
            </div>
            <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
              {user?.fullname}
            </span>
          </div>

          {/* Logout */}
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
        {/* Cart in mobile tab bar */}
        <Link href="/cart"
          className={`flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors relative
            ${pathname === '/cart' ? 'text-brand-600 dark:text-brand-400' : 'text-gray-500 dark:text-gray-400'}`}
        >
          <span className="relative">
            <ShoppingCart size={18} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-brand-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </span>
          <span className="mt-0.5">Cart</span>
        </Link>
      </div>
    </header>
  );
}