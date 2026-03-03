import type { Metadata } from 'next';
import PlatesClient from './PlatesClient';

export const metadata: Metadata = { title: 'Admin Plates' };

export default function PlatesPage() {
  return (
    <div className="p-6 h-full">
      <PlatesClient />
    </div>
  );
}