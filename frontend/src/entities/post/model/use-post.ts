"use client";

import { useEffect, useState } from "react";
import { errorMessage } from "@/shared/lib/errors";
import { fetchPost } from "../api/posts";
import type { Post } from "./types";

/** Пост по id для правки: свой черновик тоже. */
export const usePost = (id: number) => {
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    fetchPost(id)
      .then((found) => active && setPost(found))
      .catch((failure) => active && setError(errorMessage(failure, "Публикация не найдена")));

    return () => {
      active = false;
    };
  }, [id]);

  return { post, error };
};
