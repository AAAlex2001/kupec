"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { addFavorite, removeFavorite } from "../api/favorites";

type FavoritesValue = {
  isFavorite: (listingId: number) => boolean;
  toggle: (listingId: number) => void;
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

  const toggle = (listingId: number) => {
    if (isFavorite(listingId)) {
      setIds(ids.filter((id) => id !== listingId));
      removeFavorite(listingId);
      return;
    }

    setIds([...ids, listingId]);
    addFavorite(listingId);
  };

  return (
    <FavoritesContext.Provider value={{ isFavorite, toggle }}>{children}</FavoritesContext.Provider>
  );
};

/** Проверить и переключить избранное. */
export const useFavorites = (): FavoritesValue => {
  const value = useContext(FavoritesContext);

  if (!value) {
    throw new Error("useFavorites можно вызывать только внутри FavoritesProvider");
  }

  return value;
};
