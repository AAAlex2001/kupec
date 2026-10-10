"use client";

import type { ConversationDetail, Message } from "@/entities/conversation";
import { useBlockToggle } from "@/features/block-user";
import { useShareContacts } from "@/features/share-contacts";
import { SETTINGS_PATH, listingPath } from "@/shared/config/routes";
import ActionMenu, { type MenuAction } from "@/shared/ui/action-menu";
import { BanIcon, BasketIcon, PhoneIcon } from "@/shared/ui/icons";

type ChatMenuProps = {
  detail: ConversationDetail;
  onSent: (message: Message) => void;
  onChanged: () => void;
};

/** «⋯» в шапке диалога: к объявлению, поделиться телефоном, заблокировать. */
const ChatMenu = ({ detail, onSent, onChanged }: ChatMenuProps) => {
  const { id, listing } = detail.conversation;
  const contacts = useShareContacts(id, onSent);
  const block = useBlockToggle(id, detail.blocked_by_me, onChanged);

  const shareAction: MenuAction = contacts.canShare
    ? { label: "Поделиться контактами", Icon: PhoneIcon, onClick: contacts.share }
    : { label: "Добавить телефон в профиль", Icon: PhoneIcon, href: SETTINGS_PATH };

  const actions: MenuAction[] = [
    { label: "Перейти к объявлению", Icon: BasketIcon, href: listingPath(listing.id) },
    shareAction,
    { label: block.label, Icon: BanIcon, onClick: block.toggle },
  ];

  return <ActionMenu ariaLabel="Действия с перепиской" actions={actions} />;
};

export default ChatMenu;
