import type { Metadata } from "next";
import MyListings from "@/widgets/my-listings";

export const metadata: Metadata = {
  title: "Мои объявления",
};

/** Объявления пользователя по вкладкам. */
export default function MyListingsPage() {
  return <MyListings />;
}
