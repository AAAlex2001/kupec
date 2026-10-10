"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  createArticle,
  deleteArticle,
  removeArticleCover,
  updateArticle,
  uploadArticleCover,
  type AdminArticle,
  type ArticlePayload,
  type ArticleSection,
} from "@/entities/article";
import { ADMIN_ARTICLES_PATH, adminArticlePath } from "@/shared/config/routes";
import { errorMessage } from "@/shared/lib/errors";
import { slugify } from "@/shared/lib/slug";

export type ArticleFields = {
  section: ArticleSection;
  title: string;
  slug: string;
  description: string;
  html: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
};

export type ArticlePending = "publish" | "draft" | "cover" | "delete" | null;

/** Поля новой статьи или правки существующей. */
const initialFields = (article: AdminArticle | undefined): ArticleFields => ({
  section: article?.section ?? "news",
  title: article?.title ?? "",
  slug: article?.slug ?? "",
  description: article?.description ?? "",
  html: article?.html ?? "",
  seoTitle: article?.seo_title ?? "",
  seoDescription: article?.seo_description ?? "",
  seoKeywords: article?.seo_keywords ?? "",
});

/** Поля формы в тело запроса. */
const toPayload = (fields: ArticleFields, publish: boolean): ArticlePayload => ({
  section: fields.section,
  slug: fields.slug,
  title: fields.title,
  description: fields.description,
  html: fields.html,
  seo_title: fields.seoTitle,
  seo_description: fields.seoDescription,
  seo_keywords: fields.seoKeywords,
  publish,
});

/** Форма статьи: у новой адрес собирается из заголовка, пока его не поправили руками. Новая после сохранения открывается по своему адресу. */
export const useArticleForm = (initial: AdminArticle | undefined) => {
  const router = useRouter();
  const [article, setArticle] = useState(initial);
  const [fields, setFields] = useState(() => initialFields(initial));
  const [slugEdited, setSlugEdited] = useState(Boolean(initial));
  const [pending, setPending] = useState<ArticlePending>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const change = (patch: Partial<ArticleFields>) => {
    setFields((current) => ({ ...current, ...patch }));
    setSaved(false);
  };

  const changeTitle = (title: string) =>
    change(slugEdited ? { title } : { title, slug: slugify(title) });

  const changeSlug = (slug: string) => {
    setSlugEdited(true);
    change({ slug });
  };

  const run = async (kind: ArticlePending, action: () => Promise<void>, fallback: string) => {
    setPending(kind);
    setError(null);

    try {
      await action();
    } catch (failure) {
      setError(errorMessage(failure, fallback));
    }

    setPending(null);
  };

  const save = (publish: boolean) =>
    run(
      publish ? "publish" : "draft",
      async () => {
        const payload = toPayload(fields, publish);

        if (!article) {
          const created = await createArticle(payload);
          router.replace(adminArticlePath(created.id));
          return;
        }

        setArticle(await updateArticle(article.id, payload));
        setSaved(true);
      },
      "Не удалось сохранить статью",
    );

  const uploadCover = (file: File) =>
    run(
      "cover",
      async () => {
        if (article) setArticle(await uploadArticleCover(article.id, file));
      },
      "Не удалось загрузить обложку",
    );

  const removeCover = () =>
    run(
      "cover",
      async () => {
        if (article) setArticle(await removeArticleCover(article.id));
      },
      "Не удалось убрать обложку",
    );

  const remove = () =>
    run(
      "delete",
      async () => {
        if (!article) return;
        await deleteArticle(article.id);
        router.push(ADMIN_ARTICLES_PATH);
      },
      "Не удалось удалить статью",
    );

  return {
    article,
    fields,
    pending,
    error,
    saved,
    change,
    changeTitle,
    changeSlug,
    save,
    uploadCover,
    removeCover,
    remove,
  };
};
