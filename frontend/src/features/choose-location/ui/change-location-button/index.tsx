"use client";

import { useState } from "react";
import type { City } from "@/entities/city";
import Button from "@/shared/ui/button";
import { MapPinIcon } from "@/shared/ui/icons";
import LocationModal from "../location-modal";

type ChangeLocationButtonProps = {
  city: City | null;
};

/** Серая кнопка «Сменить регион» — открывает выбор места, где искать объявления. */
const ChangeLocationButton = ({ city }: ChangeLocationButtonProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        <MapPinIcon />
        Сменить регион
      </Button>

      <LocationModal open={open} city={city} onClose={() => setOpen(false)} />
    </>
  );
};

export default ChangeLocationButton;
