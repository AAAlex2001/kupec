import { plural } from "@/shared/lib/format";
import { MapPinIcon } from "@/shared/ui/icons";
import { locationName } from "../../lib/label";
import type { City } from "../../model/types";
import styles from "./style.module.scss";

type LocationSummaryProps = {
  city: City | null;
  total: number;
};

const LISTINGS: [string, string, string] = ["объявление", "объявления", "объявлений"];

/** Где ищем и сколько нашли: «Ангарск · 12 объявлений». */
const LocationSummary = ({ city, total }: LocationSummaryProps) => (
  <p className={styles.summary}>
    <MapPinIcon className={styles.pin} />
    <span className={styles.place}>{locationName(city)}</span>
    <span aria-hidden="true">·</span>
    <span>
      {total} {plural(total, LISTINGS)}
    </span>
  </p>
);

export default LocationSummary;
