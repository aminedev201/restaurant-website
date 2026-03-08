import { Metadata } from 'next';
import TestimonialsClient from './testimonialsClient';

export const metadata: Metadata = {
  title: 'Testimonials',
};

export default function ReservationsPage() {
  return (
    <div className="p-6">
        <TestimonialsClient />
    </div>
  );
}