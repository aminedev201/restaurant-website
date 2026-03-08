'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Plate } from '@/lib/publicServiceApi';

export const STORAGE_KEY = 'restaurant_cart';

export interface CartItem {
  plate: Plate;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (plate: Plate) => void;
  removeItem: (id: number) => void;
  updateQty: (id: number, qty: number) => void;
  clearCart: () => void;
  total: number;
  count: number;
}

const CartContext = createContext<CartContextType | null>(null);

// ── Persist helpers ────────────────────────────────────────────────────────────
function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown[];
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item: any) =>
      // drop old shape { menuItem, quantity } and any corrupted entries
      item &&
      typeof item === 'object' &&
      item.plate &&
      typeof item.plate === 'object' &&
      typeof item.plate.id === 'number' &&
      typeof item.plate.price === 'number' &&
      typeof item.quantity === 'number'
    ) as CartItem[];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch { }
}

// ── Provider ───────────────────────────────────────────────────────────────────
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(loadCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveCart(items);
  }, [items, hydrated]);

  const addItem = useCallback((plate: Plate) => {
    setItems(prev => {
      const existing = prev.find(i => i.plate.id === plate.id);
      if (existing) {
        return prev.map(i => i.plate.id === plate.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { plate, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((id: number) => {
    setItems(prev => prev.filter(i => i.plate.id !== id));
  }, []);

  const updateQty = useCallback((id: number, qty: number) => {
    if (qty <= 0) { removeItem(id); return; }
    setItems(prev => prev.map(i => i.plate.id === id ? { ...i, quantity: qty } : i));
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch { }
  }, []);

  const total = items.reduce((s, i) => {
    if (!i?.plate?.price) return s;
    const discount = i.plate.discount ?? 0;
    const effectivePrice = discount > 0
      ? i.plate.price * (1 - discount / 100)
      : i.plate.price;
    return s + effectivePrice * i.quantity;
  }, 0);

  const count = items.reduce((s, i) => s + (i?.quantity ?? 0), 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}