'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingCart, Plus, Minus, Heart, ArrowLeft,
  AlertCircle, UtensilsCrossed, Tag, X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { menuApi, PlateWithCategory } from '@/lib/publicServiceApi';

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
          <button onClick={onLogin} className="mt-2 text-xs font-semibold text-brand-500 hover:text-brand-600 hover:underline">
            Go to login →
          </button>
        </div>
        <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
          <X size={15} />
        </button>
      </div>
    </div>
  );
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800 ${className}`} />;
}

function PlateDetailSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-12">
      <Skeleton className="h-96 rounded-2xl" />
      <div className="space-y-4 py-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
        <Skeleton className="h-10 w-32 mt-4" />
        <div className="flex gap-3 mt-6">
          <Skeleton className="h-12 flex-1 rounded-xl" />
          <Skeleton className="h-12 w-12 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function PlateDetailClient({ id }: { id: number }) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { addItem, items, updateQty, removeItem } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();

  const [plate, setPlate] = useState<PlateWithCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showAuthNotice, setShowAuthNotice] = useState(false);
  const authTimer = useRef<NodeJS.Timeout | null>(null);

  const fetchPlate = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await menuApi.getPlateDetails(id);
      if (!res.status || !res.data) { router.replace('/menu'); return; }
      setPlate(res.data);
    } catch (err: any) {
      if (err?.response?.status === 404) { router.replace('/menu'); return; }
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => { fetchPlate(); }, [fetchPlate]);

  const qty = plate ? (items.find(i => i.plate.id === plate.id)?.quantity ?? 0) : 0;
  const fav = plate ? isFavorite(plate.id) : false;
  const hasDiscount = plate && plate.discount > 0 && plate.old_price != null;

  const guard = (action: () => void) => {
    if (!isAuthenticated) {
      setShowAuthNotice(true);
      if (authTimer.current) clearTimeout(authTimer.current);
      authTimer.current = setTimeout(() => setShowAuthNotice(false), 5000);
      return;
    }
    action();
  };

  return (
    <div className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* ── Hero ── */}
      <section className="relative bg-gray-800 text-white pb-24 pt-36 text-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('/imgs/plate-details.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/60 via-gray-950/40 to-gray-950/80" />
        <div className="relative z-10">
          {plate?.category && (
            <p className="text-amber-400 uppercase tracking-widest text-sm mb-3 font-medium">
              {plate.category.name}
            </p>
          )}
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-4">
            {loading ? 'Loading…' : (plate?.name ?? 'Dish Details')}
          </h1>
          {plate?.short_desc && (
            <p className="text-gray-300 text-base max-w-md mx-auto">{plate.short_desc}</p>
          )}
        </div>
      </section>

      {/* Back bar */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/menu" className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors font-medium">
            <ArrowLeft size={15} /> Back to Menu
          </Link>
          {plate && (
            <>
              <span className="text-gray-300 dark:text-gray-700">/</span>
              <span className="text-sm text-gray-400 dark:text-gray-500">{plate.category?.name}</span>
              <span className="text-gray-300 dark:text-gray-700">/</span>
              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium truncate">{plate.name}</span>
            </>
          )}
        </div>
      </div>

      {loading && <PlateDetailSkeleton />}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center">
            <AlertCircle size={28} className="text-red-400" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Failed to load plate details.</p>
          <button onClick={fetchPlate} className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl transition-colors">
            Try again
          </button>
        </div>
      )}

      {!loading && !error && plate && (
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 gap-12 items-start">

            {/* Image */}
            <div className="relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 aspect-square shadow-sm">
              {plate.image_url ? (
                <Image src={plate.image_url} alt={plate.name} fill className="object-cover" priority />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <UtensilsCrossed size={64} className="text-gray-300 dark:text-gray-700" />
                </div>
              )}
              {hasDiscount && (
                <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow">
                  -{plate.discount}% OFF
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col gap-5">
              {plate.category && (
                <Link href="/menu" className="flex items-center gap-1.5 w-fit px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 text-xs font-semibold hover:bg-brand-100 dark:hover:bg-brand-900/30 transition-colors">
                  <Tag size={11} /> {plate.category.name}
                </Link>
              )}

              <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                {plate.name}
              </h1>

              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{plate.short_desc}</p>

              {plate.desc && (
                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4">
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line">{plate.desc}</p>
                </div>
              )}

              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold text-brand-600 dark:text-brand-400">MAD {plate.price.toFixed(0)}</span>
                {hasDiscount && <span className="text-lg text-gray-400 line-through mb-0.5">MAD {plate.old_price!.toFixed(0)}</span>}
                {hasDiscount && <span className="mb-0.5 text-sm font-semibold text-red-500">Save MAD {(plate.old_price! - plate.price).toFixed(0)}</span>}
              </div>

              <div className="h-px bg-gray-200 dark:bg-gray-800" />

              <div className="flex items-center gap-3">
                {qty === 0 ? (
                  <button onClick={() => { if (plate) guard(() => addItem(plate)); }} className="flex-1 flex items-center justify-center gap-2 py-3 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
                    <ShoppingCart size={16} /> Add to Order
                  </button>
                ) : (
                  <div className="flex-1 flex items-center justify-between bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2">
                    <button onClick={() => qty === 1 ? removeItem(plate.id) : updateQty(plate.id, qty - 1)} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300">
                      <Minus size={16} />
                    </button>
                    <span className="font-bold text-gray-900 dark:text-white">{qty} in cart</span>
                    <button onClick={() => updateQty(plate.id, qty + 1)} className="w-9 h-9 flex items-center justify-center rounded-lg bg-brand-500 hover:bg-brand-600 text-white transition-colors">
                      <Plus size={16} />
                    </button>
                  </div>
                )}

                <button
                  onClick={() => guard(() => toggleFavorite(plate))}
                  className={`w-12 h-12 flex items-center justify-center rounded-xl border transition-all ${fav ? 'bg-red-500 border-red-500 text-white shadow-sm' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-700'}`}
                  aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart size={18} className={fav ? 'fill-current' : ''} />
                </button>
              </div>

              {!isAuthenticated && (
                <p className="text-xs text-gray-400 text-center">
                  <Link href="/login" className="text-brand-500 hover:underline font-medium">Sign in</Link>{' '}
                  to add items to your cart or favorites.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {showAuthNotice && (
        <AuthNotice
          onClose={() => setShowAuthNotice(false)}
          onLogin={() => { setShowAuthNotice(false); router.push('/login'); }}
        />
      )}
    </div>
  );
}