import { ChevronDownIcon, MapPinIcon } from "@/shared/ui/icons";
import styles from "./style.module.scss";

type CityButtonProps = {
  city: string;
};

/** Текущий город в служебной строке шапки. По нажатию будет открываться выбор города. */
const CityButton = ({ city }: CityButtonProps) => (
  <button type="button" className={styles.button} aria-label={`Город: ${city}. Сменить город`}>
    <MapPinIcon className={styles.pin} />
    <span className={styles.city}>{city}</span>
    <ChevronDownIcon className={styles.chevron} />
  </button>
);

export default CityButton;
