import type { CategoryField } from "@/entities/attribute";
import type { Category, ListingKind } from "@/entities/listing";
import type { Unit } from "@/entities/unit";

export type CategoryNode = Category & {
  children: CategoryNode[];
};

export type CategoryPage = {
  category: Category;
  parents: Category[];
  children: Category[];
  fields: CategoryField[];
  units: Unit[];
};

export type AdminCategory = Category & {
  parent_id: number | null;
  is_active: boolean;
  listings_count: number;
  children: AdminCategory[];
};

export type CategoryCreatePayload = {
  parent_id: number | null;
  kind: ListingKind;
  slug: string;
  name: string;
};

export type CategoryUpdatePayload = {
  parent_id: number | null;
  slug: string;
  name: string;
  is_active: boolean;
};
