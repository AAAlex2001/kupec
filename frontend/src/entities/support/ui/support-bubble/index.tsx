"use client";

import cn from "classnames";
import Image from "next/image";
import { useState } from "react";
import { formatTime } from "@/shared/lib/format";
import Lightbox from "@/shared/ui/lightbox";
import type { SupportMessage } from "../../model/types";
import styles from "./style.module.scss";

type SupportBubbleProps = {
  message: SupportMessage;
  mine: boolean;
  author: string;
};

/** Сообщение в поддержке: свои справа голубые, чужие слева серые. Фото открываются на весь экран. */
const SupportBubble = ({ message, mine, author }: SupportBubbleProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const photos = message.photos.map((photo) => photo.url);

  return (
    <div className={cn(styles.row, mine && styles.mine)}>
      <div className={styles.bubble}>
        {!mine && <p className={styles.author}>{author}</p>}

        {photos.length > 0 && (
          <div className={styles.photos}>
            {photos.map((url, index) => (
              <button
                key={url}
                type="button"
                className={styles.photo}
                aria-label="Открыть фото"
                onClick={() => setOpenIndex(index)}
              >
                <Image src={url} alt="" fill sizes="160px" unoptimized />
              </button>
            ))}
          </div>
        )}

        {message.text && <p className={styles.text}>{message.text}</p>}
        <p className={styles.time}>{formatTime(message.created_at)}</p>
      </div>

      {photos.length > 0 && (
        <Lightbox photos={photos} openIndex={openIndex} onClose={() => setOpenIndex(null)} />
      )}
    </div>
  );
};

export default SupportBubble;
