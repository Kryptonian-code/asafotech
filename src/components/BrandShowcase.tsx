const brands = [
  { name: "TechGH", tone: "bg-slate-900 text-white" },
  { name: "AkwabaStyle", tone: "bg-primary text-white" },
  { name: "GhanaGlow", tone: "bg-secondary text-white" },
  { name: "HomeNest", tone: "bg-foreground text-white" },
];

const BrandShowcase = () => {
  return (
    <section className="py-6 md:py-8">
      <div className="container">
        <div className="mb-4">
          <h2 className="font-display text-xl font-extrabold text-foreground md:text-3xl">Featured Brands</h2>
          <p className="mt-1 text-sm text-muted-foreground">Official-store style sections for your top vendors and in-house labels.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {brands.map((brand) => (
            <div key={brand.name} className={`rounded-[28px] p-6 ${brand.tone} market-shadow`}>
              <p className="text-xs uppercase tracking-[0.24em] opacity-70">Official Store</p>
              <h3 className="mt-4 font-display text-3xl font-bold">{brand.name}</h3>
              <p className="mt-2 text-sm opacity-80">Dedicated campaigns, curated picks, and exclusive pricing.</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandShowcase;
