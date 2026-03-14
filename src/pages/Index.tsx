import { useQuery } from "@tanstack/react-query";
import BottomNav from "@/components/BottomNav";
import CategorySection from "@/components/CategorySection";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ProductGrid from "@/components/ProductGrid";
import { getCategories } from "@/lib/api";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useEffect } from "react";

const categoryShowcase = [
  { slug: "smart-phones", title: "Phones", subtitle: "Smart phones across entry-level, mid-range, and flagship picks." },
  { slug: "laptops", title: "Laptops", subtitle: "Reliable laptops for work, school, browsing, and content creation." },
  { slug: "desktop-pcs", title: "Desktop PCs", subtitle: "Desktop computers for office desks, shops, and home setups." },
  { slug: "system-units", title: "System Units", subtitle: "Built systems and towers for office work, power users, and gaming setups." },
  { slug: "game-consoles", title: "Game Consoles", subtitle: "PlayStation, Xbox, Nintendo and more for gaming setups." },
  { slug: "game-controllers", title: "Controllers", subtitle: "Gaming controllers for console play, PC gaming, and accessories." },
  { slug: "headphones", title: "Headphones", subtitle: "Wireless, wired, and everyday listening gear for music, calls, and gaming." },
  { slug: "accessories", title: "Accessories", subtitle: "Chargers, cables, speakers, adapters, and everyday device add-ons." },
] as const;

const Index = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const selectedCategorySlug = searchParams.get("category") ?? "";
  const searchQuery = searchParams.get("search")?.trim() ?? "";
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
  const selectedCategory = categories.find((category) => category.slug === selectedCategorySlug);

  useEffect(() => {
    if (!location.hash) {
      return;
    }

    const target = document.querySelector<HTMLElement>(location.hash);

    if (!target) {
      return;
    }

    window.requestAnimationFrame(() => {
      target.classList.remove("section-focus");
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(() => {
        target.classList.add("section-focus");
      }, 320);
      window.setTimeout(() => {
        target.classList.remove("section-focus");
      }, 1700);
    });
  }, [location.hash]);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />

      <main>
        <HeroSection />
        <CategorySection />

        {(selectedCategorySlug || searchQuery) && (
          <section className="bg-white py-10">
            <div className="container">
              <div className="border border-border bg-accent px-6 py-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                      {searchQuery ? "Search Results" : "Category Filter"}
                    </p>
                    <h2 className="mt-2 font-display text-3xl font-extrabold uppercase tracking-tight text-foreground md:text-5xl">
                      {searchQuery ? `Results for "${searchQuery}"` : (selectedCategory?.name ?? "Selected Category")}
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {searchQuery
                        ? "Browse products that match your electronics search."
                        : "You are viewing products from the category you selected."}
                    </p>
                  </div>
                  <Link
                    to="/"
                    className="inline-flex h-11 items-center justify-center border border-primary px-5 text-sm font-semibold uppercase tracking-wide text-primary transition-colors hover:bg-primary hover:text-white"
                  >
                    Back to Home
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {selectedCategorySlug && (
          <ProductGrid
            title={selectedCategory ? `${selectedCategory.name}` : "Category Products"}
            subtitle="Products filtered from your selected electronics category."
            categorySlug={selectedCategorySlug}
            searchQuery={searchQuery}
            emptyTitle="No products in this category yet"
            emptyMessage="Add products under this electronics category from your admin dashboard and they will show here."
          />
        )}

        <ProductGrid
          title={searchQuery ? "Search Results" : "Featured Products"}
          subtitle={searchQuery
            ? "Matching electronics results from your current catalog."
            : "Phones, laptops, gaming gear and accessories picked for your store front."}
          collection={searchQuery ? undefined : "trending"}
          searchQuery={searchQuery}
          tone="inverse"
        />

        {!selectedCategorySlug && !searchQuery && categoryShowcase.map((section) => (
          <ProductGrid
            key={section.slug}
            sectionId={`category-${section.slug}`}
            title={section.title}
            subtitle={section.subtitle}
            categorySlug={section.slug}
            emptyTitle={`No ${section.title.toLowerCase()} yet`}
            emptyMessage={`Add products under ${section.title.toLowerCase()} from your admin dashboard and they will appear here.`}
          />
        ))}

        <ProductGrid
          title="Latest Deals"
          subtitle="Electronics offers and popular accessories with competitive pricing."
          collection="deals"
        />
      </main>
      <Footer />

      <BottomNav />
    </div>
  );
};

export default Index;
