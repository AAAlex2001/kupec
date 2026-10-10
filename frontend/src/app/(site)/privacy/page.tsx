import LegalPage, { legalMetadata } from "@/widgets/legal-page";
import { PRIVACY_DOCUMENT } from "@/widgets/legal-page/privacy";

export const metadata = legalMetadata(PRIVACY_DOCUMENT);

export default function PrivacyPage() {
  return <LegalPage document={PRIVACY_DOCUMENT} />;
}
