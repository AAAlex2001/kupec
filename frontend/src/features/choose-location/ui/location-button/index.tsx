"use client";

import { useState } from "react";
import { locationName, type City } from "@/entities/city";
import { ChevronDownIcon, MapPinIcon } from "@/shared/ui/icons";
import LocationModal from "../location-modal";
import styles from "./style.module.scss";

type LocationButtonProps = {
  city: City | null;
};

/** Где ищем объявления — в шапке. По нажатию открывается выбор места. */
const LocationButton = ({ city }: LocationButtonProps) => {
  const [open, setOpen] = useState(false);
  const name = locationName(city);

  return (
    <>
      <button
        type="button"
        className={styles.button}
        aria-label={`Где искать: ${name}. Изменить`}
        onClick={() => setOpen(true)}
      >
        <MapPinIcon className={styles.pin} />
        <span className={styles.name}>{name}</span>
        <ChevronDownIcon className={styles.chevron} />
      </button>

      <LocationModal open={open} city={city} onClose={() => setOpen(false)} />
    </>
  );
};

export default LocationButton;
