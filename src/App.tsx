import { Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import CartSheet from "@/components/CartSheet";
import ProtectedAdminRoute from "@/components/ProtectedAdminRoute";
import ProtectedCustomerRoute from "@/components/ProtectedCustomerRoute";
import TawkChatWidget from "@/components/TawkChatWidget";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AdminAuthProvider } from "@/context/AdminAuthContext";
import { CartProvider } from "@/context/CartContext";
import { CustomerAuthProvider } from "@/context/CustomerAuthContext";
import { WishlistProvider } from "@/context/WishlistContext";
const Account = lazy(() => import("./pages/Account"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const Checkout = lazy(() => import("./pages/Checkout"));
const CustomerLogin = lazy(() => import("./pages/CustomerLogin"));
const Index = lazy(() => import("./pages/Index"));
const InfoPage = lazy(() => import("./pages/InfoPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Products = lazy(() => import("./pages/Products"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AdminAuthProvider>
        <CustomerAuthProvider>
          <WishlistProvider>
            <CartProvider>
              <Toaster />
              <Sonner />
              <TawkChatWidget />
              <BrowserRouter basename={import.meta.env.BASE_URL}>
                <Suspense fallback={<div className="min-h-screen bg-background" />}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/info/:slug" element={<InfoPage />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/:slug" element={<ProductDetails />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/order-success" element={<OrderSuccess />} />
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route
                      path="/admin"
                      element={(
                        <ProtectedAdminRoute>
                          <Admin />
                        </ProtectedAdminRoute>
                      )}
                    />
                    <Route path="/account/login" element={<CustomerLogin />} />
                    <Route
                      path="/account"
                      element={(
                        <ProtectedCustomerRoute>
                          <Account />
                        </ProtectedCustomerRoute>
                      )}
                    />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
                <CartSheet />
              </BrowserRouter>
            </CartProvider>
          </WishlistProvider>
        </CustomerAuthProvider>
      </AdminAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
