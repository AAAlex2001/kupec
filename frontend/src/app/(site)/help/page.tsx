import type { Metadata } from "next";
import { HELP_PATH } from "@/shared/config/routes";
import InfoPage, { HELP_PAGE } from "@/widgets/info-page";

export const metadata: Metadata = {
  title: HELP_PAGE.title,
  description: HELP_PAGE.lead,
  alternates: { canonical: HELP_PATH },
};

/** Страница помощи. */
export default function HelpPage() {
  return (
    <main>
      <InfoPage content={HELP_PAGE} />
    </main>
  );
}
