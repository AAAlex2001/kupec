"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { reportError } from "@/shared/lib/report-error";
import { addFavorite, removeFavorite } from "../api/favorites";

type FavoritesValue = {
  isFavorite: (listingId: number) => boolean;
  toggle: (listingId: number) => Promise<void>;
};

const FavoritesContext = createContext<FavoritesValue | null>(null);

type FavoritesProviderProps = {
  initialIds: number[];
  children: ReactNode;
};

/** Хранит id избранных объявлений. Список приходит с сервера при загрузке страницы. */
export const FavoritesProvider = ({ initialIds, children }: FavoritesProviderProps) => {
  const [ids, setIds] = useState(initialIds);

  const isFavorite = (listingId: number) => ids.includes(listingId);

  const add = (listingId: number) => setIds((current) => [...current, listingId]);
  const remove = (listingId: number) => setIds((current) => current.filter((id) => id !== listingId));

  const toggle = async (listingId: number) => {
    const wasFavorite = isFavorite(listingId);
    if (wasFavorite) remove(listingId);
    else add(listingId);

    try {
      await (wasFavorite ? removeFavorite(listingId) : addFavorite(listingId));
    } catch (failure) {
      if (wasFavorite) add(listingId);
      else remove(listingId);
      reportError(failure);
    }
  };

  return (
    <FavoritesContext.Provider value={{ isFavorite, toggle }}>{children}</FavoritesContext.Provider>
  );
};

/** Проверить и переключить избранное. При ошибке сердечко возвращается обратно. */
export const useFavorites = (): FavoritesValue => {
  const value = useContext(FavoritesContext);

  if (!value) {
    throw new Error("useFavorites можно вызывать только внутри FavoritesProvider");
  }

  return value;
};
