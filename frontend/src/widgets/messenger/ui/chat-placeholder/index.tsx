import EmptyState from "@/shared/ui/empty-state";
import { MessageCircleIcon } from "@/shared/ui/icons";

/** Пока диалог не выбран: подсказка вместо переписки. */
const ChatPlaceholder = () => (
  <EmptyState
    icon={<MessageCircleIcon />}
    title="Выберите диалог"
    text="Переписка откроется здесь. Чтобы начать новую, нажмите «Написать» в объявлении."
  />
);

export default ChatPlaceholder;
