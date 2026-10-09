"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { attributeTypeLabel } from "@/entities/attribute";
import type { AdminCategory } from "@/entities/category";
import { ADMIN_ATTRIBUTES_PATH } from "@/shared/config/routes";
import Button from "@/shared/ui/button";
import Dropdown from "@/shared/ui/dropdown";
import Loader from "@/shared/ui/loader";
import Modal from "@/shared/ui/modal";
import Notice from "@/shared/ui/notice";
import Title from "@/shared/ui/title";
import { useCategoryAttributes } from "../../model/use-category-attributes";
import OwnAttributeRow from "../own-attribute-row";
import styles from "./style.module.scss";

type CategoryAttributesModalProps = {
  category: AdminCategory;
  onClose: () => void;
  onSaved: () => void;
};

/** Окно «Атрибуты категории»: от родителей — для справки, свои — добавить, упорядочить, убрать. */
const CategoryAttributesModal = ({ category, onClose, onSaved }: CategoryAttributesModalProps) => {
  const id = useId();
  const bound = useCategoryAttributes(category.id, onSaved);
  const [choice, setChoice] = useState("");
  const title = `Атрибуты «${category.name}»`;

  const add = () => {
    bound.add(Number(choice));
    setChoice("");
  };

  return (
    <Modal open onClose={onClose} ariaLabel={title}>
      <div className={styles.content}>
        <Title>{title}</Title>

        <p className={styles.hint}>
          Атрибуты действуют в категории и во всех её подкатегориях: в форме объявления, карточке и
          фильтрах.
        </p>

        {!bound.loaded && !bound.error && <Loader />}

        {bound.inherited.length > 0 && (
          <div className={styles.group}>
            <p className={styles.label}>От родительских категорий</p>
            {bound.inherited.map((field) => (
              <p key={field.id} className={styles.inherited}>
                {[
                  field.name,
                  attributeTypeLabel(field.type),
                  `из «${field.category_name}»`,
                  field.is_required && "обязательный",
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            ))}
          </div>
        )}

        {bound.loaded && (
          <div className={styles.group}>
            <p className={styles.label}>Свои</p>

            {bound.own.length === 0 && <p className={styles.hint}>Своих атрибутов пока нет.</p>}

            {bound.own.map((item, index) => (
              <OwnAttributeRow
                key={item.attribute.id}
                item={item}
                first={index === 0}
                last={index === bound.own.length - 1}
                onRequired={(isRequired) => bound.setRequired(index, isRequired)}
                onUp={() => bound.move(index, -1)}
                onDown={() => bound.move(index, 1)}
                onRemove={() => bound.remove(index)}
              />
            ))}

            {bound.available.length > 0 ? (
              <div className={styles.add}>
                <Dropdown
                  id={`${id}-add`}
                  className={styles.choice}
                  value={choice}
                  options={bound.available.map((attribute) => ({
                    value: String(attribute.id),
                    label: attribute.name,
                    hint: attributeTypeLabel(attribute.type),
                  }))}
                  placeholder="Выберите атрибут"
                  onChange={setChoice}
                />
                <Button variant="secondary" disabled={!choice} onClick={add}>
                  Добавить
                </Button>
              </div>
            ) : (
              <p className={styles.hint}>
                Все атрибуты уже привязаны. Новые создают в разделе{" "}
                <Link className={styles.link} href={ADMIN_ATTRIBUTES_PATH}>
                  «Атрибуты»
                </Link>
                .
              </p>
            )}
          </div>
        )}

        {bound.error && <Notice tone="error">{bound.error}</Notice>}

        <div className={styles.buttons}>
          <Button
            className={styles.button}
            loading={bound.pending}
            disabled={!bound.loaded}
            onClick={bound.save}
          >
            Сохранить
          </Button>
          <Button className={styles.button} variant="ghost" disabled={bound.pending} onClick={onClose}>
            Отменить
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CategoryAttributesModal;
