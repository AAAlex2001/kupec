import type { Listing } from "@/entities/listing";
import type { User } from "@/entities/user";
import { attributeDrafts } from "../lib/attributes";
import type { ListingFields } from "./types";

/** Пустая форма: город и телефон берутся из профиля. */
export const emptyFields = (user: User): ListingFields => ({
  kind: "product",
  categoryId: "",
  title: "",
  description: "",
  photos: [],
  price: "",
  unit: "",
  city: user.city,
  address: "",
  point: null,
  servicePlaces: [],
  schedule: "",
  contactPhone: user.phone ?? "",
  attributes: {},
});

/** Поля формы из сохранённого объявления — для правки. */
export const listingFields = (listing: Listing): ListingFields => ({
  kind: listing.kind,
  categoryId: listing.category ? String(listing.category.id) : "",
  title: listing.title,
  description: listing.description ?? "",
  photos: listing.photos,
  price: listing.price ? String(Number(listing.price)) : "",
  unit: listing.unit ?? "",
  city: listing.city,
  address: listing.address ?? "",
  point:
    listing.latitude !== null && listing.longitude !== null
      ? [listing.latitude, listing.longitude]
      : null,
  servicePlaces: listing.service_places,
  schedule: listing.schedule ?? "",
  contactPhone: listing.contact_phone ?? "",
  attributes: attributeDrafts(listing.attributes),
});
