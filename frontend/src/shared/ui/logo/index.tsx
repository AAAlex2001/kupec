import cn from "classnames";
import Image from "next/image";
import Link from "next/link";
import styles from "./style.module.scss";

type LogoProps = {
  href: string;
  ariaLabel: string;
  size?: "md" | "sm";
  className?: string;
};

/** Логотип «Купец» со ссылкой: в шапке обычный, в подвале поменьше. */
const Logo = ({ href, ariaLabel, size = "md", className }: LogoProps) => (
  <Link className={cn(styles.logo, styles[size], className)} href={href} aria-label={ariaLabel}>
    <Image className={styles.image} src="/logo.svg" alt="" width={135} height={36} priority unoptimized />
  </Link>
);

export default Logo;
