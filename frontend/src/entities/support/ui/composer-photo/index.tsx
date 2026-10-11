"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import CloseButton from "@/shared/ui/close-button";
import styles from "./style.module.scss";

type ComposerPhotoProps = {
  file: File;
  onRemove: () => void;
};

/** Превью выбранного фото до отправки с крестиком «Убрать». */
const ComposerPhoto = ({ file, onRemove }: ComposerPhotoProps) => {
  const [url] = useState(() => URL.createObjectURL(file));

  useEffect(() => () => URL.revokeObjectURL(url), [url]);

  return (
    <div className={styles.photo}>
      <Image className={styles.image} src={url} alt="" fill sizes="64px" unoptimized />
      <CloseButton className={styles.remove} ariaLabel="Убрать фото" dark onClick={onRemove} />
    </div>
  );
};

export default ComposerPhoto;
