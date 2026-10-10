"use client";

import Button from "@/shared/ui/button";
import { UserMinusIcon, UserPlusIcon } from "@/shared/ui/icons";
import { useFollow } from "../../model/use-follow";
import styles from "./style.module.scss";

const FOLLOW = { label: "Подписаться", Icon: UserPlusIcon, variant: "primary" } as const;
const UNFOLLOW = { label: "Отписаться", Icon: UserMinusIcon, variant: "secondary" } as const;

type FollowButtonProps = {
  authorId: number;
  following: boolean;
};

/** «Подписаться» на автора или «Отписаться», если уже подписан. */
const FollowButton = ({ authorId, following }: FollowButtonProps) => {
  const follow = useFollow(authorId, following);
  const { label, Icon, variant } = follow.following ? UNFOLLOW : FOLLOW;

  return (
    <div className={styles.follow}>
      <Button variant={variant} onClick={follow.toggle}>
        <Icon />
        {label}
      </Button>

      {follow.error && <p className={styles.error}>{follow.error}</p>}
    </div>
  );
};

export default FollowButton;
