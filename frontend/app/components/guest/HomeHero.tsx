'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, Star, ChevronLeft, ChevronRight } from 'lucide-react';

const SLIDES = [
  {
    image: 'imgs/HomeHero/homeHero1.jpg',
    label: 'Fine Dining',
    heading: 'Where Every Meal',
    accent: 'Becomes a Memory',
    sub: 'Discover Mediterranean flavors reimagined with modern artistry. A dining experience you will carry with you long after the last bite.',
  },
  {
    image: 'imgs/HomeHero/homeHero2.jpg',
    label: 'Exquisite Cuisine',
    heading: 'Crafted With',
    accent: 'Passion & Precision',
    sub: "Every plate tells a story — seasonal ingredients, traditional techniques, and a chef's unwavering commitment to excellence.",
  },
  {
    image: 'imgs/HomeHero/homeHero3.jpg',
    label: 'Unforgettable Evenings',
    heading: 'An Atmosphere',
    accent: 'Like No Other',
    sub: 'From intimate dinners to grand celebrations, our space is designed to make every moment feel extraordinary.',
  },
];

const INTERVAL = 3000;

export default function HomeHero() {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [transitioning, setTransitioning] = useState(false);
  const [paused, setPaused] = useState(false);

  const goTo = (index: number, dir: 'next' | 'prev' = 'next') => {
    if (transitioning || index === current) return;
    setDirection(dir);
    setPrev(current);
    setTransitioning(true);
    setCurrent(index);
    setTimeout(() => {
      setPrev(null);
      setTransitioning(false);
    }, 900);
  };

  const next = () => goTo((current + 1) % SLIDES.length, 'next');
  const prev_ = () => goTo((current - 1 + SLIDES.length) % SLIDES.length, 'prev');

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(next, INTERVAL);
    return () => clearTimeout(t);
  }, [current, paused, transitioning]);

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Slide images ── */}
      {SLIDES.map((slide, i) => {
        const isActive = i === current;
        const isPrev = i === prev;

        let imageClass = 'opacity-0 scale-105';
        if (isActive) imageClass = 'opacity-100 scale-110';
        if (isPrev) imageClass = 'opacity-0 scale-100';

        return (
          <div
            key={i}
            className="absolute inset-0"
            style={{
              zIndex: isActive ? 2 : isPrev ? 1 : 0,
            }}
          >
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all ease-in-out"
              style={{
                backgroundImage: `url('${slide.image}')`,
                transitionDuration: '900ms',
                opacity: isActive ? 1 : 0,
                transform: isActive ? 'scale(1.05)' : 'scale(1)',
              }}
            />
          </div>
        );
      })}

      {/* ── Overlays ── */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/85 z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-black/50 z-10" />

      {/* Grain */}
      <div
        className="absolute inset-0 opacity-[0.15] bg-repeat z-10 pointer-events-none"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">

        {/* Badge */}
        {/* <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white text-sm mb-6">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={11} className="fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span>Rated #1 Fine Dining in Rabat</span>
        </div> */}

        {/* Slide label */}
        <div
          key={`label-${current}`}
          className="inline-flex items-center gap-2.5 mb-4"
          style={{ animation: 'heroFadeUp 0.7s ease both' }}
        >
          <div className="h-px w-8 bg-amber-400/70" />
          <span className="text-amber-400 text-xs font-semibold uppercase tracking-[0.2em]">
            {SLIDES[current].label}
          </span>
          <div className="h-px w-8 bg-amber-400/70" />
        </div>

        {/* Heading */}
        <h1
          key={`heading-${current}`}
          className="font-display text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
          style={{ animation: 'heroFadeUp 0.7s ease 0.1s both' }}
        >
          {SLIDES[current].heading}
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500">
            {SLIDES[current].accent}
          </span>
        </h1>

        {/* Sub */}
        <p
          key={`sub-${current}`}
          className="text-base md:text-lg text-white/75 mb-10 max-w-2xl mx-auto leading-relaxed"
          style={{ animation: 'heroFadeUp 0.7s ease 0.2s both' }}
        >
          {SLIDES[current].sub}
        </p>

        {/* CTAs */}
        <div
          key={`cta-${current}`}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          style={{ animation: 'heroFadeUp 0.7s ease 0.3s both' }}
        >
          <Link
            href="/reservation"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-base font-semibold shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:-translate-y-0.5 transition-all duration-200"
          >
            Reserve a Table
          </Link>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 px-8 py-4 text-white border border-white/30 hover:bg-white/10 rounded-full font-medium transition-all text-base backdrop-blur"
          >
            View Our Menu
          </Link>
        </div>
      </div>

      {/* ── Prev / Next arrows ── */}
      <button
        onClick={prev_}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
        aria-label="Previous slide"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
        aria-label="Next slide"
      >
        <ChevronRight size={20} />
      </button>

      {/* ── Dot indicators ── */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i, i > current ? 'next' : 'prev')}
            aria-label={`Go to slide ${i + 1}`}
            className="relative h-1 rounded-full overflow-hidden transition-all duration-300"
            style={{ width: i === current ? 32 : 8, background: 'rgba(255,255,255,0.3)' }}
          >
            {i === current && (
              <span
                className="absolute inset-0 bg-amber-400 rounded-full origin-left"
                style={{
                  animation: paused
                    ? 'none'
                    : `slideProgress ${INTERVAL}ms linear forwards`,
                }}
              />
            )}
          </button>
        ))}
      </div>

      {/* ── Scroll cue ── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 text-white/40 animate-bounce">
        <ChevronDown size={22} />
      </div>

      {/* ── Keyframe styles ── */}
      <style>{`
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes slideProgress {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
      `}</style>
    </section>
  );
}