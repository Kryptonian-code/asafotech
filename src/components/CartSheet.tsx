import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/context/CartContext";

const CartSheet = () => {
  const { items, isOpen, closeCart, updateQuantity, removeItem, subtotal, clearCart } = useCart();

  const deliveryFee = subtotal >= 200 ? 0 : items.length > 0 ? 15 : 0;
  const total = subtotal + deliveryFee;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => (open ? undefined : closeCart())}>
      <SheetContent side="right" className="w-full overflow-y-auto border-l border-border bg-white p-0 sm:max-w-2xl">
        <div className="flex h-full flex-col">
          <SheetHeader className="border-b border-border px-6 py-5 text-left">
            <SheetTitle className="font-display text-3xl font-bold">Cart Page</SheetTitle>
            <SheetDescription>Review the electronics in your cart before continuing to checkout.</SheetDescription>
          </SheetHeader>

          <div className="flex-1 px-6 py-6">
            {items.length === 0 ? (
              <div className="border border-dashed border-border px-6 py-16 text-center">
                <ShoppingBag className="mx-auto h-12 w-12 text-primary" />
                <h3 className="mt-4 font-display text-3xl font-bold text-foreground">Your cart is empty</h3>
                <p className="mt-3 text-sm text-muted-foreground">Add phones, laptops, controllers or accessories to begin your order.</p>
              </div>
            ) : (
              <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                <div>
                  <div className="mb-6 flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h3 className="text-4xl font-bold text-foreground">Shopping Cart</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {items.length} product{items.length === 1 ? "" : "s"} in your cart.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full px-5 text-sm font-semibold"
                      onClick={clearCart}
                    >
                      Clear Cart
                    </Button>
                  </div>
                  <div className="space-y-6">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-[28px] border border-border bg-slate-50/80 p-4 shadow-[0_18px_48px_-40px_rgba(15,23,42,0.4)]"
                      >
                        <div className="grid gap-4 md:grid-cols-[132px_minmax(0,1fr)]">
                          <div className="rounded-3xl bg-white p-4">
                            <img src={item.product.image} alt={item.product.name} className="h-28 w-full object-contain" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                              <div className="min-w-0">
                                <p className="line-clamp-2 text-lg font-semibold text-foreground">
                                  {item.product.name}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                  {item.product.brand}
                                  {item.selectedVariant?.label ? ` | ${item.selectedVariant.label}` : ""}
                                </p>
                                <div className="mt-3 flex flex-wrap items-center gap-3">
                                  <span className="text-base font-semibold text-foreground">
                                    GHS {(item.selectedVariant?.price ?? item.product.price).toFixed(2)}
                                  </span>
                                  <span
                                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                                      (item.product.inventoryCount ?? 0) > 0
                                        ? "bg-emerald-100 text-emerald-700"
                                        : "bg-rose-100 text-rose-700"
                                    }`}
                                  >
                                    {(item.product.inventoryCount ?? 0) > 0 ? "In Stock" : "Out of Stock"}
                                  </span>
                                </div>
                              </div>

                              <button
                                type="button"
                                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
                                onClick={() => removeItem(item.id)}
                                aria-label={`Remove ${item.product.name} from cart`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="mt-5 grid gap-4 sm:grid-cols-[auto_1fr_auto] sm:items-center">
                              <div className="inline-flex items-center rounded-full border border-border bg-white">
                                <button
                                  type="button"
                                  className="px-3 py-3 text-foreground transition-colors hover:bg-accent"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                                <span className="min-w-12 border-x border-border px-4 py-3 text-center text-sm font-semibold">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  className="px-3 py-3 text-foreground transition-colors hover:bg-accent"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>

                              <p className="text-sm text-muted-foreground">
                                Quantity updates instantly in your cart before checkout.
                              </p>

                              <div className="text-left sm:text-right">
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                                  Item Total
                                </p>
                                <p className="mt-1 text-xl font-bold text-foreground">
                                  GHS {((item.selectedVariant?.price ?? item.product.price) * item.quantity).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-muted p-6">
                  <h3 className="text-2xl font-semibold text-foreground">Order summary</h3>

                  <div className="mt-6 space-y-4 text-base">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-semibold text-foreground">GHS {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Shipping estimate</span>
                      <span className="font-semibold text-foreground">GHS {deliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-border pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-foreground">Order total</span>
                        <span className="text-2xl font-bold text-foreground">GHS {total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 rounded-[24px] border border-border bg-white p-4">
                    <p className="text-sm font-semibold text-foreground">Ready for checkout?</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Continue to the full checkout page to add your Ghana delivery details and complete secure Paystack payment.
                    </p>
                  </div>

                  <Button
                    className="mt-8 h-12 w-full rounded-sm text-base font-semibold uppercase tracking-wide"
                    disabled={items.length === 0 || items.some((item) => (item.product.inventoryCount ?? 0) <= 0)}
                    asChild
                  >
                    <Link to="/checkout" onClick={closeCart}>Proceed to Checkout</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;
