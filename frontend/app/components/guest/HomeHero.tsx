'use client';

import Link from 'next/link';
import { ChevronDown, Star } from 'lucide-react';

export default function HomeHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=80')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />

      {/* Grain overlay */}
      <div className="absolute inset-0 opacity-20 bg-repeat"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")" }} />

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white text-sm mb-6 animate-fade-in">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => <Star key={i} size={11} className="fill-brand-400 text-brand-400" />)}
          </div>
          <span>Rated #1 Fine Dining in Rabat</span>
        </div>

        <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-6 leading-tight animate-fade-up">
          Where Every Meal<br />
          <span className="text-gradient">Becomes a Memory</span>
        </h1>

        <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto animate-fade-up animate-delay-200">
          Discover Mediterranean flavors reimagined with modern artistry. A dining experience you will carry with you long after the last bite.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up animate-delay-300">
          <Link href="/booking" className="btn-primary text-base px-8 py-4 shadow-lg shadow-brand-500/30">
            Reserve a Table
          </Link>
          <Link href="/menu" className="inline-flex items-center gap-2 px-8 py-4 text-white border border-white/30 hover:bg-white/10 rounded-xl font-medium transition-all text-base backdrop-blur">
            View Our Menu
          </Link>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 animate-bounce">
        <ChevronDown size={24} />
      </div>
    </section>
  );
}