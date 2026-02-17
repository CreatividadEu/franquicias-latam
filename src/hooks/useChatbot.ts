"use client";

import { useReducer, useCallback } from "react";
import { useRouter } from "next/navigation";
import type {
  ChatState,
  ChatAction,
  ChatStep,
  ChatMessage,
} from "@/types";
import type { InvestmentRange, ExperienceLevel } from "@prisma/client";

function createMessage(
  type: "bot" | "user",
  content: string
): ChatMessage {
  return {
    id: crypto.randomUUID(),
    type,
    content,
    timestamp: new Date(),
  };
}

const STEP_ORDER: ChatStep[] = [
  "welcome",
  "sector",
  "investment",
  "country",
  "experience",
  "contact",
  "verification",
  "results",
];

export function getStepNumber(step: ChatStep): number {
  return STEP_ORDER.indexOf(step) + 1;
}

const initialState: ChatState = {
  currentStep: "sector",
  messages: [
    createMessage(
      "bot",
      "Selecciona una o más industrias en las que quieres invertir."
    ),
  ],
  answers: {
    sectors: [],
    investmentRange: null,
    countryId: null,
    experienceLevel: null,
    name: "",
    email: "",
    phone: "",
  },
  isLoading: false,
  error: null,
  results: [],
  verificationSent: false,
  stepHistory: ["sector"],
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "START":
      return {
        ...state,
        currentStep: "sector",
        messages: [
          ...state.messages,
          createMessage("user", "Comenzar"),
          createMessage(
            "bot",
            "Excelente! Primero, selecciona los sectores que te interesan. Puedes elegir mas de uno."
          ),
        ],
      };

    case "SELECT_SECTORS":
      return {
        ...state,
        currentStep: "investment",
        stepHistory: [...state.stepHistory, "investment"],
        answers: { ...state.answers, sectors: action.sectors },
        messages: [
          ...state.messages,
          createMessage("user", action.sectorNames.join(", ")),
          createMessage(
            "bot",
            "Perfecto! Ahora dime, cual es tu rango de inversion disponible en US dollars (USD)?"
          ),
        ],
      };

    case "SELECT_INVESTMENT":
      return {
        ...state,
        currentStep: "country",
        stepHistory: [...state.stepHistory, "country"],
        answers: {
          ...state.answers,
          investmentRange: action.range as InvestmentRange,
        },
        messages: [
          ...state.messages,
          createMessage("user", action.label),
          createMessage(
            "bot",
            "Muy bien! En que pais te gustaria operar tu franquicia?"
          ),
        ],
      };

    case "SELECT_COUNTRY":
      return {
        ...state,
        currentStep: "experience",
        stepHistory: [...state.stepHistory, "experience"],
        answers: { ...state.answers, countryId: action.countryId },
        messages: [
          ...state.messages,
          createMessage("user", action.countryName),
          createMessage(
            "bot",
            "Casi terminamos! Cual es tu nivel de experiencia?"
          ),
        ],
      };

    case "SELECT_EXPERIENCE":
      return {
        ...state,
        currentStep: "contact",
        stepHistory: [...state.stepHistory, "contact"],
        answers: {
          ...state.answers,
          experienceLevel: action.level as ExperienceLevel,
        },
        messages: [
          ...state.messages,
          createMessage("user", action.label),
          createMessage(
            "bot",
            "Genial! Ahora necesito tus datos de contacto para enviarte los resultados."
          ),
        ],
      };

    case "SUBMIT_CONTACT":
      return {
        ...state,
        currentStep: "verification",
        stepHistory: [...state.stepHistory, "verification"],
        answers: {
          ...state.answers,
          name: action.name,
          email: action.email,
          phone: action.phone,
        },
        messages: [
          ...state.messages,
          createMessage("user", `${action.name} - ${action.email}`),
          createMessage(
            "bot",
            `Te enviamos un codigo de verificacion al ${action.phone}. Ingresalo a continuacion.`
          ),
        ],
      };

    case "SMS_SENT":
      return {
        ...state,
        verificationSent: true,
      };

    case "VERIFICATION_SUCCESS":
      return {
        ...state,
        isLoading: true,
        messages: [
          ...state.messages,
          createMessage("user", "Codigo verificado"),
          createMessage("bot", "Verificacion exitosa! Buscando franquicias para ti..."),
        ],
      };

    case "VERIFICATION_FAILED":
      return {
        ...state,
        error: action.error,
        messages: [
          ...state.messages,
          createMessage(
            "bot",
            "El codigo no es correcto. Por favor intenta de nuevo."
          ),
        ],
      };

    case "MATCHES_LOADED":
      return {
        ...state,
        currentStep: "results",
        isLoading: false,
        results: action.results,
        messages: [
          ...state.messages,
          createMessage(
            "bot",
            action.results.length > 0
              ? `Encontramos ${action.results.length} franquicia${action.results.length > 1 ? "s" : ""} para ti! Aqui estan tus resultados:`
              : "Te mostramos las opciones mas cercanas a tu perfil:"
          ),
        ],
      };

    case "SET_LOADING":
      return { ...state, isLoading: action.loading };

    case "SET_ERROR":
      return {
        ...state,
        error: action.error,
        isLoading: false,
      };

    case "GO_BACK": {
      if (state.stepHistory.length <= 1) return state;

      const newHistory = [...state.stepHistory];
      newHistory.pop(); // Remove current step
      const previousStep = newHistory[newHistory.length - 1];

      // Find the last bot message for the previous step in messages
      // We'll remove messages after going back to show clean slate
      const stepIndex = STEP_ORDER.indexOf(previousStep);
      const currentIndex = STEP_ORDER.indexOf(state.currentStep);

      // Calculate how many messages to remove (2 per step: user answer + bot question)
      const messagesToRemove = (currentIndex - stepIndex) * 2;
      const newMessages = state.messages.slice(0, -messagesToRemove);

      return {
        ...state,
        currentStep: previousStep,
        stepHistory: newHistory,
        messages: newMessages,
      };
    }

    default:
      return state;
  }
}

