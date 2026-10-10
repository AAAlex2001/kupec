"use client";

import { useUser } from "@/entities/user";
import Button from "@/shared/ui/button";
import styles from "./style.module.scss";

/** Гостю вместо формы комментария: войдите, чтобы участвовать в обсуждении. */
const CommentGuest = () => {
  const { openAuth } = useUser();

  return (
    <div className={styles.guest}>
      <p className={styles.text}>Войдите, чтобы оставить комментарий.</p>
      <Button variant="secondary" onClick={openAuth}>
        Войти
      </Button>
    </div>
  );
};

export default CommentGuest;
