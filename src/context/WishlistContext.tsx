import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Product } from "@/lib/api";

interface WishlistContextValue {
  items: Product[];
  itemCount: number;
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  toggleItem: (product: Product) => void;
  isWishlisted: (productId: number) => boolean;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);
const STORAGE_KEY = "asafo-tech-wishlist";

function isProductArray(value: unknown): value is Product[] {
  return Array.isArray(value) && value.every((item) => {
    if (typeof item !== "object" || item === null) {
      return false;
    }

    const candidate = item as { id?: unknown; name?: unknown; price?: unknown };
    return typeof candidate.id === "number"
      && typeof candidate.name === "string"
      && typeof candidate.price === "number";
  });
}

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored) as unknown;

      if (isProductArray(parsed)) {
        setItems(parsed);
        return;
      }

      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo<WishlistContextValue>(() => ({
    items,
    itemCount: items.length,
    addItem: (product) => {
      setItems((current) => {
        if (current.some((item) => item.id === product.id)) {
          return current;
        }

        return [product, ...current];
      });
    },
    removeItem: (productId) => {
      setItems((current) => current.filter((item) => item.id !== productId));
    },
    toggleItem: (product) => {
      setItems((current) => (
        current.some((item) => item.id === product.id)
          ? current.filter((item) => item.id !== product.id)
          : [product, ...current]
      ));
    },
    isWishlisted: (productId) => items.some((item) => item.id === productId),
  }), [items]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }

  return context;
};
