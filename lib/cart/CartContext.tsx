"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useSyncExternalStore,
} from "react";
import type { CartItem } from "../types";

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number; // cents (display only — server recomputes authoritative price)
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  checkoutOpen: boolean;
  openCheckout: () => void;
  closeCheckout: () => void;
  add: (item: CartItem) => void;
  remove: (productId: string, sizeId?: string) => void;
  setQuantity: (productId: string, sizeId: string | undefined, quantity: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function sameLine(a: CartItem, productId: string, sizeId?: string) {
  return a.productId === productId && (a.sizeId ?? "") === (sizeId ?? "");
}

/* ── Persistence ─────────────────────────────────────────────────────────
   The cart is saved in localStorage so it survives a refresh or a new visit.
   It is strictly necessary for the shopping feature the visitor asked for
   (no consent needed under Loi 25), and is disclosed in the privacy policy
   (/confidentialite, section "Témoins et stockage local"). Contents expire
   after CART_TTL_MS of inactivity. Keep the key / TTL in sync with the policy. */
const CART_STORAGE_KEY = "amethyste_cart";
const CART_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const EMPTY: CartItem[] = [];

let cartCache: CartItem[] | null = null;
const listeners = new Set<() => void>();

function isCartItem(v: unknown): v is CartItem {
  if (!v || typeof v !== "object") return false;
  const i = v as Record<string, unknown>;
  return (
    typeof i.productId === "string" &&
    typeof i.slug === "string" &&
    typeof i.quantity === "number" &&
    i.quantity > 0 &&
    typeof i.displayUnitAmount === "number" &&
    !!i.name &&
    typeof i.name === "object"
  );
}

function readStoredCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as { savedAt?: number; items?: unknown };
    if (typeof parsed.savedAt !== "number" || Date.now() - parsed.savedAt > CART_TTL_MS) {
      localStorage.removeItem(CART_STORAGE_KEY);
      return EMPTY;
    }
    return Array.isArray(parsed.items) ? parsed.items.filter(isCartItem) : EMPTY;
  } catch {
    return EMPTY;
  }
}

function writeStoredCart(items: CartItem[]) {
  try {
    if (items.length === 0) {
      localStorage.removeItem(CART_STORAGE_KEY);
      return;
    }
    const save = (list: CartItem[]) =>
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ savedAt: Date.now(), items: list }));
    try {
      save(items);
    } catch {
      // Quota exceeded (e.g. inline data: images) — retry without images.
      save(items.map((i) => (i.image?.startsWith("data:") ? { ...i, image: undefined } : i)));
    }
  } catch {
    // Storage unavailable (private mode, blocked) — cart stays in memory only.
  }
}

function getCart(): CartItem[] {
  if (cartCache === null) cartCache = readStoredCart();
  return cartCache;
}

function setCart(updater: (prev: CartItem[]) => CartItem[]) {
  const next = updater(getCart());
  cartCache = next;
  writeStoredCart(next);
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Keep several open tabs in sync.
  const onStorage = (e: StorageEvent) => {
    if (e.key !== null && e.key !== CART_STORAGE_KEY) return;
    cartCache = readStoredCart();
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  // Server render / hydration sees an empty cart; the saved cart is applied
  // right after hydration, so there's no markup mismatch.
  const items = useSyncExternalStore(subscribe, getCart, () => EMPTY);
  const [isOpen, setIsOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const add = useCallback((item: CartItem) => {
    setCart((prev) => {
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
    setCart((prev) => prev.filter((i) => !sameLine(i, productId, sizeId)));
  }, []);

  const setQuantity = useCallback(
    (productId: string, sizeId: string | undefined, quantity: number) => {
      setCart((prev) =>
        quantity <= 0
          ? prev.filter((i) => !sameLine(i, productId, sizeId))
          : prev.map((i) =>
              sameLine(i, productId, sizeId) ? { ...i, quantity } : i,
            ),
      );
    },
    [],
  );

  const clear = useCallback(() => setCart(() => EMPTY), []);

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
    checkoutOpen,
    // Opening checkout closes the drawer so the payment modal takes over.
    openCheckout: () => {
      setIsOpen(false);
      setCheckoutOpen(true);
    },
    closeCheckout: () => setCheckoutOpen(false),
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
