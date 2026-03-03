'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { companyApi, Company } from '@/lib/adminServiceApi';

interface CompanyContextType {
  company: Company | null;
  loading: boolean;
  refreshCompany: () => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshCompany = useCallback(async () => {
    try {
      const res = await companyApi.get();
      setCompany(res.data ?? null);
    } catch (error) {
      console.error('Failed to fetch company info:', error);
      setCompany(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCompany();
  }, [refreshCompany]);

  return (
    <CompanyContext.Provider value={{ company, loading, refreshCompany }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
}