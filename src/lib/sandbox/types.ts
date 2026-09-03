/**
 * Tipos compartidos entre server y cliente del Sandbox. `SandboxClientSession`
 * es TODO lo que la ruta pública recibe (§8): marca de la sesión + preload
 * validado + take-homes ya guardados. Nunca assets, PIN ni inputs del admin.
 */
import type { AccentResolution } from "./color";
import type { SandboxLocale } from "./i18n";
import type {
  ReadinessScores,
  RouteMilestone,
  SandboxPreloadData,
} from "./schemas";

export type SandboxSectorId = "restaurante" | "retail" | "servicios" | "otro";
export type SandboxStatusId = "draft" | "ready" | "live" | "done" | "archived";

export type SandboxResultData = {
  readinessScores: ReadinessScores | null;
  headline: string | null;
  route: RouteMilestone[] | null;
  financials: unknown;
  chosenPain: unknown;
  chosenIdea: unknown;
  manual: unknown;
  legalChecklist: unknown;
  sentToEmail: string | null;
};

export type SandboxClientSession = {
  slug: string;
  brandName: string;
  sector: SandboxSectorId;
  country: string;
  city: string | null;
  logoUrl: string | null;
  accent: AccentResolution;
  consultantName: string | null;
  locale: SandboxLocale;
  status: SandboxStatusId;
  scheduledAt: string | null;
  preload: SandboxPreloadData | null;
  result: SandboxResultData | null;
};

/** Tipos de evento del log append-only (M1). Las fases añaden los suyos. */
export type SandboxEventType =
  | "session_open"
  | "phase_enter"
  | "phase_complete"
  | "locale_change"
  | "pin_ok"
  | "pin_fail"
  | "report_email";
