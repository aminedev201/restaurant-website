'use client';

import React, {
  createContext, useContext, useState,
  useCallback, useEffect,
} from 'react';
import { useAuth } from '@/context/AuthContext';
import { favoritesApi, Plate, PlateWithCategory } from '@/lib/userServiceApi';

interface FavoritesContextType {
  favorites: PlateWithCategory[];
  loading: boolean;
  toggleFavorite: (plate: Plate | PlateWithCategory) => Promise<void>;
  isFavorite: (id: number) => boolean;
  count: number;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  refresh: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  const [favorites, setFavorites]   = useState<PlateWithCategory[]>([]);
  const [loading, setLoading]       = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // ── Fetch from API ──────────────────────────────────────────────────────────
  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setFavorites([]);
      return;
    }
    setLoading(true);
    try {
      const res = await favoritesApi.getAll();
      if (res.status) setFavorites(res.data ?? []);
    } catch {
      // silently ignore — user keeps stale state
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch whenever auth state changes
  useEffect(() => { refresh(); }, [refresh]);

  // Clear on logout
  useEffect(() => {
    if (!isAuthenticated) setFavorites([]);
  }, [isAuthenticated]);

  // ── Toggle (optimistic) ─────────────────────────────────────────────────────
  const toggleFavorite = useCallback(async (plate: Plate | PlateWithCategory) => {
    if (!isAuthenticated) return;

    const alreadyFav = favorites.some(p => p.id === plate.id);

    // Optimistic update
    setFavorites(prev =>
      alreadyFav
        ? prev.filter(p => p.id !== plate.id)
        : [...prev, plate as PlateWithCategory],
    );

    try {
      await favoritesApi.toggle(plate.id);
    } catch {
      // Rollback on error
      setFavorites(prev =>
        alreadyFav
          ? [...prev, plate as PlateWithCategory]
          : prev.filter(p => p.id !== plate.id),
      );
    }
  }, [isAuthenticated, favorites]);

  const isFavorite   = useCallback((id: number) => favorites.some(p => p.id === id), [favorites]);
  const openDrawer   = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer  = useCallback(() => setDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setDrawerOpen(v => !v), []);

  return (
    <FavoritesContext.Provider value={{
      favorites, loading,
      toggleFavorite, isFavorite, count: favorites.length,
      drawerOpen, openDrawer, closeDrawer, toggleDrawer,
      refresh,
    }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used inside FavoritesProvider');
  return ctx;
}