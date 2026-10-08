"use client";

import type { ListingOptions } from "@/entities/listing";
import type { ListingForm as ListingFormModel } from "../../model/use-listing-form";
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
  onPreview: () => void;
};

/** Форма размещения объявления. Состояние приходит снаружи, чтобы рядом рисовать предпросмотр. */
const ListingForm = ({ form, options, onPreview }: ListingFormProps) => {
  const { state, change, changeKind, publish, saveDraft } = form;
  const { fields, errors } = state;

  return (
    <div className={styles.form}>
      <MainFields
        fields={fields}
        errors={errors}
        categories={options.categories}
        onChange={change}
        onKindChange={changeKind}
      />

      <PhotoField
        photos={fields.photos}
        error={errors.photos}
        onChange={(photos) => change({ photos })}
      />

      <section className={styles.section}>
        <PriceFields fields={fields} errors={errors} units={options.units} onChange={change} />
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
