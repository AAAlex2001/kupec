import { postPath, userPath } from "@/shared/config/routes";
import { absoluteUrl, shorten, textFromHtml } from "@/shared/lib/seo";
import type { Post } from "../model/types";
import { postCover } from "./cover";

const TITLE_LENGTH = 60;

/** Текст поста без тегов. У репоста без комментария — текст оригинала. */
export const postText = (post: Post) => textFromHtml(post.html || post.repost_of?.html || "");

/** Заголовок страницы поста: начало текста или «Публикация автора». */
export const postTitle = (post: Post) => {
  const author = post.author.name ?? "пользователя";
  const text = postText(post);
  if (!text) return `Публикация ${author}`;

  return shorten(text, TITLE_LENGTH);
};

/** Описание страницы поста для поисковиков и превью ссылок. */
export const postDescription = (post: Post) => {
  const author = post.author.name ?? "Пользователь";
  const text = postText(post);
  if (!text) return `${author} поделился публикацией на «Купце».`;

  return shorten(`${author}: ${text}`);
};

/** Разметка schema.org: публикация в соцсети с автором, датой и картинкой. */
export const postJsonLd = (post: Post) => {
  const cover = postCover(post);

  return {
    "@context": "https://schema.org",
    "@type": "SocialMediaPosting",
    headline: postTitle(post),
    text: postText(post),
    url: absoluteUrl(postPath(post.id)),
    datePublished: post.published_at ?? post.created_at,
    image: cover ? [absoluteUrl(cover)] : undefined,
    author: {
      "@type": "Person",
      name: post.author.name ?? "Пользователь",
      url: absoluteUrl(userPath(post.author.id)),
    },
    interactionStatistic: [
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/LikeAction",
        userInteractionCount: post.likes_count,
      },
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/CommentAction",
        userInteractionCount: post.comments_count,
      },
    ],
  };
};
