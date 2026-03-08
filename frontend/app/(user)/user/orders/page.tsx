import type { Metadata } from 'next';
import OrderClient from './OrderClient';

export const metadata: Metadata = { title: 'My Orders' };

export default function ReservationsPage() {
  return <OrderClient/>;
}