"use client";

import type { ComponentType } from "react";
import type { AttributeType, CategoryField } from "@/entities/attribute";
import { decimalInput } from "@/shared/lib/decimal-input";
import Checkbox from "@/shared/ui/checkbox";
import CheckList from "@/shared/ui/check-list";
import Dropdown from "@/shared/ui/dropdown";
import Input from "@/shared/ui/input";
import type { AttributeDraft } from "../../model/types";
import styles from "./style.module.scss";

type AttributeInputProps = {
  id: string;
  field: CategoryField;
  value: AttributeDraft | undefined;
  invalid: boolean;
  onChange: (value: AttributeDraft) => void;
};

/** Число с единицей справа: «3 кг». */
const NumberInput = ({ id, field, value, invalid, onChange }: AttributeInputProps) => (
  <Input
    id={id}
    value={typeof value === "string" ? value : ""}
    inputMode="decimal"
    maxLength={12}
    invalid={invalid}
    onChange={(text) => onChange(decimalInput(text))}
    suffix={field.unit && <span className={styles.unit}>{field.unit}</span>}
  />
);

/** Один вариант из списка. */
const SelectInput = ({ id, field, value, invalid, onChange }: AttributeInputProps) => (
  <Dropdown
    id={id}
    value={typeof value === "string" ? value : ""}
    options={field.options}
    searchable={field.options.length > 12}
    placeholder="Выберите"
    invalid={invalid}
    onChange={onChange}
  />
);

/** Несколько вариантов флажками. */
const MultiselectInput = ({ field, value, onChange }: AttributeInputProps) => (
  <CheckList options={field.options} values={Array.isArray(value) ? value : []} onChange={onChange} limit={8} />
);

/** Да или нет одним флажком. */
const BooleanInput = ({ value, onChange }: AttributeInputProps) => (
  <Checkbox checked={value === true} onChange={onChange}>
    Да
  </Checkbox>
);

/** Короткий текст. */
const TextInput = ({ id, value, invalid, onChange }: AttributeInputProps) => (
  <Input
    id={id}
    value={typeof value === "string" ? value : ""}
    maxLength={200}
    invalid={invalid}
    onChange={onChange}
  />
);

const INPUTS: Record<AttributeType, ComponentType<AttributeInputProps>> = {
  number: NumberInput,
  select: SelectInput,
  multiselect: MultiselectInput,
  boolean: BooleanInput,
  text: TextInput,
};

/** Поле атрибута в форме объявления — своё для каждого типа. */
const AttributeInput = (props: AttributeInputProps) => {
  const Control = INPUTS[props.field.type];

  return <Control {...props} />;
};

export default AttributeInput;
