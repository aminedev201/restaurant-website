'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingCart, Plus, Minus, Heart, Search,
  X, AlertCircle, UtensilsCrossed, ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { menuApi, MenuCategory, Plate } from '@/lib/publicServiceApi';

// ─── Auth-gate toast ──────────────────────────────────────────────────────────
function AuthNotice({ onClose, onLogin }: { onClose: () => void; onLogin: () => void }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-900 border border-amber-200 dark:border-amber-800 rounded-2xl shadow-xl p-4 flex items-start gap-3">
        <div className="w-9 h-9 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center shrink-0">
          <AlertCircle size={18} className="text-amber-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Login required</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Please sign in to add items to your cart or favorites.
          </p>
          <button
            onClick={onLogin}
            className="mt-2 text-xs font-semibold text-brand-500 hover:text-brand-600 hover:underline"
          >
            Go to login →
          </button>
        </div>
        <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          <X size={15} />
        </button>
      </div>
    </div>
  );
}

// ─── Skeleton card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200 dark:bg-gray-800" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
        <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-xl mt-4" />
      </div>
    </div>
  );
}

// ─── Plate card ───────────────────────────────────────────────────────────────
function PlateCard({
  plate,
  onAuthRequired,
}: {
  plate: Plate;
  onAuthRequired: () => void;
}) {
  const { isAuthenticated } = useAuth();
  const { addItem, items, updateQty, removeItem } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();

  const qty = items.find(i => i.plate.id === plate.id)?.quantity ?? 0;
  const fav = isFavorite(plate.id);
  const hasDiscount = plate.discount > 0 && plate.old_price != null;

  const guard = (action: () => void) => {
    if (!isAuthenticated) { onAuthRequired(); return; }
    action();
  };

  return (
    <div className="group relative flex flex-col rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">

      {/* Image */}
      <div className="relative h-48 bg-gray-100 dark:bg-gray-800 overflow-hidden">
        {plate.image_url ? (
          <Image
            src={plate.image_url}
            alt={plate.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <UtensilsCrossed size={40} className="text-gray-300 dark:text-gray-700" />
          </div>
        )}

        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            -{plate.discount}%
          </span>
        )}

        {/* Favorite button */}
        <button
          onClick={e => { e.preventDefault(); guard(() => toggleFavorite(plate)); }}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-all
            ${fav
              ? 'bg-red-500 text-white shadow-md scale-110'
              : 'bg-white/80 dark:bg-gray-800/80 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400'
            }`}
          aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart size={14} className={fav ? 'fill-current' : ''} />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug line-clamp-1">
            {plate.name}
          </h3>
          <div className="shrink-0 text-right">
            <span className="text-brand-600 dark:text-brand-400 font-bold text-sm">
              MAD {plate.price.toFixed(0)}
            </span>
            {hasDiscount && (
              <p className="text-xs text-gray-400 line-through leading-none">
                MAD {plate.old_price!.toFixed(0)}
              </p>
            )}
          </div>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3 flex-1 line-clamp-2">
          {plate.short_desc}
        </p>

        {/* View details link */}
        <Link
          href={`/menu/${plate.id}`}
          className="flex items-center gap-1 text-xs text-brand-500 hover:text-brand-600 font-medium mb-3 w-fit group/link"
        >
          View details
          <ArrowRight size={12} className="group-hover/link:translate-x-0.5 transition-transform" />
        </Link>

        {/* Cart controls */}
        {qty === 0 ? (
          <button
            onClick={() => guard(() => addItem(plate))}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm rounded-xl transition-colors font-semibold"
          >
            <ShoppingCart size={14} />
            Add to Order
          </button>
        ) : (
          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-xl px-2 py-1.5">
            <button
              onClick={() => qty === 1 ? removeItem(plate.id) : updateQty(plate.id, qty - 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
            >
              <Minus size={14} />
            </button>
            <span className="font-bold text-gray-900 dark:text-white text-sm w-6 text-center">{qty}</span>
            <button
              onClick={() => updateQty(plate.id, qty + 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-brand-500 hover:bg-brand-600 text-white transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function MenuClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [activeCategory, setActiveCategory] = useState<'all' | number>('all');
  const [search, setSearch] = useState('');

  const [showAuthNotice, setShowAuthNotice] = useState(false);
  const authTimer = useRef<NodeJS.Timeout | null>(null);

  // ── Fetch once on mount ───────────────────────────────────────────────────
  const fetchMenu = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await menuApi.getMenu();
      setCategories(res.data ?? []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMenu(); }, [fetchMenu]);

  // ── Apply ?category= query param on load ──────────────────────────────────
  useEffect(() => {
    const catParam = searchParams.get('category');
    if (catParam) {
      const id = parseInt(catParam, 10);
      if (!isNaN(id)) setActiveCategory(id);
    }
  }, [searchParams]);

  // ── Client-side search + category filter ─────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return categories
      .map(cat => {
        const plates = cat.plates.filter(p =>
          !q ||
          p.name.toLowerCase().includes(q) ||
          p.short_desc.toLowerCase().includes(q),
        );
        const catMatch = q && cat.name.toLowerCase().includes(q);
        return { ...cat, plates: catMatch ? cat.plates : plates };
      })
      .filter(cat => {
        if (activeCategory !== 'all' && cat.id !== activeCategory) return false;
        return cat.plates.length > 0;
      });
  }, [categories, search, activeCategory]);

  const totalVisible = filtered.reduce((s, c) => s + c.plates.length, 0);
  const totalAll = categories.reduce((s, c) => s + c.plates.length, 0);

  // ── Auth guard ────────────────────────────────────────────────────────────
  const handleAuthRequired = useCallback(() => {
    setShowAuthNotice(true);
    if (authTimer.current) clearTimeout(authTimer.current);
    authTimer.current = setTimeout(() => setShowAuthNotice(false), 5000);
  }, []);

  return (
    <div className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* ── Hero ── */}
      <section className="relative bg-gray-800 text-white pb-24 pt-36 text-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('/imgs/menu.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/60 via-gray-950/40 to-gray-950/80" />
        <div className="relative z-10">
          <p className="text-amber-400 uppercase tracking-widest text-sm mb-3 font-medium">Our Offerings</p>
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-4">The Menu</h1>
          <p className="text-gray-300 text-base max-w-md mx-auto">
            Discover our authentic Moroccan dishes, crafted with tradition and passion.
          </p>
        </div>
      </section>

      {/* ── Sticky toolbar ── */}
      <div className="sticky top-16 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">

          {/* Search */}
          <div className="py-3 border-b border-gray-100 dark:border-gray-800">
            <div className="relative max-w-md">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search dishes or categories…"
                value={search}
                onChange={e => { setSearch(e.target.value); setActiveCategory('all'); }}
                className="w-full pl-9 pr-9 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-brand-400 transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Category tabs */}
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-1 py-2.5 min-w-max">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap
                  ${activeCategory === 'all'
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
              >
                All
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full
                  ${activeCategory === 'all' ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                  {totalAll}
                </span>
              </button>

              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCategory(cat.id); setSearch(''); }}
                  className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap
                    ${activeCategory === cat.id
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                >
                  {cat.name}
                  <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full
                    ${activeCategory === cat.id ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                    {cat.plates.length}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center">
              <AlertCircle size={28} className="text-red-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">Failed to load menu.</p>
            <button
              onClick={fetchMenu}
              className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && totalVisible === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
              <UtensilsCrossed size={28} className="text-gray-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              {search ? `No results for "${search}"` : 'No items available.'}
            </p>
            {search && (
              <button onClick={() => setSearch('')} className="text-sm text-brand-500 hover:underline">
                Clear search
              </button>
            )}
          </div>
        )}

        {!loading && !error && totalVisible > 0 && (
          <div className="space-y-12">
            {filtered.map(cat => (
              <section key={cat.id}>
                <div className="flex items-center gap-4 mb-6">
                  <div>
                    <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white">
                      {cat.name}
                    </h2>
                    {cat.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{cat.description}</p>
                    )}
                  </div>
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
                  <span className="text-xs text-gray-400 font-medium shrink-0">
                    {cat.plates.length} item{cat.plates.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {cat.plates.map(plate => (
                    <PlateCard
                      key={plate.id}
                      plate={plate}
                      onAuthRequired={handleAuthRequired}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {showAuthNotice && (
        <AuthNotice
          onClose={() => setShowAuthNotice(false)}
          onLogin={() => { setShowAuthNotice(false); router.push('/login'); }}
        />
      )}
    </div>
  );
}