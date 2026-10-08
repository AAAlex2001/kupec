import type { Metadata } from "next";
import { getListingOptions } from "@/entities/listing/server";
import ListingEditor from "@/widgets/listing-editor";

export const metadata: Metadata = {
  title: "Разместить объявление",
  robots: { index: false, follow: false },
};

/** Размещение объявления. Справочники формы грузятся на сервере. */
export default async function NewListingPage() {
  const options = await getListingOptions();

  return (
    <main>
      <ListingEditor options={options} />
    </main>
  );
}
