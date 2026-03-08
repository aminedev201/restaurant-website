import type { Metadata } from 'next';
import HomeHero         from '@/components/guest/HomeHero';
import HomeFeatured     from '@/components/guest/HomeFeatured';
import HomeChefs        from '@/components/guest/HomeChefs';
import HomeTestimonials from '@/components/guest/HomeTestimonials';
import HomeCategories from '@/components/guest/HomeCategories';
import HomeReservation from '@/components/guest/HomeReservation';
import HomeContact from '@/components/guest/HomeContact';

export const metadata: Metadata = {
  title: 'Fine Dining Restaurant',
  description: 'Experience exquisite Mediterranean cuisine in the heart of Rabat. Book your table online.',
  openGraph: {
    title: 'Restaurant',
    description: 'Fine dining in Rabat — book your table online.',
  },
};

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <HomeFeatured />
      <HomeCategories />
      <HomeChefs />
      <HomeReservation />
      <HomeTestimonials />
      <HomeContact />
    </>
  );
}