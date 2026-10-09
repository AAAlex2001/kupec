"use client";

import { useState } from "react";
import {
  createAttribute,
  hasOptions,
  updateAttribute,
  type Attribute,
  type AttributeOptionPayload,
  type AttributeType,
} from "@/entities/attribute";
import { errorMessage } from "@/shared/lib/errors";
import { slugify } from "@/shared/lib/slug";

export type AttributeFields = {
  name: string;
  slug: string;
  type: AttributeType;
  unit: string;
  isFilterable: boolean;
  options: AttributeOptionPayload[];
};

/** Поля нового атрибута или правки существующего. */
const initialFields = (attribute?: Attribute): AttributeFields => ({
  name: attribute?.name ?? "",
  slug: attribute?.slug ?? "",
  type: attribute?.type ?? "select",
  unit: attribute?.unit ?? "",
  isFilterable: attribute?.is_filterable ?? true,
  options: attribute?.options.map(({ id, value, label }) => ({ id, value, label })) ?? [],
});

/** Форма атрибута: адрес нового собирается из названия, варианты добавляются и убираются. */
export const useAttributeForm = (attribute: Attribute | undefined, onSaved: () => void) => {
  const [fields, setFields] = useState(() => initialFields(attribute));
  const [slugEdited, setSlugEdited] = useState(Boolean(attribute));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const change = (patch: Partial<AttributeFields>) =>
    setFields((current) => ({ ...current, ...patch }));

  const changeName = (name: string) => change(slugEdited ? { name } : { name, slug: slugify(name) });

  const changeSlug = (slug: string) => {
    setSlugEdited(true);
    change({ slug });
  };

  const addOption = (label: string) =>
    change({ options: [...fields.options, { id: null, value: slugify(label), label }] });

  const renameOption = (index: number, label: string) =>
    change({
      options: fields.options.map((option, position) =>
        position === index ? { ...option, label } : option,
      ),
    });

  const removeOption = (index: number) =>
    change({ options: fields.options.filter((_option, position) => position !== index) });

  const submit = async () => {
    setPending(true);
    setError(null);

    const payload = {
      name: fields.name,
      unit: fields.unit.trim() || null,
      is_filterable: fields.isFilterable,
      options: hasOptions(fields.type) ? fields.options : [],
    };

    try {
      if (attribute) await updateAttribute(attribute.id, payload);
      else await createAttribute({ ...payload, slug: fields.slug, type: fields.type });
      onSaved();
    } catch (failure) {
      setError(errorMessage(failure, "Не удалось сохранить атрибут"));
    }

    setPending(false);
  };

  return {
    fields,
    pending,
    error,
    change,
    changeName,
    changeSlug,
    addOption,
    renameOption,
    removeOption,
    submit,
  };
};
