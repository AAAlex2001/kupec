"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { repostPost } from "@/entities/post";
import { REPOSTS_PATH } from "@/shared/config/routes";
import { errorMessage } from "@/shared/lib/errors";

/** Репост с комментарием: текст из редактора и публикация — потом к своим репостам. */
export const useRepostForm = (postId: number) => {
  const router = useRouter();
  const [html, setHtml] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const publish = async () => {
    setPending(true);
    setError(null);

    try {
      await repostPost(postId, html);
      router.push(REPOSTS_PATH);
    } catch (failure) {
      setError(errorMessage(failure, "Не удалось опубликовать репост"));
      setPending(false);
    }
  };

  return { html, setHtml, pending, error, publish };
};
