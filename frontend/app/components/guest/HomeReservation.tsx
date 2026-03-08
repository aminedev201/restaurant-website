import Link from 'next/link';
import { CalendarCheck, Clock, Users } from 'lucide-react';

export default function HomeReservation() {
  return (
    <section className="relative py-20 md:py-28 bg-gray-50 dark:bg-gray-950 overflow-hidden">

      {/* Background texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04] dark:opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, #92400e 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Ambient glows */}
      <div className="absolute -right-40 -top-40 w-96 h-96 rounded-full bg-amber-400/10 dark:bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -left-40 -bottom-40 w-96 h-96 rounded-full bg-amber-400/5 dark:bg-amber-500/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2.5 mb-5">
          <div className="h-px w-10 bg-amber-500/60" />
          <span className="text-amber-600 dark:text-amber-400 text-xs font-semibold uppercase tracking-[0.2em]">
            Plan Your Visit
          </span>
          <div className="h-px w-10 bg-amber-500/60" />
        </div>

        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-[1.1] tracking-tight mb-5">
          Make a
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-300 dark:to-amber-500">
            Reservation
          </span>
        </h2>

        <p className="text-gray-500 dark:text-gray-400 text-base md:text-lg mb-12 max-w-xl mx-auto leading-relaxed">
          Secure your spot for an unforgettable evening. We accommodate private events, celebrations, and date nights.
        </p>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
          {[
            { icon: CalendarCheck, title: 'Easy Reservation', desc: 'Reserve online in under 2 minutes' },
            { icon: Clock,         title: 'Flexible Times',   desc: 'Lunch, dinner, and private events'  },
            { icon: Users,         title: 'Any Group Size',   desc: 'Tables for 1 up to 4 guests'        },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6 backdrop-blur-sm shadow-sm dark:shadow-none"
            >
              <div className="w-12 h-12 bg-amber-50 dark:bg-amber-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Icon size={22} className="text-amber-600 dark:text-amber-400" />
              </div>
              <h4 className="text-gray-900 dark:text-white font-semibold mb-1">{title}</h4>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link
          href="/reservation"
          className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-base font-semibold shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-0.5 transition-all duration-200"
        >
          Reserve a Table Now
        </Link>
      </div>
    </section>
  );
}