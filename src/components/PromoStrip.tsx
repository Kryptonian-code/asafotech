const promos = [
  "Free delivery on orders over GHS 200",
  "Official stores and trusted local brands",
  "Built for fast Ghana-wide shopping",
  "Weekly deals across beauty, fashion, and home",
];

const PromoStrip = () => {
  return (
    <section className="container pt-4">
      <div className="grid gap-3 rounded-[28px] border border-border bg-card p-4 market-shadow md:grid-cols-4">
        {promos.map((promo) => (
          <div key={promo} className="rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-foreground">
            {promo}
          </div>
        ))}
      </div>
    </section>
  );
};

export default PromoStrip;
