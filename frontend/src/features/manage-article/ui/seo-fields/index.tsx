"use client";

import { useId } from "react";
import Field from "@/shared/ui/field";
import Input from "@/shared/ui/input";
import Textarea from "@/shared/ui/textarea";
import type { ArticleFields } from "../../model/use-article-form";
import styles from "./style.module.scss";

const TITLE_LIMIT = 60;
const DESCRIPTION_LIMIT = 160;

type SeoFieldsProps = {
  fields: ArticleFields;
  onChange: (patch: Partial<ArticleFields>) => void;
};

/** Сколько символов из рекомендованных: «48 из 60». */
const counter = (value: string, limit: number) => `${value.length} из ${limit}`;

/** Поля для поисковиков: заголовок и описание в выдаче, ключевые запросы. Пустые — берутся заголовок и анонс. */
const SeoFields = ({ fields, onChange }: SeoFieldsProps) => {
  const titleId = useId();
  const descriptionId = useId();
  const keywordsId = useId();

  return (
    <section className={styles.seo}>
      <div className={styles.head}>
        <h2 className={styles.title}>Для поисковиков</h2>
        <p className={styles.hint}>Если оставить пустыми, возьмутся заголовок и анонс статьи.</p>
      </div>

      <Field
        label="Заголовок в поиске"
        htmlFor={titleId}
        hint={`${counter(fields.seoTitle, TITLE_LIMIT)} — длиннее поиск обрежет. Главный запрос — в начало.`}
      >
        <Input
          id={titleId}
          value={fields.seoTitle}
          onChange={(seoTitle) => onChange({ seoTitle })}
          maxLength={120}
        />
      </Field>

      <Field
        label="Описание в поиске"
        htmlFor={descriptionId}
        hint={`${counter(fields.seoDescription, DESCRIPTION_LIMIT)} — что человек узнает из статьи.`}
      >
        <Textarea
          id={descriptionId}
          value={fields.seoDescription}
          onChange={(seoDescription) => onChange({ seoDescription })}
          maxLength={300}
          rows={3}
        />
      </Field>

      <Field
        label="Ключевые запросы"
        htmlFor={keywordsId}
        hint="Через запятую, как люди пишут в поиске: «как проверить телефон при покупке»."
      >
        <Textarea
          id={keywordsId}
          value={fields.seoKeywords}
          onChange={(seoKeywords) => onChange({ seoKeywords })}
          maxLength={500}
          rows={3}
        />
      </Field>
    </section>
  );
};

export default SeoFields;
