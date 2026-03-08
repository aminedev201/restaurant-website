'use client';

import { useEffect, useState, useRef } from 'react';
import { chefsApi, PublicChef } from '@/lib/publicServiceApi';
import { Facebook, Instagram, Twitter, Youtube, Linkedin, ChefHat } from 'lucide-react';

// ─── Social icon map ──────────────────────────────────────────────────────────
const SOCIAL_META: Record<string, { icon: React.ElementType; label: string }> = {
  facebook:  { icon: Facebook,  label: 'Facebook'  },
  instagram: { icon: Instagram, label: 'Instagram' },
  twitter:   { icon: Twitter,   label: 'Twitter'   },
  youtube:   { icon: Youtube,   label: 'YouTube'   },
  linkedin:  { icon: Linkedin,  label: 'LinkedIn'  },
};

// ─── Skeleton card ────────────────────────────────────────────────────────────
function ChefSkeleton() {
  return (
    <div className="flex flex-col gap-0 animate-pulse">
      <div className="relative overflow-hidden rounded-2xl bg-gray-200 dark:bg-gray-800 aspect-[3/4]" />
      <div className="pt-5 px-1 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-3/4" />
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full w-1/2" />
      </div>
    </div>
  );
}

// ─── Chef card ────────────────────────────────────────────────────────────────
function ChefCard({ chef, index }: { chef: PublicChef; index: number }) {
  const ref  = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const socialEntries = chef.social_media
    ? Object.entries(chef.social_media).filter(([, v]) => v)
    : [];

  return (
    <div
      ref={ref}
      className="group flex flex-col"
      style={{
        opacity:    visible ? 1 : 0,
        transform:  visible ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.6s ease ${index * 120}ms, transform 0.6s ease ${index * 120}ms`,
      }}
    >
      {/* Image wrapper */}
      <div className="relative overflow-hidden rounded-2xl aspect-[3/4] bg-gray-200 dark:bg-gray-800">
        {chef.image_url ? (
          <img
            src={chef.image_url}
            alt={chef.fullname}
            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
            <ChefHat size={48} className="text-gray-300 dark:text-gray-600" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Social links — slide up on hover */}
        {socialEntries.length > 0 && (
          <div className="absolute bottom-0 inset-x-0 flex items-center justify-center gap-3 px-4 py-5
                          translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
            {socialEntries.map(([platform, url]) => {
              const meta = SOCIAL_META[platform];
              if (!meta) return null;
              const Icon = meta.icon;
              return (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={meta.label}
                  className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm border border-white/20
                             flex items-center justify-center text-white/80
                             hover:bg-amber-400 hover:border-amber-400 hover:text-gray-900
                             transition-all duration-200"
                >
                  <Icon size={15} />
                </a>
              );
            })}
          </div>
        )}

        {/* Position badge */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide
                           bg-black/50 backdrop-blur-sm border border-white/10 text-white/80">
            {chef.position}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="pt-4 px-1">
        <h3 className="text-gray-900 dark:text-white font-semibold text-lg leading-tight tracking-tight">{chef.fullname}</h3>
        {chef.short_desc && (
          <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">{chef.short_desc}</p>
        )}
      </div>
    </div>
  );
}

// ─── Main section ─────────────────────────────────────────────────────────────
export default function HomeChefs() {
  const [chefs,   setChefs]   = useState<PublicChef[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  const headerRef = useRef<HTMLDivElement>(null);
  const [headerVisible, setHeaderVisible] = useState(false);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setHeaderVisible(true); obs.disconnect(); } },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    chefsApi.getAll()
      .then(res => setChefs(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  // Don't render section at all if no chefs and not loading
  if (!loading && (error || chefs.length === 0)) return null;

  return (
    <section className="relative bg-gray-50 dark:bg-gray-950 py-24 md:py-32 overflow-hidden">

      {/* Subtle background texture */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, #92400e 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        {/* Warm accent glow */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full
                        bg-amber-400/10 dark:bg-amber-600/10 blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div
          ref={headerRef}
          className="text-center mb-16 md:mb-20"
          style={{
            opacity:   headerVisible ? 1 : 0,
            transform: headerVisible ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
          }}
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2.5 mb-5">
            <div className="h-px w-10 bg-amber-500/60" />
            <span className="text-amber-600 dark:text-amber-400 text-xs font-semibold uppercase tracking-[0.2em]">
              Meet the Team
            </span>
            <div className="h-px w-10 bg-amber-500/60" />
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-[1.1] tracking-tight">
            The Faces Behind
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-300 dark:to-amber-500">
              Every Dish
            </span>
          </h2>

          <p className="mt-5 max-w-xl mx-auto text-gray-500 dark:text-gray-400 text-base md:text-lg leading-relaxed">
            Our chefs bring decades of passion and craft to every plate, transforming the finest ingredients into unforgettable experiences.
          </p>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {Array.from({ length: 4 }).map((_, i) => <ChefSkeleton key={i} />)}
          </div>
        ) : (
          <div className={`grid gap-6 md:gap-8 ${
            chefs.length === 1 ? 'grid-cols-1 max-w-sm mx-auto' :
            chefs.length === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-xl mx-auto' :
            chefs.length === 3 ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3' :
                                 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
          }`}>
            {chefs.map((chef, i) => (
              <ChefCard key={chef.id} chef={chef} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}