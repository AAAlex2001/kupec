import type { Metadata } from "next";
import RepostEditor from "@/widgets/repost-editor";

type RepostPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Репост с комментарием",
};

/** Репост публикации с комментарием. */
export default async function RepostPage({ params }: RepostPageProps) {
  const { id } = await params;

  return <RepostEditor id={Number(id)} />;
}
