const spotlightStores = [
  { title: "Beauty Picks", subtitle: "Skincare, wellness and self-care bestsellers" },
  { title: "Home Upgrade", subtitle: "Appliances and essentials for modern households" },
  { title: "Back to Campus", subtitle: "Bags, devices and room must-haves for students" },
];

const StoreSpotlight = () => {
  return (
    <section className="py-6 md:py-8">
      <div className="container grid gap-4 lg:grid-cols-3">
        {spotlightStores.map((store, index) => (
          <div
            key={store.title}
            className="rounded-[28px] border border-border bg-card p-6 market-shadow"
            style={{ backgroundImage: index === 1 ? "linear-gradient(180deg, rgba(255,237,213,0.75), rgba(255,255,255,0))" : undefined }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Store Spotlight</p>
            <h3 className="mt-3 font-display text-2xl font-bold text-foreground">{store.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{store.subtitle}</p>
            <button className="mt-5 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary">
              Explore Collection
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StoreSpotlight;
