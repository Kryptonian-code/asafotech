import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, MapPin, ShieldCheck, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/context/CartContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { initializePaystackPayment } from "@/lib/api";
import { digitsOnly } from "@/lib/phone";

const Checkout = () => {
  const { items, subtotal } = useCart();
  const { user } = useCustomerAuth();
  const [customerName, setCustomerName] = useState(user?.fullName ?? "");
  const [customerPhone, setCustomerPhone] = useState(user?.phone ?? "");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryRegion, setDeliveryRegion] = useState("Greater Accra");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const deliveryFee = subtotal >= 200 ? 0 : items.length > 0 ? 15 : 0;
  const total = subtotal + deliveryFee;

  const hasOutOfStockItem = useMemo(
    () => items.some((item) => (item.product.inventoryCount ?? 0) <= 0),
    [items],
  );

  const checkoutMutation = useMutation({
    mutationFn: initializePaystackPayment,
    onSuccess: (response) => {
      setSuccessMessage(`Redirecting to Paystack for order ${response.order.orderNumber}...`);
      window.location.href = response.authorizationUrl;
    },
  });

  return (
    <div className="min-h-screen bg-[#f4f7fb] pb-20 md:pb-0">
      <Header />

      <section className="bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_45%,#dbeafe_100%)] py-12 text-white">
        <div className="container">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/75">Checkout</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold md:text-6xl">Complete your order</h1>
          <p className="mt-4 max-w-3xl text-base text-white/85 md:text-lg">
            Confirm your delivery details, review your electronics order, and continue to secure Paystack payment with Ghana cedi pricing.
          </p>
        </div>
      </section>

      <main className="container py-8">
        {items.length === 0 ? (
          <div className="rounded-[30px] border border-dashed border-border bg-white px-6 py-16 text-center shadow-[0_24px_80px_-48px_rgba(15,23,42,0.45)]">
            <CheckCircle2 className="mx-auto h-14 w-14 text-primary" />
            <h2 className="mt-5 text-3xl font-extrabold text-foreground">Your cart is empty</h2>
            <p className="mt-3 text-sm text-muted-foreground">Add phones, laptops, gaming gear, and accessories before checking out.</p>
            <Button className="mt-6 rounded-full px-6" asChild>
              <Link to="/products">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-[30px] border border-border bg-white p-6 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.45)]">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Delivery Details</p>
              <h2 className="mt-2 text-3xl font-extrabold text-foreground">Ghana-first checkout</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Use an active Ghana phone number and clear delivery address so your order can be confirmed quickly.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="customerName">Full name</Label>
                  <Input id="customerName" value={customerName} onChange={(event) => setCustomerName(event.target.value)} className="h-12 rounded-2xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Phone number</Label>
                  <Input
                    id="customerPhone"
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={customerPhone}
                    onChange={(event) => setCustomerPhone(digitsOnly(event.target.value))}
                    className="h-12 rounded-2xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliveryRegion">Delivery region</Label>
                  <select
                    id="deliveryRegion"
                    value={deliveryRegion}
                    onChange={(event) => setDeliveryRegion(event.target.value)}
                    className="h-12 w-full rounded-2xl border border-border bg-white px-4 text-sm text-foreground outline-none"
                  >
                    <option>Greater Accra</option>
                    <option>Ashanti</option>
                    <option>Western</option>
                    <option>Central</option>
                    <option>Eastern</option>
                    <option>Northern</option>
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="deliveryAddress">Delivery address</Label>
                  <Textarea
                    id="deliveryAddress"
                    value={deliveryAddress}
                    onChange={(event) => setDeliveryAddress(event.target.value)}
                    className="min-h-32 rounded-2xl"
                    placeholder="Street, landmark, area and any delivery note for Accra, Kumasi or your chosen location."
                  />
                </div>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {[
                  { icon: MapPin, title: "Delivery support", text: "Clear area, landmark and region details help faster Ghana-wide dispatch." },
                  { icon: Truck, title: "Shipping promise", text: "Orders in major cities can be processed faster once payment is confirmed." },
                  { icon: ShieldCheck, title: "Secure payment", text: "Paystack checkout keeps your order amount and reference protected." },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="rounded-3xl border border-border bg-slate-50 p-4">
                      <Icon className="h-5 w-5 text-primary" />
                      <p className="mt-3 font-semibold text-foreground">{item.title}</p>
                      <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
                    </div>
                  );
                })}
              </div>
            </section>

            <aside className="rounded-[30px] border border-border bg-white p-6 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.45)]">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Order Summary</p>
              <h2 className="mt-2 text-3xl font-extrabold text-foreground">Your basket</h2>

              <div className="mt-6 space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="grid gap-3 rounded-3xl border border-border bg-slate-50 p-4 sm:grid-cols-[72px_minmax(0,1fr)_auto] sm:items-center">
                    <div className="rounded-2xl bg-white p-3">
                      <img src={item.product.image} alt={item.product.name} className="h-12 w-full object-contain" />
                    </div>
                    <div className="min-w-0">
                      <p className="line-clamp-2 font-semibold text-foreground">{item.product.name}</p>
                      {item.selectedVariant?.label && <p className="mt-1 text-xs font-medium text-primary">{item.selectedVariant.label}</p>}
                      <p className="mt-1 text-sm text-muted-foreground">Qty {item.quantity}</p>
                    </div>
                    <p className="text-right font-semibold text-foreground">GHS {((item.selectedVariant?.price ?? item.product.price) * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-3 border-t border-border pt-5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold text-foreground">GHS {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Delivery fee</span>
                  <span className="font-semibold text-foreground">GHS {deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-3">
                  <span className="text-base font-semibold text-foreground">Order total</span>
                  <span className="text-2xl font-bold text-foreground">GHS {total.toFixed(2)}</span>
                </div>
              </div>

              {hasOutOfStockItem && (
                <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  One or more products in your cart are out of stock. Update your basket before payment.
                </p>
              )}
              {checkoutMutation.error && (
                <p className="mt-4 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {checkoutMutation.error.message}
                </p>
              )}
              {successMessage && (
                <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {successMessage}
                </p>
              )}

              <Button
                className="mt-6 h-12 w-full rounded-full text-base font-semibold uppercase tracking-wide"
                disabled={checkoutMutation.isPending || hasOutOfStockItem || customerName.trim() === "" || customerPhone.trim() === "" || deliveryAddress.trim() === ""}
                onClick={() => {
                  setSuccessMessage(null);
                  checkoutMutation.mutate({
                    customerName,
                    customerPhone,
                    deliveryAddress: `${deliveryRegion}: ${deliveryAddress}`,
                    customerEmail: user?.email,
                    customerFirebaseUid: user?.firebaseUid,
                    items: items.map((item) => ({
                      productId: item.product.id,
                      quantity: item.quantity,
                      variantLabel: item.selectedVariant?.label ?? null,
                      variantPrice: item.selectedVariant?.price ?? null,
                    })),
                  });
                }}
              >
                {checkoutMutation.isPending ? "Preparing Payment..." : "Continue to Paystack"}
              </Button>
            </aside>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Checkout;
