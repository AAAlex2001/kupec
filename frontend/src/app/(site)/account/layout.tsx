import type { Metadata } from "next";
import Account from "@/widgets/account";

export const metadata: Metadata = {
  title: "Личный кабинет",
  robots: { index: false, follow: false },
};

/** Общая оболочка разделов кабинета. */
export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <Account>{children}</Account>
    </main>
  );
}
