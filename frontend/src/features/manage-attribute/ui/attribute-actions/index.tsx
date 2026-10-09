"use client";

import { useState } from "react";
import { deleteAttribute, type Attribute } from "@/entities/attribute";
import { errorMessage } from "@/shared/lib/errors";
import ActionMenu from "@/shared/ui/action-menu";
import ConfirmModal from "@/shared/ui/confirm-modal";
import AttributeModal from "../attribute-modal";

type AttributeActionsProps = {
  attribute: Attribute;
  onDone: () => void;
};

/** Меню «⋯» атрибута: изменить или удалить. */
const AttributeActions = ({ attribute, onDone }: AttributeActionsProps) => {
  const [dialog, setDialog] = useState<"edit" | "delete" | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => setDialog(null);

  const saved = () => {
    close();
    onDone();
  };

  const remove = async () => {
    setPending(true);
    setError(null);

    try {
      await deleteAttribute(attribute.id);
      saved();
    } catch (failure) {
      setError(errorMessage(failure, "Не удалось удалить атрибут"));
    }

    setPending(false);
  };

  return (
    <>
      <ActionMenu
        ariaLabel={`Действия с атрибутом «${attribute.name}»`}
        actions={[
          { label: "Изменить", onClick: () => setDialog("edit") },
          { label: "Удалить", danger: true, onClick: () => setDialog("delete") },
        ]}
      />

      {dialog === "edit" && <AttributeModal attribute={attribute} onClose={close} onSaved={saved} />}

      <ConfirmModal
        open={dialog === "delete"}
        title={`Удалить «${attribute.name}»?`}
        text={
          error ??
          "Атрибут пропадёт из всех категорий, форм и фильтров. Значения в объявлениях больше не покажутся."
        }
        confirmLabel="Удалить"
        pending={pending}
        onConfirm={remove}
        onClose={close}
      />
    </>
  );
};

export default AttributeActions;
