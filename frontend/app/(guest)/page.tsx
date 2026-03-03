import type { Metadata } from 'next';
import HomeHero from '@/components/guest/HomeHero';
import HomeFeatured from '@/components/guest/HomeFeatured';
import HomeBooking from '@/components/guest/HomeBooking';
import HomeTestimonials from '@/components/guest/HomeTestimonials';

export const metadata: Metadata = {
  title: 'La Maison – Fine Dining Restaurant',
  description: 'Experience exquisite Mediterranean cuisine in the heart of Rabat. Book your table online.',
  openGraph: {
    title: 'La Maison Restaurant',
    description: 'Fine dining in Rabat — book your table online.',
  },
};

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <HomeFeatured />
      <HomeBooking />
      <HomeTestimonials />
    </>
  );
}