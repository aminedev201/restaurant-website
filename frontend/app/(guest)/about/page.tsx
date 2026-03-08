import type { Metadata } from 'next';
import AboutClient from './AboutClient';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'The story behind La Maison Restaurant — passion, tradition, and modern cuisine.',
};

export default function AboutPage() {
  return <AboutClient />;
}