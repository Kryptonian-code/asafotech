export const STORE_CATEGORY_PRESETS = [
  { name: "Smart Phones", slug: "smart-phones", iconName: "Smartphone", displayOrder: 1 },
  { name: "Laptops", slug: "laptops", iconName: "Laptop", displayOrder: 2 },
  { name: "Desktop PCs", slug: "desktop-pcs", iconName: "MonitorSmartphone", displayOrder: 3 },
  { name: "System Units", slug: "system-units", iconName: "Cpu", displayOrder: 4 },
  { name: "Game Consoles", slug: "game-consoles", iconName: "Gamepad2", displayOrder: 5 },
  { name: "Game Controllers", slug: "game-controllers", iconName: "Gamepad2", displayOrder: 6 },
  { name: "Headphones", slug: "headphones", iconName: "Headphones", displayOrder: 7 },
  { name: "Accessories", slug: "accessories", iconName: "Smartphone", displayOrder: 8 },
] as const;

export const STORE_CATEGORY_FALLBACKS = STORE_CATEGORY_PRESETS.map(({ name, slug }) => ({ name, slug }));
