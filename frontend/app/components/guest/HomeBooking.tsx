import Link from 'next/link';
import { CalendarCheck, Clock, Users } from 'lucide-react';

export default function HomeBooking() {
  return (
    <section className="py-20 bg-gray-950 relative overflow-hidden">
      {/* Decorative circle */}
      <div className="absolute -right-40 -top-40 w-96 h-96 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -left-40 -bottom-40 w-96 h-96 rounded-full bg-brand-500/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-brand-400 font-medium uppercase tracking-widest text-sm mb-3">Plan Your Visit</p>
        <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-5">
          Reserve Your Table
        </h2>
        <p className="text-gray-400 text-lg mb-12 max-w-xl mx-auto">
          Secure your spot for an unforgettable evening. We accommodate private events, celebrations, and date nights.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          {[
            { icon: CalendarCheck, title: 'Easy Booking', desc: 'Reserve online in under 2 minutes' },
            { icon: Clock, title: 'Flexible Times', desc: 'Lunch, dinner, and private events' },
            { icon: Users, title: 'Any Group Size', desc: 'Tables for 2 up to 40 guests' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur">
              <div className="w-12 h-12 bg-brand-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Icon size={22} className="text-brand-400" />
              </div>
              <h4 className="text-white font-semibold mb-1">{title}</h4>
              <p className="text-gray-400 text-sm">{desc}</p>
            </div>
          ))}
        </div>

        <Link href="/booking" className="btn-primary text-base px-10 py-4 shadow-xl shadow-brand-500/25">
          Book a Table Now
        </Link>
      </div>
    </section>
  );
}