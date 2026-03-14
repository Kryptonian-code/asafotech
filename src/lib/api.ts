export interface Category {
  id: number;
  name: string;
  slug: string;
  iconName: string;
  displayOrder?: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  brand: string;
  description?: string | null;
  conditionLabel?: string | null;
  warrantyMonths?: number | null;
  keySpecs?: string | null;
  galleryImages?: string[] | null;
  variants?: ProductVariant[] | null;
  status?: string;
  price: number;
  originalPrice?: number | null;
  image: string;
  rating: number;
  reviews: number;
  inventoryCount?: number;
  isFeatured?: number | boolean;
  collectionTag?: string | null;
  categoryId?: number;
  categoryName?: string;
  categorySlug?: string;
}

export interface OrderSummary {
  id: number;
  orderNumber: string;
  userId?: number | null;
  status: string;
  paymentStatus: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  createdAt: string;
}

export interface OrderItemDetail {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  productName: string;
  productSlug: string;
  image: string;
  brand: string;
  variantLabel?: string | null;
}

export interface OrderDetails extends OrderSummary {
  items: OrderItemDetail[];
}

export interface ProductVariant {
  id: string;
  label: string;
  price: number;
  inventoryCount: number;
  image?: string | null;
}

export interface AdminUser {
  id: number;
  fullName: string;
  email: string;
}

export interface AdminAuthResponse {
  token: string;
  admin: AdminUser;
  expiresAt: string;
}

export interface CustomerUser {
  id: number;
  fullName: string;
  email: string;
  phone?: string | null;
  firebaseUid?: string | null;
}

export interface CustomerAuthResponse {
  token: string;
  user: CustomerUser;
  expiresAt: string;
}

export interface CategoryPayload {
  name: string;
  slug?: string;
  iconName: string;
  displayOrder?: number;
}

export interface ProductPayload {
  categoryId: number;
  name: string;
  slug?: string;
  brand: string;
  description?: string;
  conditionLabel?: string;
  warrantyMonths?: number | null;
  keySpecs?: string | null;
  galleryImages?: string[];
  variants?: ProductVariant[];
  status?: string;
  price: number;
  originalPrice?: number | null;
  rating?: number;
  reviews?: number;
  image: string;
  inventoryCount?: number;
  collectionTag?: string | null;
  isFeatured?: boolean;
}

export interface OrderPayload {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  customerEmail?: string;
  customerFirebaseUid?: string;
  items: Array<{
    productId: number;
    quantity: number;
    variantLabel?: string | null;
    variantPrice?: number | null;
  }>;
}

export interface OrderResponse {
  orderId: number;
  orderNumber: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
}

export interface PaystackInitializeResponse {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
  order: OrderResponse;
}

export interface PaystackVerifyResponse {
  paymentStatus: string;
  order: OrderSummary;
  paystackStatus: string;
  message: string;
}

