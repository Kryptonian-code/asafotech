import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  Heart,
  Inbox,
  LayoutGrid,
  LogOut,
  MessageCircleMore,
  Package2,
  ShoppingCart,
  UserRound,
  Wifi,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { isTawkConfigured } from "@/components/TawkChatWidget";
import { useCart } from "@/context/CartContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { getCategories, getCustomerOrderDetails, getCustomerOrders, getProducts, verifyPaystackPayment } from "@/lib/api";

const mainTabs = ["home", "categories", "cart", "wishlist", "account"] as const;
type MainTab = (typeof mainTabs)[number];

const accountPanels = ["overview", "orders", "inbox", "wishlists"] as const;
type AccountPanel = (typeof accountPanels)[number];

const greetings = ["Akwaaba", "Woezor", "Oobakɛ", "Awaaba", "Barka da zuwa"] as const;

const getRotatingGreeting = () => {
  const now = new Date();
  const thirtySecondBucket = Math.floor(now.getTime() / (30 * 1000));
  return greetings[thirtySecondBucket % greetings.length];
};

const Account = () => {
  const { user, logout } = useCustomerAuth();
  const { items: cartItems, subtotal, openCart } = useCart();
  const { items: wishlistItems } = useWishlist();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const panelParam = searchParams.get("panel");
  const activeTab: MainTab = mainTabs.includes(tabParam as MainTab) ? (tabParam as MainTab) : "home";
  const activePanel: AccountPanel = accountPanels.includes(panelParam as AccountPanel)
    ? (panelParam as AccountPanel)
    : "overview";

  const { data: products = [] } = useQuery({
    queryKey: ["products", "account-home"],
    queryFn: () => getProducts(),
  });
  const { data: categories = [] } = useQuery({
    queryKey: ["categories", "account"],
    queryFn: getCategories,
  });
  const { data: customerOrders = [] } = useQuery({
    queryKey: ["customer-orders", user?.email, user?.firebaseUid],
    queryFn: () => getCustomerOrders({
      email: user?.email ?? "",
      firebaseUid: user?.firebaseUid ?? null,
    }),
    enabled: Boolean(user?.email),
  });

  const firstName = user?.fullName?.split(" ")[0] ?? "Customer";
  const [greeting, setGreeting] = useState(getRotatingGreeting());
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);
  const [selectedOrderNumber, setSelectedOrderNumber] = useState<string | null>(null);
  const supportMessage = encodeURIComponent("Hello Asafo Tech, I need help with my account, order, or cart.");
  const whatsappLink = `https://wa.me/233240000000?text=${supportMessage}`;
  const openLiveChat = () => {
    if (isTawkConfigured) {
      window.Tawk_API?.maximize?.();
      return;
    }

    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set("tab", "account");
      next.set("panel", "inbox");
      return next;
    });
  };

  const { data: selectedOrderDetails } = useQuery({
    queryKey: ["customer-order-details", selectedOrderNumber, user?.email, user?.firebaseUid],
    queryFn: () => getCustomerOrderDetails({
      email: user?.email ?? "",
      firebaseUid: user?.firebaseUid ?? null,
    }, selectedOrderNumber ?? ""),
    enabled: Boolean(selectedOrderNumber && user?.email),
  });

  useEffect(() => {
    setGreeting(getRotatingGreeting());

    const intervalId = window.setInterval(() => {
      setGreeting(getRotatingGreeting());
    }, 30 * 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const reference = searchParams.get("reference") ?? searchParams.get("trxref");

    if (!reference || !user?.email) {
      return;
    }

    let cancelled = false;

    void verifyPaystackPayment(reference)
      .then((response) => {
        if (cancelled) {
          return;
        }

        setPaymentMessage(response.message);
        const next = new URLSearchParams(searchParams);
        next.set("tab", "account");
        next.set("panel", "orders");
        next.delete("reference");
        next.delete("trxref");
        setSearchParams(next, { replace: true });
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }

        setPaymentMessage(error instanceof Error ? error.message : "Payment verification failed.");
      });

    return () => {
      cancelled = true;
    };
  }, [searchParams, setSearchParams, user?.email]);

  const setMainTab = (tab: MainTab) => {
    const next = new URLSearchParams(searchParams);
    next.set("tab", tab);
    if (tab !== "account") {
      next.delete("panel");
    } else if (!next.get("panel")) {
      next.set("panel", "overview");
    }
    setSearchParams(next);
  };

  const setAccountPanel = (panel: AccountPanel) => {
    const next = new URLSearchParams(searchParams);
    next.set("tab", "account");
    next.set("panel", panel);
    setSearchParams(next);
  };

  const quickLinks = [
    {
      id: "orders" as const,
      title: "Orders",
      description: "Track your purchases and delivery progress.",
      icon: Package2,
    },
    {
      id: "inbox" as const,
      title: "Inbox",
      description: "See support replies and account alerts.",
      icon: Inbox,
    },
    {
      id: "wishlists" as const,
      title: "Wishlists",
      description: "Open your saved phones, laptops, and accessories.",
      icon: Heart,
    },
  ];

  const renderAccountPanel = () => {
    const orderStageIndex = (status: string) => {
      const stages = ["pending", "processing", "shipped", "delivered"];
      const index = stages.indexOf(status.toLowerCase());
      return index === -1 ? 0 : index;
    };

    if (activePanel === "orders") {
      return (
        <div className="rounded-3xl border border-border bg-slate-50 p-6">
          <div className="flex items-center gap-3">
            <Package2 className="h-5 w-5 text-primary" />
            <h3 className="text-2xl font-bold text-foreground">Orders</h3>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">Track your placed orders and see their current status.</p>
          {paymentMessage && (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {paymentMessage}
            </div>
          )}
          {customerOrders.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-border bg-white px-6 py-12 text-center">
              <Package2 className="mx-auto h-12 w-12 text-primary" />
              <h4 className="mt-4 text-xl font-bold text-foreground">No orders yet</h4>
              <p className="mt-2 text-sm text-muted-foreground">
                When you shop while signed in, your confirmed orders will be listed here.
              </p>
                <Link to="/products" className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-white">
                  Start Shopping
                </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {customerOrders.map((order) => (
                <div key={order.id} className="rounded-3xl border border-border bg-white p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-primary">Order</p>
                      <h4 className="mt-2 text-xl font-bold text-foreground">{order.orderNumber}</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">{order.status}</span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">{order.paymentStatus}</span>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-4 text-sm text-muted-foreground md:grid-cols-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em]">Total</p>
                      <p className="mt-2 text-base font-semibold text-foreground">GHS {order.total.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em]">Placed</p>
                      <p className="mt-2 text-base font-semibold text-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em]">Delivery</p>
                      <p className="mt-2 text-base font-semibold text-foreground">{order.deliveryAddress}</p>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-2 md:grid-cols-4">
                    {["Pending", "Processing", "Shipped", "Delivered"].map((stage, index) => {
                      const active = index <= orderStageIndex(order.status);
                      return (
                        <div
                          key={`${order.id}-${stage}`}
                          className={`rounded-2xl px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide ${
                            active
                              ? "bg-primary text-white"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {stage}
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-5 flex justify-end">
                    <Button
                      variant="outline"
                      className="rounded-full"
                      onClick={() => setSelectedOrderNumber((current) => current === order.orderNumber ? null : order.orderNumber)}
                    >
                      {selectedOrderNumber === order.orderNumber ? "Hide Details" : "View Details"}
                    </Button>
                  </div>
                  {selectedOrderNumber === order.orderNumber && selectedOrderDetails && (
                    <div className="mt-5 rounded-3xl border border-border bg-slate-50 p-5">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Customer</p>
                          <p className="mt-2 font-semibold text-foreground">{selectedOrderDetails.customerName}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Phone</p>
                          <p className="mt-2 font-semibold text-foreground">{selectedOrderDetails.customerPhone}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Address</p>
                          <p className="mt-2 font-semibold text-foreground">{selectedOrderDetails.deliveryAddress}</p>
                        </div>
                      </div>

                      <div className="mt-5 space-y-3">
                        {selectedOrderDetails.items.map((item) => (
                          <div key={item.id} className="grid gap-3 rounded-2xl border border-border bg-white p-4 sm:grid-cols-[70px_minmax(0,1fr)_auto] sm:items-center">
                            <div className="rounded-2xl bg-slate-50 p-3">
                              <img src={item.image} alt={item.productName} className="h-12 w-full object-contain" />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-foreground">{item.productName}</p>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {item.brand}
                                {item.variantLabel ? ` | ${item.variantLabel}` : ""}
                                {" | "}Qty {item.quantity}
                              </p>
                            </div>
                            <p className="font-semibold text-foreground">GHS {(item.unitPrice * item.quantity).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (activePanel === "inbox") {
      return (
        <div className="rounded-3xl border border-border bg-slate-50 p-6">
          <div className="flex items-center gap-3">
            <Inbox className="h-5 w-5 text-primary" />
            <h3 className="text-2xl font-bold text-foreground">Inbox</h3>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">See notifications related to your shopping, support, and saved items.</p>
          <div className="mt-6 space-y-4">
            <div className="rounded-3xl border border-border bg-white p-5">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-primary" />
                <p className="text-base font-semibold text-foreground">Account active</p>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Your Asafo Tech account is signed in and ready for orders, wishlist saves, and support updates.
              </p>
            </div>
            {customerOrders.map((order) => (
              <div key={`inbox-${order.id}`} className="rounded-3xl border border-border bg-white p-5">
                <div className="flex items-center gap-3">
                  <Package2 className="h-5 w-5 text-primary" />
                  <p className="text-base font-semibold text-foreground">Order update for {order.orderNumber}</p>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  Your order is currently <span className="font-semibold text-foreground">{order.status}</span> with payment marked as <span className="font-semibold text-foreground">{order.paymentStatus}</span>.
                </p>
              </div>
            ))}
            {customerOrders.length === 0 && (
              <div className="rounded-3xl border border-dashed border-border bg-white px-6 py-12 text-center">
                <Bell className="mx-auto h-12 w-12 text-primary" />
                <h4 className="mt-4 text-xl font-bold text-foreground">Your inbox is quiet for now</h4>
                <p className="mt-2 text-sm text-muted-foreground">
                  Once you place an order or contact support, updates will appear here automatically.
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (activePanel === "wishlists") {
      return (
        <div className="rounded-3xl border border-border bg-slate-50 p-6">
          <div className="flex items-center gap-3">
            <Heart className="h-5 w-5 text-primary" />
            <h3 className="text-2xl font-bold text-foreground">Wishlists</h3>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Quickly return to the products you saved for later.
          </p>

          {wishlistItems.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-border bg-white px-6 py-12 text-center">
              <Heart className="mx-auto h-12 w-12 text-primary" />
              <h4 className="mt-4 text-xl font-bold text-foreground">You haven't saved an item yet</h4>
              <p className="mt-2 text-sm text-muted-foreground">
                Found something you like? Tap on the heart shaped icon next to the item to add it to your wishlist.
              </p>
              <Link to="/products" className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-white">
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {wishlistItems.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="rounded-[28px] bg-[linear-gradient(135deg,#0f172a_0%,#1e3a8a_55%,#60a5fa_100%)] p-6 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/70">Customer Account</p>
          <h3 className="mt-3 text-4xl font-extrabold">My AsafoTech Account</h3>
          <p className="mt-3 max-w-2xl text-white/80">
            Manage your shopping, saved items, support access, and everything connected to your account in one place.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              className="inline-flex h-12 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-slate-950"
              onClick={openLiveChat}
            >
              <MessageCircleMore className="mr-2 h-4 w-4" />
              {isTawkConfigured ? "Live Chat" : "Open Support Inbox"}
            </button>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/30 px-5 text-sm font-semibold text-white"
            >
              <Wifi className="mr-2 h-4 w-4" />
              WhatsApp
            </a>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {quickLinks.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                className="rounded-3xl border border-border bg-white p-5 text-left transition-transform hover:-translate-y-1"
                onClick={() => setAccountPanel(item.id)}
              >
                <Icon className="h-6 w-6 text-primary" />
                <p className="mt-4 text-xl font-bold text-foreground">{item.title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              </button>
            );
          })}
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl border border-border bg-white p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Email</p>
            <p className="mt-3 text-lg font-semibold text-foreground break-words">{user?.email}</p>
          </div>
          <div className="rounded-3xl border border-border bg-white p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Phone</p>
            <p className="mt-3 text-lg font-semibold text-foreground">{user?.phone || "Google-managed or not set"}</p>
          </div>
          <div className="rounded-3xl border border-border bg-white p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Wishlist</p>
            <p className="mt-3 text-lg font-semibold text-foreground">{wishlistItems.length} saved item(s)</p>
          </div>
          <div className="rounded-3xl border border-border bg-white p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Cart</p>
            <p className="mt-3 text-lg font-semibold text-foreground">{cartItems.length} item(s)</p>
          </div>
          <div className="rounded-3xl border border-border bg-white p-5 md:col-span-2 xl:col-span-1">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Orders</p>
            <p className="mt-3 text-lg font-semibold text-foreground">{customerOrders.length} order(s)</p>
          </div>
        </div>

        <Button className="h-12 rounded-full px-6 text-base font-semibold" variant="outline" onClick={() => void logout()}>
          <LogOut className="mr-2 h-4 w-4" />
          Log Out
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f3f5f8] pb-24 md:pb-0">
      <Header />

      <section className="bg-[linear-gradient(135deg,#1d4ed8_0%,#2563eb_48%,#dbeafe_100%)] py-10 text-white">
        <div className="container">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/75">Customer Dashboard</p>
          <h1 key={greeting} className="greeting-fade mt-3 font-display text-4xl font-extrabold md:text-6xl">{greeting} {firstName}</h1>
          <p className="mt-4 max-w-2xl text-base text-white/85 md:text-lg">
            Browse products, explore categories, manage your cart and wishlist, and stay close to Asafo Tech support.
          </p>
        </div>
      </section>

      <main className="container py-8">
        <div className="rounded-[32px] bg-white p-3 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.55)]">
          <div className="flex gap-3 overflow-x-auto rounded-[28px] bg-slate-100 p-2">
            {mainTabs.map((tab) => {
              const meta = {
                home: { icon: LayoutGrid, label: "Home" },
                categories: { icon: LayoutGrid, label: "Categories" },
                cart: { icon: ShoppingCart, label: "Cart" },
                wishlist: { icon: Heart, label: "Wishlist" },
                account: { icon: UserRound, label: "Account" },
              }[tab];

              const Icon = meta.icon;
              const count = tab === "cart" ? cartItems.length : tab === "wishlist" ? wishlistItems.length : null;

              return (
                <button
                  key={tab}
                  type="button"
                  className={`inline-flex min-w-fit items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition-colors ${
                    activeTab === tab
                      ? "bg-primary text-white"
                      : "bg-white text-foreground hover:bg-slate-200"
                  }`}
                  onClick={() => setMainTab(tab)}
                >
                  <Icon className="h-4 w-4" />
                  {meta.label}
                  {count !== null && <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs">{count}</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8">
          {activeTab === "home" && (
            <section className="rounded-3xl bg-white p-6 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.55)]">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Home</p>
                  <h2 className="mt-2 text-3xl font-extrabold text-foreground">All Products</h2>
                </div>
                <Link to="/products" className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground hover:border-primary hover:text-primary">
                  Open Storefront
                </Link>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {products.slice(0, 6).map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            </section>
          )}

          {activeTab === "categories" && (
            <section className="rounded-3xl bg-white p-6 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.55)]">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Categories</p>
              <h2 className="mt-2 text-3xl font-extrabold text-foreground">Shop By Category</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/products?category=${encodeURIComponent(category.slug)}`}
                    className="rounded-3xl border border-border bg-slate-50 p-5 transition-transform hover:-translate-y-1 hover:border-primary"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Category</p>
                    <h3 className="mt-3 text-xl font-bold text-foreground">{category.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Browse everything available in {category.name.toLowerCase()}.</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {activeTab === "cart" && (
            <section className="rounded-3xl bg-white p-6 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.55)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Cart</p>
                  <h2 className="mt-2 text-3xl font-extrabold text-foreground">My Cart</h2>
                </div>
                {cartItems.length > 0 && (
                  <Button className="rounded-full px-6 font-semibold" onClick={openCart}>
                    Open Cart
                  </Button>
                )}
              </div>

              {cartItems.length === 0 ? (
                <div className="mt-8 rounded-3xl border border-dashed border-border bg-slate-50 px-6 py-14 text-center">
                  <ShoppingCart className="mx-auto h-14 w-14 text-primary" />
                  <h3 className="mt-5 text-2xl font-bold text-foreground">Your cart is empty</h3>
                  <p className="mt-3 text-base text-muted-foreground">Browse our categories and discover our best deals.</p>
                  <Link to="/products" className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold uppercase tracking-wide text-white">
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="mt-8 space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="grid gap-4 rounded-3xl border border-border p-4 md:grid-cols-[92px_minmax(0,1fr)_120px] md:items-center">
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <img src={item.product.image} alt={item.product.name} className="h-16 w-full object-contain" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-foreground">{item.product.name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {item.selectedVariant?.label ? `${item.selectedVariant.label} | ` : ""}Qty {item.quantity}
                        </p>
                      </div>
                      <p className="text-right text-lg font-bold text-foreground">GHS {((item.selectedVariant?.price ?? item.product.price) * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                  <div className="rounded-3xl bg-slate-950 p-5 text-white">
                    <p className="text-sm text-white/70">Cart subtotal</p>
                    <p className="mt-2 text-3xl font-bold">GHS {subtotal.toFixed(2)}</p>
                  </div>
                </div>
              )}
            </section>
          )}

          {activeTab === "wishlist" && (
            <section className="rounded-3xl bg-white p-6 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.55)]">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Wishlist</p>
              <h2 className="mt-2 text-3xl font-extrabold text-foreground">Saved Items</h2>

              {wishlistItems.length === 0 ? (
                <div className="mt-8 rounded-3xl border border-dashed border-border bg-slate-50 px-6 py-14 text-center">
                  <Heart className="mx-auto h-14 w-14 text-primary" />
                  <h3 className="mt-5 text-2xl font-bold text-foreground">You haven't saved an item yet</h3>
                  <p className="mt-3 text-base text-muted-foreground">
                    Found something you like? Tap on the heart shaped icon next to the item to add it to your wishlist.
                  </p>
                  <Link to="/products" className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold uppercase tracking-wide text-white">
                    Continue Shopping
                  </Link>
                </div>
              ) : (
                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {wishlistItems.map((product) => (
                    <ProductCard key={product.id} {...product} />
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === "account" && renderAccountPanel()}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Account;
