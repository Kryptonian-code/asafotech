import { Link } from "react-router-dom";

const footerSections = [
  {
    title: "Sale",
    links: [
      { label: "Discounts", to: "/products?collection=deals" },
      { label: "New Arrivals", to: "/products?sort=newest" },
      { label: "Register Discounts", to: "/account/login?mode=register" },
    ],
  },
  {
    title: "About Us",
    links: [
      { label: "About Asafo Tech", to: "/info/about-asafo-tech" },
      { label: "Work With Us", to: "/info/work-with-us" },
      { label: "Company Profile", to: "/info/company-profile" },
    ],
  },
  {
    title: "Buying",
    links: [
      { label: "How to Order", to: "/info/how-to-order" },
      { label: "Terms Of Use", to: "/info/terms-of-use" },
      { label: "Privacy Policy", to: "/info/privacy-policy" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact", to: "/info/contact" },
      { label: "Help Centre", to: "/info/help-centre" },
      { label: "FAQ", to: "/info/faq" },
    ],
  },
] as const;

const Footer = () => (
  <footer className="bg-white py-14">
    <div className="container">
      <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div>
          <h3 className="font-display text-4xl font-extrabold tracking-tight text-foreground">
            Asafo<span className="text-primary">Tech</span>
          </h3>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            Ghana Electronics
          </p>
        </div>

        {footerSections.map((section) => (
          <div key={section.title}>
            <h4 className="text-lg font-semibold text-primary">{section.title}</h4>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              {section.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  </footer>
);

export default Footer;
