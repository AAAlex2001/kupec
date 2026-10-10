export type LegalSection = {
  id: string;
  title: string;
  paragraphs: string[];
};

export type LegalDocument = {
  title: string;
  description: string;
  path: string;
  cover: "terms" | "privacy" | "personalData";
  sections: LegalSection[];
};
