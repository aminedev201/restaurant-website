import type { Metadata } from 'next';
import AdminsClient from './AdminsClient';

export const metadata: Metadata = { title: 'Admin Management' };

export default function AdminsPage() {
  return (
    <div className="p-6">
      <AdminsClient />
    </div>
  );
}