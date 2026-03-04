'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Plate } from '@/lib/publicService.Api';

interface FavoritesContextType {
  favorites: Plate[];
  toggleFavorite: (plate: Plate) => void;
  isFavorite: (id: number) => boolean;
  count: number;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<Plate[]>([]);

  const toggleFavorite = useCallback((plate: Plate) => {
    setFavorites(prev =>
      prev.find(p => p.id === plate.id)
        ? prev.filter(p => p.id !== plate.id)
        : [...prev, plate],
    );
  }, []);

  const isFavorite = useCallback(
    (id: number) => favorites.some(p => p.id === id),
    [favorites],
  );

  const count = favorites.length;

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, count }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used inside FavoritesProvider');
  return ctx;
}