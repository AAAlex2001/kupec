import type { CategoryField } from "@/entities/attribute";
import type { Listing } from "@/entities/listing";
import { listingSpecs } from "../../lib/specs";
import Section from "../section";
import styles from "./style.module.scss";

type ListingSpecsProps = {
  listing: Listing;
  fields: CategoryField[];
};

/** «Об услуге» или «О товаре»: характеристики строками «название — значение». */
const ListingSpecs = ({ listing, fields }: ListingSpecsProps) => (
  <Section title={listing.kind === "service" ? "Об услуге" : "О товаре"}>
    <dl className={styles.specs}>
      {listingSpecs(listing, fields).map((spec) => (
        <div key={spec.label} className={styles.row}>
          <dt className={styles.label}>{spec.label}</dt>
          <dd className={styles.value}>{spec.value}</dd>
        </div>
      ))}
    </dl>
  </Section>
);

export default ListingSpecs;
