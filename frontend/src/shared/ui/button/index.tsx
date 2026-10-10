import cn from "classnames";
import Link from "next/link";
import type { ReactNode } from "react";
import Spinner from "@/shared/ui/spinner";
import styles from "./style.module.scss";

type ButtonProps = {
  children: ReactNode;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "tool";
  size?: "md" | "lg" | "icon";
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
  href?: string;
  ariaLabel?: string;
  ariaPressed?: boolean;
};

/** Кнопка: синяя, серая, в рамке, текстовая, красная или кнопка панели. size: 40px, 44px или квадрат под иконку. */
const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  disabled,
  loading,
  onClick,
  className,
  href,
  ariaLabel,
  ariaPressed,
}: ButtonProps) => {
  const classNames = cn(
    styles.button,
    styles[variant],
    styles[size],
    loading && styles.loading,
    className,
  );

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={classNames} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classNames}
      disabled={disabled || loading}
      aria-busy={loading}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      onClick={onClick}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
};

export default Button;
