export type PointId =
  | "chapinero"
  | "usaquen"
  | "cedritos"
  | "salitre"
  | "kennedy"
  | "medellin-poblado"
  | "medellin-laureles"
  | "cali-granada"
  | "barranquilla"
  | "bucaramanga";

export type NarrativeFlag =
  | "star"
  | "wait-problem"
  | "ramping"
  | "food-cost"
  | "second-best"
  | "steady";

export type DailyRecord = {
  date: string;
  revenue: number;
  tickets: number;
  avgTicket: number;
  foodCostPct: number;
  laborCostPct: number;
  nps: number;
  waitTimeAvg: number;
  occupancyPct: number;
  staffCount: number;
  positionsOpen: number;
};

export type Point = {
  id: PointId;
  name: string;
  city: string;
  manager: string;
  openedAt: string;
  capacity: number;
  flag: NarrativeFlag;
  headline: string;
  daily: DailyRecord[];
};

export type Role =
  | "Cocinero"
  | "Mesero"
  | "Cajero"
  | "Anfitrión"
  | "Gerente de punto";

export type CandidateStatus =
  | "sourced"
  | "contacted"
  | "interviewing"
  | "hired"
  | "rejected";

export type ChatMessage = {
  from: "bot" | "candidate";
  text: string;
  at: string;
};

export type Candidate = {
  id: string;
  name: string;
  city: string;
  role: Role;
  aiScore: number;
  status: CandidateStatus;
  lastTouch: string;
  pointPreference: PointId;
  conversation?: ChatMessage[];
};

export type Competency = "Servicio" | "Bar" | "Cocina" | "Caja" | "Celebraciones";

export type TrainingModule = {
  id: string;
  title: string;
  competency: Competency;
  pointId: PointId;
  generatedAt: string;
  durationMin: number;
};

export type AlertSeverity = "high" | "medium" | "low";

export type Alert = {
  id: string;
  pointId: PointId;
  severity: AlertSeverity;
  title: string;
  detail: string;
  suggestedModule: "talento" | "academia" | "pulso" | "finanzas";
  createdAt: string;
};

export type VoCSentiment = "positive" | "neutral" | "negative";

export type VoCEvent = {
  id: string;
  pointId: PointId;
  sentiment: VoCSentiment;
  topic: string;
  excerpt: string;
  at: string;
};
