"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createPost, updatePost, type AttachedListing, type Post } from "@/entities/post";
import { MY_POSTS_PATH } from "@/shared/config/routes";
import { errorMessage } from "@/shared/lib/errors";
import type { UploadedPhoto } from "@/shared/lib/use-photo-upload";

/** Форма поста: новый или правка своего. Опубликовать или сохранить черновиком — и к своим публикациям. */
export const usePostForm = (post?: Post) => {
  const router = useRouter();
  const [html, setHtml] = useState(post?.html ?? "");
  const [media, setMedia] = useState<UploadedPhoto[]>(post?.media ?? []);
  const [listings, setListings] = useState<AttachedListing[]>(post?.listings ?? []);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<"draft" | "publish" | null>(null);

  const save = async (draft: boolean) => {
    const payload = {
      html,
      media_ids: media.map((item) => item.id),
      listing_ids: listings.map((listing) => listing.id),
      draft,
    };

    setPending(draft ? "draft" : "publish");
    setError(null);

    try {
      await (post ? updatePost(post.id, payload) : createPost(payload));
      router.push(MY_POSTS_PATH);
    } catch (failure) {
      setError(errorMessage(failure, "Не удалось сохранить публикацию"));
      setPending(null);
    }
  };

  const empty = html === "" && media.length === 0 && listings.length === 0;

  return { html, setHtml, media, setMedia, listings, setListings, error, pending, empty, save };
};
