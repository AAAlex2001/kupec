import type { Metadata } from "next";
import { EditPost } from "@/widgets/post-editor";

type EditPostPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Изменить публикацию",
};

/** Правка своего поста. */
export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;

  return <EditPost id={Number(id)} />;
}
