import cn from "classnames";
import { CloseIcon } from "@/shared/ui/icons";
import styles from "./style.module.scss";

type CloseButtonProps = {
  onClick: () => void;
  ariaLabel?: string;
  dark?: boolean;
  className?: string;
};

/** Круглая кнопка с крестиком: закрыть окно, а тёмная поверх фото — удалить его. */
const CloseButton = ({ onClick, ariaLabel = "Закрыть", dark, className }: CloseButtonProps) => (
  <button
    type="button"
    className={cn(styles.close, dark && styles.dark, className)}
    aria-label={ariaLabel}
    onClick={onClick}
  >
    <CloseIcon />
  </button>
);

export default CloseButton;
