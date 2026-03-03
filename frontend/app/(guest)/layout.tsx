import type { Metadata } from 'next';
import GuestNavbar from '@/components/guest/Navbar';
import Footer from '@/components/guest/Footer';

export default function GuestLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <GuestNavbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}