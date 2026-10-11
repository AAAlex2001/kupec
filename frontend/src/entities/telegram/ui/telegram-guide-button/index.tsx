"use client";

import { useState } from "react";
import Button from "@/shared/ui/button";
import type { TelegramLink } from "../../model/types";
import TelegramGuide from "../telegram-guide";

type TelegramGuideButtonProps = {
  link: TelegramLink;
  label: string;
};

/** Кнопка, которая открывает инструкцию подключения канала. */
const TelegramGuideButton = ({ link, label }: TelegramGuideButtonProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        {label}
      </Button>

      {open && <TelegramGuide link={link} onClose={() => setOpen(false)} />}
    </>
  );
};

export default TelegramGuideButton;
