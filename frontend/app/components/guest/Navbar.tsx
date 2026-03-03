'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ShoppingCart, User, ChefHat } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import ThemeToggle from '@/components/shared/ThemeToggle';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/menu', label: 'Menu' },
  { href: '/booking', label: 'Reserve' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function GuestNavbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();
  const { count } = useCart();
  const isHome = pathname === '/';

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navBg = isHome
    ? scrolled
      ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur shadow-sm'
      : 'bg-transparent'
    : 'bg-white dark:bg-gray-900 shadow-sm';

  const textColor = isHome && !scrolled ? 'text-white' : 'text-gray-800 dark:text-gray-100';

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${navBg}`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center">
            <ChefHat size={16} className="text-white" />
          </div>
          <span className={`font-display text-xl font-bold tracking-tight ${textColor}`}>
            La Maison
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-1">
          {navLinks.map(link => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                  ${pathname === link.href
                    ? 'bg-brand-500 text-white'
                    : `${textColor} hover:bg-brand-100/20 dark:hover:bg-white/10`
                  }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* Cart */}
          <button
            onClick={() => setCartOpen(v => !v)}
            className={`relative w-9 h-9 flex items-center justify-center rounded-full transition-colors
              hover:bg-brand-100/20 dark:hover:bg-white/10 ${textColor}`}
            aria-label="Cart"
          >
            <ShoppingCart size={18} />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {count}
              </span>
            )}
          </button>

          {/* Auth button */}
          {isAuthenticated ? (
            <Link
              href={user?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-full text-sm font-medium transition-colors"
            >
              <User size={15} />
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-full text-sm font-medium transition-colors"
            >
              Sign In
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(v => !v)}
            className={`md:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 ${textColor}`}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t dark:border-gray-800 px-4 py-4 flex flex-col gap-2 shadow-lg animate-fade-in">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${pathname === link.href
                  ? 'bg-brand-500 text-white'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <Link href={user?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'} onClick={() => setOpen(false)}
              className="px-4 py-2.5 bg-brand-500 text-white rounded-lg text-sm font-medium text-center">
              Dashboard
            </Link>
          ) : (
            <Link href="/login" onClick={() => setOpen(false)}
              className="px-4 py-2.5 bg-brand-500 text-white rounded-lg text-sm font-medium text-center">
              Sign In
            </Link>
          )}
        </div>
      )}
    </header>
  );
}