"use client";

import { useSupport } from "../../model/support";
import SupportDialog from "../support-dialog";

/** Чат поддержки на весь экран. Открывается из шапки и нижнего бара. */
const SupportChat = () => {
  const { chatOpen, closeChat } = useSupport();

  if (!chatOpen) return null;

  return <SupportDialog onClose={closeChat} />;
};

export default SupportChat;
