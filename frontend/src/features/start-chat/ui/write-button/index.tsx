"use client";

import { useUser } from "@/entities/user";
import { MY_LISTINGS_PATH } from "@/shared/config/routes";
import Button from "@/shared/ui/button";
import { MessageCircleMoreIcon } from "@/shared/ui/icons";
import { useStartChat } from "../../model/use-start-chat";
import styles from "./style.module.scss";

type WriteButtonProps = {
  listingId: number;
  ownerId: number;
  label?: string;
  variant?: "primary" | "secondary";
};

/** «Написать» автору объявления. Автору вместо неё — ссылка на его объявления. */
const WriteButton = ({
  listingId,
  ownerId,
  label = "Написать",
  variant = "secondary",
}: WriteButtonProps) => {
  const { user } = useUser();
  const { pending, error, start } = useStartChat(listingId);

  if (user?.id === ownerId) {
    return (
      <Button variant={variant} href={MY_LISTINGS_PATH}>
        Ваше объявление
      </Button>
    );
  }

  return (
    <>
      <Button variant={variant} loading={pending} onClick={start}>
        <MessageCircleMoreIcon />
        {label}
      </Button>

      {error && <p className={styles.error}>{error}</p>}
    </>
  );
};

export default WriteButton;
