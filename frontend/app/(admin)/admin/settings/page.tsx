import { Metadata } from 'next';
import SettingsClient from './SettingsClient';

export const metadata: Metadata = {
  title: 'Settings',
};

export default function ReservationsPage() {
  return (
    <div className="p-6">
        <SettingsClient />
    </div>
  );
}