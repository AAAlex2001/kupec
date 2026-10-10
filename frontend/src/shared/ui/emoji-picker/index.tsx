"use client";

import { EmojiPicker as Picker } from "frimousse";
import Spinner from "@/shared/ui/spinner";
import styles from "./style.module.scss";

type EmojiPickerProps = {
  onSelect: (emoji: string) => void;
};

/** Выбор смайлика с поиском по-русски. */
const EmojiPicker = ({ onSelect }: EmojiPickerProps) => (
  <Picker.Root
    className={styles.picker}
    locale="ru"
    columns={8}
    onEmojiSelect={({ emoji }) => onSelect(emoji)}
  >
    <Picker.Search className={styles.search} placeholder="Найти смайлик" />

    <Picker.Viewport className={styles.viewport}>
      <Picker.Loading className={styles.status}>
        <Spinner />
      </Picker.Loading>
      <Picker.Empty className={styles.status}>Ничего не нашлось</Picker.Empty>
      <Picker.List />
    </Picker.Viewport>
  </Picker.Root>
);

export default EmojiPicker;
