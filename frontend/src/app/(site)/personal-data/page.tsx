import LegalPage, { legalMetadata } from "@/widgets/legal-page";
import { PERSONAL_DATA_DOCUMENT } from "@/widgets/legal-page/personal-data";

export const metadata = legalMetadata(PERSONAL_DATA_DOCUMENT);

export default function PersonalDataPage() {
  return <LegalPage document={PERSONAL_DATA_DOCUMENT} />;
}
