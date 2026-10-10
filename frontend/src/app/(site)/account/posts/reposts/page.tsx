import type { Metadata } from "next";
import MyReposts from "@/widgets/my-reposts";

export const metadata: Metadata = {
  title: "Репосты",
};

/** Свои репосты. */
export default function RepostsPage() {
  return <MyReposts />;
}
