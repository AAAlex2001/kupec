export type AttributeType = "number" | "select" | "multiselect" | "boolean" | "text";

export type AttributeOption = {
  id: number;
  value: string;
  label: string;
};

export type Attribute = {
  id: number;
  slug: string;
  name: string;
  type: AttributeType;
  unit: string | null;
  is_filterable: boolean;
  options: AttributeOption[];
};

export type CategoryField = Attribute & {
  is_required: boolean;
};

export type InheritedField = CategoryField & {
  category_name: string;
};

export type CategoryAttributes = {
  own: CategoryField[];
  inherited: InheritedField[];
};

export type AttributeValue = number | string | string[] | boolean;

export type AttributeValues = Record<string, AttributeValue>;

export type AttributeOptionPayload = {
  id: number | null;
  value: string;
  label: string;
};

export type AttributeUpdatePayload = {
  name: string;
  unit: string | null;
  is_filterable: boolean;
  options: AttributeOptionPayload[];
};

export type AttributeCreatePayload = AttributeUpdatePayload & {
  slug: string;
  type: AttributeType;
};

export type CategoryAttributeItem = {
  attribute_id: number;
  is_required: boolean;
};
