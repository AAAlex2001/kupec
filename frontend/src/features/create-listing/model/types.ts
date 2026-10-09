import type { City } from "@/entities/city";
import type { Listing, ListingKind, ListingPhoto } from "@/entities/listing";
import type { Coordinates } from "@/shared/ui/yandex-map";

export type AttributeDraft = string | string[] | boolean;

export type AttributeDrafts = Record<string, AttributeDraft>;

export type ListingFields = {
  kind: ListingKind;
  categoryId: string;
  title: string;
  description: string;
  photos: ListingPhoto[];
  price: string;
  unit: string;
  city: City | null;
  address: string;
  point: Coordinates | null;
  servicePlaces: string[];
  schedule: string;
  contactPhone: string;
  attributes: AttributeDrafts;
};

export type ErrorKey = keyof ListingFields | `attributes.${string}`;

export type ListingErrors = Partial<Record<ErrorKey, string>>;

export type SaveMode = "publish" | "draft";

export type ListingFormState = {
  fields: ListingFields;
  errors: ListingErrors;
  saving: SaveMode | null;
  error: string | null;
  saved: Listing | null;
};

export type ListingFormAction =
  | { type: "fields/change"; changes: Partial<ListingFields> }
  | { type: "kind/change"; kind: ListingKind }
  | { type: "attribute/change"; slug: string; value: AttributeDraft }
  | { type: "save/invalid"; errors: ListingErrors }
  | { type: "save/start"; mode: SaveMode }
  | { type: "save/success"; listing: Listing }
  | { type: "save/failure"; error: string }
  | { type: "form/reset"; fields: ListingFields };
