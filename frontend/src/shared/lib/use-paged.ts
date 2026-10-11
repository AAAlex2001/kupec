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
 * initial — страница, уже полученная с сервера: тогда первый запрос не нужен. start — с какой записи она начинается.
 */
export const usePaged = <T, P extends Page<T>>(
  key: string,
  load: (offset: number) => Promise<P>,
  initial: P | null = null,
  start = 0,
) => {
  const [page, setPage] = useState<P | null>(initial);
  const [items, setItems] = useState<T[] | null>(initial?.items ?? null);
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (initial && version === 0) return;

    let active = true;
    const timer = setTimeout(() => {
      load(start)
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

  const next = start + (items?.length ?? 0);

  const loadMore = async () => {
    setLoadingMore(true);

    try {
      const found = await load(next);
      setPage(found);
      setItems((current) => [...(current ?? []), ...found.items]);
    } catch (failure) {
      setError(errorMessage(failure, "Не удалось загрузить"));
    }

    setLoadingMore(false);
  };

  const reload = () => setVersion((value) => value + 1);
  const hasMore = items !== null && page !== null && next < page.total;

  return { page, items, next, error, loadingMore, hasMore, loadMore, reload };
};
