"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, CalendarDays, FileText, Mail, ArrowRight } from "lucide-react";
import type { ChatbotData } from "@/lib/franchise-mapper";

// ── Decision tree ─────────────────────────────────────────────────────────────

type NodeOption = {
  label: string;
  nextNodeId?: string;
  result?: Result;
};

type TreeNode = {
  id: string;
  question: string;
  options: NodeOption[];
};

type Result = {
  score: "alta" | "media" | "baja";
  message: string;
  ctaType: "book_call" | "download_brochure" | "contact_form";
};

const DECISION_TREE: TreeNode[] = [
  {
    id: "q1",
    question: "¿Cuál es tu capacidad de inversión disponible?",
    options: [
      { label: "Menos de $50,000 USD", nextNodeId: "q1_low" },
      { label: "$50,000 – $150,000 USD", nextNodeId: "q2" },
      { label: "$150,000 – $500,000 USD", nextNodeId: "q2" },
      { label: "Más de $500,000 USD", nextNodeId: "q2_high" },
    ],
  },
  {
    id: "q1_low",
    question: "¿Estás considerando financiamiento externo para complementar tu inversión?",
    options: [
      { label: "Sí, tengo acceso a crédito o socios", nextNodeId: "q2" },
      {
        label: "No, mi capital disponible es ese",
        result: {
          score: "baja",
          message: "Tu perfil de inversión está por debajo del rango mínimo de la mayoría de nuestros modelos. Te recomendamos explorar opciones de financiamiento antes de avanzar.",
          ctaType: "contact_form",
        },
      },
    ],
  },
  {
    id: "q2_high",
    question: "Con ese capital, ¿estás interesado en abrir múltiples unidades o un master?",
    options: [
      { label: "Sí, busco escala o master franquicia", nextNodeId: "q3" },
      { label: "Por ahora una unidad, luego escalar", nextNodeId: "q3" },
    ],
  },
  {
    id: "q2",
    question: "¿Tienes experiencia previa en franquicias o negocios propios?",
    options: [
      { label: "Tengo una o más franquicias activas", nextNodeId: "q3" },
      { label: "Tuve un negocio propio anteriormente", nextNodeId: "q3" },
      { label: "Es mi primera vez como emprendedor", nextNodeId: "q3" },
    ],
  },
  {
    id: "q3",
    question: "¿En qué sector te interesa invertir?",
    options: [
      { label: "Alimentos y bebidas", nextNodeId: "q4" },
      { label: "Retail y moda", nextNodeId: "q4" },
      { label: "Salud y bienestar", nextNodeId: "q4" },
      { label: "Servicios y tecnología", nextNodeId: "q4" },
    ],
  },
  {
    id: "q4",
    question: "¿En qué plazo planeas tomar una decisión de inversión?",
    options: [
      {
        label: "En los próximos 1–3 meses",
        result: {
          score: "alta",
          message: "Tu perfil encaja muy bien con nuestro modelo. Tienes capital, timing y disposición. El siguiente paso es una llamada directa con el equipo de franquicia.",
          ctaType: "book_call",
        },
      },
      {
        label: "En los próximos 3–6 meses",
        result: {
          score: "media",
          message: "Tu perfil es sólido. Te recomendamos descargar el dossier completo para preparar tu análisis durante este período.",
          ctaType: "download_brochure",
        },
      },
      {
        label: "Más de 6 meses / explorando",
        result: {
          score: "media",
          message: "Estás en fase de exploración. Mantente informado descargando el dossier y nos ponemos en contacto cuando estés listo.",
          ctaType: "download_brochure",
        },
      },
    ],
  },
];

const SCORE_CONFIG = {
  alta: {
    label: "Perfil Alto",
    color: "text-[#00F0FF]",
    border: "border-[#00F0FF]/25",
    bg: "bg-[#00F0FF]/8",
    dot: "bg-[#00F0FF]",
  },
  media: {
    label: "Perfil Medio",
    color: "text-[#7B61FF]",
    border: "border-[#7B61FF]/25",
    bg: "bg-[#7B61FF]/8",
    dot: "bg-[#7B61FF]",
  },
  baja: {
    label: "Perfil Bajo",
    color: "text-[#8A8F9E]",
    border: "border-white/10",
    bg: "",
    dot: "bg-[#8A8F9E]",
  },
};

// ── Component ─────────────────────────────────────────────────────────────────

type Message =
  | { role: "bot"; text: string }
  | { role: "user"; text: string }
  | { role: "result"; result: Result };

