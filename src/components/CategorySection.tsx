import { useQuery } from "@tanstack/react-query";
import {
  Camera,
  Cpu,
  Gamepad2,
  Headphones,
  HelpCircle,
  Laptop,
  MonitorSmartphone,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getCategories } from "@/lib/api";

const iconMap: Record<string, LucideIcon> = {
  Smartphone,
  Laptop,
  MonitorSmartphone,
  Camera,
  Headphones,
  Gamepad2,
  Cpu,
};

const fallbackCategories = [
  { id: 1, name: "Smart Phones", slug: "smart-phones", iconName: "Smartphone" },
  { id: 2, name: "Laptops", slug: "laptops", iconName: "Laptop" },
  { id: 3, name: "Desktop PCs", slug: "desktop-pcs", iconName: "MonitorSmartphone" },
  { id: 4, name: "Game Consoles", slug: "game-consoles", iconName: "Gamepad2" },
  { id: 5, name: "Game Controllers", slug: "game-controllers", iconName: "Gamepad2" },
  { id: 6, name: "Cameras", slug: "cameras", iconName: "Camera" },
  { id: 7, name: "Headphones", slug: "headphones", iconName: "Headphones" },
  { id: 8, name: "System Units", slug: "system-units", iconName: "Cpu" },
];

const CategorySection = () => {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const displayCategories = categories.length > 0 ? categories : fallbackCategories;

  return (
    <section className="bg-primary py-12">
      <div className="container">
        <h2 className="text-center font-display text-4xl font-extrabold uppercase tracking-tight text-white md:text-5xl">
          Browse Categories
        </h2>

        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-4">
          {isLoading && Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-28 rounded-sm bg-white/80 animate-pulse" />
          ))}

          {!isLoading && displayCategories.map((category) => {
            const Icon = iconMap[category.iconName] ?? HelpCircle;

            return (
              <Link
                key={category.slug}
                to={`/?category=${encodeURIComponent(category.slug)}`}
                className="group rounded-sm bg-white px-4 py-6 text-center transition-transform hover:-translate-y-1"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="mt-4 block text-sm font-semibold text-foreground">
                  {category.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
