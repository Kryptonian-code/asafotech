import { useQuery } from "@tanstack/react-query";
import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/lib/api";
import { Link } from "react-router-dom";

interface ProductGridProps {
  title: string;
  subtitle?: string;
  collection?: string;
  categorySlug?: string;
  searchQuery?: string;
  emptyTitle?: string;
  emptyMessage?: string;
  tone?: "default" | "inverse";
  sectionId?: string;
}

const normalizeSlug = (value: string) =>
  value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const ProductGrid = ({
  title,
  subtitle,
  collection,
  categorySlug,
  searchQuery,
  emptyTitle = "No products yet",
  emptyMessage = "Add products from your own database and they will appear here automatically.",
  tone = "default",
  sectionId,
}: ProductGridProps) => {
  const { data: products = [], isLoading, isError } = useQuery({
    queryKey: ["products", collection ?? "all"],
    queryFn: () => getProducts(collection),
  });
  const filteredProducts = products.filter((product) => {
    const matchesCategory = categorySlug
      ? normalizeSlug(product.categorySlug ?? product.categoryName ?? "") === categorySlug
      : true;

    const query = searchQuery?.trim().toLowerCase() ?? "";
    const haystack = [
      product.name,
      product.brand,
      product.categoryName ?? "",
      product.categorySlug ?? "",
    ].join(" ").toLowerCase();

    const matchesSearch = query === "" || haystack.includes(query);

    return matchesCategory && matchesSearch;
  });

  const isInverse = tone === "inverse";

  return (
    <section
      id={sectionId}
      className={`scroll-mt-40 py-10 md:py-14 ${isInverse ? "bg-primary" : "bg-white"}`}
    >
      <div className="container">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className={`font-display text-3xl font-extrabold uppercase tracking-tight md:text-5xl ${isInverse ? "text-white" : "text-foreground"}`}>{title}</h2>
            {subtitle && <p className={`mt-2 text-sm md:text-base ${isInverse ? "text-white/80" : "text-muted-foreground"}`}>{subtitle}</p>}
          </div>
          <Link
            to={
              categorySlug
                ? `/products?category=${encodeURIComponent(categorySlug)}`
                : collection
                  ? `/products?collection=${encodeURIComponent(collection)}`
                  : "/products"
            }
            className={`px-4 py-2 text-sm font-semibold uppercase tracking-wide transition-colors ${
              isInverse
                ? "border border-white bg-white text-primary hover:bg-white/90"
                : "border border-border bg-white text-foreground hover:border-primary hover:text-primary"
            }`}
          >
            {categorySlug ? "Shop Category" : "View All"}
          </Link>
        </div>
        {isError && (
          <div className="border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            Products could not be loaded right now. Check that the local PHP API is running.
          </div>
        )}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {isLoading && Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="aspect-[0.88] bg-white/90 animate-pulse" />
          ))}
          {!isLoading && filteredProducts.length === 0 && (
            <div className="col-span-full border border-dashed border-border bg-white px-6 py-12 text-center market-shadow">
              <h3 className="font-display text-2xl font-bold text-foreground">{emptyTitle}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{emptyMessage}</p>
            </div>
          )}
          {!isLoading && filteredProducts.map((product, index) => (
            <div key={product.id} style={{ animationDelay: `${index * 0.05}s` }}>
              <ProductCard {...product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
