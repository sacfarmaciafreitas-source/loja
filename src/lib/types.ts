export type Category = {
  id: string;
  slug: string;
  name: string;
  blurb?: string | null;
  position?: number;
  image_url?: string | null;
  parent_id?: string | null;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  brand: string | null;
  gtin: string | null;
  sku: string | null;
  price: number;
  compare_at_price: number | null;
  stock: number;
  image_url: string | null;
  images?: string[];
  category_slug: string;
  active: boolean;
  featured: boolean;
};

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image_url: string | null;
  qty: number;
};

export type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "canceled";

export type Order = {
  id: string;
  code: string;
  status: OrderStatus;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_document: string;
  address: Record<string, string>;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  payment_provider: string;
  payment_id: string | null;
  pix_code: string | null;
  tracking_code: string | null;
  created_at: string;
  paid_at: string | null;
  items?: OrderItem[];
};

export type OrderItem = {
  id?: string;
  order_id?: string;
  product_id: string;
  name: string;
  unit_price: number;
  qty: number;
};
