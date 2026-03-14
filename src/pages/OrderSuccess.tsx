import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Package2, ShoppingBag } from "lucide-react";
import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { verifyPaystackPayment } from "@/lib/api";

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference") ?? searchParams.get("trxref") ?? "";
  const { clearCart } = useCart();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["paystack-order-success", reference],
    queryFn: () => verifyPaystackPayment(reference),
    enabled: reference.trim() !== "",
    retry: 1,
  });

  useEffect(() => {
    if (data?.paymentStatus === "paid") {
      clearCart();
    }
  }, [clearCart, data?.paymentStatus]);

  return (
    <div className="min-h-screen bg-[#f4f7fb] pb-20 md:pb-0">
      <Header />

      <section className="bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_45%,#dbeafe_100%)] py-12 text-white">
        <div className="container">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/75">Order Update</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold md:text-6xl">Payment return</h1>
          <p className="mt-4 max-w-3xl text-base text-white/85 md:text-lg">
            We are confirming your Asafo Tech payment and preparing your electronics order details.
          </p>
        </div>
      </section>

      <main className="container py-8">
        <div className="mx-auto max-w-3xl rounded-[32px] border border-border bg-white p-6 shadow-[0_24px_70px_-52px_rgba(15,23,42,0.5)] md:p-8">
          {reference.trim() === "" && (
            <div className="text-center">
              <Package2 className="mx-auto h-14 w-14 text-primary" />
              <h2 className="mt-5 text-3xl font-extrabold text-foreground">No payment reference found</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                This page works after checkout returns from Paystack with a valid payment reference.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button asChild className="rounded-full px-6">
                  <Link to="/products">Browse Products</Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full px-6">
                  <Link to="/checkout">Return to Checkout</Link>
                </Button>
              </div>
            </div>
          )}

          {reference.trim() !== "" && isLoading && (
            <div className="text-center">
              <CheckCircle2 className="mx-auto h-14 w-14 animate-pulse text-primary" />
              <h2 className="mt-5 text-3xl font-extrabold text-foreground">Verifying payment</h2>
              <p className="mt-3 text-sm text-muted-foreground">Please wait while we confirm your order with Paystack.</p>
            </div>
          )}

          {reference.trim() !== "" && isError && (
            <div className="text-center">
              <Package2 className="mx-auto h-14 w-14 text-destructive" />
              <h2 className="mt-5 text-3xl font-extrabold text-foreground">We could not confirm this payment yet</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                {error instanceof Error ? error.message : "Payment verification failed."}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button asChild className="rounded-full px-6">
                  <Link to="/account?tab=account&panel=orders">Open My Orders</Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full px-6">
                  <Link to="/checkout">Return to Checkout</Link>
                </Button>
              </div>
            </div>
          )}

          {data && (
            <div className="text-center">
              <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-600" />
              <p className="mt-5 text-sm font-semibold uppercase tracking-[0.24em] text-primary">Payment Confirmed</p>
              <h2 className="mt-3 text-3xl font-extrabold text-foreground md:text-4xl">Your order is on the way into processing.</h2>
              <p className="mt-3 text-sm text-muted-foreground">{data.message}</p>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <div className="rounded-3xl border border-border bg-slate-50 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Order Number</p>
                  <p className="mt-3 text-lg font-semibold text-foreground">{data.order.orderNumber}</p>
                </div>
                <div className="rounded-3xl border border-border bg-slate-50 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Payment Status</p>
                  <p className="mt-3 text-lg font-semibold capitalize text-foreground">{data.paymentStatus}</p>
                </div>
                <div className="rounded-3xl border border-border bg-slate-50 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Total</p>
                  <p className="mt-3 text-lg font-semibold text-foreground">GHS {data.order.total.toFixed(2)}</p>
                </div>
              </div>

              <div className="mt-8 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-left">
                <p className="text-sm font-semibold text-emerald-800">What happens next</p>
                <ul className="mt-3 space-y-2 text-sm text-emerald-700">
                  <li>Your order will appear in your account orders panel.</li>
                  <li>Our merchant desk can now move it through processing and delivery.</li>
                  <li>Keep your phone nearby in case support or dispatch needs to reach you.</li>
                </ul>
              </div>

              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button asChild className="rounded-full px-6">
                  <Link to="/account?tab=account&panel=orders">
                    <Package2 className="mr-2 h-4 w-4" />
                    View My Orders
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full px-6">
                  <Link to="/products">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Continue Shopping
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default OrderSuccess;
