import type { Metadata } from 'next';
import MenuClient from './MenuClient';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Our Menu',
  description: 'Explore our curated menu of Mediterranean and Moroccan-inspired dishes.',
};

export default function MenuPage() {
  return (
    <Suspense>
      <MenuClient />
    </Suspense>
  );
}