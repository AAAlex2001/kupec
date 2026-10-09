import { attributeTypeLabel } from "@/entities/attribute";
import Button from "@/shared/ui/button";
import Checkbox from "@/shared/ui/checkbox";
import { ChevronDownIcon, ChevronUpIcon, CloseIcon } from "@/shared/ui/icons";
import type { OwnAttribute } from "../../model/use-category-attributes";
import styles from "./style.module.scss";

type OwnAttributeRowProps = {
  item: OwnAttribute;
  first: boolean;
  last: boolean;
  onRequired: (isRequired: boolean) => void;
  onUp: () => void;
  onDown: () => void;
  onRemove: () => void;
};

/** Свой атрибут категории: обязательность, порядок и «убрать». */
const OwnAttributeRow = ({
  item,
  first,
  last,
  onRequired,
  onUp,
  onDown,
  onRemove,
}: OwnAttributeRowProps) => (
  <div className={styles.row}>
    <div className={styles.info}>
      <p className={styles.name}>{item.attribute.name}</p>
      <p className={styles.type}>{attributeTypeLabel(item.attribute.type)}</p>
    </div>

    <Checkbox checked={item.isRequired} onChange={onRequired}>
      Обязательный
    </Checkbox>

    <div className={styles.buttons}>
      <Button variant="ghost" size="icon" ariaLabel="Выше" disabled={first} onClick={onUp}>
        <ChevronUpIcon />
      </Button>
      <Button variant="ghost" size="icon" ariaLabel="Ниже" disabled={last} onClick={onDown}>
        <ChevronDownIcon />
      </Button>
      <Button
        variant="danger"
        size="icon"
        ariaLabel={`Убрать «${item.attribute.name}»`}
        onClick={onRemove}
      >
        <CloseIcon />
      </Button>
    </div>
  </div>
);

export default OwnAttributeRow;
