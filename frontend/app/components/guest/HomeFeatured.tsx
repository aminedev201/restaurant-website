'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { UtensilsCrossed, ArrowRight, Tag } from 'lucide-react';
import { latestPlatesApi, PlateWithCategory } from '@/lib/publicServiceApi';

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function PlateSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800 overflow-hidden">
      <div className="h-52 bg-gray-200 dark:bg-gray-700" />
      <div className="p-4 space-y-2.5">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
        <div className="flex justify-between items-center mt-3">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
        </div>
      </div>
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
function FeaturedPlateCard({ plate, index }: { plate: PlateWithCategory; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const hasDiscount = plate.discount > 0 && plate.old_price != null;

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.55s ease ${index * 90}ms, transform 0.55s ease ${index * 90}ms`,
      }}
    >
      <Link
        href={`/menu/${plate.id}`}
        className="group flex flex-col rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
      >
        {/* Image */}
        <div className="relative h-52 overflow-hidden bg-gray-100 dark:bg-gray-800">
          {plate.image_url ? (
            <Image
              src={plate.image_url}
              alt={plate.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-900">
              <UtensilsCrossed size={40} className="text-amber-200 dark:text-gray-700" />
            </div>
          )}

          {hasDiscount && (
            <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow">
              -{plate.discount}%
            </span>
          )}

          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-xs font-semibold text-gray-800 dark:text-white shadow-lg">
              View Details
              <ArrowRight size={12} />
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-4">
          {plate.category && (
            <div className="flex items-center gap-1 mb-2">
              <Tag size={10} className="text-amber-500" />
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                {plate.category.name}
              </span>
            </div>
          )}

          <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug line-clamp-1 mb-1">
            {plate.name}
          </h3>

          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 flex-1">
            {plate.short_desc}
          </p>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-amber-600 dark:text-amber-400">
                MAD {plate.price.toFixed(0)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-gray-400 line-through">
                  MAD {plate.old_price!.toFixed(0)}
                </span>
              )}
            </div>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1 group-hover:gap-2 transition-all">
              Order
              <ArrowRight size={11} />
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────
export default function HomeFeatured() {
  const [plates, setPlates] = useState<PlateWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const headerRef = useRef<HTMLDivElement>(null);
  const [headerVisible, setHeaderVisible] = useState(false);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeaderVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    latestPlatesApi
      .get()
      .then((res) => setPlates(res.data ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && (error || plates.length === 0)) return null;

  return (
    <section className="relative bg-gray-50 dark:bg-gray-950 py-20 md:py-28 overflow-hidden">
      <div className="absolute bottom-0 right-0 w-[500px] h-[400px] rounded-full bg-amber-400/10 dark:bg-amber-600/10 blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          ref={headerRef}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12"
          style={{
            opacity: headerVisible ? 1 : 0,
            transform: headerVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
          }}
        >
          <div>
            <div className="inline-flex items-center gap-2.5 mb-3">
              <div className="h-px w-8 bg-amber-500/60" />
              <span className="text-amber-600 dark:text-amber-400 text-xs font-semibold uppercase tracking-[0.2em]">
                Featured Dishes
              </span>
              <div className="h-px w-8 bg-amber-500/60" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
              Signature{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-300 dark:to-amber-500">
                Selections
              </span>
            </h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm max-w-md">
              A taste of what our kitchen does best — crafted with care, served with passion.
            </p>
          </div>

          <a
            href="/menu"
            className="flex items-center gap-1.5 text-sm font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors shrink-0 group/link"
          >
            See full menu
            <ArrowRight size={15} className="group-hover/link:translate-x-0.5 transition-transform" />
          </a>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <PlateSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {plates.map((plate, i) => (
              <FeaturedPlateCard key={plate.id} plate={plate} index={i} />
            ))}
          </div>
        )}

        {/* CTA */}
        {!loading && plates.length > 0 && (
          <div className="mt-12 text-center">
            <a
              href="/menu"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold shadow-lg hover:shadow-amber-500/30 hover:-translate-y-0.5 transition-all duration-200"
            >
              View All Dishes
              <ArrowRight size={15} />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}