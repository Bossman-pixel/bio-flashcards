export type CardPart = {
  label: string;
  text: string;
  marks: number | null;
};

export type Card = {
  id: string;
  paperCode: string;
  year: number;
  session: string;
  variant: string;
  sessionLabel: string;
  variantLabel: string;
  questionNumber: number;
  questionText: string;
  parts: CardPart[];
  totalMarks: number;
  markscheme: string;
  markschemeParts: CardPart[];
  sourceQp: string;
  sourceMs: string;
  sourceQpUrl: string;
  sourceMsUrl: string;
  topics?: string[];
};

export type SrState = {
  ease: number;
  interval: number;
  reps: number;
  lapses: number;
  due: number;
  lastSeen: number | null;
};

export type Rating = "again" | "hard" | "good" | "easy";
