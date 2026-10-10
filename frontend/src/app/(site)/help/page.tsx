import type { Metadata } from "next";
import { HELP_PATH } from "@/shared/config/routes";
import { OG_BASE, OG_COVERS } from "@/shared/lib/seo";
import InfoPage, { HELP_PAGE } from "@/widgets/info-page";

export const metadata: Metadata = {
  title: HELP_PAGE.title,
  description: HELP_PAGE.lead,
  alternates: { canonical: HELP_PATH },
  openGraph: {
    ...OG_BASE,
    type: "website",
    title: HELP_PAGE.title,
    description: HELP_PAGE.lead,
    url: HELP_PATH,
    images: [OG_COVERS.help],
  },
};

/** Страница помощи. */
export default function HelpPage() {
  return (
    <main>
      <InfoPage content={HELP_PAGE} />
    </main>
  );
}
