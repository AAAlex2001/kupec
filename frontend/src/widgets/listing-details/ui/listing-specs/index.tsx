import type { Listing } from "@/entities/listing";
import { listingSpecs } from "../../lib/specs";
import Section from "../section";
import styles from "./style.module.scss";

type ListingSpecsProps = {
  listing: Listing;
};

/** «Об услуге» или «О товаре»: характеристики строками «название — значение». */
const ListingSpecs = ({ listing }: ListingSpecsProps) => (
  <Section title={listing.kind === "service" ? "Об услуге" : "О товаре"}>
    <dl className={styles.specs}>
      {listingSpecs(listing).map((spec) => (
        <div key={spec.label} className={styles.row}>
          <dt className={styles.label}>{spec.label}</dt>
          <dd className={styles.value}>{spec.value}</dd>
        </div>
      ))}
    </dl>
  </Section>
);

export default ListingSpecs;
