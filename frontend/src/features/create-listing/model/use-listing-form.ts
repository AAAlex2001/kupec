"use client";

import { useReducer } from "react";
import type { CategoryField } from "@/entities/attribute";
import {
  createListing,
  updateListing,
  type Category,
  type Listing,
  type ListingKind,
  type ListingPayload,
} from "@/entities/listing";
import type { User } from "@/entities/user";
import { errorMessage } from "@/shared/lib/errors";
import { attributesPayload } from "../lib/attributes";
import { emptyFields, listingFields } from "./fields";
import { listingFormReducer } from "./reducer";
import type { AttributeDraft, ListingFields, SaveMode } from "./types";
import { useCategoryForm } from "./use-category-form";
import { validateListing } from "./validate";

/** Тело запроса из полей формы и атрибутов выбранной категории. */
const toPayload = (
  fields: ListingFields,
  attributeFields: CategoryField[],
  publish: boolean,
): ListingPayload => ({
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
  attributes: attributesPayload(fields.attributes, attributeFields),
});

/** Форма объявления: новое или правка listing. Атрибуты и единицы подгружаются по выбранной категории. */
export const useListingForm = (user: User, categories: Category[], listing?: Listing) => {
  const [state, dispatch] = useReducer(listingFormReducer, {
    fields: listing ? listingFields(listing) : emptyFields(user),
    errors: {},
    saving: null,
    error: null,
    saved: null,
  });
  const category = useCategoryForm(categories, state.fields.categoryId);
  const attributeFields = category.fields;

  const change = (changes: Partial<ListingFields>) => dispatch({ type: "fields/change", changes });
  const changeKind = (kind: ListingKind) => dispatch({ type: "kind/change", kind });
  const changeAttribute = (slug: string, value: AttributeDraft) =>
    dispatch({ type: "attribute/change", slug, value });
  const reset = () => dispatch({ type: "form/reset", fields: emptyFields(user) });

  const send = (payload: ListingPayload) =>
    listing ? updateListing(listing.id, payload) : createListing(payload);

  const save = async (mode: SaveMode) => {
    const publish = mode === "publish";
    const errors = validateListing(state.fields, attributeFields, publish);

    if (Object.keys(errors).length > 0) {
      dispatch({ type: "save/invalid", errors });

      return;
    }

    dispatch({ type: "save/start", mode });

    try {
      const payload = toPayload(state.fields, attributeFields, publish);
      dispatch({ type: "save/success", listing: await send(payload) });
    } catch (failure) {
      dispatch({ type: "save/failure", error: errorMessage(failure, "Не удалось сохранить") });
    }
  };

  return {
    state,
    attributeFields,
    categoryUnits: category.units,
    editing: Boolean(listing),
    change,
    changeKind,
    changeAttribute,
    reset,
    publish: () => save("publish"),
    saveDraft: () => save("draft"),
  };
};

export type ListingForm = ReturnType<typeof useListingForm>;
