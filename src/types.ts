export interface Link {
  id: number;
  user_id: number;
  title: string;
  url: string;
  icon: string;
  active: number;
  order_index: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  stock: number;
}

export interface Order {
  id: number;
  user_id: number | null;
  total_amount: number;
  status: string;
  items: string;
  customer_details: string;
  created_at: string;
}

export interface SiteSettings {
  hero_title: string;
  hero_subtitle: string;
  contact_email: string;
  currency_symbol: string;
}

export interface Profile {
  id: number;
  user_id: number;
  name: string;
  bio: string;
  avatar_url: string;
  background_image_url?: string;
  theme: string;
  custom_css?: string;
  background_video_url?: string;
  music_embed_url?: string;
  enable_contact_form: number;
}

export interface User {
  id: number;
  username: string;
  role?: string;
  created_at?: string;
}
