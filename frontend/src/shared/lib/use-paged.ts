"use client";

import { useEffect, useState } from "react";
import { errorMessage } from "@/shared/lib/errors";

type Page<T> = {
  items: T[];
  total: number;
};

const DELAY_MS = 250;

/** Список с «Показать ещё». При смене фильтров (key) грузит первую страницу заново, с короткой паузой для поиска.
 *
 * load получает offset и возвращает страницу. Последний ответ целиком лежит в page — например, для счётчиков вкладок.
 */
export const usePaged = <T, P extends Page<T>>(key: string, load: (offset: number) => Promise<P>) => {
  const [page, setPage] = useState<P | null>(null);
  const [items, setItems] = useState<T[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      load(0)
        .then((found) => {
          if (!active) return;
          setPage(found);
          setItems(found.items);
          setError(null);
        })
        .catch((failure) => active && setError(errorMessage(failure, "Не удалось загрузить")));
    }, DELAY_MS);

    return () => {
      active = false;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, version]);

  const loadMore = async () => {
    setLoadingMore(true);

    try {
      const found = await load(items?.length ?? 0);
      setPage(found);
      setItems((current) => [...(current ?? []), ...found.items]);
    } catch (failure) {
      setError(errorMessage(failure, "Не удалось загрузить"));
    }

    setLoadingMore(false);
  };

  const reload = () => setVersion((value) => value + 1);
  const hasMore = items !== null && page !== null && items.length < page.total;

  return { page, items, error, loadingMore, hasMore, loadMore, reload };
};
