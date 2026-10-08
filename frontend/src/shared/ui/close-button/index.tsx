import cn from "classnames";
import { CloseIcon } from "@/shared/ui/icons";
import styles from "./style.module.scss";

type CloseButtonProps = {
  onClick: () => void;
  ariaLabel?: string;
  className?: string;
};

/** Круглая кнопка с крестиком для закрытия окон. */
const CloseButton = ({ onClick, ariaLabel = "Закрыть", className }: CloseButtonProps) => (
  <button
    type="button"
    className={cn(styles.close, className)}
    aria-label={ariaLabel}
    onClick={onClick}
  >
    <CloseIcon />
  </button>
);

export default CloseButton;
