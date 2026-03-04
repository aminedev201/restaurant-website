import type { Metadata } from 'next';
import ContactMessagesClient from './ContactMessagesClient';

export const metadata: Metadata = { title: 'Contact Messages' };

export default function CompanyPage() {
  return (
    <div className="p-6">
      <ContactMessagesClient />
    </div>
  );
}