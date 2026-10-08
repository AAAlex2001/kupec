export type InfoSection = {
  id: string;
  title: string;
  intro: string;
  steps: string[];
  tip?: string;
};

export type InfoQuestion = {
  question: string;
  answer: string;
};

export type InfoPageContent = {
  title: string;
  lead: string;
  sections: InfoSection[];
  questions: InfoQuestion[];
};
