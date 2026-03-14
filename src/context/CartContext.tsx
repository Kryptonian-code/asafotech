import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Product, ProductVariant } from "@/lib/api";

interface CartItem {
  id: string;
  product: Product;
  selectedVariant?: ProductVariant | null;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  itemCount: number;
  subtotal: number;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, selectedVariant?: ProductVariant | null) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "asafo-tech-cart";

function isCartItemArray(value: unknown): value is CartItem[] {
  return Array.isArray(value) && value.every((item) => {
    if (typeof item !== "object" || item === null) {
      return false;
    }

    const candidate = item as {
      quantity?: unknown;
      id?: unknown;
      product?: { id?: unknown; price?: unknown };
    };

    return (candidate.id == null || typeof candidate.id === "string")
      && typeof candidate.quantity === "number"
      && typeof candidate.product?.id === "number"
      && typeof candidate.product?.price === "number";
  });
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored) as unknown;

      if (isCartItemArray(parsed)) {
        setItems(parsed.map((item) => ({
          ...item,
          id: item.id ?? `${item.product.id}:${item.selectedVariant?.id ?? "default"}`,
        })));
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

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + (item.selectedVariant?.price ?? item.product.price) * item.quantity, 0);

    return {
      items,
      isOpen,
      itemCount,
      subtotal,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem: (product, selectedVariant = null) => {
        setItems((current) => {
          const itemId = `${product.id}:${selectedVariant?.id ?? "default"}`;
          const existing = current.find((item) => item.id === itemId);

          if (existing) {
            return current.map((item) =>
              item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item,
            );
          }

          return [...current, { id: itemId, product, selectedVariant, quantity: 1 }];
        });
      },
      removeItem: (itemId) => {
        setItems((current) => current.filter((item) => item.id !== itemId));
      },
      updateQuantity: (itemId, quantity) => {
        setItems((current) =>
          current.map((item) =>
            item.id === itemId ? { ...item, quantity: Math.max(1, quantity) } : item,
          ),
        );
      },
      clearCart: () => setItems([]),
    };
  }, [isOpen, items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
};
