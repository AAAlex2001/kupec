"use client";

import type { ReactNode } from "react";
import { useUser } from "@/entities/user";
import { NEW_LISTING_PATH } from "@/shared/config/routes";
import Button from "@/shared/ui/button";

type PublishButtonProps = {
  children: ReactNode;
  className?: string;
};

/** «Разместить объявление»: вошедшего ведёт на форму, гостю открывает окно входа. */
const PublishButton = ({ children, className }: PublishButtonProps) => {
  const { user, openAuth } = useUser();

  if (!user) {
    return (
      <Button className={className} onClick={openAuth}>
        {children}
      </Button>
    );
  }

  return (
    <Button className={className} href={NEW_LISTING_PATH}>
      {children}
    </Button>
  );
};

export default PublishButton;
