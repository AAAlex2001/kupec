"use client";

import { useRouter } from "next/navigation";
import { useId } from "react";
import { CitySelect, COUNTRY, saveLocation, type City } from "@/entities/city";
import Button from "@/shared/ui/button";
import Field from "@/shared/ui/field";
import Modal from "@/shared/ui/modal";
import Title from "@/shared/ui/title";
import styles from "./style.module.scss";

type LocationModalProps = {
  open: boolean;
  city: City | null;
  onClose: () => void;
};

/** Окно «Где искать»: населённый пункт с поиском или вся Россия. Выбор сразу обновляет страницу. */
const LocationModal = ({ open, city, onClose }: LocationModalProps) => {
  const id = useId();
  const router = useRouter();

  const choose = (chosen: City | null) => {
    saveLocation(chosen?.id ?? null);
    onClose();
    router.refresh();
  };

  return (
    <Modal open={open} onClose={onClose} ariaLabel="Где искать объявления">
      <div className={styles.content}>
        <Title>Где искать</Title>

        <Field label="Населённый пункт" htmlFor={id}>
          <CitySelect id={id} value={city} onChange={choose} />
        </Field>

        <Button variant="secondary" disabled={city === null} onClick={() => choose(null)}>
          Вся {COUNTRY}
        </Button>
      </div>
    </Modal>
  );
};

export default LocationModal;
