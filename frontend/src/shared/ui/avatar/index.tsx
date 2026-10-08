import cn from "classnames";
import Image from "next/image";
import styles from "./style.module.scss";

type AvatarProps = {
  src: string | null;
  letter: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZES = { sm: 28, md: 48, lg: 64 };

/** Круглый аватар: фото, а без него — первая буква имени. */
const Avatar = ({ src, letter, size = "md", className }: AvatarProps) => (
  <span className={cn(styles.avatar, styles[size], className)} aria-hidden="true">
    {src ? (
      <Image
        className={styles.photo}
        src={src}
        alt=""
        width={SIZES[size]}
        height={SIZES[size]}
        unoptimized
      />
    ) : (
      letter
    )}
  </span>
);

export default Avatar;
