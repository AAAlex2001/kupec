"use client";

import { useReducer } from "react";
import {
  createListing,
  updateListing,
  type Listing,
  type ListingKind,
  type ListingPayload,
} from "@/entities/listing";
import type { User } from "@/entities/user";
import { errorMessage } from "@/shared/lib/errors";
import { emptyFields, listingFields } from "./fields";
import { listingFormReducer } from "./reducer";
import type { ListingFields, SaveMode } from "./types";
import { validateListing } from "./validate";

/** Тело запроса из полей формы. */
const toPayload = (fields: ListingFields, publish: boolean): ListingPayload => ({
  kind: fields.kind,
  publish,
  category_id: fields.categoryId ? Number(fields.categoryId) : null,
  title: fields.title,
  description: fields.description.trim() || null,
  price: fields.price || null,
  unit: fields.unit || null,
  city_id: fields.city?.id ?? null,
  address: fields.address.trim() || null,
  latitude: fields.point?.[0] ?? null,
  longitude: fields.point?.[1] ?? null,
  service_places: fields.kind === "service" ? fields.servicePlaces : [],
  schedule: fields.kind === "service" ? fields.schedule.trim() || null : null,
  contact_phone: fields.contactPhone.trim() || null,
  photo_ids: fields.photos.map((photo) => photo.id),
});

/** Форма объявления: новое или правка listing. Проверка и сохранение черновиком или с публикацией. */
export const useListingForm = (user: User, listing?: Listing) => {
  const [state, dispatch] = useReducer(listingFormReducer, {
    fields: listing ? listingFields(listing) : emptyFields(user),
    errors: {},
    saving: null,
    error: null,
    saved: null,
  });

  const change = (changes: Partial<ListingFields>) => dispatch({ type: "fields/change", changes });
  const changeKind = (kind: ListingKind) => dispatch({ type: "kind/change", kind });
  const reset = () => dispatch({ type: "form/reset", fields: emptyFields(user) });

  const send = (payload: ListingPayload) =>
    listing ? updateListing(listing.id, payload) : createListing(payload);

  const save = async (mode: SaveMode) => {
    const publish = mode === "publish";
    const errors = validateListing(state.fields, publish);

    if (Object.keys(errors).length > 0) {
      dispatch({ type: "save/invalid", errors });

      return;
    }

    dispatch({ type: "save/start", mode });

    try {
      dispatch({ type: "save/success", listing: await send(toPayload(state.fields, publish)) });
    } catch (failure) {
      dispatch({ type: "save/failure", error: errorMessage(failure, "Не удалось сохранить") });
    }
  };

  return {
    state,
    editing: Boolean(listing),
    change,
    changeKind,
    reset,
    publish: () => save("publish"),
    saveDraft: () => save("draft"),
  };
};

export type ListingForm = ReturnType<typeof useListingForm>;
