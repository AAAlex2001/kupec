export type UnitKind = "product" | "service";

export type Unit = {
  id: number;
  code: string;
  label: string;
  kind: UnitKind;
};

export type CategoryUnits = {
  own: Unit[];
  inherited: Unit[];
  inherited_from: string | null;
};

export type UnitCreatePayload = {
  code: string;
  label: string;
  kind: UnitKind;
};
