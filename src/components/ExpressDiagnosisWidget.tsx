"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export const CALENDLY_URL =
  "https://calendly.com/franquicias_latam/programa_aceleradora_franquicias";

const STORAGE_KEY = "fl_diagnostico_express_v1";
const TOTAL_STEPS = 6;

type BusinessType =
  | "retail"
  | "restaurants"
  | "services"
  | "health"
  | "education";
type OperatingTime = "under1" | "1to3" | "3to7" | "7plus";
type Units = "single" | "2to3" | "4to10" | "10plus";
type RevenueStop = 1 | 2 | 3 | 4 | 5;
type Profitability = "profitable" | "unstable" | "notYet";
type Bottleneck =
  | "sales"
  | "operations"
  | "marketing"
  | "finance"
  | "standardization";
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

type ChatMessage = {
  id: string;
  role: "system" | "user";
  text: string;
};

type Option<T extends string | number> = {
  value: T;
  label: string;
};

type ChipOption = Option<BusinessType | OperatingTime | Units | Profitability | Bottleneck>;

type AccentConfig = {
  selected: string;
  hover: string;
  selectedIcon: string;
};

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
  { value: "education", label: "Educación / Formación" },
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
  { value: 1, label: "< $3k" },
  { value: 2, label: "$3k – $8k" },
  { value: 3, label: "$8k – $15k" },
  { value: 4, label: "$15k – $30k" },
  { value: 5, label: "> $30k" },
];

const PROFITABILITY_OPTIONS: Option<Profitability>[] = [
  { value: "profitable", label: "Rentable (margen positivo estable)" },
  { value: "unstable", label: "Al borde (sube y baja)" },
  { value: "notYet", label: "No rentable todavía" },
];

const BOTTLENECK_OPTIONS: Option<Bottleneck>[] = [
  { value: "sales", label: "Ventas / demanda" },
  { value: "operations", label: "Operaciones (calidad, tiempos, personal)" },
  { value: "marketing", label: "Marketing / marca" },
  { value: "finance", label: "Finanzas / control" },
  { value: "standardization", label: "Estandarización (manuales / procesos)" },
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
  5: 20,
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
  standardization: 0,
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
  standardization: {
    name: "Sprint de Estandarización (4 horas)",
    subtitle: "Documenta y empaqueta procesos para una expansión replicable.",
  },
};

const ACCENT_CONFIGS: AccentConfig[] = [
  {
    selected: "border-[#2860E7] bg-[#2860E7] text-white",
    hover: "hover:border-[#2860E7]/30 hover:bg-[#2860E7]/10 hover:text-[#1f52cc]",
    selectedIcon: "text-white",
  },
  {
    selected: "border-violet-600 bg-violet-600 text-white",
    hover: "hover:border-violet-200 hover:bg-violet-50 hover:text-violet-800",
    selectedIcon: "text-white",
  },
  {
    selected: "border-emerald-600 bg-emerald-600 text-white",
    hover: "hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800",
    selectedIcon: "text-white",
  },
  {
    selected: "border-orange-500 bg-orange-500 text-white",
    hover: "hover:border-orange-200 hover:bg-orange-50 hover:text-orange-800",
    selectedIcon: "text-white",
  },
  {
    selected: "border-amber-500 bg-amber-500 text-slate-900",
    hover: "hover:border-amber-200 hover:bg-amber-50 hover:text-amber-800",
    selectedIcon: "text-slate-900",
  },
];

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

function getAnswerLabel(questionId: QuestionId, answers: DiagnosisAnswers): string | null {
  switch (questionId) {
    case "businessType":
      return findLabel(BUSINESS_TYPE_OPTIONS, answers.businessType);
    case "operatingTime":
      return findLabel(OPERATING_TIME_OPTIONS, answers.operatingTime);
    case "units":
      return findLabel(UNITS_OPTIONS, answers.units);
    case "revenueStop":
      return findLabel(REVENUE_STOPS, answers.revenueStop);
    case "profitability":
      return findLabel(PROFITABILITY_OPTIONS, answers.profitability);
    case "bottleneck":
      return findLabel(BOTTLENECK_OPTIONS, answers.bottleneck);
    default:
      return null;
  }
}

function getChipOptions(questionId: Exclude<QuestionId, "revenueStop">): ChipOption[] {
  switch (questionId) {
    case "businessType":
      return BUSINESS_TYPE_OPTIONS;
    case "operatingTime":
      return OPERATING_TIME_OPTIONS;
    case "units":
      return UNITS_OPTIONS;
    case "profitability":
      return PROFITABILITY_OPTIONS;
    case "bottleneck":
      return BOTTLENECK_OPTIONS;
    default:
      return [];
  }
}

