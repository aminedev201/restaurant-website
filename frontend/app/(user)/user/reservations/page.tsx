import type { Metadata } from 'next';
import ReservationsClient from './ReservationsClient';

export const metadata: Metadata = { title: 'My Reservations' };

export default function ReservationsPage() {
  return <ReservationsClient />;
}