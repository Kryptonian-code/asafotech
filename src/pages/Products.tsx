import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpDown, SlidersHorizontal } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { getCategories, getProducts } from "@/lib/api";

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating-desc", label: "Top Rated" },
  { value: "newest", label: "Newest" },
] as const;

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category") ?? "";
  const selectedBrand = searchParams.get("brand") ?? "";
  const search = searchParams.get("search")?.trim().toLowerCase() ?? "";
  const collection = searchParams.get("collection") ?? "";
  const stock = searchParams.get("stock") ?? "";
  const sort = searchParams.get("sort") ?? "featured";

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
  const { data: products = [], isLoading, isError } = useQuery({
    queryKey: ["products", "all-products"],
    queryFn: () => getProducts(),
  });

  const brands = useMemo(
    () => Array.from(new Set(products.map((product) => product.brand))).sort((a, b) => a.localeCompare(b)),
    [products],
  );

  const filteredProducts = useMemo(() => {
    const visible = products.filter((product) => {
      const matchesCategory = selectedCategory === "" || product.categorySlug === selectedCategory;
      const matchesBrand = selectedBrand === "" || product.brand === selectedBrand;
      const matchesCollection = collection === "" || product.collectionTag === collection;
      const matchesStock = stock === ""
        || (stock === "in-stock" ? (product.inventoryCount ?? 0) > 0 : (product.inventoryCount ?? 0) <= 0);
      const haystack = [
        product.name,
        product.brand,
        product.categoryName ?? "",
        product.description ?? "",
      ].join(" ").toLowerCase();
      const matchesSearch = search === "" || haystack.includes(search);

      return matchesCategory && matchesBrand && matchesCollection && matchesStock && matchesSearch;
    });

    return [...visible].sort((left, right) => {
      switch (sort) {
        case "price-asc":
          return left.price - right.price;
        case "price-desc":
          return right.price - left.price;
        case "rating-desc":
          return right.rating - left.rating;
        case "newest":
          return right.id - left.id;
        default:
          return Number(right.isFeatured ?? 0) - Number(left.isFeatured ?? 0);
      }
    });
  }, [collection, products, search, selectedBrand, selectedCategory, sort, stock]);

  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);

    if (value === "") {
      next.delete(key);
    } else {
      next.set(key, value);
    }

    setSearchParams(next);
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] pb-20 md:pb-0">
      <Header />

      <section className="bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_45%,#dbeafe_100%)] py-12 text-white">
        <div className="container">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/75">Shop Electronics</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold md:text-6xl">All Products</h1>
          <p className="mt-4 max-w-3xl text-base text-white/85 md:text-lg">
            Explore phones, laptops, desktops, system units, gaming gear, headphones, and accessories with filters built for a Ghanaian electronics storefront.
          </p>
        </div>
      </section>

      <main className="container py-8">
        <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="rounded-[28px] border border-border bg-white p-5 shadow-[0_24px_70px_-52px_rgba(15,23,42,0.5)]">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Filters</h2>
            </div>

            <div className="mt-6 space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Category</p>
                <div className="mt-3 grid gap-2">
                  <button type="button" className={`rounded-full px-4 py-2 text-left text-sm font-medium ${selectedCategory === "" ? "bg-primary text-white" : "bg-slate-100 text-foreground"}`} onClick={() => updateFilter("category", "")}>All Categories</button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      className={`rounded-full px-4 py-2 text-left text-sm font-medium ${selectedCategory === category.slug ? "bg-primary text-white" : "bg-slate-100 text-foreground"}`}
                      onClick={() => updateFilter("category", category.slug)}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Availability</p>
                <div className="mt-3 grid gap-2">
                  {[
                    { value: "", label: "All stock states" },
                    { value: "in-stock", label: "In Stock" },
                    { value: "out-of-stock", label: "Out of Stock" },
                  ].map((option) => (
                    <button
                      key={option.value || "all"}
                      type="button"
                      className={`rounded-full px-4 py-2 text-left text-sm font-medium ${stock === option.value ? "bg-primary text-white" : "bg-slate-100 text-foreground"}`}
                      onClick={() => updateFilter("stock", option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Brand</p>
                <select
                  value={selectedBrand}
                  onChange={(event) => updateFilter("brand", event.target.value)}
                  className="mt-3 h-12 w-full rounded-2xl border border-border bg-white px-4 text-sm text-foreground outline-none"
                >
                  <option value="">All brands</option>
                  {brands.map((brand) => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Collection</p>
                <select
                  value={collection}
                  onChange={(event) => updateFilter("collection", event.target.value)}
                  className="mt-3 h-12 w-full rounded-2xl border border-border bg-white px-4 text-sm text-foreground outline-none"
                >
                  <option value="">All collections</option>
                  <option value="trending">Trending</option>
                  <option value="deals">Deals</option>
                </select>
              </div>
            </div>
          </aside>

          <section className="rounded-[28px] border border-border bg-white p-5 shadow-[0_24px_70px_-52px_rgba(15,23,42,0.5)]">
            <div className="flex flex-col gap-4 border-b border-border pb-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Catalog</p>
                <h2 className="mt-2 text-3xl font-extrabold text-foreground">Browse the full store</h2>
                <p className="mt-2 text-sm text-muted-foreground">{filteredProducts.length} products matched your current filters.</p>
              </div>

              <div className="flex items-center gap-3">
                <ArrowUpDown className="h-4 w-4 text-primary" />
                <select
                  value={sort}
                  onChange={(event) => updateFilter("sort", event.target.value)}
                  className="h-11 rounded-full border border-border bg-white px-4 text-sm font-medium text-foreground outline-none"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {isError && (
              <div className="mt-6 rounded-3xl border border-destructive/20 bg-destructive/5 px-5 py-4 text-sm text-destructive">
                Products could not be loaded right now. Check that your local API is running.
              </div>
            )}

            {isLoading ? (
              <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="aspect-[0.88] rounded-3xl bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="mt-6 rounded-3xl border border-dashed border-border bg-slate-50 px-6 py-16 text-center">
                <h3 className="text-2xl font-bold text-foreground">No products matched</h3>
                <p className="mt-3 text-sm text-muted-foreground">Adjust your filters or return to the full storefront list.</p>
                <Button className="mt-5 rounded-full px-6" asChild>
                  <Link to="/products">Reset Filters</Link>
                </Button>
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Products;
