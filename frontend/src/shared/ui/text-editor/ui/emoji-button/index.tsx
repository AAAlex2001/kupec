"use client";

import { useState } from "react";
import Button from "@/shared/ui/button";
import EmojiPicker from "@/shared/ui/emoji-picker";
import { SmileIcon } from "@/shared/ui/icons";
import styles from "./style.module.scss";

type EmojiButtonProps = {
  onSelect: (emoji: string) => void;
};

/** Кнопка «Смайлик» с выпадающим выбором. Закрывается после выбора или клика мимо. */
const EmojiButton = ({ onSelect }: EmojiButtonProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <Button
        variant="tool"
        size="icon"
        ariaLabel="Смайлик"
        ariaPressed={open}
        onClick={() => setOpen(!open)}
      >
        <SmileIcon />
      </Button>

      {open && (
        <div className={styles.popover}>
          <EmojiPicker
            onSelect={(emoji) => {
              onSelect(emoji);
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default EmojiButton;
