import { Link, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Headphones, Heart, LogOut, Mail, Menu, Phone, Search, ShoppingCart, User } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { getCategories } from "@/lib/api";
import { STORE_CATEGORY_FALLBACKS } from "@/lib/storeCategories";

const scrollCategorySlugs = new Set([
  "smart-phones",
  "laptops",
  "desktop-pcs",
  "system-units",
  "game-consoles",
  "game-controllers",
  "headphones",
  "accessories",
]);

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { itemCount, openCart } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const { user, logout } = useCustomerAuth();
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const allCategories = useMemo(
    () => Array.from(
      new Map(
        [...categories.map((category) => ({ name: category.name, slug: category.slug })), ...STORE_CATEGORY_FALLBACKS]
          .map((category) => [category.slug, category]),
      ).values(),
    ),
    [categories],
  );

  const submitSearch = () => {
    const query = search.trim();
    navigate(query ? `/?search=${encodeURIComponent(query)}` : "/");
    setMenuOpen(false);
  };

  const getCategoryHref = (slug: string) =>
    scrollCategorySlugs.has(slug) ? `/#category-${slug}` : `/?category=${encodeURIComponent(slug)}`;

  const handleBrandClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (location.pathname === "/") {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-[0_12px_30px_-28px_rgba(31,71,145,0.45)]">
      <div className="bg-primary text-primary-foreground">
        <div className="container flex h-9 items-center justify-between text-xs">
          <div className="hidden items-center gap-5 md:flex">
            <span className="inline-flex items-center gap-2 font-medium">
              <Phone className="h-3.5 w-3.5" />
              +233 24 000 0000
            </span>
            <span className="inline-flex items-center gap-2 font-medium">
              <Mail className="h-3.5 w-3.5" />
              support@asafotech.com
            </span>
          </div>
          <div className="ml-auto flex items-center gap-4 font-medium">
            {user ? (
              <>
                <Link to="/account" className="hover:opacity-90">{user.fullName}</Link>
                <Link to="/admin/login" className="hover:opacity-90">Admin</Link>
                <button type="button" className="inline-flex items-center gap-1 hover:opacity-90" onClick={() => void logout()}>
                  <LogOut className="h-3.5 w-3.5" />
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/account/login" className="hover:opacity-90">Login</Link>
                <Link to="/account/login?mode=register" className="hover:opacity-90">Register</Link>
                <Link to="/admin/login" className="hover:opacity-90">Admin</Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="container py-5">
        <div className="grid items-center gap-4 lg:grid-cols-[260px_minmax(0,1fr)_180px]">
          <Link to="/" className="inline-flex flex-col justify-center" onClick={handleBrandClick}>
            <span className="font-display text-3xl font-extrabold tracking-tight text-foreground">
              Asafo<span className="text-primary">Tech</span>
            </span>
            <span className="mt-1 text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              Ghana Electronics
            </span>
          </Link>

          <div className="hidden items-center rounded-md border border-border bg-white lg:flex">
            <div className="relative border-r border-border">
              <button
                type="button"
                className="inline-flex h-12 min-w-[170px] items-center justify-between px-4 text-sm font-medium text-foreground"
                onClick={() => setCategoriesOpen((open) => !open)}
              >
                All Categories
                <ChevronDown className={`h-4 w-4 transition-transform ${categoriesOpen ? "rotate-180" : ""}`} />
              </button>
              {categoriesOpen && (
                <div className="absolute left-0 top-[calc(100%+0.5rem)] z-50 grid w-72 gap-1 rounded-md border border-border bg-white p-2 market-shadow">
                  {allCategories.map((category) => (
                    <Link
                      key={category.slug}
                      to={getCategoryHref(category.slug)}
                      className="rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-primary"
                      onClick={() => setCategoriesOpen(false)}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    submitSearch();
                  }
                }}
                placeholder="Search phones, laptops, consoles, controllers..."
                className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <Button className="h-12 rounded-none rounded-r-md px-6 text-sm font-semibold" onClick={submitSearch}>
              Search
            </Button>
          </div>

          <div className="hidden items-center justify-end gap-5 lg:flex">
            <Link to={user ? "/account" : "/account/login"} className="text-muted-foreground transition-colors hover:text-primary" aria-label="Account">
              <User className="h-5 w-5" />
            </Link>
            <Link to="/account?tab=wishlist" className="relative text-muted-foreground transition-colors hover:text-primary" aria-label="Wishlist">
              <Heart className="h-5 w-5" />
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                {wishlistCount}
              </span>
            </Link>
            <button type="button" className="relative text-muted-foreground transition-colors hover:text-primary" onClick={openCart} aria-label="Cart">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                {itemCount}
              </span>
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 lg:hidden">
            <Button variant="outline" size="icon" className="rounded-md" onClick={() => setMenuOpen((open) => !open)}>
              <Menu className="h-5 w-5" />
            </Button>
            <button type="button" className="relative text-muted-foreground transition-colors hover:text-primary" onClick={openCart} aria-label="Cart">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                {itemCount}
              </span>
            </button>
          </div>
        </div>

        <div className="mt-4 lg:hidden">
          <div className="flex overflow-hidden rounded-md border border-border bg-white">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  submitSearch();
                }
              }}
              placeholder="Search electronics..."
              className="h-11 flex-1 border-0 px-4 text-sm outline-none placeholder:text-muted-foreground"
            />
            <Button className="h-11 rounded-none px-4" onClick={submitSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {menuOpen && (
          <div className="mt-4 grid gap-2 rounded-md border border-border bg-white p-3 lg:hidden">
            {allCategories.map((category) => (
              <Link
                key={category.slug}
                to={getCategoryHref(category.slug)}
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-primary"
                onClick={() => setMenuOpen(false)}
              >
                {category.name}
              </Link>
            ))}
            {user ? (
              <>
                <Link to="/account" className="rounded-md px-3 py-2 text-sm font-medium text-foreground">My Account</Link>
                <Link to="/admin/login" className="rounded-md px-3 py-2 text-sm font-medium text-foreground">Admin Login</Link>
                <button type="button" className="rounded-md px-3 py-2 text-left text-sm font-medium text-foreground" onClick={() => void logout()}>
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/account/login" className="rounded-md px-3 py-2 text-sm font-medium text-foreground">Login</Link>
                <Link to="/account/login?mode=register" className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white">
                  Register
                </Link>
                <Link to="/admin/login" className="rounded-md px-3 py-2 text-sm font-medium text-foreground">Admin Login</Link>
              </>
            )}
          </div>
        )}
      </div>

      <div className="hidden border-t border-border bg-white lg:block">
        <div className="container flex h-12 items-center justify-between overflow-x-auto whitespace-nowrap text-sm font-medium">
          <div className="flex items-center gap-6">
            <Link to="/#category-smart-phones" className="text-foreground hover:text-primary">Phones</Link>
            <Link to="/#category-laptops" className="text-foreground hover:text-primary">Laptops</Link>
            <Link to="/#category-desktop-pcs" className="text-foreground hover:text-primary">Desktop PCs</Link>
            <Link to="/#category-game-consoles" className="text-foreground hover:text-primary">Game Consoles</Link>
            <Link to="/#category-game-controllers" className="text-foreground hover:text-primary">Controllers</Link>
            <Link to="/#category-accessories" className="text-foreground hover:text-primary">Accessories</Link>
          </div>
          <div className="inline-flex items-center gap-2 text-muted-foreground">
            <Headphones className="h-4 w-4 text-primary" />
            Expert support for phones, laptops, gaming and accessories
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

