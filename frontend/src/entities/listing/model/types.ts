import type { AttributeValues } from "@/entities/attribute";
import type { City } from "@/entities/city";
import type { Unit } from "@/entities/unit";

export type ListingKind = "product" | "service";

export type ListingStatus = "draft" | "published" | "archived";

export type Category = {
  id: number;
  kind: ListingKind;
  slug: string;
  name: string;
  image_url: string | null;
  parent_name?: string | null;
};

export type Option = {
  code: string;
  label: string;
};

export type ListingOptions = {
  categories: Category[];
  units: Unit[];
  service_places: Option[];
};

export type ListingPhoto = {
  id: number;
  url: string;
};

export type ListingAuthor = {
  id: number;
  name: string | null;
  avatar_url: string | null;
  rating: number;
  reviews_count: number;
  created_at: string;
};

export type Listing = {
  id: number;
  kind: ListingKind;
  status: ListingStatus;
  category: Category | null;
  title: string;
  description: string | null;
  price: string | null;
  unit: string | null;
  unit_label: string | null;
  city: City | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  service_places: string[];
  service_place_labels: string[];
  schedule: string | null;
  contact_phone: string | null;
  attributes: AttributeValues;
  photos: ListingPhoto[];
  owner: ListingAuthor;
  views_count: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

export type ValueRange = {
  min: number;
  max: number;
};

export type ListingPage = {
  items: Listing[];
  total: number;
  ranges?: Record<string, ValueRange>;
};

export type ListingQuery = {
  kind?: ListingKind;
  category?: string;
  city?: number;
  owner?: number;
  exclude?: number;
  filters?: string;
  bounds?: boolean;
  limit: number;
  offset?: number;
};

export type ListingCounts = Record<ListingStatus, number>;

export type MyListings = {
  items: Listing[];
  counts: ListingCounts;
};

export type AdminListingPage = MyListings & {
  total: number;
};

export type ListingPayload = {
  kind: ListingKind;
  publish: boolean;
  category_id: number | null;
  title: string;
  description: string | null;
  price: string | null;
  unit: string | null;
  city_id: number | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  service_places: string[];
  schedule: string | null;
  contact_phone: string | null;
  photo_ids: number[];
  attributes: AttributeValues;
};
