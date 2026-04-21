export interface Company {
  name: string;
  instagram: string;
  website: string;
}

export interface OptionScores {
  F: number;
  A: number;
  D: number;
}

export interface QuestionOption {
  label: string;
  value: string;
  scores: OptionScores;
}

export interface Question {
  id: string;
  text: string;
  sub: string;
  dimension: string;
  options: QuestionOption[];
}

export interface Scores {
  F: number;
  A: number;
  D: number;
  _radar: number[];
}

export type ProgramKey = 'F' | 'A' | 'D';

export type Screen = 'intro' | 'company' | 'question' | 'processing' | 'results';

export type Answers = Record<string, string>;

export interface IntelReview {
  text: string;
  rating: number;
  source: string;
  sentiment: 'positive' | 'negative' | 'mixed';
}

export interface IntelData {
  business_type: string;
  reviews: IntelReview[];
  signals: string[];
  digital_summary: string;
}

export interface DxState {
  screen: Screen;
  qIdx: number;
  answers: Answers;
  scores: Scores;
  company: Company;
}
