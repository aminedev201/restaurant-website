import type { Metadata } from 'next';
import UsersClient from './UsersClient';

export const metadata: Metadata = { title: 'Admin Users' };

export default function UsersPage() {
  return (
    <div className="p-6">
      <UsersClient />
    </div>
  );
}