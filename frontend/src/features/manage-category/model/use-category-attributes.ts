"use client";

import { useEffect, useState } from "react";
import {
  fetchAttributes,
  fetchCategoryAttributes,
  saveCategoryAttributes,
  type Attribute,
  type InheritedField,
} from "@/entities/attribute";
import { errorMessage } from "@/shared/lib/errors";

export type OwnAttribute = {
  attribute: Attribute;
  isRequired: boolean;
};

/** Атрибуты категории в админке: унаследованные только для чтения, свои — список с порядком. */
export const useCategoryAttributes = (categoryId: number, onSaved: () => void) => {
  const [all, setAll] = useState<Attribute[] | null>(null);
  const [inherited, setInherited] = useState<InheritedField[]>([]);
  const [own, setOwn] = useState<OwnAttribute[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    Promise.all([fetchAttributes(), fetchCategoryAttributes(categoryId)])
      .then(([attributes, bound]) => {
        if (!active) return;
        setAll(attributes);
        setInherited(bound.inherited);
        setOwn(bound.own.map((field) => ({ attribute: field, isRequired: field.is_required })));
      })
      .catch((failure) => active && setError(errorMessage(failure, "Не удалось загрузить")));

    return () => {
      active = false;
    };
  }, [categoryId]);

  const taken = new Set([...own.map((item) => item.attribute.id), ...inherited.map((item) => item.id)]);
  const available = (all ?? []).filter((attribute) => !taken.has(attribute.id));

  const add = (attributeId: number) => {
    const attribute = available.find((item) => item.id === attributeId);
    if (attribute) setOwn([...own, { attribute, isRequired: false }]);
  };

  const remove = (index: number) => setOwn(own.filter((_item, position) => position !== index));

  const setRequired = (index: number, isRequired: boolean) =>
    setOwn(own.map((item, position) => (position === index ? { ...item, isRequired } : item)));

  const move = (index: number, step: -1 | 1) => {
    const target = index + step;
    if (target < 0 || target >= own.length) return;

    const next = [...own];
    [next[index], next[target]] = [next[target], next[index]];
    setOwn(next);
  };

  const save = async () => {
    setPending(true);
    setError(null);

    try {
      await saveCategoryAttributes(
        categoryId,
        own.map((item) => ({ attribute_id: item.attribute.id, is_required: item.isRequired })),
      );
      onSaved();
    } catch (failure) {
      setError(errorMessage(failure, "Не удалось сохранить"));
    }

    setPending(false);
  };

  return {
    loaded: all !== null,
    inherited,
    own,
    available,
    pending,
    error,
    add,
    remove,
    setRequired,
    move,
    save,
  };
};
