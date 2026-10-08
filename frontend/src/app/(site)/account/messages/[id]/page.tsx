import { ChatRoom } from "@/widgets/messenger";

type ConversationPageProps = {
  params: Promise<{ id: string }>;
};

/** Открытый диалог. */
export default async function ConversationPage({ params }: ConversationPageProps) {
  const { id } = await params;

  return <ChatRoom conversationId={Number(id)} />;
}
