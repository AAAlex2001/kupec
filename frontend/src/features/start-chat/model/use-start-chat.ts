"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { startConversation } from "@/entities/conversation";
import { useUser } from "@/entities/user";
import { conversationPath } from "@/shared/config/routes";
import { errorMessage } from "@/shared/lib/errors";

/** Открыть переписку по объявлению. Гостю — окно входа. */
export const useStartChat = (listingId: number) => {
  const router = useRouter();
  const { user, openAuth } = useUser();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = async () => {
    if (!user) return openAuth();

    setPending(true);
    setError(null);

    try {
      const conversation = await startConversation(listingId);
      router.push(conversationPath(conversation.id));
    } catch (failure) {
      setError(errorMessage(failure, "Не удалось открыть переписку"));
      setPending(false);
    }
  };

  return { pending, error, start };
};
