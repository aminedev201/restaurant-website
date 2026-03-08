'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLoader from './DashboardLoader';

interface Props {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
}

export default function ProtectedRoute({ children, requiredRole }: Props) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) { router.replace('/login'); return; }
    if (requiredRole && user?.role !== requiredRole) {
      router.replace(user?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
    }
  }, [isAuthenticated, isLoading, requiredRole, user, router]);

  if (isLoading) return <DashboardLoader />;

  if (!isAuthenticated) return null;
  if (requiredRole && user?.role !== requiredRole) return null;

  return <>{children}</>;
}