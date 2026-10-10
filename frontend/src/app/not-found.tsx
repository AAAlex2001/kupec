import type { Metadata } from "next";
import NotFound from "@/widgets/not-found";
import SiteLayout from "./(site)/layout";

export const metadata: Metadata = {
  title: "Страница не найдена",
  robots: { index: false },
};

/** 404 для всего сайта — с шапкой и подвалом, как обычная страница. */
export default function NotFoundPage() {
  return (
    <SiteLayout>
      <main>
        <NotFound />
      </main>
    </SiteLayout>
  );
}
