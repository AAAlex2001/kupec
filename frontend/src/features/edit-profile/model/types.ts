import type { City } from "@/entities/city";

export type ProfileFields = {
  name: string;
  phone: string;
  city: City | null;
  notifyMessagesEmail: boolean;
  notifySite: boolean;
  notifyNewsEmail: boolean;
};

export type ProfileStatus = "idle" | "saving" | "saved" | "error";

export type ProfileState = {
  fields: ProfileFields;
  status: ProfileStatus;
  error: string | null;
};

export type ProfileAction =
  | { type: "fields/change"; changes: Partial<ProfileFields> }
  | { type: "fields/reset"; fields: ProfileFields }
  | { type: "save/start" }
  | { type: "save/success"; fields: ProfileFields }
  | { type: "save/failure"; error: string };
