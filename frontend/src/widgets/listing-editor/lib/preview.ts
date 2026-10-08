import type { ListingOptions } from "@/entities/listing";
import { displayName, type User } from "@/entities/user";
import type { ListingFields } from "@/features/create-listing";

/** Данные карточки предпросмотра из незаполненной до конца формы. */
export const previewCard = (fields: ListingFields, options: ListingOptions, user: User) => {
  const unit = options.units.find((item) => item.code === fields.unit);
  const places = options.service_places
    .filter((place) => fields.servicePlaces.includes(place.code))
    .map((place) => place.label);

  return {
    photoUrl: fields.photos[0]?.url ?? null,
    price: fields.price || null,
    unitLabel: unit?.label ?? null,
    title: fields.title.trim(),
    author: displayName(user),
    place: fields.city?.name ?? "Город не указан",
    conditions: fields.kind === "service" ? places.join(" · ") : "Самовывоз",
  };
};
