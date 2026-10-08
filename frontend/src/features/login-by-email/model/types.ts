export type LoginStep = "email" | "code";

export type LoginState = {
  step: LoginStep;
  email: string;
  code: string;
  pending: "send" | "verify" | null;
  error: string | null;
  resendAfter: number;
  sentCount: number;
};

export type LoginAction =
  | { type: "email/change"; email: string }
  | { type: "email/edit" }
  | { type: "code/change"; code: string }
  | { type: "send/start" }
  | { type: "send/success"; resendAfter: number }
  | { type: "verify/start" }
  | { type: "request/failure"; error: string };
