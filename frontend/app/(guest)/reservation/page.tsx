import type { Metadata } from 'next';
import BookingClient from './ReservationTableClient';

export const metadata: Metadata = {
  title: 'Reserve a Table',
  description: 'Book your table at La Maison Restaurant — easy online reservation.',
};

export default function BookingPage() {
  return <BookingClient />;
}