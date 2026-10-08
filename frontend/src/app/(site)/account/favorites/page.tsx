import type { Metadata } from "next";
import Favorites from "@/widgets/favorites";

export const metadata: Metadata = {
  title: "Избранное",
};

/** Сохранённые объявления. */
export default function FavoritesPage() {
  return <Favorites />;
}
