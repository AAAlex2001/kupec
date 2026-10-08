"use client";

import { useReducer } from "react";
import { updateProfile, useUser, type User } from "@/entities/user";
import { errorMessage } from "@/shared/lib/errors";
import { profileReducer } from "./reducer";
import type { ProfileFields } from "./types";

/** Поля формы из профиля. */
const toFields = (user: User): ProfileFields => ({
  name: user.name ?? "",
  phone: user.phone ?? "",
  city: user.city,
  notifyMessagesEmail: user.notify_messages_email,
  notifySite: user.notify_site,
  notifyNewsEmail: user.notify_news_email,
});

/** Форма профиля: имя, телефон, город и уведомления сохраняются одним запросом. */
export const useProfileForm = (user: User) => {
  const { setUser } = useUser();
  const [state, dispatch] = useReducer(profileReducer, {
    fields: toFields(user),
    status: "idle",
    error: null,
  });

  const change = (changes: Partial<ProfileFields>) => dispatch({ type: "fields/change", changes });
  const reset = () => dispatch({ type: "fields/reset", fields: toFields(user) });

  const save = async () => {
    const { fields } = state;

    if (!fields.name.trim()) {
      dispatch({ type: "save/failure", error: "Укажите имя" });

      return;
    }

    dispatch({ type: "save/start" });

    try {
      const updated = await updateProfile({
        name: fields.name,
        phone: fields.phone.trim() || null,
        city_id: fields.city?.id ?? null,
        notify_messages_email: fields.notifyMessagesEmail,
        notify_site: fields.notifySite,
        notify_news_email: fields.notifyNewsEmail,
      });

      setUser(updated);
      dispatch({ type: "save/success", fields: toFields(updated) });
    } catch (failure) {
      dispatch({ type: "save/failure", error: errorMessage(failure, "Не удалось сохранить") });
    }
  };

  return { state, change, reset, save };
};
