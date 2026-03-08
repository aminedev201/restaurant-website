'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ChevronLeft, ChevronRight, ChefHat, LogOut,
  Tag, UtensilsCrossed, ShieldCheck, Users, User as UserIcon,
  Building2, MessageSquare, CalendarClock, ClipboardList,
  Settings2, Menu, X, MessageSquareQuote 
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { getInitials } from '@/lib/utils';
import { useCompany } from '@/context/CompanyContext';

const navItems = [
  { href: '/admin/dashboard',        label: 'Dashboard',        icon: LayoutDashboard },
  { href: '/admin/categories',       label: 'Categories',       icon: Tag },
  { href: '/admin/plates',           label: 'Plates',           icon: UtensilsCrossed },
  { href: '/admin/orders',           label: 'Orders',           icon: ClipboardList },
  { href: '/admin/reservations',     label: 'Reservations',     icon: CalendarClock },
  { href: '/admin/testimonials',     label: 'Testimonials',     icon: MessageSquareQuote  },
  { href: '/admin/chefs',            label: 'Chefs',            icon: ChefHat },
  { href: '/admin/admins',           label: 'Admins',           icon: ShieldCheck },
  { href: '/admin/users',            label: 'Users',            icon: Users },
  { href: '/admin/contact-messages', label: 'Contact Messages', icon: MessageSquare },
  { href: '/admin/company',          label: 'Company',          icon: Building2 },
  { href: '/admin/settings',         label: 'Settings',         icon: Settings2 },
];

export default function AdminSidebar() {
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname  = usePathname();
  const { logout, user } = useAuth();
  const router    = useRouter();
  const { company, loading } = useCompany();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const initials = user?.fullname ? getInitials(user.fullname) : 'A';

  // ── Shared sidebar body ────────────────────────────────────────────────────
  const SidebarContent = ({ onNavClick, onClose }: { onNavClick?: () => void; onClose?: () => void }) => (
    <>
      {/* Logo row — with optional close button for mobile */}
      <div className={`flex items-center h-16 px-4 border-b border-gray-800 ${collapsed ? 'justify-center' : 'gap-3'}`}>
        <Link
          href="/admin/dashboard"
          onClick={onNavClick}
          className={`flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity ${collapsed ? 'justify-center' : ''}`}
        >
          {loading ? (
            <>
              <div className="w-10 h-10 rounded-lg bg-gray-700 animate-pulse shrink-0" />
              {!collapsed && <div className="h-4 w-28 rounded-lg bg-gray-700 animate-pulse" />}
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden bg-gray-800">
                {company?.logo_url ? (
                  <img src={company.logo_url} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <ChefHat size={18} className="text-white" />
                )}
              </div>
              {!collapsed && (
                <span className="font-display font-bold text-lg tracking-tight truncate">
                  {company?.name || 'Restaurant'}
                </span>
              )}
            </>
          )}
        </Link>

        {/* Close button — mobile only, inside the header */}
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavClick}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                ${active ? 'bg-brand-500 text-white shadow-sm' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}
                ${collapsed ? 'justify-center' : ''}`}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Profile + Logout */}
      <div className="border-t border-gray-800 p-3 space-y-1">
        <Link
          href="/admin/profile"
          onClick={onNavClick}
          title={collapsed ? 'My Profile' : undefined}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group
            ${pathname.startsWith('/admin/profile') ? 'bg-brand-500 text-white' : 'hover:bg-gray-800'}
            ${collapsed ? 'justify-center' : ''}`}
        >
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.fullname}
              className="w-7 h-7 rounded-lg object-cover shrink-0 border border-gray-700"
            />
          ) : (
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors
              ${pathname.startsWith('/admin/profile') ? 'bg-white/20 text-white' : 'bg-amber-500 text-white'}`}>
              {initials}
            </div>
          )}
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium truncate leading-none
                ${pathname.startsWith('/admin/profile') ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                {user?.fullname}
              </p>
              <p className={`text-xs mt-0.5 capitalize truncate
                ${pathname.startsWith('/admin/profile') ? 'text-white/70' : 'text-gray-500'}`}>
                {user?.role}
              </p>
            </div>
          )}
          {!collapsed && (
            <UserIcon size={14} className={`shrink-0 ${pathname.startsWith('/admin/profile') ? 'text-white/70' : 'text-gray-600 group-hover:text-gray-400'}`} />
          )}
        </Link>

        <button
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-red-900/40 hover:text-red-400 transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && 'Logout'}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* ── Mobile toggle button — hidden when drawer is open ───────────── */}
      {!mobileOpen && (
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden fixed top-3.5 left-4 z-50 w-9 h-9 bg-gray-900 text-white rounded-lg flex items-center justify-center shadow-lg border border-gray-700"
          aria-label="Open sidebar"
        >
          <Menu size={18} />
        </button>
      )}

      {/* ── Mobile backdrop ──────────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile drawer ────────────────────────────────────────────────── */}
      <aside
        className={`md:hidden fixed top-0 left-0 z-40 h-full w-64 bg-gray-900 text-white flex flex-col transition-transform duration-300
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <SidebarContent
          onNavClick={() => setMobileOpen(false)}
          onClose={() => setMobileOpen(false)}
        />
      </aside>

      {/* ── Desktop sidebar ──────────────────────────────────────────────── */}
      <aside
        className={`hidden md:flex relative flex-col bg-gray-900 text-white transition-all duration-300 min-h-screen
          ${collapsed ? 'w-16' : 'w-64'}`}
      >
        <SidebarContent />

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(v => !v)}
          className="absolute -right-3 top-20 w-6 h-6 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-full flex items-center justify-center transition-colors z-10"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>
    </>
  );
}