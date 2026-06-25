"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import type { CartItem } from "../types";

const STORAGE_KEY = "amethyste_cart_v1";

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number; // cents (display only — server recomputes authoritative price)
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  add: (item: CartItem) => void;
  remove: (productId: string, sizeId?: string) => void;
  setQuantity: (productId: string, sizeId: string | undefined, quantity: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function sameLine(a: CartItem, productId: string, sizeId?: string) {
  return a.productId === productId && (a.sizeId ?? "") === (sizeId ?? "");
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // Hydrate cart from localStorage post-mount to avoid SSR mismatch.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items, hydrated]);

  const add = useCallback((item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => sameLine(i, item.productId, item.sizeId));
      if (existing) {
        return prev.map((i) =>
          sameLine(i, item.productId, item.sizeId)
            ? { ...i, quantity: i.quantity + item.quantity }
            : i,
        );
      }
      return [...prev, item];
    });
    setIsOpen(true);
  }, []);

  const remove = useCallback((productId: string, sizeId?: string) => {
    setItems((prev) => prev.filter((i) => !sameLine(i, productId, sizeId)));
  }, []);

  const setQuantity = useCallback(
    (productId: string, sizeId: string | undefined, quantity: number) => {
      setItems((prev) =>
        quantity <= 0
          ? prev.filter((i) => !sameLine(i, productId, sizeId))
          : prev.map((i) =>
              sameLine(i, productId, sizeId) ? { ...i, quantity } : i,
            ),
      );
    },
    [],
  );

  const clear = useCallback(() => setItems([]), []);

  const { count, subtotal } = useMemo(() => {
    return items.reduce(
      (acc, i) => ({
        count: acc.count + i.quantity,
        subtotal: acc.subtotal + i.displayUnitAmount * i.quantity,
      }),
      { count: 0, subtotal: 0 },
    );
  }, [items]);

  const value: CartContextValue = {
    items,
    count,
    subtotal,
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((v) => !v),
    add,
    remove,
    setQuantity,
    clear,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
