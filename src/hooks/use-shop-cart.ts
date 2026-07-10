"use client";

import { useCallback, useEffect, useState } from "react";

import { useAppData } from "@/hooks/app-data";
import type { CartLine } from "@/types";

function cartKey(userId: string) {
  return `shop-cart:${userId}`;
}

/**
 * Client-only cart, persisted to localStorage. Keyed per user because mock
 * mode's paddler<->coach toggle swaps currentUserId mid-session — an
 * unkeyed cart would leak one role's cart into the other's.
 */
export function useShopCart() {
  const { currentUserId } = useAppData();
  const [cart, setCart] = useState<CartLine[]>([]);
  const [loadedForUserId, setLoadedForUserId] = useState<string | null>(null);

  // Render-time state adjustment (React's documented pattern for deriving
  // state from a prop change — pure and synchronous, so not an effect):
  // reload the cart whenever currentUserId changes. Covers both real auth
  // sign-in/out AND mock mode's paddler<->coach toggle, which is
  // effectively a different "account" for cart-scoping purposes.
  if (currentUserId !== loadedForUserId) {
    setLoadedForUserId(currentUserId);
    if (!currentUserId || typeof window === "undefined") {
      setCart([]);
    } else {
      try {
        const raw = window.localStorage.getItem(cartKey(currentUserId));
        setCart(raw ? JSON.parse(raw) : []);
      } catch {
        setCart([]);
      }
    }
  }

  useEffect(() => {
    if (!currentUserId) return;
    window.localStorage.setItem(cartKey(currentUserId), JSON.stringify(cart));
  }, [cart, currentUserId]);

  const addLine = useCallback((line: CartLine) => {
    setCart((prev) => {
      const existing = prev.find((l) => l.styleId === line.styleId && l.size === line.size);
      if (existing) {
        return prev.map((l) =>
          l === existing ? { ...l, quantity: l.quantity + line.quantity } : l
        );
      }
      return [...prev, line];
    });
  }, []);

  const updateQuantity = useCallback((styleId: string, size: string, quantity: number) => {
    setCart((prev) =>
      prev.map((l) => (l.styleId === styleId && l.size === size ? { ...l, quantity } : l))
    );
  }, []);

  const removeLine = useCallback((styleId: string, size: string) => {
    setCart((prev) => prev.filter((l) => !(l.styleId === styleId && l.size === size)));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const totalCount = cart.reduce((sum, l) => sum + l.quantity, 0);

  return { cart, addLine, updateQuantity, removeLine, clearCart, totalCount };
}
