import { Metadata } from 'next';
import ReservationsClient from './ReservationsClient';

export const metadata: Metadata = {
  title: 'Reservations',
};

export default function ReservationsPage() {
  return (
    <div className="p-6">
        <ReservationsClient />
    </div>
  );
}