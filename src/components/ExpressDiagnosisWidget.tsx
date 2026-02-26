"use client";

import { useEffect, useRef, useState } from "react";

export const CALENDLY_URL =
  "https://calendly.com/franquicias_latam/programa_aceleradora_franquicias";

const STORAGE_KEY = "fl_diagnostico_express_v1";
const TOTAL_STEPS = 6;

type BusinessType =
  | "retail"
  | "restaurants"
  | "services"
  | "health";
type OperatingTime = "under1" | "1to3" | "3to7" | "7plus";
type Units = "single" | "2to3" | "4to10" | "10plus";
type RevenueStop = 1 | 2 | 3 | 4;
type Profitability = "profitable" | "unstable" | "notYet";
type Bottleneck = "sales" | "operations" | "marketing" | "finance";
type AnswerValue =
  | BusinessType
  | OperatingTime
  | Units
  | RevenueStop
  | Profitability
  | Bottleneck;

type QuestionId =
  | "businessType"
  | "operatingTime"
  | "units"
  | "revenueStop"
  | "profitability"
  | "bottleneck";

type DiagnosisAnswers = {
  businessType?: BusinessType;
  operatingTime?: OperatingTime;
  units?: Units;
  revenueStop?: RevenueStop;
  profitability?: Profitability;
  bottleneck?: Bottleneck;
};

type CompleteDiagnosisAnswers = {
  businessType: BusinessType;
  operatingTime: OperatingTime;
  units: Units;
  revenueStop: RevenueStop;
  profitability: Profitability;
  bottleneck: Bottleneck;
};

type ProgramRecommendation = {
  name: string;
  subtitle: string;
};

export type DiagnosisPayload = {
  completedAt: string;
  score: 0 | 20 | 40 | 60 | 80 | 100;
  isFranchisable: boolean;
  improvementAreas: string[];
  recommendedProgram: ProgramRecommendation;
  answers: CompleteDiagnosisAnswers;
};

type StoredDiagnosisPayload = DiagnosisPayload & {
  leadCapture?: {
    whatsapp?: string;
    wantsEmail: boolean;
    email?: string;
  };
};

type Option<T extends string | number> = {
  value: T;
  label: string;
};

type ChipOption = Option<
  BusinessType | OperatingTime | Units | RevenueStop | Profitability | Bottleneck
>;

type ExpressDiagnosisWidgetProps = {
  onComplete?: (payload: DiagnosisPayload) => void;
  startDirectly?: boolean;
};

const QUESTION_ORDER: QuestionId[] = [
  "businessType",
  "operatingTime",
  "units",
  "revenueStop",
  "profitability",
  "bottleneck",
];

const QUESTION_PROMPTS: Record<QuestionId, string> = {
  businessType: "¿Qué tipo de negocio operas hoy?",
  operatingTime: "¿Cuánto tiempo llevas operando?",
  units: "¿Cuántas sedes o unidades tienes hoy?",
  revenueStop: "¿En qué rango está tu facturación mensual (USD)?",
  profitability: "Hoy tu negocio es...",
  bottleneck: "¿Cuál es tu principal cuello de botella?",
};

const BUSINESS_TYPE_OPTIONS: Option<BusinessType>[] = [
  { value: "retail", label: "Retail" },
  { value: "restaurants", label: "Restaurantes / Cafés" },
  { value: "services", label: "Servicios" },
  { value: "health", label: "Salud y bienestar" },
];

const OPERATING_TIME_OPTIONS: Option<OperatingTime>[] = [
  { value: "under1", label: "Menos de 1 año" },
  { value: "1to3", label: "1–3 años" },
  { value: "3to7", label: "3–7 años" },
  { value: "7plus", label: "+7 años" },
];

const UNITS_OPTIONS: Option<Units>[] = [
  { value: "single", label: "1 (solo una sede)" },
  { value: "2to3", label: "2–3" },
  { value: "4to10", label: "4–10" },
  { value: "10plus", label: "+10" },
];

