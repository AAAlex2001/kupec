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
  created_at: string;
};

export type UserChanges = {
  name?: string;
  phone?: string | null;
  city_id?: number | null;
  notify_messages_email?: boolean;
  notify_site?: boolean;
  notify_news_email?: boolean;
};
