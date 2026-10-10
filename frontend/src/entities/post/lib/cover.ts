import type { Post } from "../model/types";

/** Обложка поста для превью: первое фото поста, а у репоста без фото — первое фото оригинала. */
export const postCover = (post: Post) => {
  const media = post.media.length > 0 ? post.media : (post.repost_of?.media ?? []);

  return media.find((item) => item.kind === "photo")?.url ?? null;
};