const REVENUE_STOPS: Option<RevenueStop>[] = [
  { value: 1, label: "Hasta $5k" },
  { value: 2, label: "$5k–$12k" },
  { value: 3, label: "$12k–$30k" },
  { value: 4, label: "+$30k" },
];

const PROFITABILITY_OPTIONS: Option<Profitability>[] = [
  { value: "profitable", label: "Rentable (margen positivo estable)" },
  { value: "unstable", label: "Al borde (sube y baja)" },
  { value: "notYet", label: "No rentable todavía" },
];

const BOTTLENECK_OPTIONS: Option<Bottleneck>[] = [
  { value: "sales", label: "Ventas" },
  { value: "operations", label: "Operaciones" },
  { value: "marketing", label: "Marketing" },
  { value: "finance", label: "Finanzas" },
];

const TIME_POINTS: Record<OperatingTime, 0 | 20> = {
  under1: 0,
  "1to3": 20,
  "3to7": 20,
  "7plus": 20,
};

const UNITS_POINTS: Record<Units, 0 | 20> = {
  single: 0,
  "2to3": 20,
  "4to10": 20,
  "10plus": 20,
};

const REVENUE_POINTS: Record<RevenueStop, 0 | 20> = {
  1: 0,
  2: 0,
  3: 20,
  4: 20,
};

const PROFITABILITY_POINTS: Record<Profitability, 0 | 20> = {
  profitable: 20,
  unstable: 0,
  notYet: 0,
};

const OPERABILITY_POINTS: Record<Bottleneck, 0 | 20> = {
  sales: 20,
  operations: 0,
  marketing: 20,
  finance: 20,
};

const PROGRAM_MAP: Record<Bottleneck, ProgramRecommendation> = {
  sales: {
    name: "Sprint de Mejora de Ventas (4 horas)",
    subtitle: "Convierte más demanda en cierres con un sistema comercial repetible.",
  },
  marketing: {
    name: "Sprint de Marketing & Demanda (4 horas)",
    subtitle: "Construye tracción con un plan de adquisición claro y medible.",
  },
  finance: {
    name: "Sprint de Optimización Financiera (4 horas)",
    subtitle: "Mejora margen, control y visibilidad para crecer con orden.",
  },
  operations: {
    name: "Sprint de Excelencia Operativa (4 horas)",
    subtitle: "Eleva consistencia operativa para escalar sin perder calidad.",
  },
};

function hasCompleteAnswers(answers: DiagnosisAnswers): answers is CompleteDiagnosisAnswers {
  return QUESTION_ORDER.every((questionId) => answers[questionId] !== undefined);
}

function findLabel<T extends string | number>(
  options: Option<T>[],
  value: T | undefined,
): string | null {
  if (value === undefined) {
    return null;
  }

  return options.find((option) => option.value === value)?.label ?? null;
}

function getQuestionOptions(questionId: QuestionId): ChipOption[] {
  switch (questionId) {
    case "businessType":
      return BUSINESS_TYPE_OPTIONS;
    case "operatingTime":
      return OPERATING_TIME_OPTIONS;
    case "units":
      return UNITS_OPTIONS;
    case "revenueStop":
      return REVENUE_STOPS;
    case "profitability":
      return PROFITABILITY_OPTIONS;
    case "bottleneck":
      return BOTTLENECK_OPTIONS;
    default:
      return [];
  }
}

function computePayload(answers: CompleteDiagnosisAnswers): DiagnosisPayload {
  const score = (TIME_POINTS[answers.operatingTime] +
    UNITS_POINTS[answers.units] +
    REVENUE_POINTS[answers.revenueStop] +
    PROFITABILITY_POINTS[answers.profitability] +
    OPERABILITY_POINTS[answers.bottleneck]) as 0 | 20 | 40 | 60 | 80 | 100;

  const bottleneckArea = findLabel(BOTTLENECK_OPTIONS, answers.bottleneck) ?? "Cuello de botella";

  const improvementAreas: string[] = [bottleneckArea];
  if (answers.profitability !== "profitable") {
    improvementAreas.push("Rentabilidad y estructura de costos");
  }
  if (answers.revenueStop <= 2) {
    improvementAreas.push("Impulso comercial (volumen y ticket)");
  }
  if (answers.units === "single") {
    improvementAreas.push("Replicabilidad multi-sede");
  }

  return {
    completedAt: new Date().toISOString(),
    score,
    isFranchisable: score >= 80,
    improvementAreas: Array.from(new Set(improvementAreas)).slice(0, 3),
    recommendedProgram: PROGRAM_MAP[answers.bottleneck],
    answers,
  };
}

