"use client";

import { useState } from "react";
import type { Listing } from "@/entities/listing";
import { editListingPath, listingPath } from "@/shared/config/routes";
import Button from "@/shared/ui/button";
import ConfirmModal from "@/shared/ui/confirm-modal";
import { useListingActions } from "../../model/use-listing-actions";
import styles from "./style.module.scss";

type ListingActionsProps = {
  listing: Listing;
  onDone: () => void;
};

/** Кнопки строки «Мои объявления»: перейти, снять или вернуть, редактировать, удалить. */
const ListingActions = ({ listing, onDone }: ListingActionsProps) => {
  const { pending, error, archive, restore, remove } = useListingActions(listing, onDone);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" href={listingPath(listing.id)}>
        Перейти
      </Button>

      {listing.status === "published" && (
        <Button variant="danger" loading={pending === "archive"} onClick={archive}>
          В архив
        </Button>
      )}

      {listing.status === "archived" && (
        <Button loading={pending === "restore"} onClick={restore}>
          Опубликовать снова
        </Button>
      )}

      <Button variant="ghost" href={editListingPath(listing.id)}>
        Редактировать
      </Button>

      {listing.status !== "published" && (
        <Button variant="danger" disabled={pending !== null} onClick={() => setConfirmOpen(true)}>
          Удалить
        </Button>
      )}

      {error && <p className={styles.error}>{error}</p>}

      <ConfirmModal
        open={confirmOpen}
        title="Удалить объявление?"
        text={`«${listing.title}» удалится вместе с фото. Вернуть его будет нельзя.`}
        confirmLabel="Удалить"
        pending={pending === "delete"}
        onConfirm={remove}
        onClose={() => setConfirmOpen(false)}
      />
    </>
  );
};

export default ListingActions;
