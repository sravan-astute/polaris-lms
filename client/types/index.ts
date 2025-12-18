export type QuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';

export interface Option {
  id?: string;        // Optional for new options not yet saved
  text: string;
  isCorrect: boolean;
  feedback?: string;
}

export interface Question {
  id?: string;        // Optional for new questions
  text: string;       // HTML supported (for Math/ELA)
  type: QuestionType;
  points: number;
  options: Option[];
  organizationId: string;
}