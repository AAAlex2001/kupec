import type { Metadata } from "next";
import InfoPage, { HELP_PAGE } from "@/widgets/info-page";

export const metadata: Metadata = {
  title: HELP_PAGE.title,
  description: HELP_PAGE.lead,
};

/** Страница помощи. */
export default function HelpPage() {
  return (
    <main>
      <InfoPage content={HELP_PAGE} />
    </main>
  );
}
