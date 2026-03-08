import type { Metadata } from 'next';
import ChefsClient from './ChefsClient';

export const metadata: Metadata = { title: 'Chefs' };

export default function CompanyPage() {
  return (
    <div className="p-6">
      <ChefsClient />
    </div>
  );
}