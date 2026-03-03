import type { Metadata } from 'next';
import CompanyClient from './CompanyClient';

export const metadata: Metadata = { title: 'Company Settings' };

export default function CompanyPage() {
  return (
    <div className="p-6">
      <CompanyClient />
    </div>
  );
}