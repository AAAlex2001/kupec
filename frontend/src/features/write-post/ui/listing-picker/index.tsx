"use client";

import { useState } from "react";
import { PostListing, type AttachedListing } from "@/entities/post";
import Button from "@/shared/ui/button";
import CloseButton from "@/shared/ui/close-button";
import { BasketIcon } from "@/shared/ui/icons";
import ListingsModal from "../listings-modal";
import styles from "./style.module.scss";

type ListingPickerProps = {
  listings: AttachedListing[];
  max: number;
  onChange: (listings: AttachedListing[]) => void;
};

/** Объявления в посте: карточки с крестиком и кнопка «Прикрепить объявление». */
const ListingPicker = ({ listings, max, onChange }: ListingPickerProps) => {
  const [open, setOpen] = useState(false);

  return (
    <section className={styles.section}>
      <p className={styles.title}>Объявления</p>

      {listings.map((listing) => (
        <PostListing
          key={listing.id}
          listing={listing}
          action={
            <CloseButton
              ariaLabel="Убрать объявление"
              onClick={() => onChange(listings.filter((item) => item.id !== listing.id))}
            />
          }
        />
      ))}

      <Button variant="secondary" onClick={() => setOpen(true)}>
        <BasketIcon />
        Прикрепить объявление
      </Button>

      {open && (
        <ListingsModal
          selected={listings}
          max={max}
          onSave={(chosen) => {
            onChange(chosen);
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </section>
  );
};

export default ListingPicker;
