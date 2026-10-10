"use client";

import { useId } from "react";
import { ARTICLE_SECTION_TABS, ARTICLE_SECTIONS, type AdminArticle, type ArticleSection } from "@/entities/article";
import { articlePath } from "@/shared/config/routes";
import { formatDate } from "@/shared/lib/format";
import Field from "@/shared/ui/field";
import Input from "@/shared/ui/input";
import Notice from "@/shared/ui/notice";
import Tabs from "@/shared/ui/tabs";
import TextEditor from "@/shared/ui/text-editor";
import Textarea from "@/shared/ui/textarea";
import { useArticleForm } from "../../model/use-article-form";
import ArticleActions from "../article-actions";
import ArticleCover from "../article-cover";
import SeoFields from "../seo-fields";
import styles from "./style.module.scss";

const TEXT_LIMIT = 40000;

type ArticleFormProps = {
  article?: AdminArticle;
};

/** Состояние статьи для подписи над формой: черновик или дата публикации. */
const statusText = (article: AdminArticle | undefined) => {
  if (!article) return "Новая статья";
  if (article.status === "draft" || !article.published_at) return "Черновик";

  return `Опубликована ${formatDate(article.published_at)}`;
};

/** Форма статьи для админки: раздел, заголовок, адрес, анонс, текст, обложка и поля для поисковиков. */
const ArticleForm = ({ article: initial }: ArticleFormProps) => {
  const form = useArticleForm(initial);
  const titleId = useId();
  const slugId = useId();
  const descriptionId = useId();
  const sectionPath = ARTICLE_SECTIONS[form.fields.section].path;

  return (
    <div className={styles.form}>
      <p className={styles.status}>{statusText(form.article)}</p>

      <Tabs
        ariaLabel="Раздел статьи"
        value={form.fields.section}
        tabs={ARTICLE_SECTION_TABS}
        onChange={(section) => form.change({ section: section as ArticleSection })}
      />

      <Field label="Заголовок" htmlFor={titleId} hint="Это H1 страницы: главный вопрос или запрос — в начале.">
        <Input
          id={titleId}
          value={form.fields.title}
          onChange={form.changeTitle}
          maxLength={200}
        />
      </Field>

      <Field
        label="Адрес"
        htmlFor={slugId}
        hint={`Латиницей через дефис: ${articlePath(form.fields.section, form.fields.slug || "adres-stati")}`}
      >
        <Input id={slugId} value={form.fields.slug} onChange={form.changeSlug} maxLength={150} />
      </Field>

      <Field
        label="Анонс"
        htmlFor={descriptionId}
        hint={`Под заголовком и в карточке в разделе ${sectionPath}. 1–2 предложения.`}
      >
        <Textarea
          id={descriptionId}
          value={form.fields.description}
          onChange={(description) => form.change({ description })}
          maxLength={500}
          rows={3}
        />
      </Field>

      <section className={styles.text}>
        <p className={styles.label}>Текст статьи</p>
        <TextEditor
          key={form.article?.id ?? "new"}
          ariaLabel="Текст статьи"
          placeholder="Начните с короткого ответа на главный вопрос, дальше — разделы с подзаголовками."
          value={form.fields.html}
          limit={TEXT_LIMIT}
          onChange={(html) => form.change({ html })}
        />
      </section>

      <ArticleCover
        article={form.article}
        pending={form.pending === "cover"}
        onUpload={form.uploadCover}
        onRemove={form.removeCover}
      />

      <SeoFields fields={form.fields} onChange={form.change} />

      {form.error && <Notice tone="error">{form.error}</Notice>}
      {form.saved && <Notice tone="success">Сохранено.</Notice>}

      <ArticleActions
        article={form.article}
        pending={form.pending}
        onSave={form.save}
        onDelete={form.remove}
      />
    </div>
  );
};

export default ArticleForm;
