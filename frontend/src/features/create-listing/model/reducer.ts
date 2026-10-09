import type { ListingErrors, ListingFormAction, ListingFormState } from "./types";

/** Убрать ошибки полей, которые пользователь только что поправил. */
const withoutErrors = (errors: ListingErrors, fields: string[]): ListingErrors =>
  Object.fromEntries(Object.entries(errors).filter(([field]) => !fields.includes(field)));

export const listingFormReducer = (
  state: ListingFormState,
  action: ListingFormAction,
): ListingFormState => {
  switch (action.type) {
    case "fields/change":
      return {
        ...state,
        fields: { ...state.fields, ...action.changes },
        errors: withoutErrors(state.errors, Object.keys(action.changes)),
        error: null,
      };

    case "kind/change":
      return {
        ...state,
        fields: {
          ...state.fields,
          kind: action.kind,
          categoryId: "",
          unit: "",
          servicePlaces: [],
          attributes: {},
        },
        errors: {},
        error: null,
      };

    case "attribute/change":
      return {
        ...state,
        fields: {
          ...state.fields,
          attributes: { ...state.fields.attributes, [action.slug]: action.value },
        },
        errors: withoutErrors(state.errors, [`attributes.${action.slug}`]),
        error: null,
      };

    case "save/invalid":
      return { ...state, errors: action.errors, error: null };

    case "save/start":
      return { ...state, saving: action.mode, errors: {}, error: null };

    case "save/success":
      return { ...state, saving: null, saved: action.listing };

    case "save/failure":
      return { ...state, saving: null, error: action.error };

    case "form/reset":
      return { fields: action.fields, errors: {}, saving: null, error: null, saved: null };

    default:
      return state;
  }
};
