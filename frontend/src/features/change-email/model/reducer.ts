import type { EmailAction, EmailState } from "./types";

export const EMAIL_IDLE: EmailState = {
  step: "idle",
  email: "",
  code: "",
  pending: false,
  error: null,
};

export const emailReducer = (state: EmailState, action: EmailAction): EmailState => {
  switch (action.type) {
    case "edit/open":
      return { ...EMAIL_IDLE, step: "email" };

    case "edit/close":
      return EMAIL_IDLE;

    case "email/change":
      return { ...state, email: action.email, error: null };

    case "code/change":
      return { ...state, code: action.code, error: null };

    case "request/start":
      return { ...state, pending: true, error: null };

    case "request/sent":
      return { ...state, step: "code", code: "", pending: false };

    case "request/failure":
      return { ...state, pending: false, error: action.error };

    default:
      return state;
  }
};
