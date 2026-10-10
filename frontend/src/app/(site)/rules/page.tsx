import type { Metadata } from "next";
import { RULES_PATH } from "@/shared/config/routes";
import InfoPage, { RULES_PAGE } from "@/widgets/info-page";

export const metadata: Metadata = {
  title: RULES_PAGE.title,
  description: RULES_PAGE.lead,
  alternates: { canonical: RULES_PATH },
};

/** Правила площадки. */
export default function RulesPage() {
  return (
    <main>
      <InfoPage content={RULES_PAGE} />
    </main>
  );
}
