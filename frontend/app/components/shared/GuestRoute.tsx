'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import GuestLoader from './GuestLoader';

export default function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated) {
      router.replace(user?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading) return <GuestLoader />;

  if (isAuthenticated) return null;
  return <>{children}</>;
}