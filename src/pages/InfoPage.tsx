import { ArrowRight, CheckCircle2, Headset, ShieldCheck, Truck } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";

const infoPages = {
  "about-asafo-tech": {
    eyebrow: "About Asafo Tech",
    title: "A Ghana-first electronics store built for practical shopping.",
    description: "Asafo Tech focuses on phones, laptops, desktops, system units, consoles, controllers, headphones, and accessories for shoppers across Accra, Kumasi, Takoradi, Tamale, and beyond.",
    bullets: [
      "We keep pricing in Ghana cedis and present products in clear, honest language.",
      "We focus on electronics only, so shoppers do not need to dig through unrelated catalog clutter.",
      "We aim to make support, payment, delivery, and warranty information feel simple and trustworthy.",
    ],
  },
  "work-with-us": {
    eyebrow: "Work With Us",
    title: "Partner, supply, or grow with Asafo Tech.",
    description: "If you sell electronics, accessories, or business support services in Ghana, we can explore merchant, supply, or operations partnerships.",
    bullets: [
      "Electronics brands and wholesalers can reach out for featured catalog placement.",
      "Technicians and support partners can collaborate on after-sales service and warranty support.",
      "Merchants can contact the store team before applying for backend access and catalog onboarding.",
    ],
  },
  "company-profile": {
    eyebrow: "Company Profile",
    title: "A focused electronics merchant desk with Ghanaian shoppers in mind.",
    description: "Asafo Tech is structured around a practical electronics catalog, clear support lanes, and a shopping flow designed for local delivery, pickups, and customer confidence.",
    bullets: [
      "Store categories are organized for the way Ghanaian shoppers actually browse electronics.",
      "Customer support can run through WhatsApp, live chat, and direct assistance when configured.",
      "Orders, catalog updates, and stock controls are built around merchant usability instead of clutter.",
    ],
  },
  "how-to-order": {
    eyebrow: "Buying Guide",
    title: "How to order from Asafo Tech.",
    description: "Shopping should feel direct and easy, especially for phones, laptops, gaming gear, and accessories.",
    bullets: [
      "Browse products by category or search for the exact brand and item you want.",
      "Add products to your cart or wishlist, then move into checkout when you are ready.",
      "Review your delivery details carefully, then complete payment and track your order from your account area.",
    ],
  },
  "terms-of-use": {
    eyebrow: "Terms Of Use",
    title: "Simple store terms for responsible shopping and merchant operations.",
    description: "These terms outline store usage, ordering behavior, support boundaries, and platform expectations while you use Asafo Tech.",
    bullets: [
      "Product availability, pricing, and fulfillment status can change without notice until an order is confirmed.",
      "Users must provide accurate personal, address, and payment information.",
      "Abuse of store tools, unauthorized admin access, or fraudulent payment attempts may lead to account restrictions.",
    ],
  },
  "privacy-policy": {
    eyebrow: "Privacy Policy",
    title: "We only use customer data for shopping, support, and delivery operations.",
    description: "Your account and order details help Asafo Tech fulfil purchases, provide support, and improve the shopping experience.",
    bullets: [
      "We store customer details needed for account access, orders, delivery, and service communication.",
      "Payment flows may involve trusted providers such as Paystack and other configured services.",
      "Support interactions may also use tools like live chat or WhatsApp when enabled.",
    ],
  },
  contact: {
    eyebrow: "Contact",
    title: "Reach Asafo Tech support quickly.",
    description: "For account help, product questions, delivery issues, and order follow-ups, contact the team through the fastest channel available to you.",
    bullets: [
      "Use live chat when it is available on the store.",
      "Reach support through WhatsApp for quicker back-and-forth conversations.",
      "Use your account inbox and order area to keep purchase-related information in one place.",
    ],
  },
  "help-centre": {
    eyebrow: "Help Centre",
    title: "Support topics for ordering, payment, delivery, and account issues.",
    description: "Use the help centre to understand how to order, how payments work, how to manage your account, and where to get support when you need it.",
    bullets: [
      "Ordering help explains how to browse, add to cart, and complete checkout.",
      "Payment help covers checkout states like pending, paid, and failed.",
      "Delivery help explains how to give a clear address and track your order progress.",
    ],
  },
  faq: {
    eyebrow: "FAQ",
    title: "Common questions shoppers ask before buying electronics.",
    description: "These are the store questions most likely to come up before payment, delivery, or after-sales support.",
    bullets: [
      "Do prices include delivery? Delivery may vary based on your area and checkout details.",
      "Can I order outside Accra and Kumasi? Yes, but make your address and landmark very clear.",
      "What if a product is out of stock? You can watch availability or continue shopping for similar options.",
    ],
  },
} as const;

const iconCards = [
  { title: "Trusted Support", body: "Stay close to live chat, WhatsApp, and shopper guidance whenever support is configured.", icon: Headset },
  { title: "Clear Policies", body: "Know what to expect from ordering, warranty language, and customer communication.", icon: ShieldCheck },
  { title: "Delivery Confidence", body: "We emphasize practical local delivery messaging for Ghanaian shoppers.", icon: Truck },
];

const InfoPage = () => {
  const { slug = "" } = useParams();
  const content = infoPages[slug as keyof typeof infoPages];

  if (!content) {
    return (
      <div className="min-h-screen bg-[#f4f7fb] pb-20 md:pb-0">
        <Header />
        <main className="container py-16">
          <div className="rounded-[32px] border border-border bg-white px-6 py-16 text-center shadow-[0_24px_70px_-52px_rgba(15,23,42,0.5)]">
            <h1 className="text-4xl font-extrabold text-foreground">Page not found</h1>
            <p className="mt-4 text-muted-foreground">This information page is not available yet.</p>
            <Button asChild className="mt-6 rounded-full px-6">
              <Link to="/">Return Home</Link>
            </Button>
          </div>
        </main>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb] pb-20 md:pb-0">
      <Header />

      <section className="bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_45%,#dbeafe_100%)] py-14 text-white">
        <div className="container">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/75">{content.eyebrow}</p>
          <h1 className="mt-3 max-w-4xl font-display text-4xl font-extrabold md:text-6xl">{content.title}</h1>
          <p className="mt-4 max-w-3xl text-base text-white/85 md:text-lg">{content.description}</p>
        </div>
      </section>

      <main className="container py-8">
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[32px] border border-border bg-white p-6 shadow-[0_24px_70px_-52px_rgba(15,23,42,0.5)] md:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">What this means for shoppers</p>
            <div className="mt-6 space-y-4">
              {content.bullets.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-border bg-slate-50 px-4 py-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
                  <p className="text-sm leading-6 text-muted-foreground">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="rounded-full px-6">
                <Link to="/products">
                  Browse Products
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full px-6">
                <Link to="/account/login">Go to My Account</Link>
              </Button>
            </div>
          </section>

          <aside className="space-y-4">
            {iconCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="rounded-[28px] border border-border bg-white p-6 shadow-[0_24px_70px_-52px_rgba(15,23,42,0.5)]">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-bold text-foreground">{card.title}</h2>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-muted-foreground">{card.body}</p>
                </div>
              );
            })}
          </aside>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default InfoPage;
