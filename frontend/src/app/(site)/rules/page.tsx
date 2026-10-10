import type { Metadata } from "next";
import { RULES_PATH } from "@/shared/config/routes";
import { OG_BASE, OG_COVERS } from "@/shared/lib/seo";
import InfoPage, { RULES_PAGE } from "@/widgets/info-page";

export const metadata: Metadata = {
  title: RULES_PAGE.title,
  description: RULES_PAGE.lead,
  alternates: { canonical: RULES_PATH },
  openGraph: {
    ...OG_BASE,
    type: "website",
    title: RULES_PAGE.title,
    description: RULES_PAGE.lead,
    url: RULES_PATH,
    images: [OG_COVERS.rules],
  },
};

/** Правила площадки. */
export default function RulesPage() {
  return (
    <main>
      <InfoPage content={RULES_PAGE} />
    </main>
  );
}
