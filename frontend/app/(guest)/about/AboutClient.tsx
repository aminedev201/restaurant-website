'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

const stats = [
  { n: '14+', label: 'Years of Excellence' },
  { n: '3',   label: 'Chef Awards' },
  { n: '40+', label: 'Signature Dishes' },
  { n: '5K+', label: 'Happy Guests / Month' },
];

const values = [
  {
    title: 'Heritage',
    desc: 'Every recipe traces its roots to centuries-old Moroccan tradition, preserved with reverence and care.',
  },
  {
    title: 'Craft',
    desc: 'Our brigade brings Michelin-level precision to each plate — no shortcuts, no compromises.',
  },
  {
    title: 'Seasonality',
    desc: 'We follow the rhythm of the land, sourcing the finest local ingredients at their peak.',
  },
  {
    title: 'Hospitality',
    desc: 'From the first greeting to the last morsel, we believe dining is an act of genuine care.',
  },
];

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add('revealed'); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useReveal();
  return (
    <div ref={ref} className={`reveal-block ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export default function AboutClient() {
  return (
    <>
      <style>{`
        .reveal-block {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.75s cubic-bezier(.22,1,.36,1), transform 0.75s cubic-bezier(.22,1,.36,1);
        }
        .reveal-block.revealed { opacity: 1; transform: translateY(0); }

        .dot-texture {
          background-image: radial-gradient(circle, #92400e 1px, transparent 1px);
          background-size: 28px 28px;
        }

        @keyframes slowZoom {
          from { transform: scale(1); }
          to   { transform: scale(1.07); }
        }
        .hero-img { animation: slowZoom 14s ease-in-out infinite alternate; }

        .gold-line {
          display: inline-flex;
          align-items: center;
          gap: 12px;
        }
        .gold-line::before, .gold-line::after {
          content: '';
          display: block;
          height: 1px;
          width: 36px;
          background: #d97706;
          opacity: 0.65;
        }
      `}</style>

      <div className="pt-16 min-h-screen bg-white dark:bg-gray-950 overflow-hidden">

        {/* ── HERO ────────────────────────────────────── */}
        <section className="relative h-[72vh] min-h-[520px] flex items-end overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="hero-img absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('imgs/about-us.jpg')" }}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
          {/* Grain */}
          <div
            className="absolute inset-0 opacity-[0.12] pointer-events-none"
            style={{ backgroundImage: "url('imgs/about-us.jpg')" }}
          />
          <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-12 pb-16 w-full">
            <p className="gold-line text-amber-400 text-xs font-semibold uppercase tracking-[0.25em] mb-5">
              Our Story
            </p>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-[1.05] mb-5">
              Born From<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">
                Passion & Fire
              </span>
            </h1>
            <p className="text-white/60 text-base md:text-lg max-w-xl leading-relaxed">
              A chef&apos;s love letter to Morocco — where ancient spice routes meet the finesse of modern gastronomy.
            </p>
          </div>
        </section>

        {/* ── ORIGIN STORY ────────────────────────────── */}
        <section className="relative py-24 md:py-32 bg-white dark:bg-gray-950">
          <div className="absolute inset-0 dot-texture opacity-[0.035] dark:opacity-[0.025] pointer-events-none" />
          <div className="absolute -right-40 top-20 w-96 h-96 bg-amber-400/6 dark:bg-amber-500/6 blur-3xl pointer-events-none rounded-full" />

          <div className="relative max-w-6xl mx-auto px-6 lg:px-12">
            <div className="grid md:grid-cols-2 gap-16 lg:gap-24 items-center">

              {/* Image side */}
              <Reveal className="order-2 md:order-1">
                <div className="relative">
                  <div className="absolute -top-5 -left-5 w-full h-full border border-amber-400/25 rounded-2xl" />
                  <div className="relative rounded-2xl overflow-hidden aspect-[4/5] bg-gray-100 dark:bg-gray-800 shadow-2xl">
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: "url('imgs/about-us-chef.jpg')" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <p className="text-white font-semibold text-lg leading-tight">Chef Karim Alaoui</p>
                      <p className="text-white/55 text-sm">Founder & Head Chef</p>
                    </div>
                  </div>
                  {/* Floating badge */}
                  <div className="absolute -bottom-6 -right-6 w-28 h-28 rounded-full bg-amber-500 flex flex-col items-center justify-center text-white shadow-xl shadow-amber-500/30">
                    <span className="font-display font-bold text-3xl leading-none">14</span>
                    <span className="text-[10px] font-medium opacity-80 text-center px-2 leading-snug">Years of Excellence</span>
                  </div>
                </div>
              </Reveal>

              {/* Text side */}
              <div className="order-1 md:order-2 space-y-5">
                <Reveal>
                  <p className="gold-line text-amber-600 dark:text-amber-400 text-xs font-semibold uppercase tracking-[0.2em]">
                    Founded 2010 · Rabat, Morocco
                  </p>
                </Reveal>
                <Reveal delay={80}>
                  <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                    A Kitchen Built<br />on Two Continents
                  </h2>
                </Reveal>
                <Reveal delay={150}>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
                    Chef Karim Alaoui trained in the kitchens of Paris, mastering classical French technique
                    under Michelin-starred mentors. When he returned to Rabat, he carried something far
                    more precious: a renewed reverence for his homeland&apos;s ingredients, spices, and memory.
                  </p>
                </Reveal>
                <Reveal delay={200}>
                  <p className="text-gray-500 dark:text-gray-500 leading-relaxed">
                    La Maison opened its doors with a single ambition — to make every guest feel like they
                    were dining in a cherished family home, where food is the language of love. Fourteen
                    years later, that spirit has never wavered.
                  </p>
                </Reveal>
                <Reveal delay={250}>
                  <div className="pt-2 flex flex-wrap gap-3">
                    <Link
                      href="/menu"
                      className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-lg shadow-amber-500/20 hover:-translate-y-0.5 transition-all duration-200 text-sm"
                    >
                      Explore Our Menu
                    </Link>
                    <Link
                      href="/reservation"
                      className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-all duration-200 text-sm"
                    >
                      Reserve a Table
                    </Link>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS ───────────────────────────────────── */}
        <section className="py-20 bg-gray-950 relative overflow-hidden">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[280px] bg-amber-500/8 blur-[110px] pointer-events-none rounded-full" />
          <div className="absolute inset-0 dot-texture opacity-[0.025] pointer-events-none" />

          <div className="relative max-w-6xl mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/8 rounded-3xl overflow-hidden border border-white/8">
              {stats.map((s, i) => (
                <Reveal key={s.label} delay={i * 80}>
                  <div className="bg-gray-950 p-8 md:p-10 text-center group hover:bg-amber-500/5 transition-colors duration-300 h-full">
                    <p className="font-display text-4xl md:text-5xl font-bold text-amber-400 mb-2 group-hover:scale-105 transition-transform duration-300">
                      {s.n}
                    </p>
                    <p className="text-gray-500 text-sm">{s.label}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── VALUES ──────────────────────────────────── */}
        <section className="relative py-24 md:py-32 bg-gray-50 dark:bg-gray-900/40 overflow-hidden">
          <div className="absolute inset-0 dot-texture opacity-[0.04] dark:opacity-[0.025] pointer-events-none" />
          <div className="absolute -left-40 bottom-0 w-96 h-96 rounded-full bg-amber-400/6 blur-3xl pointer-events-none" />

          <div className="relative max-w-6xl mx-auto px-6 lg:px-12">
            <Reveal className="text-center mb-16">
              <p className="gold-line text-amber-600 dark:text-amber-400 text-xs font-semibold uppercase tracking-[0.2em] justify-center mb-4">
                What We Believe
              </p>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                The Four Pillars
              </h2>
            </Reveal>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {values.map((v, i) => (
                <Reveal key={v.title} delay={i * 90}>
                  <div className="group relative bg-white dark:bg-gray-900 rounded-2xl p-7 border border-gray-100 dark:border-gray-800 hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-xl hover:shadow-amber-500/8 transition-all duration-300 h-full">
                    <span className="absolute top-5 right-5 font-display text-6xl font-bold text-gray-100 dark:text-gray-800 select-none group-hover:text-amber-100 dark:group-hover:text-amber-900/50 transition-colors duration-300 leading-none">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="relative">
                      <div className="w-8 h-0.5 bg-amber-500 mb-5" />
                      <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-3">
                        {v.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{v.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────── */}
        <section className="relative py-28 bg-white dark:bg-gray-950 overflow-hidden">
          <div className="absolute inset-0 dot-texture opacity-[0.035] dark:opacity-[0.025] pointer-events-none" />
          <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[600px] h-[300px] bg-amber-400/6 blur-[80px] pointer-events-none rounded-full" />

          <div className="relative max-w-2xl mx-auto px-6 text-center">
            <Reveal>
              <p className="gold-line text-amber-600 dark:text-amber-400 text-xs font-semibold uppercase tracking-[0.2em] justify-center mb-5">
                Join Us
              </p>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-5 leading-tight">
                Reserve Your Table{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-300 dark:to-amber-500">
                  Tonight
                </span>
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-10 leading-relaxed">
                Whether a quiet dinner for two or a grand celebration — we&apos;re ready to make your evening unforgettable.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/reservation"
                  className="px-8 py-4 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-lg shadow-amber-500/25 hover:-translate-y-0.5 transition-all duration-200"
                >
                  Make a Reservation
                </Link>
                <Link
                  href="/contact"
                  className="px-8 py-4 rounded-full border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-all duration-200"
                >
                  Get in Touch
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

      </div>
    </>
  );
}