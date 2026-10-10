"use client";

import { useState } from "react";
import { deleteUnit, type Unit } from "@/entities/unit";
import { errorMessage } from "@/shared/lib/errors";
import ActionMenu from "@/shared/ui/action-menu";
import { PencilIcon, TrashIcon } from "@/shared/ui/icons";
import ConfirmModal from "@/shared/ui/confirm-modal";
import UnitModal from "../unit-modal";

type UnitActionsProps = {
  unit: Unit;
  onDone: () => void;
};

/** Меню «⋯» единицы: переименовать или удалить. */
const UnitActions = ({ unit, onDone }: UnitActionsProps) => {
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
      await deleteUnit(unit.id);
      saved();
    } catch (failure) {
      setError(errorMessage(failure, "Не удалось удалить единицу"));
    }

    setPending(false);
  };

  return (
    <>
      <ActionMenu
        ariaLabel={`Действия с единицей «${unit.label}»`}
        actions={[
          { label: "Изменить", Icon: PencilIcon, onClick: () => setDialog("edit") },
          { label: "Удалить", Icon: TrashIcon, danger: true, onClick: () => setDialog("delete") },
        ]}
      />

      {dialog === "edit" && <UnitModal unit={unit} onClose={close} onSaved={saved} />}

      <ConfirmModal
        open={dialog === "delete"}
        title={`Удалить «${unit.label}»?`}
        text={error ?? "Удалить можно только единицу, которой нет ни в одном объявлении."}
        confirmLabel="Удалить"
        pending={pending}
        onConfirm={remove}
        onClose={close}
      />
    </>
  );
};

export default UnitActions;