function getCriticalAreas(answers: CompleteDiagnosisAnswers): string[] {
  const areas: string[] = [];

  if (
    answers.bottleneck === "operations" ||
    answers.units === "single"
  ) {
    areas.push("Estandarización");
  }

  if (answers.profitability !== "profitable" || answers.bottleneck === "finance") {
    areas.push("Rentabilidad");
  }

  if (
    answers.revenueStop <= 2 ||
    answers.bottleneck === "sales" ||
    answers.bottleneck === "marketing"
  ) {
    areas.push("Tracción comercial");
  }

  if (areas.length === 0) {
    areas.push("Estandarización");
  }

  return Array.from(new Set(areas)).slice(0, 3);
}

function getFocusAreas(answers: CompleteDiagnosisAnswers): string[] {
  const mapped = getCriticalAreas(answers).map((area) =>
    area === "Tracción comercial" ? "Tracción" : area,
  );
  const unique = Array.from(new Set(mapped));
  const defaults = ["Estandarización", "Tracción"];

  for (const fallback of defaults) {
    if (!unique.includes(fallback) && unique.length < 2) {
      unique.push(fallback);
    }
  }

  return unique.slice(0, 2);
}

function compactProgramName(name: string): string {
  return name.replace("(4 horas)", "(4h)");
}

