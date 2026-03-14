import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Boxes,
  CircleDollarSign,
  ImagePlus,
  Layers3,
  MapPin,
  PackageCheck,
  PackageSearch,
  PencilRuler,
  ShoppingBag,
  Tag,
  WalletCards,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAdminAuth } from "@/context/AdminAuthContext";
import {
  createCategory,
  createProduct,
  deleteCategory,
  deleteProduct,
  getCategories,
  getOrderDetails,
  getOrders,
  getProducts,
  updateCategory,
  updateOrderStatus,
  updateProduct,
  uploadImage,
  type Category,
  type Product,
  type ProductVariant,
} from "@/lib/api";
import { STORE_CATEGORY_PRESETS } from "@/lib/storeCategories";

const iconOptions = ["Smartphone", "Laptop", "MonitorSmartphone", "Camera", "Headphones", "Gamepad2", "Cpu"];
const collectionOptions = ["trending", "deals", "none"];
const orderStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
const paymentStatuses = ["pending", "paid", "failed"];
const stockStatuses = ["in_stock", "out_of_stock"] as const;
const productStatuses = ["active", "draft", "archived"] as const;
const conditionOptions = ["Brand New", "Like New", "Used - Excellent", "Used - Good"] as const;
const catalogViews = ["products", "categories"] as const;
const catalogPageSize = 12;

const emptyCategoryForm = { id: null as number | null, name: "", iconName: "Smartphone", displayOrder: "0" };
const emptyProductForm = {
  id: null as number | null,
  name: "",
  brand: "",
  categoryId: "",
  description: "",
  conditionLabel: "Brand New",
  warrantyMonths: "12",
  keySpecs: "",
  status: "active",
  price: "",
  originalPrice: "",
  image: "",
  galleryImages: "",
  variants: "",
  inventoryCount: "0",
  stockStatus: "in_stock",
  collectionTag: "none",
};

const panelCard = "rounded-[30px] border border-border/80 bg-white p-6 shadow-[0_28px_80px_-52px_rgba(15,23,42,0.45)]";
const softCard = "rounded-[26px] border border-border/80 bg-slate-50/80 p-5";
const labelText = "text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground";

const statusTone = (count: number) => (
  count > 0
    ? "bg-emerald-50 text-emerald-700"
    : "bg-rose-50 text-rose-700"
);

const parseLines = (value: string) => value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);

const parseVariantRows = (value: string): ProductVariant[] => (
  parseLines(value).map((line, index) => {
    const [label = "", price = "", inventoryCount = "", image = ""] = line.split("|").map((item) => item.trim());

    return {
      id: `variant-${index + 1}-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "option"}`,
      label: label || `Option ${index + 1}`,
      price: Number(price || 0),
      inventoryCount: Number(inventoryCount || 0),
      image: image || null,
    };
  }).filter((variant) => variant.label !== "" && Number.isFinite(variant.price))
);

const stringifyVariantRows = (variants?: ProductVariant[] | null) => (
  (variants ?? [])
    .map((variant) => [variant.label, variant.price, variant.inventoryCount, variant.image ?? ""].join("|"))
    .join("\n")
);

