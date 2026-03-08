'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChefHat } from 'lucide-react';
import { Company, companyApi } from '@/lib/publicServiceApi';

export default function AuthHeaderLogo() {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    companyApi.get()
      .then(res => setCompany(res.data ?? null))
      .catch(() => setCompany(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Link href="/" className="flex items-center gap-2">
      {loading ? (
        <>
          <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
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
              <ChefHat size={13} className="text-white" />
            </div>
          )}
          <span className="font-display font-bold text-gray-900 dark:text-white">
            {company?.name ?? 'Restaurant'}
          </span>
        </>
      )}
    </Link>
  );
}