function getAccentConfig(index: number): AccentConfig {
  return ACCENT_CONFIGS[index % ACCENT_CONFIGS.length];
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
    answers.bottleneck === "standardization" ||
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
  const [revenuePreview, setRevenuePreview] = useState<RevenueStop>(3);
  const [whatsapp, setWhatsapp] = useState("");
  const [wantsEmail, setWantsEmail] = useState(false);
  const [email, setEmail] = useState("");

  const transcriptRef = useRef<HTMLDivElement>(null);
  const transitionTimerRef = useRef<number | null>(null);
  const confirmationTimerRef = useRef<number | null>(null);
  const startTimerRef = useRef<number | null>(null);

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
    };
  }, []);

  const transcriptMessages = useMemo<ChatMessage[]>(() => {
    const messages: ChatMessage[] = [];

    for (let i = 0; i < QUESTION_ORDER.length; i += 1) {
      const questionId = QUESTION_ORDER[i];
      const answerLabel = getAnswerLabel(questionId, answers);

      if (answerLabel) {
        messages.push({
          id: `q-${questionId}`,
          role: "system",
          text: QUESTION_PROMPTS[questionId],
        });
        messages.push({
          id: `a-${questionId}`,
          role: "user",
          text: answerLabel,
        });
        continue;
      }

      if (!resultPayload && i === currentStep) {
        messages.push({
          id: `q-${questionId}`,
          role: "system",
          text: QUESTION_PROMPTS[questionId],
        });
      }
      break;
    }

    if (resultPayload) {
      messages.push({
        id: "result-ready",
        role: "system",
        text: resultPayload.isFranchisable
          ? "Resultado listo: tienes perfil franquiciable."
          : "Resultado listo: identificamos áreas claras para fortalecer.",
      });
    }

    return messages;
  }, [answers, currentStep, resultPayload]);

  useEffect(() => {
    const node = transcriptRef.current;
    if (!node) {
      return;
    }

    node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
  }, [transcriptMessages.length, isTransitioning]);

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

  const completeDiagnosis = (completeAnswers: CompleteDiagnosisAnswers) => {
    const payload = computePayload(completeAnswers);
    setResultPayload(payload);
    setShowWhatsAppCapture(false);
    setCurrentStep(TOTAL_STEPS);

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

    if (previousQuestionId === "revenueStop") {
      setRevenuePreview(3);
    }
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
    setRevenuePreview(3);
    setWhatsapp("");
    setWantsEmail(false);
    setEmail("");
  };

  const handleRevenueChange = (value: RevenueStop) => {
    setRevenuePreview(value);
    handleAnswer("revenueStop", value);
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
    <div>
      {!hasStarted && !resultPayload && (
        <div
          className={`rounded-2xl border border-slate-200 bg-gradient-to-br from-[#2860E7]/6 to-white p-5 transition-all duration-200 sm:p-6 ${
            isEnteringQuiz ? "translate-y-1 opacity-0" : "translate-y-0 opacity-100"
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2860E7]">
            DIAGN&Oacute;STICO EXPRESS
          </p>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.7rem]">
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
        <>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Diagn&oacute;stico express
          </p>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            &iquest;TU NEGOCIO ES FRANQUICIABLE?
          </h3>
          <p className="mt-2 text-sm text-slate-700 sm:text-base">
            En menos de 45 segundos te lo decimos.
          </p>

          <div className="mt-5">
            <div className="text-[0.75rem] font-semibold tracking-[0.02em] text-slate-700">
              Paso {visualStep} de {TOTAL_STEPS} &middot; 30 segundos
            </div>
            <div className="mt-2 h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-[#2860E7] transition-all duration-300 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          <div
            ref={transcriptRef}
            className="mt-5 max-h-[260px] space-y-3 overflow-y-auto rounded-xl border border-slate-200/80 bg-white/80 p-4"
          >
            {transcriptMessages.map((message) => (
              <div
                key={message.id}
                className={
                  message.role === "system"
                    ? "max-w-[90%] rounded-2xl rounded-tl-md bg-slate-100 px-4 py-3 text-base font-semibold leading-snug text-slate-900 sm:text-lg"
                    : "ml-auto max-w-[84%] rounded-2xl rounded-tr-md border border-[#2860E7]/20 bg-[#2860E7]/10 px-3 py-2.5 text-sm font-semibold text-[#1f52cc]"
                }
              >
                {message.text}
              </div>
            ))}
          </div>

          {!resultPayload && activeQuestionId && (
            <div
              className={`mt-5 rounded-2xl border border-slate-200 bg-gradient-to-br from-[#2860E7]/5 to-white p-5 transition-all duration-300 ${
                isTransitioning ? "translate-y-1 opacity-0" : "translate-y-0 opacity-100"
              }`}
            >
              {activeQuestionId !== "revenueStop" ? (
                <div className="grid gap-3.5 sm:grid-cols-2">
                  {getChipOptions(activeQuestionId).map((option, index) => {
                    const accent = getAccentConfig(index);
                    const isSelected = pendingSelection === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        aria-pressed={isSelected}
                        disabled={isTransitioning}
                        onClick={() => handleAnswer(activeQuestionId, option.value)}
                        className={`rounded-xl border px-3.5 py-4 text-left text-base font-medium focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(40,96,231,0.25)] ${
                          isSelected
                            ? `scale-105 shadow-md transition-all duration-150 ${accent.selected}`
                            : `border-slate-200 bg-slate-50 text-slate-800 transition-all duration-200 ${accent.hover}`
                        } disabled:cursor-not-allowed disabled:opacity-70`}
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span>{option.label}</span>
                          {isSelected ? (
                            <span className={`text-sm font-semibold ${accent.selectedIcon}`}>✓</span>
                          ) : null}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div>
                  <div className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-base font-semibold text-slate-900">
                    {findLabel(REVENUE_STOPS, revenuePreview)}
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={1}
                    value={revenuePreview}
                    onChange={(event) =>
                      handleRevenueChange(Number(event.currentTarget.value) as RevenueStop)
                    }
                    className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-[#2860E7]"
                    aria-label="Facturación mensual aproximada en USD"
                  />
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {REVENUE_STOPS.map((stop, index) => {
                      const accent = getAccentConfig(index);
                      const isSelectedStop = revenuePreview === stop.value;
                      return (
                        <button
                          key={stop.value}
                          type="button"
                          aria-pressed={isSelectedStop}
                          disabled={isTransitioning}
                          onClick={() => handleRevenueChange(stop.value)}
                          className={`rounded-full border px-4 py-3 text-base font-medium focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(40,96,231,0.25)] ${
                            isSelectedStop
                              ? `scale-105 shadow-md transition-all duration-150 ${accent.selected}`
                              : `border-slate-200 bg-slate-50 text-slate-800 transition-all duration-200 ${accent.hover}`
                          } disabled:cursor-not-allowed disabled:opacity-70`}
                        >
                          {stop.label}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-3 text-sm font-medium text-slate-600">
                    Aprox. en USD. No pedimos n&uacute;meros exactos.
                  </p>
                </div>
              )}

              <p
                className={`mt-3 text-xs font-medium text-[#2860E7] transition-opacity duration-150 ${
                  showConfirmation ? "opacity-100" : "opacity-0"
                }`}
              >
                Perfecto.
              </p>

              <div className="mt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={currentStep === 0 || isTransitioning}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  &larr; Volver
                </button>
                  <span className="text-[0.68rem] text-slate-500">Responde en 1 toque por paso</span>
              </div>
            </div>
          )}
        </>
      )}

      {resultPayload && (
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="flex items-start justify-between gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
              RESULTADO INSTANT&Aacute;NEO
            </p>
            <div className="text-right">
              <p className="text-4xl font-bold leading-none text-[#2860E7]">{resultPayload.score}</p>
              <p className="mt-1 text-sm text-slate-500">/100</p>
              <button
                type="button"
                onClick={handleReset}
                className="mt-2 text-xs font-medium text-slate-500 transition hover:text-slate-900"
              >
                Reiniciar
              </button>
            </div>
          </div>

          <h4 className="mt-3 text-2xl font-bold text-slate-900">
            {resultPayload.isFranchisable
              ? "Tienes perfil franquiciable."
              : "A&uacute;n no est&aacute;s listo para franquiciar."}
          </h4>

          {!resultPayload.isFranchisable && (
            <>
              <p className="mt-3 text-base font-semibold text-slate-900">&Aacute;reas cr&iacute;ticas:</p>
              <ul className="mt-2 space-y-1 text-base text-slate-700">
                {getCriticalAreas(resultPayload.answers).map((area) => (
                  <li key={area}>• {area}</li>
                ))}
              </ul>
            </>
          )}

          {resultPayload.isFranchisable && (
            <p className="mt-2 text-base text-slate-700">
              Tienes base para escalar con m&eacute;todo.
            </p>
          )}

          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
            Siguiente paso recomendado
          </p>
          <p className="mt-2 text-lg font-bold text-slate-900">
            {compactProgramName(resultPayload.recommendedProgram.name)}
          </p>
          <p className="mt-1 text-base text-slate-700">
            Diagn&oacute;stico + Plan 14 d&iacute;as + Entregable accionable
          </p>

          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noreferrer"
            onClick={() => setShowWhatsAppCapture(true)}
            className="mt-4 w-full rounded-xl bg-[#2860E7] px-5 py-4 text-base font-semibold text-white shadow-lg transition-all hover:-translate-y-[1px] hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(40,96,231,0.35)] inline-flex items-center justify-center"
          >
            {resultPayload.isFranchisable
              ? "Agendar siguiente paso →"
              : "Acceder al plan de mejora →"}
          </a>
          <p className="mt-2 text-center text-xs text-slate-500">Cupos limitados por cohorte.</p>

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


    </div>
  );
}
