"use client";

import type { CategoryNode } from "@/entities/category";
import type { ListingOptions } from "@/entities/listing";
import type { ListingForm as ListingFormModel } from "../../model/use-listing-form";
import AttributeFields from "../attribute-fields";
import ContactFields from "../contact-fields";
import FormActions from "../form-actions";
import MainFields from "../main-fields";
import PhotoField from "../photo-field";
import PlaceFields from "../place-fields";
import PriceFields from "../price-fields";
import styles from "./style.module.scss";

type ListingFormProps = {
  form: ListingFormModel;
  options: ListingOptions;
  tree: CategoryNode[];
  onPreview: () => void;
};

/** Форма размещения объявления. Состояние приходит снаружи, чтобы рядом рисовать предпросмотр. */
const ListingForm = ({ form, options, tree, onPreview }: ListingFormProps) => {
  const { state, attributeFields, change, changeKind, changeAttribute, publish, saveDraft } = form;
  const { fields, errors } = state;
  const units = form.categoryUnits ?? options.units.filter((unit) => unit.kind === fields.kind);

  return (
    <div className={styles.form}>
      <MainFields
        fields={fields}
        errors={errors}
        tree={tree}
        onChange={change}
        onKindChange={changeKind}
      />

      {attributeFields.length > 0 && (
        <AttributeFields
          fields={attributeFields}
          values={fields.attributes}
          errors={errors}
          onChange={changeAttribute}
        />
      )}

      <PhotoField
        photos={fields.photos}
        error={errors.photos}
        onChange={(photos) => change({ photos })}
      />

      <section className={styles.section}>
        <PriceFields fields={fields} errors={errors} units={units} onChange={change} />
        <PlaceFields
          fields={fields}
          errors={errors}
          servicePlaces={options.service_places}
          onChange={change}
        />
      </section>

      <ContactFields phone={fields.contactPhone} onChange={change} />

      <FormActions
        state={state}
        editing={form.editing}
        onPublish={publish}
        onSaveDraft={saveDraft}
        onPreview={onPreview}
      />
    </div>
  );
};

export default ListingForm;
