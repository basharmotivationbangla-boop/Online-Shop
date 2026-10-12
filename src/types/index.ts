export interface SiteSettings {
  website_name: string;
  logo_url?: string;
  store_tagline?: string;
  contact_phone?: string;
  contact_email?: string;
  store_address?: string;
  delivery_fee: number;
  banner_title?: string;
  banner_subtitle?: string;
  banner_active?: boolean;
  announcement?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  sku?: string;
  price: number;
  compare_at_price?: number;
  stock_quantity: number;
  category_id?: string;
  category_name?: string;
  images: string[];
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItemSnapshot {
  product_id: string;
  product_name_snapshot: string;
  product_sku_snapshot?: string;
  unit_price_snapshot: number;
  quantity: number;
  line_total: number;
  image_url?: string;
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export interface Order {
  id: string;
  order_number: string;
  customer_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  shipping_address: string;
  district: string;
  area: string;
  customer_notes?: string;
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  payment_method: 'COD';
  status: OrderStatus;
  items: OrderItemSnapshot[];
  created_at: string;
  updated_at?: string;
}

export interface UserProfile {
  id: string;
  full_name: string;
  phone: string;
  email?: string;
  shipping_address?: string;
  district?: string;
  area?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AdminStats {
  totalProducts: number;
  publishedProducts: number;
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
}
