import { ArrowRight, Cpu, Gamepad2, Laptop, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="bg-primary py-8 md:py-12">
      <div className="container">
        <div className="grid items-center gap-8 rounded-md bg-primary px-1 lg:grid-cols-[minmax(0,1fr)_420px]">
            <div className="px-4 py-6 text-white md:px-8">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/75">Electronics E-Commerce</p>
              <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight md:text-6xl">
                The electronics store for phones, laptops, consoles and more.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/88 md:text-lg">
                Shop smart phones, laptops, system units, game controllers, game consoles, audio gear and trusted accessories
                with a clean shopping experience built for real electronics buyers.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild className="h-12 rounded-sm bg-white px-6 font-semibold text-primary hover:bg-white/95">
                  <Link to="/products">
                    Buy Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative mx-auto hidden h-[360px] w-full max-w-[420px] lg:block">
              <div className="absolute left-10 top-8 h-44 w-72 rounded-[22px] border-[10px] border-[#111827] bg-[linear-gradient(135deg,#f8fbff_0%,#d7e4ff_100%)] shadow-[0_24px_50px_-24px_rgba(0,0,0,0.55)]">
                <div className="flex h-full items-center justify-center">
                  <Laptop className="h-20 w-20 text-primary" />
                </div>
              </div>
              <div className="absolute bottom-2 left-0 h-56 w-28 rounded-[28px] border-[8px] border-[#111827] bg-[linear-gradient(180deg,#f8fbff_0%,#d7e4ff_100%)] shadow-[0_24px_50px_-24px_rgba(0,0,0,0.55)]">
                <div className="flex h-full items-center justify-center">
                  <Smartphone className="h-16 w-16 text-primary" />
                </div>
              </div>
              <div className="absolute bottom-0 right-6 flex h-40 w-40 items-center justify-center rounded-full bg-[#0f172a] shadow-[0_24px_50px_-24px_rgba(0,0,0,0.65)]">
                <Gamepad2 className="h-16 w-16 text-white" />
              </div>
              <div className="absolute right-0 top-14 flex h-24 w-24 items-center justify-center rounded-3xl bg-white/20 backdrop-blur">
                <Cpu className="h-10 w-10 text-white" />
              </div>
            </div>
        </div>

        <div className="mt-8 rounded-md bg-[linear-gradient(90deg,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0.78)_100%)] px-6 py-10 text-center">
          <h2 className="font-display text-4xl font-extrabold uppercase tracking-tight text-white md:text-6xl">
            Introducing <span className="text-secondary">ELECTRONICS</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base font-medium text-white/95 md:text-lg">
            Buy the latest electronics for work, play and everyday life. Phones, laptops, gaming gear and accessories all in one place.
          </p>
          <Button asChild className="mt-6 h-11 rounded-sm bg-white px-8 font-semibold text-primary hover:bg-white/95">
            <Link to="/products?category=game-consoles">Shop Now</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
