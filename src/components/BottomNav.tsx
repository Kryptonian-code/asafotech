import { Grid2X2, Heart, Home, ShoppingCart, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { useWishlist } from "@/context/WishlistContext";

const BottomNav = () => {
  const { itemCount, openCart } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const { user } = useCustomerAuth();

  return (
    <nav className="fixed bottom-3 left-3 right-3 z-50 rounded-3xl border border-border bg-card/95 px-2 shadow-[0_16px_40px_-24px_rgba(0,0,0,0.45)] backdrop-blur md:hidden">
      <div className="flex h-14 items-center justify-around">
        <Link to="/" className="flex flex-col items-center gap-0.5 text-primary" aria-label="Home">
          <Home className="h-5 w-5" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <Link to="/products" className="flex flex-col items-center gap-0.5 text-muted-foreground" aria-label="Categories">
          <Grid2X2 className="h-5 w-5" />
          <span className="text-[10px] font-medium">Categories</span>
        </Link>
        <Link to={user ? "/account?tab=wishlist" : "/account/login"} className="relative flex flex-col items-center gap-0.5 text-muted-foreground" aria-label="Wishlist">
          <Heart className="h-5 w-5" />
          <span className="absolute -top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
            {wishlistCount}
          </span>
          <span className="text-[10px] font-medium">Wishlist</span>
        </Link>
        <button className="relative flex flex-col items-center gap-0.5 text-muted-foreground" aria-label="Cart" onClick={openCart}>
          <ShoppingCart className="h-5 w-5" />
          <span className="absolute -top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
            {itemCount}
          </span>
          <span className="text-[10px] font-medium">Cart</span>
        </button>
        <Link to={user ? "/account" : "/account/login"} className="flex flex-col items-center gap-0.5 text-muted-foreground" aria-label="Account">
          <User className="h-5 w-5" />
          <span className="text-[10px] font-medium">Account</span>
        </Link>
      </div>
    </nav>
  );
};

export default BottomNav;
