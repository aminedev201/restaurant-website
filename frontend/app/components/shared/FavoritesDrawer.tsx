'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  X, Heart, ShoppingCart, UtensilsCrossed,
  Loader2, ArrowRight, Trash2,
} from 'lucide-react';
import { useFavorites } from '@/context/FavoritesContext';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function FavoritesDrawer() {
  const { favorites, loading, drawerOpen, closeDrawer, toggleFavorite, count } = useFavorites();
  const { addItem, items } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeDrawer(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [closeDrawer]);

  // CartItem now uses i.plate.id (not i.menuItem.id)
  const getQty = (id: number) => items.find(i => i.plate.id === id)?.quantity ?? 0;

  return (
    <>
      {/* Backdrop */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={closeDrawer}
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-white dark:bg-gray-900 shadow-2xl flex flex-col
          transition-transform duration-300 ease-in-out
          ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center">
              <Heart size={16} className="text-red-500 fill-red-500" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white text-sm">My Favorites</h2>
              <p className="text-xs text-gray-400">{count} saved {count === 1 ? 'dish' : 'dishes'}</p>
            </div>
          </div>
          <button
            onClick={closeDrawer}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">

          {/* Not authenticated */}
          {!isAuthenticated && (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
                <Heart size={28} className="text-gray-300 dark:text-gray-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Sign in to see favorites</p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Your saved dishes will appear here after you log in.
                </p>
              </div>
              <button
                onClick={() => { closeDrawer(); router.push('/login'); }}
                className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                Sign In
              </button>
            </div>
          )}

          {/* Loading */}
          {isAuthenticated && loading && (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <Loader2 size={24} className="text-brand-500 animate-spin" />
              <p className="text-sm text-gray-400">Loading favorites…</p>
            </div>
          )}

          {/* Empty */}
          {isAuthenticated && !loading && favorites.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
                <UtensilsCrossed size={28} className="text-gray-300 dark:text-gray-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm mb-1">No favorites yet</p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Tap the heart on any dish to save it here.
                </p>
              </div>
              <button
                onClick={() => { closeDrawer(); router.push('/menu'); }}
                className="flex items-center gap-1.5 text-sm text-brand-500 hover:text-brand-600 font-medium"
              >
                Browse menu <ArrowRight size={14} />
              </button>
            </div>
          )}

          {/* Favorites list */}
          {isAuthenticated && !loading && favorites.length > 0 && (
            <ul className="divide-y divide-gray-50 dark:divide-gray-800/60">
              {favorites.map(plate => {
                const qty = getQty(plate.id);
                const hasDiscount = plate.discount > 0 && plate.old_price != null;

                return (
                  <li key={plate.id} className="flex items-start gap-3 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors group">

                    {/* Image */}
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
                      {plate.image_url ? (
                        <Image src={plate.image_url} alt={plate.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <UtensilsCrossed size={18} className="text-gray-300 dark:text-gray-600" />
                        </div>
                      )}
                      {hasDiscount && (
                        <span className="absolute bottom-0 left-0 right-0 bg-red-500 text-white text-[9px] font-bold text-center py-0.5">
                          -{plate.discount}%
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/menu/${plate.id}`}
                        onClick={closeDrawer}
                        className="font-semibold text-gray-900 dark:text-white text-sm hover:text-brand-500 dark:hover:text-brand-400 transition-colors line-clamp-1"
                      >
                        {plate.name}
                      </Link>
                      {plate.category && (
                        <p className="text-xs text-gray-400 mt-0.5">{plate.category.name}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-sm font-bold text-brand-600 dark:text-brand-400">
                          MAD {plate.price.toFixed(0)}
                        </span>
                        {hasDiscount && (
                          <span className="text-xs text-gray-400 line-through">
                            MAD {plate.old_price!.toFixed(0)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {/* Remove from favorites */}
                      <button
                        onClick={() => toggleFavorite(plate)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove from favorites"
                      >
                        <Trash2 size={13} />
                      </button>

                      {/* Add to cart — pass plate directly, no mapping needed */}
                      <button
                        onClick={() => addItem(plate)}
                        className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors
                          ${qty > 0
                            ? 'bg-brand-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-brand-500 hover:text-white dark:hover:bg-brand-500'
                          }`}
                        title={qty > 0 ? `${qty} in cart` : 'Add to cart'}
                      >
                        <ShoppingCart size={13} />
                      </button>
                      {qty > 0 && (
                        <span className="text-[10px] text-brand-500 font-semibold">×{qty}</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer CTA */}
        {isAuthenticated && !loading && favorites.length > 0 && (
          <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
            <button
              onClick={() => { closeDrawer(); router.push('/menu'); }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Browse more dishes <ArrowRight size={14} />
            </button>
          </div>
        )}
      </aside>
    </>
  );
}