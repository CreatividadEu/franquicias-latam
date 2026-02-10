import type { InvestmentRange, ExperienceLevel } from "@prisma/client";

export type ChatStep =
  | "welcome"
  | "sector"
  | "investment"
  | "country"
  | "experience"
  | "contact"
  | "verification"
  | "results";

export interface ChatMessage {
  id: string;
  type: "bot" | "user";
  content: string;
  timestamp: Date;
}

export interface ChatAnswers {
  sectors: string[];
  investmentRange: InvestmentRange | null;
  countryId: string | null;
  experienceLevel: ExperienceLevel | null;
  name: string;
  email: string;
  phone: string;
}

export interface ChatState {
  currentStep: ChatStep;
  messages: ChatMessage[];
  answers: ChatAnswers;
  isLoading: boolean;
  error: string | null;
  results: MatchedFranchise[];
  verificationSent: boolean;
  stepHistory: ChatStep[];
}

export type ChatAction =
  | { type: "START" }
  | { type: "SELECT_SECTORS"; sectors: string[]; sectorNames: string[] }
  | { type: "SELECT_INVESTMENT"; range: InvestmentRange; label: string }
  | { type: "SELECT_COUNTRY"; countryId: string; countryName: string }
  | { type: "SELECT_EXPERIENCE"; level: ExperienceLevel; label: string }
  | { type: "SUBMIT_CONTACT"; name: string; email: string; phone: string }
  | { type: "SMS_SENT" }
  | { type: "VERIFICATION_SUCCESS" }
  | { type: "VERIFICATION_FAILED"; error: string }
  | { type: "MATCHES_LOADED"; results: MatchedFranchise[] }
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "SET_ERROR"; error: string }
  | { type: "GO_BACK" };

export interface MatchedFranchise {
  id: string;
  name: string;
  description: string;
  logo: string | null;
  investmentMin: number;
  investmentMax: number;
  sectorName: string;
  sectorEmoji: string;
  score: number;
}

export interface SectorOption {
  id: string;
  name: string;
  slug: string;
  emoji: string;
}

export interface CountryOption {
  id: string;
  name: string;
  code: string;
  phoneCode: string;
  flag: string;
}

export interface LeadWithMatches {
  id: string;
  name: string;
  email: string;
  phone: string;
  phoneVerified: boolean;
  country: CountryOption;
  sectors: SectorOption[];
  investmentRange: InvestmentRange;
  experienceLevel: ExperienceLevel;
  viewed: boolean;
  createdAt: string;
  matches: {
    franchise: {
      id: string;
      name: string;
      logo: string | null;
      sectorName: string;
    };
    score: number;
    contacted: boolean;
  }[];
}

export interface DashboardStats {
  totalLeads: number;
  leadsThisMonth: number;
  unviewedLeads: number;
}
