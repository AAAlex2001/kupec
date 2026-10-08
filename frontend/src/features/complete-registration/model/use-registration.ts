"use client";

import { useState } from "react";
import type { City } from "@/entities/city";
import { updateProfile, useUser } from "@/entities/user";
import { errorMessage } from "@/shared/lib/errors";

/** Завершение регистрации: имя обязательно, город можно указать сразу или позже. */
export const useRegistration = (onDone: () => void) => {
  const { setUser } = useUser();
  const [name, setName] = useState("");
  const [city, setCity] = useState<City | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changeName = (value: string) => {
    setName(value);
    setError(null);
  };

  const save = async () => {
    if (!name.trim()) {
      setError("Укажите имя");

      return;
    }

    setPending(true);

    try {
      setUser(await updateProfile({ name, city_id: city?.id ?? null }));
      onDone();
    } catch (failure) {
      setError(errorMessage(failure, "Не удалось сохранить"));
    } finally {
      setPending(false);
    }
  };

  return { name, city, pending, error, changeName, changeCity: setCity, save };
};
