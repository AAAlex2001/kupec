import type { ProfileAction, ProfileState } from "./types";

export const profileReducer = (state: ProfileState, action: ProfileAction): ProfileState => {
  switch (action.type) {
    case "fields/change":
      return { fields: { ...state.fields, ...action.changes }, status: "idle", error: null };

    case "fields/reset":
      return { fields: action.fields, status: "idle", error: null };

    case "save/start":
      return { ...state, status: "saving", error: null };

    case "save/success":
      return { fields: action.fields, status: "saved", error: null };

    case "save/failure":
      return { ...state, status: "error", error: action.error };

    default:
      return state;
  }
};
