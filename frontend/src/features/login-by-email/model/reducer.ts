import type { LoginAction, LoginState } from "./types";

export const LOGIN_START: LoginState = {
  step: "email",
  email: "",
  code: "",
  pending: null,
  error: null,
  resendAfter: 0,
  sentCount: 0,
};

export const loginReducer = (state: LoginState, action: LoginAction): LoginState => {
  switch (action.type) {
    case "email/change":
      return { ...state, email: action.email, error: null };

    case "email/edit":
      return { ...state, step: "email", code: "", error: null };

    case "code/change":
      return { ...state, code: action.code, error: null };

    case "send/start":
      return { ...state, pending: "send", error: null };

    case "send/success":
      return {
        ...state,
        step: "code",
        code: "",
        pending: null,
        resendAfter: action.resendAfter,
        sentCount: state.sentCount + 1,
      };

    case "verify/start":
      return { ...state, pending: "verify", error: null };

    case "request/failure":
      return { ...state, pending: null, error: action.error };

    default:
      return state;
  }
};
