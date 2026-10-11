import cn from "classnames";
import Image from "next/image";
import Link from "next/link";
import styles from "./style.module.scss";

type LogoProps = {
  href?: string;
  ariaLabel: string;
  size?: "md" | "sm";
  className?: string;
};

/** Логотип «Купец»: в шапке обычный, в подвале поменьше. Без href — просто картинка, не ссылка. */
const Logo = ({ href, ariaLabel, size = "md", className }: LogoProps) => {
  const images = (
    <>
      <Image className={styles.image} src="/logo.svg" alt="" width={135} height={36} priority unoptimized />
      <Image className={cn(styles.image, styles.darkImage)} src="/logo-dark.svg" alt="" width={135} height={36} unoptimized />
    </>
  );

  if (!href) {
    return (
      <span className={cn(styles.logo, styles[size], className)} role="img" aria-label={ariaLabel}>
        {images}
      </span>
    );
  }

  return (
    <Link className={cn(styles.logo, styles[size], className)} href={href} aria-label={ariaLabel}>
      {images}
    </Link>
  );
};

export default Logo;
