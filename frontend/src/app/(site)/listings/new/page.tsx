import type { Metadata } from "next";
import { getCategoryTree } from "@/entities/category/server";
import { getListingOptions } from "@/entities/listing/server";
import ListingEditor from "@/widgets/listing-editor";

export const metadata: Metadata = {
  title: "Разместить объявление",
  robots: { index: false, follow: false },
};

/** Размещение объявления. Справочники формы и дерево категорий грузятся на сервере. */
export default async function NewListingPage() {
  const [options, tree] = await Promise.all([getListingOptions(), getCategoryTree()]);

  return (
    <main>
      <ListingEditor options={options} tree={tree} />
    </main>
  );
}
