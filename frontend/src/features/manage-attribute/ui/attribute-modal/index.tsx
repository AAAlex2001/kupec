"use client";

import { useId } from "react";
import {
  ATTRIBUTE_TYPES,
  attributeTypeLabel,
  hasOptions,
  type Attribute,
  type AttributeType,
} from "@/entities/attribute";
import Button from "@/shared/ui/button";
import Checkbox from "@/shared/ui/checkbox";
import Dropdown from "@/shared/ui/dropdown";
import Field from "@/shared/ui/field";
import Input from "@/shared/ui/input";
import Modal from "@/shared/ui/modal";
import Notice from "@/shared/ui/notice";
import Title from "@/shared/ui/title";
import { useAttributeForm } from "../../model/use-attribute-form";
import OptionsEditor from "../options-editor";
import styles from "./style.module.scss";

type AttributeModalProps = {
  attribute?: Attribute;
  onClose: () => void;
  onSaved: () => void;
};

/** Окно атрибута: новый или правка. Адрес и тип задаются один раз — по ним хранятся значения. */
const AttributeModal = ({ attribute, onClose, onSaved }: AttributeModalProps) => {
  const id = useId();
  const form = useAttributeForm(attribute, onSaved);
  const { fields } = form;
  const title = attribute ? "Изменить атрибут" : "Новый атрибут";

  return (
    <Modal open onClose={onClose} ariaLabel={title}>
      <form
        className={styles.form}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          form.submit();
        }}
      >
        <Title>{title}</Title>

        <Field label="Название" htmlFor={`${id}-name`} hint="Так поле увидят в форме и фильтрах">
          <Input
            id={`${id}-name`}
            value={fields.name}
            onChange={form.changeName}
            placeholder="Вес, Вид, Год выпуска"
            maxLength={100}
            autoFocus
          />
        </Field>

        {attribute ? (
          <p className={styles.fixed}>
            {fields.slug} · {attributeTypeLabel(fields.type)}
          </p>
        ) : (
          <>
            <Field label="Адрес" htmlFor={`${id}-slug`} hint="Латиницей. Потом не меняется">
              <Input
                id={`${id}-slug`}
                value={fields.slug}
                onChange={form.changeSlug}
                maxLength={100}
              />
            </Field>

            <Field label="Тип" htmlFor={`${id}-type`} hint="Потом не меняется">
              <Dropdown
                id={`${id}-type`}
                value={fields.type}
                options={ATTRIBUTE_TYPES}
                placeholder="Выберите"
                onChange={(type) => form.change({ type: type as AttributeType })}
              />
            </Field>
          </>
        )}

        {fields.type === "number" && (
          <Field label="Единица" htmlFor={`${id}-unit`}>
            <Input
              id={`${id}-unit`}
              value={fields.unit}
              onChange={(unit) => form.change({ unit })}
              placeholder="кг, л, шт"
              maxLength={16}
            />
          </Field>
        )}

        {hasOptions(fields.type) && (
          <OptionsEditor
            options={fields.options}
            onAdd={form.addOption}
            onRename={form.renameOption}
            onRemove={form.removeOption}
          />
        )}

        {fields.type !== "text" && (
          <Checkbox
            checked={fields.isFilterable}
            onChange={(isFilterable) => form.change({ isFilterable })}
          >
            Показывать в фильтрах каталога
          </Checkbox>
        )}

        {form.error && <Notice tone="error">{form.error}</Notice>}

        <div className={styles.buttons}>
          <Button className={styles.button} type="submit" loading={form.pending}>
            Сохранить
          </Button>
          <Button className={styles.button} variant="ghost" disabled={form.pending} onClick={onClose}>
            Отменить
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AttributeModal;
