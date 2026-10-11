"use client";

import type { ReactNode } from "react";
import Button from "@/shared/ui/button";

type LoadMoreProps = {
  href: string;
  loading: boolean;
  onLoad: () => void;
  children: ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
};

/** «Загрузить ещё»: для поисковика — ссылка на следующую страницу, для человека — подгрузка на месте. */
const LoadMore = ({ href, loading, onLoad, children, variant = "primary", className }: LoadMoreProps) => {
  if (loading) {
    return (
      <Button className={className} variant={variant} loading>
        {children}
      </Button>
    );
  }

  return (
    <Button
      className={className}
      variant={variant}
      href={href}
      onClick={(event) => {
        event.preventDefault();
        onLoad();
      }}
    >
      {children}
    </Button>
  );
};

export default LoadMore;