interface UseChatbotOptions {
  initialSectors?: { ids: string[]; names: string[] };
}

function getInitialState(options?: UseChatbotOptions): ChatState {
  if (options?.initialSectors && options.initialSectors.ids.length > 0) {
    return {
      ...initialState,
      currentStep: "investment",
      stepHistory: ["sector", "investment"],
      answers: { ...initialState.answers, sectors: options.initialSectors.ids },
      messages: [
        createMessage("bot", "Selecciona una o más industrias en las que quieres invertir."),
        createMessage("user", options.initialSectors.names.join(", ")),
        createMessage("bot", "Perfecto! Ahora dime, cual es tu rango de inversion disponible en US dollars (USD)?"),
      ],
    };
  }
  return initialState;
}

export function useChatbot(options?: UseChatbotOptions) {
  const router = useRouter();
  const [state, dispatch] = useReducer(chatReducer, options, (opts) => getInitialState(opts));

  const start = useCallback(() => dispatch({ type: "START" }), []);

  const selectSectors = useCallback(
    (sectors: string[], sectorNames: string[]) =>
      dispatch({ type: "SELECT_SECTORS", sectors, sectorNames }),
    []
  );

  const selectInvestment = useCallback(
    (range: InvestmentRange, label: string) =>
      dispatch({ type: "SELECT_INVESTMENT", range, label }),
    []
  );

  const selectCountry = useCallback(
    (countryId: string, countryName: string) =>
      dispatch({ type: "SELECT_COUNTRY", countryId, countryName }),
    []
  );

  const selectExperience = useCallback(
    (level: ExperienceLevel, label: string) =>
      dispatch({ type: "SELECT_EXPERIENCE", level, label }),
    []
  );

  const submitContact = useCallback(
    async (name: string, email: string, phone: string) => {
      dispatch({ type: "SUBMIT_CONTACT", name, email, phone });

      try {
        const res = await fetch("/api/sms/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone }),
        });

        if (!res.ok) {
          const data = await res.json();
          dispatch({
            type: "SET_ERROR",
            error: data.error || "Error enviando SMS",
          });
          return;
        }

        dispatch({ type: "SMS_SENT" });
      } catch {
        dispatch({ type: "SET_ERROR", error: "Error de conexion" });
      }
    },
    []
  );

  const verifyCode = useCallback(
    async (code: string) => {
      dispatch({ type: "SET_LOADING", loading: true });

      try {
        const verifyRes = await fetch("/api/sms/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: state.answers.phone, code }),
        });

        const verifyData = await verifyRes.json().catch(() => ({}));

        if (!verifyRes.ok || !verifyData.verified) {
          dispatch({
            type: "VERIFICATION_FAILED",
            error:
              typeof verifyData.error === "string"
                ? verifyData.error
                : "Codigo invalido",
          });
          dispatch({ type: "SET_LOADING", loading: false });
          return;
        }

        dispatch({ type: "VERIFICATION_SUCCESS" });

        // Create lead and get matches
        const leadRes = await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: state.answers.name,
            email: state.answers.email,
            phone: state.answers.phone,
            sectors: state.answers.sectors,
            investmentRange: state.answers.investmentRange,
            countryId: state.answers.countryId,
            experienceLevel: state.answers.experienceLevel,
          }),
        });

        const leadData = await leadRes.json().catch(() => ({}));

        if (!leadRes.ok) {
          dispatch({
            type: "SET_ERROR",
            error:
              typeof leadData.error === "string"
                ? leadData.error
                : "No se pudo crear tu perfil",
          });
          return;
        }

        if (!Array.isArray(leadData.matches)) {
          dispatch({
            type: "SET_ERROR",
            error: "Respuesta invalida del servidor",
          });
          return;
        }

        if (
          !state.answers.investmentRange ||
          !state.answers.countryId ||
          !state.answers.experienceLevel ||
          state.answers.sectors.length === 0
        ) {
          dispatch({
            type: "SET_ERROR",
            error: "No se pudo reconstruir la busqueda",
          });
          return;
        }

        const params = new URLSearchParams({
          sectors: state.answers.sectors.join(","),
          investmentRange: state.answers.investmentRange,
          countryId: state.answers.countryId,
          experienceLevel: state.answers.experienceLevel,
        });

        router.push(`/results?${params.toString()}`);
      } catch {
        dispatch({ type: "SET_ERROR", error: "Error de conexion" });
      }
    },
    [router, state.answers]
  );

  const goBack = useCallback(() => dispatch({ type: "GO_BACK" }), []);

  return {
    state,
    start,
    selectSectors,
    selectInvestment,
    selectCountry,
    selectExperience,
    submitContact,
    verifyCode,
    goBack,
  };
}
