"use client";

import { useId } from "react";
import type { Unit, UnitKind } from "@/entities/unit";
import Button from "@/shared/ui/button";
import Chips from "@/shared/ui/chips";
import Field from "@/shared/ui/field";
import Input from "@/shared/ui/input";
import Modal from "@/shared/ui/modal";
import Notice from "@/shared/ui/notice";
import Title from "@/shared/ui/title";
import { UNIT_KINDS, unitKindLabel } from "../../lib/kinds";
import { useUnitForm } from "../../model/use-unit-form";
import styles from "./style.module.scss";

type UnitModalProps = {
  unit?: Unit;
  onClose: () => void;
  onSaved: () => void;
};

/** Окно единицы цены: новая или переименование. Код и тип задаются один раз. */
const UnitModal = ({ unit, onClose, onSaved }: UnitModalProps) => {
  const id = useId();
  const form = useUnitForm(unit, onSaved);
  const title = unit ? "Изменить единицу" : "Новая единица";

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

        <Field label="Подпись" htmlFor={`${id}-label`} hint="Так её увидят рядом с ценой: «/ мешок»">
          <Input
            id={`${id}-label`}
            value={form.fields.label}
            onChange={form.changeLabel}
            placeholder="мешок, десяток, занятие"
            maxLength={32}
            autoFocus
          />
        </Field>

        {unit ? (
          <p className={styles.fixed}>
            {unit.code} · {unitKindLabel(unit.kind)}
          </p>
        ) : (
          <>
            <Field label="Код" htmlFor={`${id}-code`} hint="Латиницей. Потом не меняется">
              <Input
                id={`${id}-code`}
                value={form.fields.code}
                onChange={form.changeCode}
                maxLength={16}
              />
            </Field>

            <Chips
              ariaLabel="Для чего единица"
              value={form.fields.kind}
              options={UNIT_KINDS}
              onChange={(kind) => form.change({ kind: kind as UnitKind })}
            />
          </>
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

export default UnitModal;
