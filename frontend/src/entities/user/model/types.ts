import type { City } from "@/entities/city";

export type User = {
  id: number;
  email: string;
  name: string | null;
  phone: string | null;
  avatar_url: string | null;
  city: City | null;
  notify_messages_email: boolean;
  notify_site: boolean;
  notify_news_email: boolean;
  is_admin: boolean;
  created_at: string;
};

export type PublicUser = {
  id: number;
  name: string | null;
  avatar_url: string | null;
  city: City | null;
  rating: number;
  reviews_count: number;
  created_at: string;
  following: boolean;
};

export type AdminUser = {
  id: number;
  email: string;
  name: string | null;
  phone: string | null;
  avatar_url: string | null;
  city: City | null;
  is_admin: boolean;
  rating: number;
  reviews_count: number;
  listings_count: number;
  created_at: string;
};

export type AdminUserPage = {
  items: AdminUser[];
  total: number;
};

export type UserChanges = {
  name?: string;
  phone?: string | null;
  city_id?: number | null;
  notify_messages_email?: boolean;
  notify_site?: boolean;
  notify_news_email?: boolean;
};
