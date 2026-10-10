"use client";

import { useState } from "react";
import { useMyListings } from "@/entities/listing";
import type { AttachedListing } from "@/entities/post";
import Button from "@/shared/ui/button";
import Checkbox from "@/shared/ui/checkbox";
import Loader from "@/shared/ui/loader";
import Modal from "@/shared/ui/modal";
import Notice from "@/shared/ui/notice";
import Title from "@/shared/ui/title";
import { toAttached } from "../../lib/attach";
import styles from "./style.module.scss";

type ListingsModalProps = {
  selected: AttachedListing[];
  max: number;
  onSave: (listings: AttachedListing[]) => void;
  onClose: () => void;
};

/** Окно выбора своих активных объявлений для поста. */
const ListingsModal = ({ selected, max, onSave, onClose }: ListingsModalProps) => {
  const { data, error } = useMyListings("published", "");
  const [ids, setIds] = useState(selected.map((listing) => listing.id));

  const toggle = (id: number, checked: boolean) =>
    setIds(checked ? [...ids, id] : ids.filter((item) => item !== id));

  const save = () => {
    const chosen = (data?.items ?? []).filter((listing) => ids.includes(listing.id));
    onSave(chosen.map(toAttached));
  };

  return (
    <Modal open onClose={onClose} ariaLabel="Объявления в посте">
      <div className={styles.modal}>
        <Title>Объявления в посте</Title>
        <p className={styles.hint}>Можно выбрать до {max} своих активных объявлений.</p>

        {error && <Notice tone="error">{error}</Notice>}
        {!data && !error && <Loader />}
        {data?.items.length === 0 && <p className={styles.hint}>Активных объявлений нет.</p>}

        <div className={styles.list}>
          {data?.items.map((listing) => (
            <Checkbox
              key={listing.id}
              checked={ids.includes(listing.id)}
              onChange={(checked) => toggle(listing.id, checked)}
            >
              {listing.title}
            </Checkbox>
          ))}
        </div>

        <div className={styles.buttons}>
          <Button className={styles.button} disabled={ids.length > max} onClick={save}>
            Готово
          </Button>
          <Button className={styles.button} variant="ghost" onClick={onClose}>
            Отмена
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ListingsModal;