interface ApiResponse<T> {
  data: T;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";
const API_PROXY_TARGET = import.meta.env.VITE_API_PROXY_TARGET ?? "";
const AUTH_STORAGE_KEY = "asafo-tech-admin-token";
const CUSTOMER_AUTH_STORAGE_KEY = "asafo-tech-customer-token";
const REQUEST_TIMEOUT_MS = 8000;

function normalizeBaseUrl(value: string): string {
  return value.replace(/\/+$/, "");
}

function buildFallbackApiBaseUrl(): string | null {
  if (API_PROXY_TARGET.trim() === "") {
    return null;
  }

  return `${normalizeBaseUrl(API_PROXY_TARGET)}/api`;
}

const API_BASE_CANDIDATES = Array.from(
  new Set(
    [API_BASE_URL, buildFallbackApiBaseUrl()]
      .filter((value): value is string => typeof value === "string" && value.trim() !== "")
      .map(normalizeBaseUrl),
  ),
);

function authHeaders() {
  const token = window.localStorage.getItem(AUTH_STORAGE_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function customerAuthHeaders() {
  const token = window.localStorage.getItem(CUSTOMER_AUTH_STORAGE_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function hasDataProperty<T>(payload: unknown): payload is ApiResponse<T> {
  return typeof payload === "object" && payload !== null && "data" in payload;
}

function getErrorMessage(payload: unknown, status: number): string {
  if (typeof payload === "object" && payload !== null && "message" in payload) {
    const message = (payload as { message?: unknown }).message;

    if (typeof message === "string" && message.trim() !== "") {
      return message;
    }
  }

  if (typeof payload === "string" && payload.trim() !== "") {
    return payload
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  return `API request failed with status ${status}`;
}

async function parsePayload(response: Response): Promise<unknown> {
  const raw = await response.text();

  if (raw.trim() === "") {
    return null;
  }

  try {
    return JSON.parse(raw) as unknown;
  } catch {
    const jsonStart = raw.indexOf("{");
    const jsonEnd = raw.lastIndexOf("}");

    if (jsonStart !== -1 && jsonEnd > jsonStart) {
      try {
        return JSON.parse(raw.slice(jsonStart, jsonEnd + 1)) as unknown;
      } catch {
        return raw;
      }
    }

    return raw;
  }
}

function unwrapData<T>(payload: unknown): T {
  if (hasDataProperty<T>(payload)) {
    return payload.data;
  }

  if (payload === null) {
    throw new Error("The API returned an empty response.");
  }

  return payload as T;
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

function normalizeProduct(product: Product): Product {
  const galleryImages = (() => {
    const raw = (product as Product & { galleryImages?: unknown }).galleryImages;

    if (Array.isArray(raw)) {
      return raw.map((item) => String(item)).filter(Boolean);
    }

    if (typeof raw === "string" && raw.trim() !== "") {
      try {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
          return parsed.map((item) => String(item)).filter(Boolean);
        }
      } catch {
        return raw.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
      }
    }

    return product.image ? [product.image] : [];
  })();

  const variants = (() => {
    const raw = (product as Product & { variants?: unknown; variantsJson?: unknown }).variants
      ?? (product as Product & { variantsJson?: unknown }).variantsJson;

    if (Array.isArray(raw)) {
      return raw.map((variant, index) => ({
        id: String((variant as { id?: unknown }).id ?? `variant-${index + 1}`),
        label: String((variant as { label?: unknown }).label ?? `Option ${index + 1}`),
        price: toNumber((variant as { price?: unknown }).price, product.price),
        inventoryCount: toNumber((variant as { inventoryCount?: unknown }).inventoryCount, product.inventoryCount ?? 0),
        image: (variant as { image?: unknown }).image == null ? null : String((variant as { image?: unknown }).image),
      }));
    }

    if (typeof raw === "string" && raw.trim() !== "") {
      try {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
          return parsed.map((variant, index) => ({
            id: String((variant as { id?: unknown }).id ?? `variant-${index + 1}`),
            label: String((variant as { label?: unknown }).label ?? `Option ${index + 1}`),
            price: toNumber((variant as { price?: unknown }).price, product.price),
            inventoryCount: toNumber((variant as { inventoryCount?: unknown }).inventoryCount, product.inventoryCount ?? 0),
            image: (variant as { image?: unknown }).image == null ? null : String((variant as { image?: unknown }).image),
          }));
        }
      } catch {
        return [];
      }
    }

    return [];
  })();

  return {
    ...product,
    price: toNumber(product.price),
    originalPrice: product.originalPrice == null ? null : toNumber(product.originalPrice),
    rating: toNumber(product.rating),
    reviews: toNumber(product.reviews),
    inventoryCount: product.inventoryCount == null ? undefined : toNumber(product.inventoryCount),
    categoryId: product.categoryId == null ? undefined : toNumber(product.categoryId),
    warrantyMonths: product.warrantyMonths == null ? null : toNumber(product.warrantyMonths),
    galleryImages,
    variants,
  };
}

function normalizeOrder(order: OrderSummary): OrderSummary {
  return {
    ...order,
    id: toNumber(order.id),
    userId: order.userId == null ? null : toNumber(order.userId),
    subtotal: toNumber(order.subtotal),
    deliveryFee: toNumber(order.deliveryFee),
    total: toNumber(order.total),
  };
}

function normalizeOrderDetails(order: OrderDetails): OrderDetails {
  return {
    ...normalizeOrder(order),
    items: (order.items ?? []).map((item) => ({
      ...item,
      id: toNumber(item.id),
      productId: toNumber(item.productId),
      quantity: toNumber(item.quantity, 1),
      unitPrice: toNumber(item.unitPrice),
      variantLabel: item.variantLabel ?? null,
    })),
  };
}

function normalizeOrderResponse(order: OrderResponse): OrderResponse {
  return {
    ...order,
    orderId: toNumber(order.orderId),
    subtotal: toNumber(order.subtotal),
    deliveryFee: toNumber(order.deliveryFee),
    total: toNumber(order.total),
  };
}

function shouldTryNextApiBase(response: Response, payload: unknown, index: number): boolean {
  if (index >= API_BASE_CANDIDATES.length - 1) {
    return false;
  }

  const contentType = response.headers.get("content-type") ?? "";
  const isHtml = contentType.includes("text/html")
    || (typeof payload === "string" && payload.toLowerCase().includes("<!doctype html>"));

  return response.status === 404 && isHtml;
}

async function performRequest<T>(path: string, init?: RequestInit, auth: Record<string, string> = {}): Promise<T> {
  const headers = new Headers(init?.headers ?? {});

  if (!headers.has("Content-Type") && !(init?.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  Object.entries(auth).forEach(([key, value]) => headers.set(key, value));

  let lastError: Error | null = null;

  for (const [index, baseUrl] of API_BASE_CANDIDATES.entries()) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`${baseUrl}${path}`, {
        ...init,
        headers,
        signal: controller.signal,
      });

      const payload = await parsePayload(response).catch((error: unknown) => {
        if (!response.ok) {
          return null;
        }

        throw error;
      });

      if (shouldTryNextApiBase(response, payload, index)) {
        continue;
      }

      if (!response.ok) {
        throw new Error(getErrorMessage(payload, response.status));
      }

      return unwrapData<T>(payload);
    } catch (error) {
      if (error instanceof Error) {
        lastError = error;
      } else {
        lastError = new Error("Failed to reach the API.");
      }

      if (error instanceof DOMException && error.name === "AbortError") {
        lastError = new Error("The API took too long to respond. Check that Apache and MySQL are running.");
      } else if (lastError.message === "Failed to fetch" || lastError.message === "NetworkError when attempting to fetch resource.") {
        lastError = new Error("Failed to reach the API. Check that Apache is running and the local backend path is correct.");
      }

      if (index === API_BASE_CANDIDATES.length - 1) {
        throw lastError;
      }
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  throw lastError ?? new Error("Failed to reach the API.");
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  return performRequest<T>(path, init, authHeaders());
}

async function customerRequest<T>(path: string, init?: RequestInit): Promise<T> {
  return performRequest<T>(path, init, customerAuthHeaders());
}

export function setAdminToken(token: string | null) {
  if (token) {
    window.localStorage.setItem(AUTH_STORAGE_KEY, token);
  } else {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

export function getAdminToken() {
  return window.localStorage.getItem(AUTH_STORAGE_KEY);
}

export function setCustomerToken(token: string | null) {
  if (token) {
    window.localStorage.setItem(CUSTOMER_AUTH_STORAGE_KEY, token);
  } else {
    window.localStorage.removeItem(CUSTOMER_AUTH_STORAGE_KEY);
  }
}

export function getCustomerToken() {
  return window.localStorage.getItem(CUSTOMER_AUTH_STORAGE_KEY);
}

export async function getAdminStatus(): Promise<{ hasAdmin: boolean }> {
  return request<{ hasAdmin: boolean }>("/admin/status");
}

export async function bootstrapAdmin(payload: { fullName: string; email: string; password: string; }): Promise<AdminAuthResponse> {
  return request<AdminAuthResponse>("/admin/bootstrap", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function loginAdmin(payload: { email: string; password: string; }): Promise<AdminAuthResponse> {
  return request<AdminAuthResponse>("/admin/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getAdminMe(): Promise<{ admin: AdminUser }> {
  return request<{ admin: AdminUser }>("/admin/me");
}

export async function logoutAdmin(): Promise<void> {
  await request<{ ok: boolean }>("/admin/logout", { method: "POST" });
}

export async function registerCustomer(payload: { fullName: string; email: string; phone?: string; password: string; }): Promise<CustomerAuthResponse> {
  return customerRequest<CustomerAuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function loginCustomer(payload: { email: string; password: string; }): Promise<CustomerAuthResponse> {
  return customerRequest<CustomerAuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getCustomerMe(): Promise<{ user: CustomerUser }> {
  return customerRequest<{ user: CustomerUser }>("/auth/me");
}

export async function logoutCustomer(): Promise<void> {
  await customerRequest<{ ok: boolean }>("/auth/logout", { method: "POST" });
}

export async function syncFirebaseCustomer(payload: {
  firebaseUid: string;
  fullName: string;
  email: string;
  phone?: string | null;
  emailVerified: boolean;
}): Promise<{ user: CustomerUser }> {
  return request<{ user: CustomerUser }>("/auth/firebase-sync", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function uploadImage(file: File): Promise<{ url: string }> {
  const form = new FormData();
  form.append("image", file);
  return request<{ url: string }>("/uploads", {
    method: "POST",
    body: form,
  });
}

export async function getCategories(): Promise<Category[]> {
  return request<Category[]>("/categories");
}

export async function createCategory(payload: CategoryPayload): Promise<Category> {
  return request<Category>("/categories", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateCategory(id: number, payload: CategoryPayload): Promise<Category> {
  return request<Category>(`/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteCategory(id: number): Promise<void> {
  await request<{ ok: boolean }>(`/categories/${id}`, { method: "DELETE" });
}

export async function getProducts(collection?: string): Promise<Product[]> {
  const query = collection ? `?collection=${encodeURIComponent(collection)}` : "";
  const products = await request<Product[]>(`/products${query}`);
  return products.map(normalizeProduct);
}

export async function getProductBySlug(slug: string): Promise<Product> {
  const product = await request<Product>(`/products/${encodeURIComponent(slug)}`);
  return normalizeProduct(product);
}

export async function createProduct(payload: ProductPayload): Promise<Product> {
  const product = await request<Product>("/products", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return normalizeProduct(product);
}

export async function updateProduct(id: number, payload: ProductPayload): Promise<Product> {
  const product = await request<Product>(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return normalizeProduct(product);
}

export async function deleteProduct(id: number): Promise<void> {
  await request<{ ok: boolean }>(`/products/${id}`, { method: "DELETE" });
}

export async function getOrders(): Promise<OrderSummary[]> {
  const orders = await request<OrderSummary[]>("/orders");
  return orders.map(normalizeOrder);
}

export async function getOrderDetails(id: number): Promise<OrderDetails> {
  const order = await request<OrderDetails>(`/orders/${id}`);
  return normalizeOrderDetails(order);
}

export async function updateOrderStatus(id: number, payload: { status: string; paymentStatus: string; }): Promise<OrderSummary> {
  const order = await request<OrderSummary>(`/orders/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return normalizeOrder(order);
}

export async function createOrder(payload: OrderPayload): Promise<OrderResponse> {
  const order = await request<OrderResponse>("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return normalizeOrderResponse(order);
}

export async function initializePaystackPayment(payload: OrderPayload): Promise<PaystackInitializeResponse> {
  const response = await request<PaystackInitializeResponse>("/payments/paystack/initialize", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return {
    ...response,
    order: normalizeOrderResponse(response.order),
  };
}

export async function verifyPaystackPayment(reference: string): Promise<PaystackVerifyResponse> {
  const response = await request<PaystackVerifyResponse>(`/payments/paystack/verify/${encodeURIComponent(reference)}`, {
    method: "POST",
  });
  return {
    ...response,
    order: normalizeOrder(response.order),
  };
}

export async function getCustomerOrders(payload: { email: string; firebaseUid?: string | null; }): Promise<OrderSummary[]> {
  const orders = await request<OrderSummary[]>("/customer/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return orders.map(normalizeOrder);
}

export async function getCustomerOrderDetails(payload: { email: string; firebaseUid?: string | null; }, orderNumber: string): Promise<OrderDetails> {
  const order = await request<OrderDetails>(`/customer/orders/${encodeURIComponent(orderNumber)}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return normalizeOrderDetails(order);
}
