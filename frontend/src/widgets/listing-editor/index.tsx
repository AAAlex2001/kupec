"use client";

import { useState } from "react";
import type { Listing, ListingOptions } from "@/entities/listing";
import { useUser, type User } from "@/entities/user";
import { ListingForm, useListingForm } from "@/features/create-listing";
import { HOME_PATH, MY_LISTINGS_PATH } from "@/shared/config/routes";
import Breadcrumbs from "@/shared/ui/breadcrumbs";
import Button from "@/shared/ui/button";
import EmptyState from "@/shared/ui/empty-state";
import { PlusIcon } from "@/shared/ui/icons";
import Modal from "@/shared/ui/modal";
import Title from "@/shared/ui/title";
import { previewCard } from "./lib/preview";
import Preview from "./ui/preview";
import Saved from "./ui/saved";
import styles from "./style.module.scss";

type ListingEditorProps = {
  options: ListingOptions;
  listing?: Listing;
};

type EditorProps = ListingEditorProps & {
  user: User;
};

const NEW_CRUMBS = [{ label: "Главная", href: HOME_PATH }, { label: "Разместить объявление" }];

const EDIT_CRUMBS = [
  { label: "Мои объявления", href: MY_LISTINGS_PATH },
  { label: "Редактировать объявление" },
];

/** Страница размещения или правки. Гостю сначала нужно войти. */
const ListingEditor = ({ options, listing }: ListingEditorProps) => {
  const { user, openAuth } = useUser();

  if (!user) {
    return (
      <div className={styles.page}>
        <EmptyState
          icon={<PlusIcon />}
          title="Войдите, чтобы разместить объявление"
          text="Вход по почте занимает минуту, пароль не нужен."
          action={<Button onClick={openAuth}>Войти</Button>}
        />
      </div>
    );
  }

  return <Editor options={options} listing={listing} user={user} />;
};

/** Форма с предпросмотром карточки справа, а после сохранения — итог. */
const Editor = ({ options, listing, user }: EditorProps) => {
  const form = useListingForm(user, listing);
  const [previewOpen, setPreviewOpen] = useState(false);
  const card = previewCard(form.state.fields, options, user);

  if (form.state.saved) {
    return (
      <div className={styles.page}>
        <Saved listing={form.state.saved} editing={form.editing} onCreateAnother={form.reset} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Breadcrumbs items={form.editing ? EDIT_CRUMBS : NEW_CRUMBS} />

      <Title as="h1">{form.editing ? "Редактировать объявление" : "Разместить объявление"}</Title>

      <div className={styles.columns}>
        <ListingForm form={form} options={options} onPreview={() => setPreviewOpen(true)} />

        <aside className={styles.aside}>
          <Preview card={card} />
        </aside>
      </div>

      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)} ariaLabel="Предпросмотр">
        <Preview card={card} />
      </Modal>
    </div>
  );
};

export default ListingEditor;
