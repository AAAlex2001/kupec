"use client";

import { useEffect, useState } from "react";
import { errorMessage } from "@/shared/lib/errors";
import { fetchMyListings } from "../api/listings";
import type { ListingStatus, MyListings } from "./types";

const SEARCH_DELAY = 300;

/** Свои объявления на вкладке: перезагружаются при смене вкладки, поиска или после действий. */
export const useMyListings = (status: ListingStatus, query: string) => {
  const [data, setData] = useState<MyListings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      fetchMyListings(status, query)
        .then((found) => {
          if (!active) return;
          setData(found);
          setError(null);
        })
        .catch((failure) => active && setError(errorMessage(failure, "Не удалось загрузить")));
    }, query ? SEARCH_DELAY : 0);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [status, query, version]);

  const reload = () => setVersion((value) => value + 1);

  return { data, error, reload };
};
