import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { companionName, type Conversation } from "@/entities/conversation";
import { MESSAGES_PATH, listingPath } from "@/shared/config/routes";
import Button from "@/shared/ui/button";
import { ArrowLeftIcon } from "@/shared/ui/icons";
import styles from "./style.module.scss";

type ChatHeaderProps = {
  conversation: Conversation;
  actions: ReactNode;
};

/** Шапка диалога: фото объявления, собеседник, объявление и меню справа. До ПК — кнопка назад. */
const ChatHeader = ({ conversation, actions }: ChatHeaderProps) => {
  const { listing, companion } = conversation;

  return (
    <div className={styles.header}>
      <div className={styles.back}>
        <Button variant="secondary" size="icon" href={MESSAGES_PATH} ariaLabel="Ко всем диалогам">
          <ArrowLeftIcon />
        </Button>
      </div>

      <div className={styles.photo}>
        {listing.cover_url && (
          <Image className={styles.image} src={listing.cover_url} alt="" fill sizes="56px" unoptimized />
        )}
      </div>

      <div className={styles.info}>
        <p className={styles.name}>{companionName(companion)}</p>
        <Link className={styles.listing} href={listingPath(listing.id)}>
          {listing.title}
        </Link>
      </div>

      {actions}
    </div>
  );
};

export default ChatHeader;
