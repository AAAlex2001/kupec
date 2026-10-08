"use client";

import { useState } from "react";
import { archiveListing, deleteListing, restoreListing, type Listing } from "@/entities/listing";
import { errorMessage } from "@/shared/lib/errors";

type Action = "archive" | "restore" | "delete";

const REQUESTS = {
  archive: archiveListing,
  restore: restoreListing,
  delete: deleteListing,
};

/** Действия над своим объявлением. После успеха список нужно перезагрузить — onDone. */
export const useListingActions = (listing: Listing, onDone: () => void) => {
  const [pending, setPending] = useState<Action | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (action: Action) => {
    setPending(action);
    setError(null);

    try {
      await REQUESTS[action](listing.id);
      onDone();
    } catch (failure) {
      setError(errorMessage(failure, "Не удалось выполнить действие"));
    } finally {
      setPending(null);
    }
  };

  return {
    pending,
    error,
    archive: () => run("archive"),
    restore: () => run("restore"),
    remove: () => run("delete"),
  };
};
