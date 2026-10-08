import { MESSAGES_PATH } from "@/shared/config/routes";

/** id открытого диалога из адреса «/account/messages/2». На списке диалогов — null. */
export const openedConversationId = (pathname: string) => {
  const id = Number(pathname.slice(MESSAGES_PATH.length + 1));

  return id > 0 ? id : null;
};
