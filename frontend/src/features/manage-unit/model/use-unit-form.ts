"use client";

import { useState } from "react";
import { createUnit, updateUnit, type Unit, type UnitKind } from "@/entities/unit";
import { errorMessage } from "@/shared/lib/errors";
import { slugify } from "@/shared/lib/slug";

export type UnitFields = {
  label: string;
  code: string;
  kind: UnitKind;
};

/** Форма единицы: код новой собирается из подписи, пока его не поправили руками. */
export const useUnitForm = (unit: Unit | undefined, onSaved: () => void) => {
  const [fields, setFields] = useState<UnitFields>({
    label: unit?.label ?? "",
    code: unit?.code ?? "",
    kind: unit?.kind ?? "product",
  });
  const [codeEdited, setCodeEdited] = useState(Boolean(unit));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const change = (patch: Partial<UnitFields>) => setFields((current) => ({ ...current, ...patch }));

  const changeLabel = (label: string) =>
    change(codeEdited ? { label } : { label, code: slugify(label).slice(0, 16) });

  const changeCode = (code: string) => {
    setCodeEdited(true);
    change({ code });
  };

  const submit = async () => {
    setPending(true);
    setError(null);

    try {
      if (unit) await updateUnit(unit.id, fields.label);
      else await createUnit(fields);
      onSaved();
    } catch (failure) {
      setError(errorMessage(failure, "Не удалось сохранить единицу"));
    }

    setPending(false);
  };

  return { fields, pending, error, change, changeLabel, changeCode, submit };
};