const Admin = () => {
  const queryClient = useQueryClient();
  const { admin, logout } = useAdminAuth();
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: getCategories });
  const { data: products = [] } = useQuery({ queryKey: ["products", "all"], queryFn: () => getProducts() });
  const { data: orders = [] } = useQuery({ queryKey: ["orders"], queryFn: getOrders });

  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [productSearch, setProductSearch] = useState("");
  const [productFilter, setProductFilter] = useState("all");
  const [catalogView, setCatalogView] = useState<(typeof catalogViews)[number]>("products");
  const [catalogPage, setCatalogPage] = useState(1);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const refreshStore = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["categories"] }),
      queryClient.invalidateQueries({ queryKey: ["products"] }),
      queryClient.invalidateQueries({ queryKey: ["orders"] }),
    ]);
  };

  const categoryMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: categoryForm.name,
        iconName: categoryForm.iconName,
        displayOrder: Number(categoryForm.displayOrder || 0),
      };
      return categoryForm.id ? updateCategory(categoryForm.id, payload) : createCategory(payload);
    },
    onSuccess: async () => {
      setCategoryForm(emptyCategoryForm);
      await refreshStore();
    },
  });

  const productMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: productForm.name,
        brand: productForm.brand,
        categoryId: Number(productForm.categoryId),
        description: productForm.description,
        conditionLabel: productForm.conditionLabel,
        warrantyMonths: productForm.warrantyMonths ? Number(productForm.warrantyMonths) : null,
        keySpecs: productForm.keySpecs,
        status: productForm.status,
        price: Number(productForm.price),
        originalPrice: productForm.originalPrice ? Number(productForm.originalPrice) : null,
        image: productForm.image,
        galleryImages: parseLines(productForm.galleryImages).length > 0
          ? parseLines(productForm.galleryImages)
          : [productForm.image].filter(Boolean),
        variants: parseVariantRows(productForm.variants),
        inventoryCount: productForm.stockStatus === "out_of_stock"
          ? 0
          : Math.max(1, Number(productForm.inventoryCount || 1)),
        collectionTag: productForm.collectionTag === "none" ? null : productForm.collectionTag,
        isFeatured: true,
      };
      return productForm.id ? updateProduct(productForm.id, payload) : createProduct(payload);
    },
    onSuccess: async () => {
      setProductForm(emptyProductForm);
      await refreshStore();
    },
  });

  const deleteCategoryMutation = useMutation({ mutationFn: deleteCategory, onSuccess: refreshStore });
  const deleteProductMutation = useMutation({ mutationFn: deleteProduct, onSuccess: refreshStore });
  const presetCategoriesMutation = useMutation({
    mutationFn: async () => {
      const existingSlugs = new Set(categories.map((category) => category.slug));
      const missing = STORE_CATEGORY_PRESETS.filter((preset) => !existingSlugs.has(preset.slug));
      await Promise.all(missing.map((preset) => createCategory({
        name: preset.name,
        slug: preset.slug,
        iconName: preset.iconName,
        displayOrder: preset.displayOrder,
      })));
    },
    onSuccess: refreshStore,
  });
  const orderStatusMutation = useMutation({
    mutationFn: ({ id, status, paymentStatus }: { id: number; status: string; paymentStatus: string; }) =>
      updateOrderStatus(id, { status, paymentStatus }),
    onSuccess: refreshStore,
  });

  const { data: selectedOrderDetails } = useQuery({
    queryKey: ["admin-order-details", selectedOrderId],
    queryFn: () => getOrderDetails(selectedOrderId ?? 0),
    enabled: selectedOrderId !== null,
  });

  const stats = useMemo(() => ({
    categories: categories.length,
    products: products.length,
    orders: orders.length,
    revenue: orders.reduce((sum, order) => sum + Number(order.total), 0),
  }), [categories, products, orders]);

  const filteredProducts = useMemo(() => (
    products.filter((product) => {
      const query = productSearch.trim().toLowerCase();
      const matchesSearch = query === ""
        || product.name.toLowerCase().includes(query)
        || product.brand.toLowerCase().includes(query);
      const matchesCategory = productFilter === "all" || String(product.categoryId) === productFilter;
      return matchesSearch && matchesCategory;
    })
  ), [productFilter, productSearch, products]);

  const totalCatalogPages = Math.max(1, Math.ceil(filteredProducts.length / catalogPageSize));
  const paginatedProducts = useMemo(() => {
    const start = (catalogPage - 1) * catalogPageSize;
    return filteredProducts.slice(start, start + catalogPageSize);
  }, [catalogPage, filteredProducts]);

  const lowStockProducts = useMemo(
    () => products.filter((product) => (product.inventoryCount ?? 0) > 0 && (product.inventoryCount ?? 0) <= 3).slice(0, 3),
    [products],
  );

  const recentOrders = useMemo(() => orders.slice(0, 3), [orders]);
  const missingPresetCategories = useMemo(
    () => STORE_CATEGORY_PRESETS.filter((preset) => !categories.some((category) => category.slug === preset.slug)),
    [categories],
  );

  const categorySnapshots = useMemo(
    () => categories.slice(0, 4).map((category) => ({
      ...category,
      productCount: products.filter((product) => product.categoryId === category.id).length,
    })),
    [categories, products],
  );

  useEffect(() => {
    setCatalogPage(1);
  }, [productFilter, productSearch]);

  useEffect(() => {
    if (catalogPage > totalCatalogPages) {
      setCatalogPage(totalCatalogPages);
    }
  }, [catalogPage, totalCatalogPages]);

  const loadCategoryForEdit = (category: Category) => {
    setCategoryForm({
      id: category.id,
      name: category.name,
      iconName: category.iconName,
      displayOrder: String(category.displayOrder ?? 0),
    });
  };

  const loadProductForEdit = (product: Product) => {
    setProductForm({
      id: product.id,
      name: product.name,
      brand: product.brand,
      categoryId: String(product.categoryId ?? ""),
      description: product.description ?? "",
      conditionLabel: product.conditionLabel ?? "Brand New",
      warrantyMonths: product.warrantyMonths ? String(product.warrantyMonths) : "",
      keySpecs: product.keySpecs ?? "",
      status: product.status ?? "active",
      price: String(product.price),
      originalPrice: product.originalPrice ? String(product.originalPrice) : "",
      image: product.image,
      galleryImages: (product.galleryImages ?? [product.image]).join("\n"),
      variants: stringifyVariantRows(product.variants),
      inventoryCount: String(product.inventoryCount ?? 0),
      stockStatus: (product.inventoryCount ?? 0) > 0 ? "in_stock" : "out_of_stock",
      collectionTag: product.collectionTag ?? "none",
    });
  };

  const SectionHeader = ({
    icon: Icon,
    eyebrow,
    title,
    description,
  }: {
    icon: typeof Layers3;
    eyebrow: string;
    title: string;
    description: string;
  }) => (
    <div className="mb-5 flex items-start gap-3">
      <div className="mt-0.5 rounded-2xl bg-primary/10 p-2.5 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className={labelText}>{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-bold text-foreground md:text-3xl">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.08),transparent_28%),linear-gradient(180deg,#f8fbff_0%,#eef3f9_100%)] pb-20 md:pb-0">
      <Header />
      <main className="container py-6">
        <section className="overflow-hidden rounded-[34px] border border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_48%,#dbeafe_100%)] p-6 text-white shadow-[0_28px_90px_-48px_rgba(30,64,175,0.85)] md:p-8">
          <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/85">Admin Portal</p>
              <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight md:text-5xl">Asafo Tech Merchant Desk</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/95 md:text-base">
                Signed in as {admin?.fullName}. Run a cleaner Ghana electronics back office for phones, laptops, consoles,
                accessories, pricing, stock levels, and customer deliveries across Accra, Kumasi, and beyond.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {[
                  "GHS-first pricing",
                  "MoMo-ready support flow",
                  "Storefront stock control",
                  "Accra and Kumasi delivery ops",
                ].map((item) => (
                  <span key={item} className="rounded-full border border-white/35 bg-slate-950/20 px-4 py-2 text-xs font-semibold tracking-wide text-white">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-[28px] border border-white/25 bg-slate-950/20 p-5 backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/85">Today&apos;s focus</p>
                <div className="mt-4 space-y-3 text-sm text-white">
                  <div className="flex items-start gap-3">
                    <PackageCheck className="mt-0.5 h-4 w-4 text-white" />
                    <span>{lowStockProducts.length > 0 ? `${lowStockProducts.length} products need a stock check soon.` : "Stock levels are currently healthy."}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CircleDollarSign className="mt-0.5 h-4 w-4 text-white" />
                    <span>Revenue is tracked in Ghana cedis so you always read store performance clearly.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 text-white" />
                    <span>Keep product details practical for shoppers in Ghana: honest specs, condition, and delivery cues.</span>
                  </div>
                </div>
              </div>

              <div className="flex items-end justify-between rounded-[28px] border border-white/25 bg-slate-950/20 p-5 backdrop-blur-sm">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/85">Session</p>
                  <p className="mt-3 text-lg font-semibold text-white">{admin?.email}</p>
                </div>
                <Button
                  variant="outline"
                  className="rounded-full border-white/25 bg-white/10 text-white hover:bg-white hover:text-slate-950"
                  onClick={() => void logout()}
                >
                  Log Out
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Live categories",
              value: stats.categories,
              note: "How shoppers browse the store",
              icon: Layers3,
              tone: "text-sky-700 bg-sky-50",
            },
            {
              label: "Products in catalog",
              value: stats.products,
              note: "Phones, laptops, gaming and more",
              icon: ShoppingBag,
              tone: "text-indigo-700 bg-indigo-50",
            },
            {
              label: "Orders to track",
              value: stats.orders,
              note: "Customer orders needing movement",
              icon: PackageSearch,
              tone: "text-amber-700 bg-amber-50",
            },
            {
              label: "Revenue so far",
              value: `GHS ${stats.revenue.toFixed(2)}`,
              note: "Total order value in local currency",
              icon: WalletCards,
              tone: "text-emerald-700 bg-emerald-50",
            },
          ].map((stat) => {
            const Icon = stat.icon;

            return (
              <div key={stat.label} className={panelCard}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className={labelText}>{stat.label}</p>
                    <p className="mt-3 font-display text-3xl font-extrabold text-foreground">{stat.value}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{stat.note}</p>
                  </div>
                  <div className={`rounded-2xl p-3 ${stat.tone}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <section className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr_0.9fr]">
          <div className={panelCard}>
            <SectionHeader
              icon={AlertTriangle}
              eyebrow="Stock Watch"
              title="Low stock signals"
              description="Catch thin inventory before customers hit an empty shelf."
            />

            <div className="space-y-3">
              {lowStockProducts.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border px-4 py-8 text-sm text-muted-foreground">
                  No low stock alerts right now. Your main catalog still has breathing room.
                </div>
              )}

              {lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between rounded-2xl border border-border bg-slate-50 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.categoryName} | {product.brand}</p>
                  </div>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
                    {product.inventoryCount} left
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className={panelCard}>
            <SectionHeader
              icon={Tag}
              eyebrow="Category Pulse"
              title="Where shoppers browse"
              description="See the main category lanes that shape your storefront."
            />

            <div className="space-y-3">
              {categorySnapshots.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border px-4 py-8 text-sm text-muted-foreground">
                  Create categories like Smart Phones, Laptops, Consoles, and Accessories to structure the store.
                </div>
              )}

              {categorySnapshots.map((category) => (
                <div key={category.id} className="flex items-center justify-between rounded-2xl border border-border bg-slate-50 px-4 py-3">
                  <div>
                    <p className="font-semibold text-foreground">{category.name}</p>
                    <p className="text-xs text-muted-foreground">{category.slug}</p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                    {category.productCount} items
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className={panelCard}>
            <SectionHeader
              icon={PackageCheck}
              eyebrow="Recent Orders"
              title="Fulfilment snapshot"
              description="A quick look at the latest order movement in the store."
            />

            <div className="space-y-3">
              {recentOrders.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border px-4 py-8 text-sm text-muted-foreground">
                  No orders yet. Once customers start buying, recent order activity will appear here.
                </div>
              )}

              {recentOrders.map((order) => (
                <div key={order.id} className="rounded-2xl border border-border bg-slate-50 px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">{order.customerName} | {order.customerPhone}</p>
                    </div>
                    <span className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                      {order.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">GHS {Number(order.total).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-6">
            <div className={panelCard}>
              <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
                <div className="space-y-6">
                  <SectionHeader
                    icon={PencilRuler}
                    eyebrow="Product Editor"
                    title={productForm.id ? "Refine product details" : "Add a new product"}
                    description="Write product information the way a serious electronics store would: clear model name, honest brand, useful specs, and a strong sales angle."
                  />

                  <div className={softCard}>
                    <SectionHeader
                      icon={PencilRuler}
                      eyebrow="Basics"
                      title="Product details"
                      description="Lead with a clean product name, strong brand label, and a short practical description."
                    />

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="productName">Product name</Label>
                        <Input
                          id="productName"
                          value={productForm.name}
                          onChange={(event) => setProductForm((current) => ({ ...current, name: event.target.value }))}
                          placeholder="Samsung Galaxy A56"
                          className="h-11 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="productBrand">Brand</Label>
                        <Input
                          id="productBrand"
                          value={productForm.brand}
                          onChange={(event) => setProductForm((current) => ({ ...current, brand: event.target.value }))}
                          placeholder="Samsung"
                          className="h-11 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={productForm.categoryId} onValueChange={(value) => setProductForm((current) => ({ ...current, categoryId: value }))}>
                          <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Choose category" /></SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={String(category.id)}>{category.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Select value={productForm.status} onValueChange={(value) => setProductForm((current) => ({ ...current, status: value }))}>
                          <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Choose status" /></SelectTrigger>
                          <SelectContent>
                            {productStatuses.map((status) => (
                              <SelectItem key={status} value={status}>{status}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Condition</Label>
                        <Select value={productForm.conditionLabel} onValueChange={(value) => setProductForm((current) => ({ ...current, conditionLabel: value }))}>
                          <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Choose condition" /></SelectTrigger>
                          <SelectContent>
                            {conditionOptions.map((condition) => (
                              <SelectItem key={condition} value={condition}>{condition}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="warrantyMonths">Warranty (months)</Label>
                        <Input
                          id="warrantyMonths"
                          type="number"
                          min="0"
                          value={productForm.warrantyMonths}
                          onChange={(event) => setProductForm((current) => ({ ...current, warrantyMonths: event.target.value }))}
                          className="h-11 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="productDescription">Description</Label>
                        <Textarea
                          id="productDescription"
                          value={productForm.description}
                          onChange={(event) => setProductForm((current) => ({ ...current, description: event.target.value }))}
                          placeholder="Describe the electronics features, condition, key accessories in the box, and what makes it worth buying."
                          className="min-h-32 rounded-2xl"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="productSpecs">Key specifications</Label>
                        <Textarea
                          id="productSpecs"
                          value={productForm.keySpecs}
                          onChange={(event) => setProductForm((current) => ({ ...current, keySpecs: event.target.value }))}
                          placeholder={`Display size: 15.6-inch\nProcessor: Intel Core i5\nRAM: 8GB\nStorage: 512GB SSD`}
                          className="min-h-28 rounded-2xl"
                        />
                      </div>
                    </div>
                  </div>

                  <div className={softCard}>
                    <SectionHeader
                      icon={ImagePlus}
                      eyebrow="Media"
                      title="Product gallery"
                      description="Use a strong main image, then add extra gallery images for angles, ports, or what comes in the box."
                    />

                    {productForm.image && (
                      <div className="mb-4 rounded-[22px] border border-border bg-white p-3">
                        <img src={productForm.image} alt="Product preview" className="h-64 w-full rounded-[18px] object-cover" />
                      </div>
                    )}

                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="productImage">Image URL</Label>
                        <Input
                          id="productImage"
                          value={productForm.image}
                          onChange={(event) => setProductForm((current) => ({ ...current, image: event.target.value }))}
                          placeholder="https://..."
                          className="h-11 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="productImageUpload">Upload image</Label>
                        <Input
                          id="productImageUpload"
                          type="file"
                          accept="image/*"
                          className="rounded-xl"
                          onChange={async (event) => {
                            const file = event.target.files?.[0];
                            if (!file) return;
                            setUploadingImage(true);
                            try {
                              const uploaded = await uploadImage(file);
                              setProductForm((current) => ({ ...current, image: uploaded.url }));
                            } finally {
                              setUploadingImage(false);
                              event.target.value = "";
                            }
                          }}
                        />
                        {uploadingImage && <p className="text-xs text-muted-foreground">Uploading image...</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="productGallery">Gallery images</Label>
                        <Textarea
                          id="productGallery"
                          value={productForm.galleryImages}
                          onChange={(event) => setProductForm((current) => ({ ...current, galleryImages: event.target.value }))}
                          className="min-h-28 rounded-xl"
                          placeholder={"One image URL per line\nhttps://...\nhttps://..."}
                        />
                        <p className="text-xs text-muted-foreground">Use one image URL per line. The first image becomes the default gallery lead if needed.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className={softCard}>
                    <SectionHeader
                      icon={Tag}
                      eyebrow="Organization"
                      title="Store placement"
                      description="Place the item where shoppers expect to find it."
                    />

                    <div className="space-y-4">
                      {missingPresetCategories.length > 0 && (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                          <p className="font-semibold">Your storefront categories are not fully loaded yet.</p>
                          <p className="mt-1">
                            Add the Asafo Tech category set so product placement matches the customer-facing
                            <span className="font-semibold"> All Categories </span>
                            menu.
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {missingPresetCategories.map((category) => (
                              <span key={category.slug} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-amber-700">
                                {category.name}
                              </span>
                            ))}
                          </div>
                          <Button
                            className="mt-4 rounded-full"
                            disabled={presetCategoriesMutation.isPending}
                            onClick={() => presetCategoriesMutation.mutate()}
                          >
                            {presetCategoriesMutation.isPending ? "Loading Categories..." : "Load Storefront Categories"}
                          </Button>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label>Collection</Label>
                        <Select value={productForm.collectionTag} onValueChange={(value) => setProductForm((current) => ({ ...current, collectionTag: value }))}>
                          <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Choose placement" /></SelectTrigger>
                          <SelectContent>
                            {collectionOptions.map((collection) => (
                              <SelectItem key={collection} value={collection}>
                                {collection === "none" ? "No collection" : collection}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className={softCard}>
                    <SectionHeader
                      icon={WalletCards}
                      eyebrow="Pricing"
                      title="Sell in cedis"
                      description="Keep pricing simple and easy to compare for local buyers."
                    />

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="productPrice">Price</Label>
                        <Input
                          id="productPrice"
                          type="number"
                          step="0.01"
                          value={productForm.price}
                          onChange={(event) => setProductForm((current) => ({ ...current, price: event.target.value }))}
                          className="h-11 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="productOriginalPrice">Compare-at price</Label>
                        <Input
                          id="productOriginalPrice"
                          type="number"
                          step="0.01"
                          value={productForm.originalPrice}
                          onChange={(event) => setProductForm((current) => ({ ...current, originalPrice: event.target.value }))}
                          className="h-11 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="productVariants">Variants</Label>
                        <Textarea
                          id="productVariants"
                          value={productForm.variants}
                          onChange={(event) => setProductForm((current) => ({ ...current, variants: event.target.value }))}
                          className="min-h-32 rounded-xl"
                          placeholder={"Label|Price|Stock|Image URL(optional)\n128GB / Black|3499|6|https://...\n256GB / Blue|3899|4|https://..."}
                        />
                        <p className="text-xs text-muted-foreground">
                          Use one variant per line in this order: label, price, stock, image URL. This works well for storage, colour, and bundle options.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className={softCard}>
                    <SectionHeader
                      icon={Boxes}
                      eyebrow="Inventory"
                      title="Stock visibility"
                      description="Control whether shoppers can buy now or see an out-of-stock state."
                    />

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Stock status</Label>
                        <Select
                          value={productForm.stockStatus}
                          onValueChange={(value) => setProductForm((current) => ({
                            ...current,
                            stockStatus: value as (typeof stockStatuses)[number],
                            inventoryCount: value === "out_of_stock"
                              ? "0"
                              : current.inventoryCount === "0"
                                ? "1"
                                : current.inventoryCount,
                          }))}
                        >
                          <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Choose stock status" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="in_stock">In Stock</SelectItem>
                            <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="inventoryCount">Inventory count</Label>
                        <Input
                          id="inventoryCount"
                          type="number"
                          min="0"
                          value={productForm.inventoryCount}
                          onChange={(event) => setProductForm((current) => ({
                            ...current,
                            inventoryCount: event.target.value,
                            stockStatus: Number(event.target.value) > 0 ? "in_stock" : "out_of_stock",
                          }))}
                          className="h-11 rounded-xl"
                          disabled={productForm.stockStatus === "out_of_stock"}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="sticky top-24 rounded-[26px] border border-slate-200 bg-slate-950 p-5 text-white shadow-[0_30px_80px_-48px_rgba(15,23,42,0.8)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/60">Save</p>
                    <h3 className="mt-3 text-2xl font-bold">Ready to publish?</h3>
                    <p className="mt-2 text-sm leading-6 text-white/72">
                      Save this product to push it into your storefront catalog, collections, and category shelves.
                    </p>
                    <div className="mt-4 rounded-2xl bg-white/10 p-4 text-sm text-white/78">
                      Keep listings practical: model, condition, accessories included, and how quickly you can fulfil the order.
                    </div>
                    <div className="mt-5 flex gap-3">
                      <Button
                        className="h-12 flex-1 rounded-full bg-white text-slate-950 hover:bg-white/90"
                        disabled={productMutation.isPending || uploadingImage}
                        onClick={() => productMutation.mutate()}
                      >
                        {productMutation.isPending ? "Saving..." : productForm.id ? "Update Product" : "Create Product"}
                      </Button>
                      {productForm.id && (
                        <Button
                          variant="outline"
                          className="h-12 rounded-full border-white/20 bg-white/10 text-white hover:bg-white/15"
                          onClick={() => setProductForm(emptyProductForm)}
                        >
                          Reset
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={panelCard}>
              <SectionHeader
                icon={Layers3}
                eyebrow="Category Setup"
                title={categoryForm.id ? "Edit store category" : "Create a category"}
                description="Build clean product lanes like Smart Phones, Laptops, Game Consoles, Controllers, and Accessories."
              />

              <div className="mb-5 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4 text-sm text-sky-900">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">Asafo Tech storefront categories</p>
                    <p className="mt-1 text-sky-800">
                      These are the categories used in the customer-facing <span className="font-semibold">All Categories</span> menu.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="rounded-full border-sky-300 bg-white text-sky-900 hover:bg-sky-100"
                    disabled={presetCategoriesMutation.isPending || missingPresetCategories.length === 0}
                    onClick={() => presetCategoriesMutation.mutate()}
                  >
                    {missingPresetCategories.length === 0
                      ? "Storefront Categories Loaded"
                      : presetCategoriesMutation.isPending
                        ? "Loading..."
                        : "Load Storefront Categories"}
                  </Button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {STORE_CATEGORY_PRESETS.map((category) => {
                    const exists = categories.some((item) => item.slug === category.slug);

                    return (
                      <span
                        key={category.slug}
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          exists ? "bg-emerald-100 text-emerald-700" : "bg-white text-sky-900"
                        }`}
                      >
                        {category.name}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="categoryName">Category name</Label>
                  <Input
                    id="categoryName"
                    value={categoryForm.name}
                    onChange={(event) => setCategoryForm((current) => ({ ...current, name: event.target.value }))}
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <Select value={categoryForm.iconName} onValueChange={(value) => setCategoryForm((current) => ({ ...current, iconName: value }))}>
                    <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Choose an icon" /></SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((icon) => <SelectItem key={icon} value={icon}>{icon}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayOrder">Display order</Label>
                  <Input
                    id="displayOrder"
                    type="number"
                    value={categoryForm.displayOrder}
                    onChange={(event) => setCategoryForm((current) => ({ ...current, displayOrder: event.target.value }))}
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Button className="h-11 rounded-full px-6" disabled={categoryMutation.isPending} onClick={() => categoryMutation.mutate()}>
                  {categoryMutation.isPending ? "Saving..." : categoryForm.id ? "Update Category" : "Create Category"}
                </Button>
                {categoryForm.id && (
                  <Button variant="outline" className="h-11 rounded-full px-6" onClick={() => setCategoryForm(emptyCategoryForm)}>
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className={panelCard}>
              <SectionHeader
                icon={ShoppingBag}
                eyebrow="Catalog"
                title="Products and categories"
                description="Scan the store quickly, filter by category, and jump into edits without the page feeling crowded."
              />

              <div className="mb-5 grid gap-3 md:grid-cols-[1fr_220px]">
                <Input
                  placeholder="Search products"
                  value={productSearch}
                  onChange={(event) => setProductSearch(event.target.value)}
                  className="h-11 rounded-xl"
                />
                <Select value={productFilter} onValueChange={setProductFilter}>
                  <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Filter by category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>{category.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  {catalogViews.map((view) => (
                    <Button
                      key={view}
                      type="button"
                      variant={catalogView === view ? "default" : "outline"}
                      className="rounded-full capitalize"
                      onClick={() => setCatalogView(view)}
                    >
                      {view}
                    </Button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {categorySnapshots.map((category) => (
                    <span key={category.id} className="rounded-full border border-border bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
                      {category.name} ({category.productCount})
                    </span>
                  ))}
                </div>
              </div>

              {catalogView === "categories" ? (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {categories.map((category) => (
                    <div key={category.id} className="rounded-2xl border border-border bg-slate-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-foreground">{category.name}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{category.slug}</p>
                          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                            {products.filter((product) => product.categoryId === category.id).length} products
                          </p>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                          #{category.displayOrder ?? 0}
                        </span>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button variant="outline" className="rounded-full" onClick={() => loadCategoryForEdit(category)}>Edit</Button>
                        <Button variant="ghost" className="rounded-full text-destructive" onClick={() => deleteCategoryMutation.mutate(category.id)}>Delete</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-slate-50 px-4 py-3 text-sm text-muted-foreground">
                    <p>
                      Showing <span className="font-semibold text-foreground">{paginatedProducts.length}</span> of{" "}
                      <span className="font-semibold text-foreground">{filteredProducts.length}</span> matching products
                    </p>
                    <p>
                      Page <span className="font-semibold text-foreground">{catalogPage}</span> of{" "}
                      <span className="font-semibold text-foreground">{totalCatalogPages}</span>
                    </p>
                  </div>

                  {filteredProducts.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
                      No matching products. Add an item or change the filter to continue.
                    </div>
                  )}

                  <div className="space-y-3 md:hidden">
                    {paginatedProducts.map((product) => (
                      <div key={product.id} className="rounded-2xl border border-border bg-white p-4">
                        <div className="flex gap-4">
                          <img src={product.image} alt={product.name} className="h-20 w-20 rounded-2xl object-cover" />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="truncate text-lg font-bold text-foreground">{product.name}</p>
                                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                  <span>{product.categoryName} | {product.brand}</span>
                                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${statusTone(product.inventoryCount ?? 0)}`}>
                                    {(product.inventoryCount ?? 0) > 0 ? "In Stock" : "Out of Stock"}
                                  </span>
                                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700">
                                    {product.status ?? "active"}
                                  </span>
                                </div>
                                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                  <span>{product.conditionLabel ?? "Brand New"}</span>
                                  <span>|</span>
                                  <span>{product.warrantyMonths ? `${product.warrantyMonths} mo warranty` : "Warranty on request"}</span>
                                </div>
                              </div>
                              <p className="font-display text-xl font-extrabold text-foreground">GHS {product.price.toFixed(2)}</p>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                              <Button variant="outline" className="rounded-full" onClick={() => loadProductForEdit(product)}>Edit Product</Button>
                              <Button variant="ghost" className="rounded-full text-destructive" onClick={() => deleteProductMutation.mutate(product.id)}>Delete</Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="hidden overflow-hidden rounded-2xl border border-border md:block">
                    <div className="grid grid-cols-[minmax(0,2.4fr)_140px_110px_120px_150px_180px] items-center bg-slate-50 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                      <span>Product</span>
                      <span>Stock</span>
                      <span>Status</span>
                      <span>Condition</span>
                      <span>Price</span>
                      <span>Actions</span>
                    </div>
                    {paginatedProducts.map((product) => (
                      <div
                        key={product.id}
                        className="grid grid-cols-[minmax(0,2.4fr)_140px_110px_120px_150px_180px] items-center gap-3 border-t border-border bg-white px-4 py-3"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <img src={product.image} alt={product.name} className="h-14 w-14 rounded-xl object-cover" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-foreground">{product.name}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {product.categoryName} | {product.brand}
                            </p>
                            <p className="mt-1 truncate text-xs text-muted-foreground">
                              {product.warrantyMonths ? `${product.warrantyMonths} mo warranty` : "Warranty on request"}
                            </p>
                          </div>
                        </div>
                        <span className={`w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${statusTone(product.inventoryCount ?? 0)}`}>
                          {(product.inventoryCount ?? 0) > 0 ? "In Stock" : "Out of Stock"}
                        </span>
                        <span className="w-fit rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700">
                          {product.status ?? "active"}
                        </span>
                        <span className="text-sm text-muted-foreground">{product.conditionLabel ?? "Brand New"}</span>
                        <span className="font-display text-base font-extrabold text-foreground">GHS {product.price.toFixed(2)}</span>
                        <div className="flex flex-wrap items-center gap-2">
                          <Button variant="outline" size="sm" className="rounded-full" onClick={() => loadProductForEdit(product)}>Edit</Button>
                          <Button variant="ghost" size="sm" className="rounded-full text-destructive" onClick={() => deleteProductMutation.mutate(product.id)}>Delete</Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {filteredProducts.length > 0 && (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-white px-4 py-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-full"
                        disabled={catalogPage === 1}
                        onClick={() => setCatalogPage((current) => Math.max(1, current - 1))}
                      >
                        Previous
                      </Button>
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        {Array.from({ length: totalCatalogPages }, (_, index) => index + 1).map((page) => (
                          <Button
                            key={page}
                            type="button"
                            variant={catalogPage === page ? "default" : "outline"}
                            className="h-10 min-w-10 rounded-full px-3"
                            onClick={() => setCatalogPage(page)}
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-full"
                        disabled={catalogPage === totalCatalogPages}
                        onClick={() => setCatalogPage((current) => Math.min(totalCatalogPages, current + 1))}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className={panelCard}>
              <SectionHeader
                icon={PackageSearch}
                eyebrow="Order Queue"
                title="Keep orders moving"
                description="Update fulfilment and payment states without burying yourself in a noisy table."
              />

              <div className="space-y-4">
                {orders.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
                    No orders yet. As soon as customers check out, they will appear here for action.
                  </div>
                )}

                {orders.map((order) => (
                  <div key={order.id} className="rounded-2xl border border-border bg-slate-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">{order.orderNumber}</p>
                        <p className="text-xs text-muted-foreground">{order.customerName} | {order.customerPhone}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-xl font-extrabold text-foreground">GHS {Number(order.total).toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">{order.createdAt}</p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">{order.deliveryAddress}</p>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <Select defaultValue={order.status} onValueChange={(status) => orderStatusMutation.mutate({ id: order.id, status, paymentStatus: order.paymentStatus })}>
                        <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Order status" /></SelectTrigger>
                        <SelectContent>
                          {orderStatuses.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Select defaultValue={order.paymentStatus} onValueChange={(paymentStatus) => orderStatusMutation.mutate({ id: order.id, status: order.status, paymentStatus })}>
                        <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Payment status" /></SelectTrigger>
                        <SelectContent>
                          {paymentStatuses.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="outline"
                        className="rounded-full"
                        onClick={() => setSelectedOrderId((current) => current === order.id ? null : order.id)}
                      >
                        {selectedOrderId === order.id ? "Hide Order Details" : "View Order Details"}
                      </Button>
                    </div>
                    {selectedOrderId === order.id && selectedOrderDetails && (
                      <div className="mt-4 rounded-2xl border border-border bg-white p-4">
                        <div className="grid gap-4 md:grid-cols-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Customer</p>
                            <p className="mt-2 font-semibold text-foreground">{selectedOrderDetails.customerName}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Phone</p>
                            <p className="mt-2 font-semibold text-foreground">{selectedOrderDetails.customerPhone}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Delivery address</p>
                            <p className="mt-2 text-sm font-medium text-foreground">{selectedOrderDetails.deliveryAddress}</p>
                          </div>
                        </div>
                        <div className="mt-4 space-y-3">
                          {selectedOrderDetails.items.map((item) => (
                            <div key={item.id} className="grid gap-3 rounded-2xl border border-border bg-slate-50 p-3 sm:grid-cols-[68px_minmax(0,1fr)_auto] sm:items-center">
                              <div className="rounded-2xl bg-white p-3">
                                <img src={item.image} alt={item.productName} className="h-12 w-full object-contain" />
                              </div>
                              <div className="min-w-0">
                                <p className="truncate font-semibold text-foreground">{item.productName}</p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {item.brand}
                                  {item.variantLabel ? ` | ${item.variantLabel}` : ""}
                                  {" | "}Qty {item.quantity}
                                </p>
                              </div>
                              <p className="font-semibold text-foreground">GHS {(item.unitPrice * item.quantity).toFixed(2)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Admin;
