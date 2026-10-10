import type { Metadata } from "next";
import { ABOUT_PATH } from "@/shared/config/routes";
import { OG_BASE, OG_COVERS } from "@/shared/lib/seo";
import AboutPage, { ABOUT_TITLE, ABOUT_DESCRIPTION } from "@/widgets/about-page";

export const metadata: Metadata = {
  title: ABOUT_TITLE,
  description: ABOUT_DESCRIPTION,
  alternates: { canonical: ABOUT_PATH },
  robots: { index: true, follow: true },
  openGraph: {
    ...OG_BASE,
    type: "website",
    title: ABOUT_TITLE,
    description: ABOUT_DESCRIPTION,
    url: ABOUT_PATH,
    images: [OG_COVERS.about],
  },
  twitter: {
    card: "summary_large_image",
    title: ABOUT_TITLE,
    description: ABOUT_DESCRIPTION,
    images: [OG_COVERS.about.url],
  },
};

export default function Page() {
  return (
    <main>
      <AboutPage />
    </main>
  );
}
