export type EmailStep = "idle" | "email" | "code";

export type EmailState = {
  step: EmailStep;
  email: string;
  code: string;
  pending: boolean;
  error: string | null;
};

export type EmailAction =
  | { type: "edit/open" }
  | { type: "edit/close" }
  | { type: "email/change"; email: string }
  | { type: "code/change"; code: string }
  | { type: "request/start" }
  | { type: "request/sent" }
  | { type: "request/failure"; error: string };
