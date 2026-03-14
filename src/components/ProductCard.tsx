import { Heart, ShoppingCart, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import type { Product } from "@/lib/api";

type ProductCardProps = Product;

const ProductCard = (product: ProductCardProps) => {
  const { addItem } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();
  const { name, price, image, rating, slug, inventoryCount } = product;
  const wishlisted = isWishlisted(product.id);
  const inStock = (inventoryCount ?? 0) > 0;

  return (
    <div className="relative bg-white p-4 text-center shadow-[0_18px_44px_-30px_rgba(15,23,42,0.25)] transition-transform hover:-translate-y-1">
      <span
        className={`absolute left-4 top-4 z-10 inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] ${
          inStock ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
        }`}
      >
        {inStock ? "In Stock" : "Out of Stock"}
      </span>
      <button
        type="button"
        className={`absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
          wishlisted
            ? "border-primary bg-primary text-white"
            : "border-border bg-white text-muted-foreground hover:border-primary hover:text-primary"
        }`}
        onClick={() => toggleItem(product)}
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart className={`h-4 w-4 ${wishlisted ? "fill-current" : ""}`} />
      </button>

      <Link to={`/products/${encodeURIComponent(slug)}`} className="block bg-muted p-6">
        <img
          src={image}
          alt={name}
          className="mx-auto h-40 w-full object-contain"
          loading="lazy"
        />
      </Link>

      <h3 className="mt-4 line-clamp-2 min-h-12 text-sm font-semibold uppercase tracking-wide text-foreground">
        {name}
      </h3>
      <p className="mt-2 text-lg font-bold text-foreground">GHS {price.toFixed(2)}</p>

      <div className="mt-2 flex items-center justify-center gap-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className={`h-4 w-4 ${index < Math.round(rating) ? "fill-gold text-gold" : "text-muted"}`}
          />
        ))}
      </div>

      <Link
        to={`/products/${encodeURIComponent(slug)}`}
        className="mt-4 inline-flex h-10 w-full items-center justify-center border border-primary bg-white px-4 text-sm font-semibold uppercase tracking-wide text-primary transition-colors hover:bg-primary hover:text-white"
      >
        View Product
      </Link>

      <button
        type="button"
        className={`mt-3 inline-flex h-10 w-full items-center justify-center px-4 text-sm font-semibold uppercase tracking-wide transition-colors ${
          inStock
            ? "bg-primary text-white hover:bg-primary/90"
            : "cursor-not-allowed bg-muted text-muted-foreground"
        }`}
        onClick={() => {
          if (!inStock) {
            return;
          }

          addItem(product);
        }}
        disabled={!inStock}
      >
        <ShoppingCart className="mr-2 h-4 w-4" />
        {inStock ? "Add To Cart" : "Unavailable"}
      </button>
    </div>
  );
};

export default ProductCard;