function TypingIndicator() {
  return (
    <div
      className="flex items-center gap-1 rounded-2xl rounded-bl-sm px-4 py-3 w-fit"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-[#8A8F9E]"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
          transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

function ResultCard({ result, franchiseName }: { result: Result; franchiseName: string }) {
  const config = SCORE_CONFIG[result.score];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className={`overflow-hidden rounded-2xl border ${config.border} ${config.bg} p-5 space-y-4`}
    >
      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${config.dot}`} />
        <span className={`text-xs font-semibold uppercase tracking-widest ${config.color}`}>
          {config.label}
        </span>
      </div>

      <p className="text-sm leading-relaxed text-[#F0F0F5]">{result.message}</p>

      {result.ctaType === "book_call" && (
        <a
          href="/quiz"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#00F0FF] px-6 py-3 text-sm font-semibold text-[#0A0F1E] transition-all hover:brightness-110 active:scale-95"
        >
          <CalendarDays className="h-4 w-4" />
          Agendar llamada
        </a>
      )}
      {result.ctaType === "download_brochure" && (
        <a
          href="/quiz"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[#7B61FF]/40 bg-[#7B61FF]/10 px-6 py-3 text-sm font-semibold text-[#7B61FF] transition-all hover:bg-[#7B61FF]/20 active:scale-95"
        >
          <FileText className="h-4 w-4" />
          Recibir dossier
        </a>
      )}
      {result.ctaType === "contact_form" && (
        <a
          href="/quiz"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-[#F0F0F5] transition-all hover:bg-white/10 active:scale-95"
        >
          <Mail className="h-4 w-4" />
          Contactar asesor
        </a>
      )}
    </motion.div>
  );
}

function getNodeById(id: string): TreeNode | undefined {
  return DECISION_TREE.find((n) => n.id === id);
}

export function ChatbotSection({ data }: { data: ChatbotData }) {
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentNode, setCurrentNode] = useState<TreeNode | null>(null);
  const [typing, setTyping] = useState(false);
  const [done, setDone] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  function start() {
    setStarted(true);
    const first = DECISION_TREE[0];
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages([{ role: "bot", text: first.question }]);
      setCurrentNode(first);
    }, 600);
  }

  function pickOption(option: NodeOption) {
    if (!currentNode) return;

    setMessages((prev) => [...prev, { role: "user", text: option.label }]);
    setCurrentNode(null);
    setTyping(true);

    if (option.result) {
      setTimeout(() => {
        setTyping(false);
        setMessages((prev) => [
          ...prev,
          { role: "result", result: option.result! },
        ]);
        setDone(true);
      }, 800);
    } else if (option.nextNodeId) {
      const next = getNodeById(option.nextNodeId);
      if (!next) return;
      setTimeout(() => {
        setTyping(false);
        setMessages((prev) => [...prev, { role: "bot", text: next.question }]);
        setCurrentNode(next);
      }, 900);
    }
  }

  return (
    <section className="bg-[#0A0F1E] py-20 md:py-28" aria-label="Calificación guiada">
      <div className="mx-auto max-w-2xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-10 space-y-2 text-center"
        >
          <p className="text-xs font-medium uppercase tracking-widest text-[#00F0FF]">
            Calificación inteligente
          </p>
          <h2
            className="text-3xl font-bold text-[#F0F0F5] sm:text-4xl"
            style={{ fontFamily: "var(--font-heading, system-ui, sans-serif)" }}
          >
            ¿Eres el perfil ideal?
          </h2>
          <p className="text-sm text-[#8A8F9E]">
            Responde 4 preguntas y obtén tu análisis de encaje con {data.franchiseName}.
          </p>
        </motion.div>

        <div
          className="overflow-hidden rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          {/* Chat header */}
          <div
            className="flex items-center gap-3 px-5 py-4"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#00F0FF]/25 bg-[#00F0FF]/10">
              <Bot className="h-4 w-4 text-[#00F0FF]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#F0F0F5]">Asesor {data.franchiseName}</p>
              <p className="text-[10px] text-[#8A8F9E]">Motor de calificación</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00F0FF]" />
              <span className="text-[10px] text-[#8A8F9E]">En línea</span>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex min-h-[280px] flex-col gap-3 overflow-y-auto p-5"
          >
            {!started && (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 py-6 text-center">
                <p className="text-sm text-[#8A8F9E]">
                  Hola 👋 Voy a ayudarte a evaluar si {data.franchiseName} es el modelo adecuado para tu perfil.
                </p>
                <button
                  onClick={start}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#00F0FF] px-6 py-3 text-sm font-semibold text-[#0A0F1E] transition-all hover:brightness-110 active:scale-95"
                >
                  Comenzar evaluación
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}

            <AnimatePresence mode="popLayout">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {msg.role === "bot" && (
                    <div
                      className="max-w-[85%] rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-[#F0F0F5]"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      {msg.text}
                    </div>
                  )}
                  {msg.role === "user" && (
                    <div className="ml-auto max-w-[75%] rounded-2xl rounded-br-sm bg-[#00F0FF]/15 px-4 py-3 text-sm text-[#F0F0F5]">
                      {msg.text}
                    </div>
                  )}
                  {msg.role === "result" && (
                    <ResultCard result={msg.result} franchiseName={data.franchiseName} />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {typing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <TypingIndicator />
              </motion.div>
            )}
          </div>

          {/* Options */}
          {currentNode && !done && (
            <div className="p-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex flex-wrap gap-2">
                {currentNode.options.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => pickOption(opt)}
                    className="min-h-[44px] rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-left text-xs font-medium text-[#F0F0F5] transition-all hover:border-[#00F0FF]/40 hover:bg-[#00F0FF]/8 hover:text-[#00F0FF] active:scale-95"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
