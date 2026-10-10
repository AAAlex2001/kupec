import ArticleEditor from "@/widgets/article-editor";

type ArticleEditorPageProps = {
  params: Promise<{ id: string }>;
};

/** Админка: правка статьи. */
export default async function ArticleEditorPage({ params }: ArticleEditorPageProps) {
  const { id } = await params;

  return <ArticleEditor articleId={Number(id)} />;
}
