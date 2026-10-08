import Link from "next/link";
import type { ReactNode } from "react";

type CardLinkProps = {
  href?: string;
  className?: string;
  children: ReactNode;
};

/** Ссылка на объявление. Без href — обычный блок, как в превью формы. */
const CardLink = ({ href, className, children }: CardLinkProps) => {
  if (!href) return <div className={className}>{children}</div>;

  return (
    <Link className={className} href={href}>
      {children}
    </Link>
  );
};

export default CardLink;
