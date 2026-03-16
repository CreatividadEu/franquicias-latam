"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, FileText, Mail, ArrowRight, CheckCircle } from "lucide-react";
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
    color: "text-[#2563eb]",
    border: "border-[#2563eb]/20",
    bg: "bg-blue-50",
    dot: "bg-[#2563eb]",
  },
  media: {
    label: "Perfil Medio",
    color: "text-orange-600",
    border: "border-orange-200",
    bg: "bg-orange-50",
    dot: "bg-orange-500",
  },
  baja: {
    label: "Perfil Bajo",
    color: "text-slate-500",
    border: "border-black/8",
    bg: "bg-slate-50",
    dot: "bg-slate-400",
  },
};

// ── Brand avatar ──────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function BrandAvatar({
  name,
  logoUrl,
  size = "md",
}: {
  name: string;
  logoUrl?: string | null;
  size?: "md" | "lg";
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const initials = getInitials(name);
  const textCls = size === "lg" ? "text-2xl font-bold" : "text-base font-bold";

  if (logoUrl && !imgFailed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt={name}
        onError={() => setImgFailed(true)}
        className="h-full w-full rounded-xl object-contain p-1.5"
      />
    );
  }

  return (
    <span className={`${textCls} tracking-tight text-[#2563eb]`}>{initials}</span>
  );
}

// ── Component helpers ─────────────────────────────────────────────────────────

type Message =
  | { role: "bot"; text: string }
  | { role: "user"; text: string }
  | { role: "result"; result: Result };

function TypingIndicator() {
  return (
    <div
      className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm px-4 py-3.5 w-fit"
      style={{ background: "#f1f5f9", border: "1px solid rgba(0,0,0,0.06)" }}
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="h-2 w-2 rounded-full bg-slate-400"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.15, 0.8] }}
          transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