export function ExpressDiagnosisWidget({
  onComplete,
  startDirectly = false,
}: ExpressDiagnosisWidgetProps) {
  const [hasStarted, setHasStarted] = useState(startDirectly);
  const [isEnteringQuiz, setIsEnteringQuiz] = useState(false);
  const [answers, setAnswers] = useState<DiagnosisAnswers>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [resultPayload, setResultPayload] = useState<DiagnosisPayload | null>(null);
  const [pendingSelection, setPendingSelection] = useState<AnswerValue | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showWhatsAppCapture, setShowWhatsAppCapture] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [whatsapp, setWhatsapp] = useState("");
  const [wantsEmail, setWantsEmail] = useState(false);
  const [email, setEmail] = useState("");

  const transitionTimerRef = useRef<number | null>(null);
  const confirmationTimerRef = useRef<number | null>(null);
  const startTimerRef = useRef<number | null>(null);
  const celebrationTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current !== null) {
        window.clearTimeout(transitionTimerRef.current);
      }
      if (confirmationTimerRef.current !== null) {
        window.clearTimeout(confirmationTimerRef.current);
      }
      if (startTimerRef.current !== null) {
        window.clearTimeout(startTimerRef.current);
      }
      if (celebrationTimerRef.current !== null) {
        window.clearTimeout(celebrationTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!resultPayload || typeof window === "undefined") {
      return;
    }

    const stored: StoredDiagnosisPayload = {
      ...resultPayload,
      leadCapture: {
        whatsapp: whatsapp.trim() || undefined,
        wantsEmail,
        email: wantsEmail ? email.trim() || undefined : undefined,
      },
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  }, [resultPayload, whatsapp, wantsEmail, email]);

  const activeQuestionId = resultPayload ? null : QUESTION_ORDER[currentStep];
  const visualStep = resultPayload ? TOTAL_STEPS : Math.min(currentStep + 1, TOTAL_STEPS);
  const progressPercentage = (visualStep / TOTAL_STEPS) * 100;
  const focusAreas = resultPayload ? getFocusAreas(resultPayload.answers) : [];

  const completeDiagnosis = (completeAnswers: CompleteDiagnosisAnswers) => {
    const payload = computePayload(completeAnswers);
    setResultPayload(payload);
    setShowWhatsAppCapture(false);
    setCurrentStep(TOTAL_STEPS);
    if (typeof window !== "undefined") {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setShowCelebration(false);
      } else {
        if (celebrationTimerRef.current !== null) {
          window.clearTimeout(celebrationTimerRef.current);
        }
        setShowCelebration(true);
        celebrationTimerRef.current = window.setTimeout(() => {
          setShowCelebration(false);
        }, 1200);
      }
    }

    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      window.dispatchEvent(
        new CustomEvent<DiagnosisPayload>("fl:diagnosis_complete", { detail: payload }),
      );
    }

    onComplete?.(payload);
  };

  const advanceWithTransition = (callback: () => void) => {
    setIsTransitioning(true);
    if (transitionTimerRef.current !== null) {
      window.clearTimeout(transitionTimerRef.current);
    }

    transitionTimerRef.current = window.setTimeout(() => {
      callback();
      setIsTransitioning(false);
    }, 150);
  };

  const handleAnswer = (
    questionId: QuestionId,
    value: AnswerValue,
  ) => {
    if (isTransitioning || resultPayload) {
      return;
    }

    if (confirmationTimerRef.current !== null) {
      window.clearTimeout(confirmationTimerRef.current);
    }

    setShowConfirmation(true);
    confirmationTimerRef.current = window.setTimeout(() => {
      setShowConfirmation(false);
    }, 120);

    setPendingSelection(value);
    advanceWithTransition(() => {
      const nextAnswers = { ...answers, [questionId]: value } as DiagnosisAnswers;
      const nextStep = Math.min(currentStep + 1, TOTAL_STEPS);

      setAnswers(nextAnswers);
      setCurrentStep(nextStep);
      setPendingSelection(null);
      setShowConfirmation(false);

      if (nextStep === TOTAL_STEPS && hasCompleteAnswers(nextAnswers)) {
        completeDiagnosis(nextAnswers);
      }
    });
  };

  const handleBack = () => {
    if (isTransitioning || resultPayload || currentStep === 0) {
      return;
    }

    const previousStep = currentStep - 1;
    const previousQuestionId = QUESTION_ORDER[previousStep];
    const nextAnswers: DiagnosisAnswers = { ...answers };
    delete nextAnswers[previousQuestionId];

    setAnswers(nextAnswers);
    setCurrentStep(previousStep);
    setPendingSelection(null);
    setShowConfirmation(false);
  };

  const handleReset = () => {
    if (transitionTimerRef.current !== null) {
      window.clearTimeout(transitionTimerRef.current);
    }
    if (confirmationTimerRef.current !== null) {
      window.clearTimeout(confirmationTimerRef.current);
    }
    if (startTimerRef.current !== null) {
      window.clearTimeout(startTimerRef.current);
    }

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }

    setHasStarted(startDirectly);
    setIsEnteringQuiz(false);
    setAnswers({});
    setCurrentStep(0);
    setIsTransitioning(false);
    setResultPayload(null);
    setShowWhatsAppCapture(false);
    setPendingSelection(null);
    setShowConfirmation(false);
    setShowCelebration(false);
    setWhatsapp("");
    setWantsEmail(false);
    setEmail("");
  };

  const handleStart = () => {
    if (hasStarted || isEnteringQuiz) {
      return;
    }

    if (startTimerRef.current !== null) {
      window.clearTimeout(startTimerRef.current);
    }

    setIsEnteringQuiz(true);
    startTimerRef.current = window.setTimeout(() => {
      setHasStarted(true);
      setIsEnteringQuiz(false);
    }, 180);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      {!hasStarted && !resultPayload && (
        <div
          className={`rounded-2xl border border-slate-200 bg-gradient-to-br from-[#2860E7]/6 to-white p-5 transition-all duration-200 sm:p-6 ${
            isEnteringQuiz ? "translate-y-1 opacity-0" : "translate-y-0 opacity-100"
          }`}
        >
          <h3 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.7rem]">
            Obt&eacute;n tu score de escalabilidad
          </h3>
          <p className="mt-3 text-sm text-slate-700 sm:text-base">
            En menos de 45 segundos te diremos si tu negocio tiene perfil franquiciable &mdash; y
            el siguiente paso recomendado.
          </p>

          <ul className="mt-5 space-y-2">
            {[
              "Score 0–100 (resultado claro)",
              "Áreas de mejora detectadas",
              "Recomendación del programa ideal",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm font-medium text-slate-800">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#2860E7]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <p className="mt-4 text-sm font-medium text-slate-700">Cupos limitados por cohorte.</p>

          <button
            type="button"
            onClick={handleStart}
            disabled={isEnteringQuiz}
            className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-[#FF6A2B] px-5 py-4 text-base font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#E85C20] hover:shadow-xl active:bg-[#CC4F17] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-400/40 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Aplicar al Programa &rarr;
          </button>


        </div>
      )}

      {hasStarted && !resultPayload && (
        <div className="mt-1 flex min-h-0 flex-1 flex-col">
          <div className="mb-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 0 || isTransitioning}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span aria-hidden="true">&larr;</span>
              <span>Volver</span>
            </button>
            <span className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Paso {visualStep} de {TOTAL_STEPS}
            </span>
          </div>
          <h3 className="text-xl font-bold leading-tight tracking-tight text-slate-900 sm:text-[1.35rem]">
            &iquest;TU NEGOCIO ES FRANQUICIABLE?
          </h3>
          <p className="mt-1.5 text-sm text-slate-700 sm:text-base">
            Responde una pregunta por paso.
          </p>

          <div className="mt-4 h-2 rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-[#2860E7] transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {activeQuestionId && (
            <div className="mt-4 min-h-0 flex-1 overflow-y-auto">
              <div
                className={`rounded-2xl border border-slate-200 bg-gradient-to-br from-[#2860E7]/5 to-white p-5 transition-all duration-300 ${
                  isTransitioning ? "translate-y-1 opacity-0" : "translate-y-0 opacity-100"
                }`}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Pregunta actual
                </p>
                <p className="mt-1.5 text-base font-semibold text-slate-900 sm:text-lg">
                  {QUESTION_PROMPTS[activeQuestionId]}
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {getQuestionOptions(activeQuestionId).map((option) => {
                    const isSelected = pendingSelection === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        aria-pressed={isSelected}
                        disabled={isTransitioning}
                        onClick={() => handleAnswer(activeQuestionId, option.value)}
                        className={`rounded-xl border px-4 py-3.5 text-left text-sm font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(40,96,231,0.22)] sm:text-base ${
                          isSelected
                            ? "border-[#2860E7]/40 bg-[#2860E7]/10 text-[#1f52cc] shadow-sm ring-1 ring-[#2860E7]/15"
                            : "border-slate-300 bg-white text-slate-800 shadow-sm hover:border-slate-400 hover:bg-slate-50"
                        } disabled:cursor-not-allowed disabled:opacity-70`}
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span>{option.label}</span>
                          {isSelected ? <span className="text-sm font-semibold">✓</span> : null}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {activeQuestionId === "revenueStop" ? (
                  <p className="mt-3 text-sm font-medium text-slate-600">
                    Selecciona el rango m&aacute;s cercano en USD.
                  </p>
                ) : null}

                <p
                  className={`mt-3 text-xs font-medium text-[#2860E7] transition-opacity duration-150 ${
                    showConfirmation ? "opacity-100" : "opacity-0"
                  }`}
                >
                  Perfecto.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {resultPayload && (
        <div className="relative mt-5 rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
          {showCelebration && (
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-16 overflow-hidden">
              {Array.from({ length: 9 }).map((_, index) => (
                <span
                  key={`celebration-${index}`}
                  className={`celebration-dot absolute h-1.5 w-1.5 rounded-full ${
                    index % 3 === 0
                      ? "bg-[#2860E7]/75"
                      : index % 3 === 1
                        ? "bg-emerald-400/80"
                        : "bg-orange-400/80"
                  }`}
                  style={{
                    left: `${10 + index * 9}%`,
                    animationDelay: `${index * 0.05}s`,
                  }}
                />
              ))}
            </div>
          )}
          <div className="flex items-start justify-between gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
              RESULTADO INSTANT&Aacute;NEO
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-semibold text-slate-500 transition hover:text-slate-900"
            >
              Reiniciar
            </button>
          </div>

          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#2860E7]/20 bg-[#2860E7]/10 px-3 py-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2860E7]">
              Score
            </span>
            <span className="text-lg font-bold leading-none text-[#1f52cc]">
              {resultPayload.score}/100
            </span>
          </div>

          <h4 className="mt-3 text-[26px] font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
            {resultPayload.isFranchisable
              ? "Listo para escalar, pero con ajustes."
              : "Necesitas 2 ajustes clave para escalar."}
          </h4>
          <p className="mt-1.5 text-base text-slate-700">
            Te decimos exactamente d&oacute;nde enfocar el esfuerzo para avanzar m&aacute;s
            r&aacute;pido.
          </p>

          <ul className="mt-4 space-y-2 text-base font-semibold text-slate-800">
            {focusAreas.map((focus) => (
              <li key={focus} className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#2860E7]" />
                <span>{focus}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 rounded-xl border border-slate-200 bg-white/80 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              SIGUIENTE PASO RECOMENDADO
            </p>
            <p className="mt-1 text-lg font-bold text-slate-900">
              {compactProgramName(resultPayload.recommendedProgram.name)}
            </p>
            <p className="mt-1 text-sm text-slate-600">Plan + m&eacute;tricas + pr&oacute;ximos 14 d&iacute;as</p>
          </div>

          <div className="mt-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Qu&eacute; sigue
            </p>
            <div className="mt-2 grid grid-cols-3 gap-2 text-xs font-semibold text-slate-700">
              <span className="rounded-lg border border-slate-200 bg-white/80 px-2.5 py-2 text-center">
                Diagn&oacute;stico
              </span>
              <span className="rounded-lg border border-slate-200 bg-white/80 px-2.5 py-2 text-center">
                Plan acci&oacute;n
              </span>
              <span className="rounded-lg border border-slate-200 bg-white/80 px-2.5 py-2 text-center">
                Implementaci&oacute;n
              </span>
            </div>
          </div>

          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noreferrer"
            onClick={() => setShowWhatsAppCapture(true)}
            className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-[#2860E7] px-5 py-[0.95rem] text-base font-semibold text-white shadow-lg transition-all hover:-translate-y-[1px] hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(40,96,231,0.35)]"
          >
            Agendar siguiente paso
          </a>
          <p className="mt-2 text-center text-sm text-slate-600">Cupos limitados por cohorte.</p>

          {showWhatsAppCapture && (
            <div className="mt-4 animate-in fade-in duration-200 rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-sm font-semibold text-slate-900">
                &iquest;Te enviamos el roadmap por WhatsApp?
              </p>
              <input
                type="tel"
                value={whatsapp}
                onChange={(event) => setWhatsapp(event.currentTarget.value)}
                placeholder="+57..."
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-[#2860E7] focus:outline-none focus:ring-4 focus:ring-[rgba(40,96,231,0.14)]"
              />
              <label className="mt-3 flex items-center gap-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={wantsEmail}
                  onChange={(event) => setWantsEmail(event.currentTarget.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[#2860E7] focus:ring-[#2860E7]"
                />
                Tambi&eacute;n quiero recibirlo por email (opcional)
              </label>
              {wantsEmail && (
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.currentTarget.value)}
                  placeholder="tu@email.com"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-[#2860E7] focus:outline-none focus:ring-4 focus:ring-[rgba(40,96,231,0.14)]"
                />
              )}
            </div>
          )}
        </div>
      )}


      <style jsx>{`
        .celebration-dot {
          top: 8px;
          animation: confetti-fall 1.2s ease-out forwards;
        }

        @keyframes confetti-fall {
          0% {
            opacity: 0;
            transform: translateY(0) scale(0.7);
          }
          12% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateY(48px) scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .celebration-dot {
            animation: none !important;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
