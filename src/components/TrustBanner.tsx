import { Headphones, RotateCcw, Shield, Truck } from "lucide-react";

const features = [
  { icon: Truck, title: "Fast Delivery", desc: "Across Ghana in 2-5 days" },
  { icon: Shield, title: "Secure Payment", desc: "Mobile money & card accepted" },
  { icon: RotateCcw, title: "Easy Returns", desc: "14-day return policy" },
  { icon: Headphones, title: "24/7 Support", desc: "We're always here to help" },
];

const TrustBanner = () => {
  return (
    <section className="py-6 md:py-8">
      <div className="container">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {features.map((feature) => (
            <div key={feature.title} className="flex items-center gap-3 rounded-3xl border border-border bg-card px-4 py-4 market-shadow">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{feature.title}</p>
                <p className="text-xs text-muted-foreground">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBanner;
