"use client";

import { useUser } from "@/entities/user";
import { NEW_POST_PATH } from "@/shared/config/routes";
import Button from "@/shared/ui/button";

/** «Написать пост»: открывает форму поста, гостю — окно входа. */
const WritePostButton = () => {
  const { user, openAuth } = useUser();
  if (!user) return <Button onClick={openAuth}>Написать пост</Button>;

  return <Button href={NEW_POST_PATH}>Написать пост</Button>;
};

export default WritePostButton;