function ResultCard({ result }: { result: Result }) {
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

      <p className="text-[15px] leading-relaxed text-[#171717]">{result.message}</p>

      {result.ctaType === "book_call" && (
        <a
          href="/quiz"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_16px_-4px_rgba(37,99,235,0.4)] transition-all hover:-translate-y-px active:scale-95"
        >
          <CalendarDays className="h-4 w-4" />
          Agendar llamada
        </a>
      )}
      {result.ctaType === "download_brochure" && (
        <a
          href="/quiz"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-6 py-3 text-sm font-semibold text-orange-600 transition-all hover:bg-orange-100 active:scale-95"
        >
          <FileText className="h-4 w-4" />
          Recibir dossier
        </a>
      )}
      {result.ctaType === "contact_form" && (
        <a
          href="/quiz"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-medium text-[#171717] shadow-sm transition-all hover:bg-slate-50 active:scale-95"
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

// ── Main section ──────────────────────────────────────────────────────────────

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
    <section className="bg-[#f8fafc] py-16 md:py-24" aria-label="Calificación guiada">
      <div className="mx-auto max-w-5xl px-6">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-10 space-y-3 text-center"
        >
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#2563eb]">
            Calificación inteligente
          </p>
          <h2
            className="text-4xl font-bold text-[#171717] sm:text-5xl"
            style={{ fontFamily: "var(--font-heading, system-ui, sans-serif)" }}
          >
            ¿Eres el perfil ideal?
          </h2>
          <p className="mx-auto max-w-xl text-[17px] leading-relaxed text-slate-500">
            Conversa con el asesor de{" "}
            <span className="font-medium text-[#171717]">{data.franchiseName}</span>{" "}
            y valida tu encaje real: inversión, operación, territorio y potencial.
          </p>
        </motion.div>

        {/* Chat shell */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="overflow-hidden rounded-2xl"
          style={{
            background: "#ffffff",
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 4px 32px rgba(0,0,0,0.08)",
          }}
        >
          {/* ── Chat header ────────────────────────────────────────────────── */}
          <div
            className="flex items-center gap-4 px-6 py-4"
            style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
          >
            {/* Brand avatar */}
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl"
              style={{
                background: "rgba(37,99,235,0.06)",
                border: "1.5px solid rgba(37,99,235,0.18)",
              }}
            >
              <BrandAvatar name={data.franchiseName} logoUrl={data.logoUrl} size="md" />
            </div>

            {/* Name + role */}
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight text-[#171717]">
                {data.franchiseName}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">Asesor de franquicias</p>
            </div>

            {/* Online indicator */}
            <div className="ml-auto flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-slate-500">En línea</span>
            </div>
          </div>

          {/* ── Messages area ───────────────────────────────────────────────── */}
          <div
            ref={scrollRef}
            className="flex min-h-[540px] flex-col gap-3 overflow-y-auto p-6"
          >
            {/* Welcome screen (before start) */}
            {!started && (
              <div className="flex flex-1 flex-col items-center justify-center gap-8 py-8 text-center">

                {/* Large brand identity */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <div
                      className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl"
                      style={{
                        background: "rgba(37,99,235,0.06)",
                        border: "1.5px solid rgba(37,99,235,0.18)",
                      }}
                    >
                      <BrandAvatar name={data.franchiseName} logoUrl={data.logoUrl} size="lg" />
                    </div>
                    {/* Online badge */}
                    <div className="absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm">
                      <div className="h-3.5 w-3.5 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-[#171717]">
                      Asesor {data.franchiseName}
                    </p>
                    <p className="text-sm text-slate-400">Disponible ahora</p>
                  </div>
                </div>

                {/* Greeting */}
                <div className="max-w-sm space-y-2">
                  <p className="text-[18px] font-semibold leading-snug text-[#171717]">
                    Hola 👋 Voy a ayudarte a evaluar si{" "}
                    <span className="text-[#2563eb]">{data.franchiseName}</span> encaja con tu perfil.
                  </p>
                  <p className="text-[15px] leading-relaxed text-slate-500">
                    4 preguntas rápidas. Al final recibirás un análisis de encaje personalizado.
                  </p>
                </div>

                {/* Feature list */}
                <div className="w-full max-w-xs space-y-3">
                  {[
                    "Evaluamos tu capacidad de inversión real",
                    "Analizamos tu perfil y experiencia previa",
                    "Te decimos si hay match y el siguiente paso",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3 text-left">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#2563eb]" />
                      <span className="text-[14px] leading-snug text-slate-600">{item}</span>
                    </div>
                  ))}
                </div>

                {/* CTA with glow pulse */}
                <motion.button
                  onClick={start}
                  animate={{
                    boxShadow: [
                      "0 4px 16px -4px rgba(37,99,235,0.35)",
                      "0 8px 36px -4px rgba(37,99,235,0.6)",
                      "0 4px 16px -4px rgba(37,99,235,0.35)",
                    ],
                  }}
                  transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
                  className="inline-flex min-h-[50px] items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 px-8 py-3.5 text-[15px] font-semibold text-white transition-all hover:-translate-y-px active:scale-95"
                >
                  Iniciar evaluación
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
              </div>
            )}

            {/* Chat messages */}
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
                      className="max-w-[85%] rounded-2xl rounded-bl-sm px-4 py-3.5 text-[16px] leading-relaxed text-[#171717]"
                      style={{ background: "#f1f5f9", border: "1px solid rgba(0,0,0,0.06)" }}
                    >
                      {msg.text}
                    </div>
                  )}
                  {msg.role === "user" && (
                    <div className="ml-auto max-w-[75%] rounded-2xl rounded-br-sm bg-[#eef3ff] px-4 py-3.5 text-[16px] leading-relaxed text-[#171717]">
                      {msg.text}
                    </div>
                  )}
                  {msg.role === "result" && (
                    <ResultCard result={msg.result} />
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

          {/* ── Options bar ─────────────────────────────────────────────────── */}
          {currentNode && !done && (
            <div
              className="p-5"
              style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
            >
              <div className="flex flex-wrap gap-2.5">
                {currentNode.options.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => pickOption(opt)}
                    className="min-h-[44px] rounded-full border border-black/10 bg-white px-5 py-2.5 text-left text-[15px] font-medium text-[#171717] shadow-sm transition-all hover:border-[#2563eb]/40 hover:bg-blue-50 hover:text-[#2563eb] active:scale-95"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
