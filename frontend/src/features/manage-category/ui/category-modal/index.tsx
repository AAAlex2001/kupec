"use client";

import { useId } from "react";
import type { AdminCategory } from "@/entities/category";
import type { ListingKind } from "@/entities/listing";
import { categoryPath } from "@/shared/config/routes";
import Button from "@/shared/ui/button";
import Checkbox from "@/shared/ui/checkbox";
import Chips from "@/shared/ui/chips";
import Dropdown from "@/shared/ui/dropdown";
import Field from "@/shared/ui/field";
import Input from "@/shared/ui/input";
import Modal from "@/shared/ui/modal";
import Notice from "@/shared/ui/notice";
import Title from "@/shared/ui/title";
import { parentOptions } from "../../lib/parent-options";
import { useCategoryForm } from "../../model/use-category-form";
import CategoryImage from "../category-image";
import styles from "./style.module.scss";

const KINDS = [
  { value: "product", label: "Товары" },
  { value: "service", label: "Услуги" },
];

type CategoryModalProps = {
  tree: AdminCategory[];
  category?: AdminCategory;
  parent?: AdminCategory | null;
  onClose: () => void;
  onSaved: () => void;
  onChanged: () => void;
};

/** Окно категории: новая в разделе или на верхнем уровне, либо правка существующей. */
const CategoryModal = ({ tree, category, parent, onClose, onSaved, onChanged }: CategoryModalProps) => {
  const id = useId();
  const form = useCategoryForm(category, parent, onSaved);
  const title = category
    ? "Изменить категорию"
    : parent
      ? `Подкатегория в «${parent.name}»`
      : "Новый раздел";

  return (
    <Modal open onClose={onClose} ariaLabel={title}>
      <form
        className={styles.form}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          form.submit();
        }}
      >
        <Title>{title}</Title>

        <Field label="Название" htmlFor={`${id}-name`}>
          <Input
            id={`${id}-name`}
            value={form.fields.name}
            onChange={form.changeName}
            maxLength={100}
            autoFocus
          />
        </Field>

        <Field label="Адрес" htmlFor={`${id}-slug`} hint={categoryPath(form.fields.slug || "…")}>
          <Input
            id={`${id}-slug`}
            value={form.fields.slug}
            onChange={form.changeSlug}
            maxLength={100}
          />
        </Field>

        {!category && !parent && (
          <Chips
            ariaLabel="Тип раздела"
            value={form.fields.kind}
            options={KINDS}
            onChange={(kind) => form.change({ kind: kind as ListingKind })}
          />
        )}

        {category && (
          <>
            <Field label="Где находится" htmlFor={`${id}-parent`}>
              <Dropdown
                id={`${id}-parent`}
                value={form.fields.parentId}
                options={parentOptions(tree, category)}
                placeholder="Верхний уровень"
                onChange={(parentId) => form.change({ parentId })}
              />
            </Field>

            <Checkbox
              checked={form.fields.isActive}
              onChange={(isActive) => form.change({ isActive })}
            >
              Показывать на сайте
            </Checkbox>

            <CategoryImage category={category} onChanged={onChanged} />
          </>
        )}

        {form.error && <Notice tone="error">{form.error}</Notice>}

        <div className={styles.buttons}>
          <Button className={styles.button} type="submit" loading={form.pending}>
            Сохранить
          </Button>
          <Button className={styles.button} variant="ghost" disabled={form.pending} onClick={onClose}>
            Отменить
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CategoryModal;
