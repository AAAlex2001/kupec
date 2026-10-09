"use client";

import type { ReactNode } from "react";
import { useUser } from "@/entities/user";
import { NEW_LISTING_PATH } from "@/shared/config/routes";
import Button from "@/shared/ui/button";

type PublishButtonProps = {
  children: ReactNode;
  className?: string;
  variant?: "primary" | "ghost";
};

/** «Разместить объявление»: вошедшего ведёт на форму, гостю открывает окно входа. */
const PublishButton = ({ children, className, variant = "primary" }: PublishButtonProps) => {
  const { user, openAuth } = useUser();

  if (!user) {
    return (
      <Button className={className} variant={variant} onClick={openAuth}>
        {children}
      </Button>
    );
  }

  return (
    <Button className={className} variant={variant} href={NEW_LISTING_PATH}>
      {children}
    </Button>
  );
};

export default PublishButton;
