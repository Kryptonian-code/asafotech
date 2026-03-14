import { useQuery } from "@tanstack/react-query";
import { Check, Heart, Minus, Plus, ShieldCheck, Star, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { getProductBySlug, getProducts } from "@/lib/api";

const ProductDetails = () => {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState("");
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");
  const { data: product, isLoading, isError } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => getProductBySlug(slug),
    enabled: slug.length > 0,
  });
  const { data: allProducts = [] } = useQuery({
    queryKey: ["products", "related"],
    queryFn: () => getProducts(),
    enabled: slug.length > 0,
  });

  const relatedProducts = allProducts
    .filter((candidate) => candidate.slug !== product?.slug && candidate.categorySlug === product?.categorySlug)
    .slice(0, 4);

  const keySpecs = (product?.keySpecs ?? "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

  const galleryImages = useMemo(() => {
    const images = product?.galleryImages?.length ? product.galleryImages : product ? [product.image] : [];
    return Array.from(new Set(images.filter(Boolean)));
  }, [product]);

  const selectedVariant = useMemo(
    () => product?.variants?.find((variant) => variant.id === selectedVariantId) ?? null,
    [product, selectedVariantId],
  );
  const displayImage = selectedVariant?.image || activeImage || product?.image || "";
  const displayPrice = selectedVariant?.price ?? product?.price ?? 0;
  const displayInventory = selectedVariant?.inventoryCount ?? product?.inventoryCount ?? 0;

  useEffect(() => {
    setActiveImage(product?.galleryImages?.[0] ?? product?.image ?? "");
    setSelectedVariantId(product?.variants?.[0]?.id ?? "");
    setQuantity(1);
  }, [product?.galleryImages, product?.id, product?.image, product?.variants]);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />

      <section className="bg-primary py-10 text-white">
        <div className="container text-center">
          <h1 className="font-display text-5xl font-extrabold md:text-6xl">Product Details</h1>
          <p className="mt-4 text-lg text-white/85">
            <Link to="/" className="hover:text-white">Home</Link>
            <span className="mx-2">|</span>
            <span>{product?.name ?? "Product"}</span>
          </p>
        </div>
      </section>

      <main className="container py-10">
        {isLoading && <div className="h-[620px] bg-white animate-pulse" />}

        {isError && (
          <div className="border border-destructive/20 bg-destructive/5 px-6 py-14 text-center">
            <h2 className="font-display text-4xl font-bold text-foreground">Product not found</h2>
            <p className="mt-3 text-sm text-muted-foreground">We could not load this electronics item from the local API.</p>
          </div>
        )}

        {product && (
          <>
            {(() => {
              const wishlisted = isWishlisted(product.id);

              return (
            <section className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="bg-white p-8">
                <img src={displayImage} alt={product.name} className="mx-auto h-full max-h-[540px] w-full object-contain" />
                {galleryImages.length > 1 && (
                  <div className="mt-5 grid grid-cols-4 gap-3">
                    {galleryImages.map((image) => (
                      <button
                        key={image}
                        type="button"
                        className={`overflow-hidden rounded-2xl border p-2 ${displayImage === image ? "border-primary" : "border-border"}`}
                        onClick={() => setActiveImage(image)}
                      >
                        <img src={image} alt={product.name} className="h-16 w-full object-contain" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white p-8">
                <div className="flex items-center gap-2 text-gold">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className={`h-5 w-5 ${index < Math.round(product.rating) ? "fill-gold text-gold" : "text-muted"}`} />
                  ))}
                  <span className="ml-2 text-base text-foreground">({product.reviews} reviews)</span>
                </div>

                <h2 className="mt-6 font-display text-4xl font-semibold text-foreground md:text-5xl">{product.name}</h2>
                <p className="mt-5 text-3xl font-bold text-foreground">GHS {displayPrice.toFixed(2)}</p>

                <div className="mt-6 flex items-center gap-2 text-lg">
                  <span className="text-foreground">Availability:</span>
                  {displayInventory > 0 ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                      In stock
                      <Check className="h-5 w-5" />
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-semibold text-rose-600">
                      Out of stock
                    </span>
                  )}
                </div>

                {product.variants && product.variants.length > 0 && (
                  <div className="mt-8">
                    <span className="text-base font-semibold text-foreground">Choose option</span>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {product.variants.map((variant) => {
                        const active = selectedVariantId === variant.id;
                        const variantStock = variant.inventoryCount > 0;

                        return (
                          <button
                            key={variant.id}
                            type="button"
                            className={`rounded-2xl border px-4 py-4 text-left transition-colors ${
                              active ? "border-primary bg-primary/5" : "border-border bg-white"
                            }`}
                            onClick={() => {
                              setSelectedVariantId(variant.id);
                              if (variant.image) {
                                setActiveImage(variant.image);
                              }
                            }}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-semibold text-foreground">{variant.label}</p>
                                <p className="mt-1 text-sm text-muted-foreground">GHS {variant.price.toFixed(2)}</p>
                              </div>
                              <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${variantStock ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                                {variantStock ? "In Stock" : "Out of Stock"}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="mt-8 flex items-center gap-3">
                  <span className="text-2xl text-foreground">Quantity:</span>
                  <div className="inline-flex items-center border border-border">
                    <button type="button" className="px-4 py-3 text-foreground hover:bg-accent" onClick={() => setQuantity((current) => Math.max(1, current - 1))}>
                      <Minus className="h-5 w-5" />
                    </button>
                    <span className="min-w-16 border-x border-border px-4 py-3 text-center text-lg text-foreground">{quantity}</span>
                    <button type="button" className="px-4 py-3 text-foreground hover:bg-accent" onClick={() => setQuantity((current) => current + 1)}>
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <Button
                    className="h-14 rounded-sm text-base font-semibold uppercase tracking-wide"
                    variant="outline"
                    disabled={displayInventory <= 0}
                    onClick={() => {
                      if (displayInventory <= 0) {
                        return;
                      }

                      for (let index = 0; index < quantity; index += 1) {
                        addItem(product, selectedVariant);
                      }
                    }}
                  >
                    Add To Cart
                  </Button>
                  <Button
                    className="h-14 rounded-sm text-base font-semibold uppercase tracking-wide"
                    disabled={displayInventory <= 0}
                    onClick={() => {
                      if (displayInventory <= 0) {
                        return;
                      }

                      for (let index = 0; index < quantity; index += 1) {
                        addItem(product, selectedVariant);
                      }
                      navigate("/checkout");
                    }}
                  >
                    Buy Now
                  </Button>
                </div>

                <button
                  type="button"
                  className={`mt-8 inline-flex items-center gap-3 text-lg font-medium ${
                    wishlisted ? "text-primary" : "text-foreground"
                  }`}
                  onClick={() => toggleItem(product)}
                >
                  <Heart className={`h-5 w-5 ${wishlisted ? "fill-current" : ""}`} />
                  {wishlisted ? "Saved to Wishlist" : "Add to Wishlist"}
                </button>

                <div className="mt-8 space-y-4 text-base text-foreground">
                  <p><span className="font-semibold">Brand:</span> {product.brand}</p>
                  <p><span className="font-semibold">Category:</span> {product.categoryName}</p>
                  {selectedVariant?.label && <p><span className="font-semibold">Selected option:</span> {selectedVariant.label}</p>}
                  <p><span className="font-semibold">Condition:</span> {product.conditionLabel ?? "Brand New"}</p>
                  <p><span className="font-semibold">Warranty:</span> {product.warrantyMonths ? `${product.warrantyMonths} month(s)` : "Seller warranty available on request"}</p>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <div className="border border-border p-4">
                    <Truck className="h-5 w-5 text-primary" />
                    <p className="mt-3 text-sm font-medium text-foreground">Fast electronics delivery in Accra, Kumasi and beyond.</p>
                  </div>
                  <div className="border border-border p-4">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <p className="mt-3 text-sm font-medium text-foreground">Safe checkout for devices, accessories and gaming gear.</p>
                  </div>
                  <div className="border border-border p-4">
                    <Truck className="h-5 w-5 text-primary" />
                    <p className="mt-3 text-sm font-medium text-foreground">Delivery estimate: 1-2 days in Greater Accra and 2-4 days for major regional routes.</p>
                  </div>
                  <div className="border border-border p-4">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <p className="mt-3 text-sm font-medium text-foreground">Always check your device condition, included accessories, and warranty details before payment.</p>
                  </div>
                </div>
              </div>
            </section>
              );
            })()}

            <section className="mt-12 bg-white p-8">
              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <h3 className="border-b border-border pb-3 text-2xl font-semibold text-foreground">Description</h3>
                  <p className="mt-5 text-base leading-8 text-muted-foreground">
                    {product.description || "This electronics product is ready for a richer description from your admin dashboard."}
                  </p>
                </div>
                <div>
                  <h3 className="border-b border-border pb-3 text-2xl font-semibold text-foreground">Additional Info</h3>
                  <div className="mt-5 space-y-3 text-base text-muted-foreground">
                    <p><span className="font-semibold text-foreground">Brand:</span> {product.brand}</p>
                    <p><span className="font-semibold text-foreground">Category:</span> {product.categoryName}</p>
                    <p><span className="font-semibold text-foreground">Inventory:</span> {product.inventoryCount ?? 0} units</p>
                    <p><span className="font-semibold text-foreground">Status:</span> {product.status ?? "active"}</p>
                    <p><span className="font-semibold text-foreground">Condition:</span> {product.conditionLabel ?? "Brand New"}</p>
                    <p><span className="font-semibold text-foreground">Warranty:</span> {product.warrantyMonths ? `${product.warrantyMonths} month(s)` : "Contact store for warranty details"}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-12 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="bg-white p-8">
                <h3 className="border-b border-border pb-3 text-2xl font-semibold text-foreground">Key Specifications</h3>
                <div className="mt-5 space-y-3">
                  {keySpecs.length > 0 ? keySpecs.map((spec) => (
                    <div key={spec} className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-foreground">
                      <Check className="mt-0.5 h-4 w-4 text-primary" />
                      <span>{spec}</span>
                    </div>
                  )) : (
                    <>
                      <div className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-foreground">
                        <Check className="mt-0.5 h-4 w-4 text-primary" />
                        <span>Authentic electronics listing from the Asafo Tech catalog.</span>
                      </div>
                      <div className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-foreground">
                        <Check className="mt-0.5 h-4 w-4 text-primary" />
                        <span>Ask support if you need full technical specifications before purchase.</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-white p-8">
                <h3 className="border-b border-border pb-3 text-2xl font-semibold text-foreground">Buying Guidance</h3>
                <div className="mt-5 grid gap-4">
                  {[
                    "Confirm the exact model and storage or hardware variant before payment.",
                    "Use a reachable Ghana phone number for delivery updates and order confirmation.",
                    "Inspect accessories included in the box, especially chargers, controllers, or original adapters.",
                    "If you are ordering outside Accra or Kumasi, add a clear landmark to your address.",
                  ].map((item) => (
                    <div key={item} className="rounded-2xl border border-border px-4 py-4 text-sm text-muted-foreground">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {relatedProducts.length > 0 && (
              <section className="mt-12">
                <div className="mb-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Related Picks</p>
                  <h3 className="mt-2 text-3xl font-extrabold text-foreground">More in {product.categoryName}</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {relatedProducts.map((relatedProduct) => (
                    <ProductCard key={relatedProduct.id} {...relatedProduct} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
      <Footer />

      <BottomNav />
    </div>
  );
};

export default ProductDetails;
