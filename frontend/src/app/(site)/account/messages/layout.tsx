import type { Metadata } from "next";
import Messenger from "@/widgets/messenger";

export const metadata: Metadata = {
  title: "Сообщения",
};

/** Общая часть раздела «Сообщения»: список диалогов живёт здесь и не перезагружается. */
export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  return <Messenger>{children}</Messenger>;
}
