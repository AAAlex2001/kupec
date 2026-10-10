import LegalPage, { legalMetadata } from "@/widgets/legal-page";
import { TERMS_DOCUMENT } from "@/widgets/legal-page/terms";

export const metadata = legalMetadata(TERMS_DOCUMENT);

export default function TermsPage() {
  return <LegalPage document={TERMS_DOCUMENT} />;
}
