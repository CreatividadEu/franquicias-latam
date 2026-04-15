"use client";

import { useEffect, useRef, useState } from "react";
import type { DragEvent } from "react";

type PhaseStatus = "complete" | "active" | "pending";
type DistributionStatus = "ready" | "building" | "planned";
type TrainingStatus = "active" | "complete" | "locked";
type SpaceId =
  | "dashboard"
  | "development"
  | "training"
  | "uploads"
  | "distribution";

interface Phase {
  id: number;
  label: string;
  icon: string;
  status: PhaseStatus;
  progress: number;
  description: string;
  tasks: string[];
  docs: number;
}

interface Space {
  id: SpaceId;
  label: string;
  icon: string;
}

interface RecentActivityItem {
  action: string;
  time: string;
  user: string;
  type: "edit" | "upload" | "milestone" | "feedback" | "export";
}

interface UploadedFile {
  name: string;
  size: string;
  date: string;
  type: "doc" | "pdf" | "pptx" | "xlsx" | "zip";
}

interface DistributionFormat {
  format: string;
  icon: string;
  status: DistributionStatus;
  count: number;
}

interface TrainingModule {
  title: string;
  progress: number;
  lessons: number;
  duration: string;
  status: TrainingStatus;
}

const PHASES: Phase[] = [
  {
    id: 1,
    label: "Diagnóstico",
    icon: "🔍",
    status: "complete",
    progress: 100,
    description:
      "Auditoría operativa completa de la red TOTTO. Análisis de 450+ puntos de venta en 45 países.",
    tasks: [
      "Mapeo de procesos actuales",
      "Benchmarking competitivo",
      "Entrevistas con franquiciados",
      "Análisis de brechas operativas",
    ],
    docs: 12,
  },
  {
    id: 2,
    label: "Diseño",
    icon: "✦",
    status: "complete",
    progress: 100,
    description:
      "Arquitectura del sistema de manuales inteligentes y estructura de capacitación modular.",
    tasks: [
      "Framework de manuales",
      "Mapa de competencias",
      "Diseño instruccional",
      "Prototipado de plataforma",
    ],
    docs: 8,
  },
  {
    id: 3,
    label: "Desarrollo",
    icon: "⚡",
    status: "active",
    progress: 64,
    description:
      "Construcción de manuales operativos, material de capacitación y sistema de evaluación.",
    tasks: [
      "Manual de operaciones",
      "Manual de marca",
      "Guías de capacitación",
      "Sistema de evaluación",
      "Plataforma digital",
    ],
    docs: 5,
  },
  {
    id: 4,
    label: "Validación",
    icon: "◎",
    status: "pending",
    progress: 0,
    description:
      "Testing con franquiciados piloto. Iteración basada en feedback real de la red.",
    tasks: [
      "Piloto con 5 tiendas",
      "Feedback loop",
      "Ajustes de contenido",
      "Validación con TOTTO Corp",
    ],
    docs: 0,
  },
  {
    id: 5,
    label: "Implementación",
    icon: "▲",
    status: "pending",
    progress: 0,
    description:
      "Rollout progresivo a la red completa. Onboarding y capacitación de equipos regionales.",
    tasks: [
      "Rollout Fase 1: LATAM",
      "Rollout Fase 2: Europa",
      "Train-the-trainer",
      "Soporte post-lanzamiento",
    ],
    docs: 0,
  },
  {
    id: 6,
    label: "Distribución",
    icon: "◈",
    status: "pending",
    progress: 0,
    description:
      "Exportación a múltiples formatos. Sistema de actualización continua y métricas de adopción.",
    tasks: [
      "Export PDF/PPTX/Web",
      "Dashboard de métricas",
      "Sistema de versiones",
      "Actualizaciones automáticas",
    ],
    docs: 0,
  },
];

const SPACES: Space[] = [
  { id: "dashboard", label: "Dashboard", icon: "◫" },
  { id: "development", label: "Desarrollo", icon: "⚡" },
  { id: "training", label: "Capacitación", icon: "◉" },
  { id: "uploads", label: "Archivos", icon: "↑" },
  { id: "distribution", label: "Distribución", icon: "◈" },
];

const RECENT_ACTIVITY: RecentActivityItem[] = [
  {
    action: "Manual de Operaciones v2.3 actualizado",
    time: "Hace 2h",
    user: "DS",
    type: "edit",
  },
  {
    action: "3 archivos subidos a Capacitación",
    time: "Hace 4h",
    user: "DS",
    type: "upload",
  },
  {
    action: "Fase 2 — Diseño completada",
    time: "Hace 1d",
    user: "Sistema",
    type: "milestone",
  },
  {
    action: "Feedback recibido: Tienda Bogotá Norte",
    time: "Hace 2d",
    user: "JR",
    type: "feedback",
  },
  {
    action: "Export PDF generado: Guía de Marca",
    time: "Hace 3d",
    user: "DS",
    type: "export",
  },
];

const UPLOADED_FILES: UploadedFile[] = [
  {
    name: "manual_operaciones_v2.3.docx",
    size: "4.2 MB",
    date: "Abr 12",
    type: "doc",
  },
  {
    name: "brand_guidelines_totto.pdf",
    size: "12.8 MB",
    date: "Abr 10",
    type: "pdf",
  },
  {
    name: "capacitacion_modulo1.pptx",
    size: "8.1 MB",
    date: "Abr 8",
    type: "pptx",
  },
  {
    name: "evaluacion_franquiciados.xlsx",
    size: "1.4 MB",
    date: "Abr 5",
    type: "xlsx",
  },
  {
    name: "fotos_tienda_modelo.zip",
    size: "45 MB",
    date: "Abr 3",
    type: "zip",
  },
];

const DISTRIBUTION_FORMATS: DistributionFormat[] = [
  { format: "PDF Interactivo", icon: "📄", status: "ready", count: 4 },
  { format: "Presentación PPTX", icon: "📊", status: "ready", count: 2 },
  { format: "Web App", icon: "🌐", status: "building", count: 1 },
  { format: "Mobile (PWA)", icon: "📱", status: "planned", count: 0 },
  { format: "Video Training", icon: "🎬", status: "planned", count: 0 },
  { format: "API / LMS", icon: "🔗", status: "planned", count: 0 },
];

const TRAINING_MODULES: TrainingModule[] = [
  {
    title: "Apertura de Tienda",
    progress: 85,
    lessons: 12,
    duration: "4h 30m",
    status: "active",
  },
  {
    title: "Atención al Cliente TOTTO",
    progress: 100,
    lessons: 8,
    duration: "2h 15m",
    status: "complete",
  },
  {
    title: "Visual Merchandising",
    progress: 40,
    lessons: 10,
    duration: "3h 45m",
    status: "active",
  },
  {
    title: "Gestión de Inventarios",
    progress: 0,
    lessons: 6,
    duration: "2h",
    status: "locked",
  },
  {
    title: "Marketing Local",
    progress: 0,
    lessons: 9,
    duration: "3h",
    status: "locked",
  },
];

function AnimatedNumber({
  target,
  duration = 1200,
}: {
  target: number;
  duration?: number;
}) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let current = 0;
    const step = target / (duration / 16);
    const interval = window.setInterval(() => {
      current += step;

      if (current >= target) {
        setValue(target);
        window.clearInterval(interval);
      } else {
        setValue(Math.floor(current));
      }
    }, 16);

    return () => window.clearInterval(interval);
  }, [duration, target]);

  return <span>{value}</span>;
}

function ProgressRing({
  progress,
  size = 48,
  stroke = 4,
}: {
  progress: number;
  size?: number;
  stroke?: number;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      style={{ transform: "rotate(-90deg)", flexShrink: 0 }}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={progress === 100 ? "#00e5c3" : "#8b5cf6"}
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1s ease" }}
      />
    </svg>
  );
}

function getPhaseAccent(status: PhaseStatus) {
  if (status === "complete") return "#00e5c3";
  if (status === "active") return "#8b5cf6";
  return "rgba(255,255,255,0.2)";
}

function getActivityDot(type: RecentActivityItem["type"]) {
  if (type === "milestone") return "#00e5c3";
  if (type === "upload") return "#8b5cf6";
  if (type === "export") return "#3b82f6";
  if (type === "feedback") return "#ff6b35";
  return "rgba(255,255,255,0.2)";
}

function getFileBadgeStyle(type: UploadedFile["type"]) {
  if (type === "doc") {
    return {
      background: "rgba(59,130,246,0.15)",
      color: "#60a5fa",
    };
  }

  if (type === "pdf") {
    return {
      background: "rgba(239,68,68,0.15)",
      color: "#f87171",
    };
  }

  if (type === "pptx") {
    return {
      background: "rgba(249,115,22,0.15)",
      color: "#fb923c",
    };
  }

  if (type === "xlsx") {
    return {
      background: "rgba(34,197,94,0.15)",
      color: "#4ade80",
    };
  }

  return {
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.4)",
  };
}

export default function TottoDemoPage() {
  const [activeSpace, setActiveSpace] = useState<SpaceId>("dashboard");
  const [selectedPhase, setSelectedPhase] = useState(3);
  const [isDragging, setIsDragging] = useState(false);
  const [showUploadSuccess, setShowUploadSuccess] = useState(false);
  const uploadTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (uploadTimeoutRef.current !== null) {
        window.clearTimeout(uploadTimeoutRef.current);
      }
    };
  }, []);

  function triggerUploadSuccess() {
    setShowUploadSuccess(true);

    if (uploadTimeoutRef.current !== null) {
      window.clearTimeout(uploadTimeoutRef.current);
    }

    uploadTimeoutRef.current = window.setTimeout(() => {
      setShowUploadSuccess(false);
    }, 3000);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    triggerUploadSuccess();
  }

  const phase = PHASES.find((item) => item.id === selectedPhase);

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(0,229,195,0.12), transparent 22%), radial-gradient(circle at top right, rgba(139,92,246,0.16), transparent 24%), #07090f",
        color: "#e8ecf2",
        fontFamily:
          "'Segoe UI', 'Aptos', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          minHeight: 56,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(7,9,15,0.9)",
          backdropFilter: "blur(20px)",
          position: "sticky",
          top: 0,
          zIndex: 100,
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            minWidth: 0,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: "linear-gradient(135deg, #00e5c3, #00b89c)",
              display: "grid",
              placeItems: "center",
              fontSize: 13,
              fontWeight: 800,
              color: "#07090f",
              flexShrink: 0,
            }}
          >
            FL
          </div>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "-0.01em",
            }}
          >
            Franquicias LATAM
          </span>
          <span style={{ color: "rgba(255,255,255,0.2)", margin: "0 4px" }}>
            /
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#00e5c3" }}>
            TOTTO
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "#07090f",
              background: "#8b5cf6",
              padding: "2px 8px",
              borderRadius: 4,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Proyecto Activo
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.4)",
              fontFamily: "monospace",
            }}
          >
            v2.3 · Última actualización: Hoy
          </div>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #ff6b35, #ff8f65)",
              display: "grid",
              placeItems: "center",
              fontSize: 12,
              fontWeight: 700,
              color: "white",
            }}
          >
            DS
          </div>
        </div>
      </header>

      <div
        className="totto-shell"
        style={{ display: "flex", flex: 1, overflow: "hidden" }}
      >
        <aside
          className="totto-sidebar"
          style={{
            width: 220,
            borderRight: "1px solid rgba(255,255,255,0.06)",
            padding: "20px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
            flexShrink: 0,
            background: "rgba(255,255,255,0.01)",
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "rgba(255,255,255,0.3)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              padding: "8px 12px 12px",
            }}
          >
            Espacios
          </div>

          {SPACES.map((space) => (
            <button
              key={space.id}
              type="button"
              onClick={() => setActiveSpace(space.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 8,
                background:
                  activeSpace === space.id
                    ? "rgba(0,229,195,0.08)"
                    : "transparent",
                border:
                  activeSpace === space.id
                    ? "1px solid rgba(0,229,195,0.15)"
                    : "1px solid transparent",
                color:
                  activeSpace === space.id
                    ? "#00e5c3"
                    : "rgba(255,255,255,0.5)",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 500,
                transition: "all 0.2s",
                textAlign: "left",
                width: "100%",
                fontFamily: "inherit",
              }}
            >
              <span
                style={{ fontSize: 16, width: 20, textAlign: "center" }}
              >
                {space.icon}
              </span>
              {space.label}
            </button>
          ))}

          <div style={{ flex: 1 }} />

          <div
            style={{
              margin: "0 4px",
              padding: 16,
              borderRadius: 10,
              background: "rgba(139,92,246,0.08)",
              border: "1px solid rgba(139,92,246,0.15)",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#8b5cf6",
                marginBottom: 6,
              }}
            >
              Progreso Global
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: "white",
                letterSpacing: "-0.03em",
              }}
            >
              <AnimatedNumber target={44} />%
            </div>
            <div
              style={{
                height: 4,
                borderRadius: 2,
                background: "rgba(255,255,255,0.06)",
                marginTop: 10,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: "44%",
                  borderRadius: 2,
                  background: "linear-gradient(90deg, #8b5cf6, #00e5c3)",
                  transition: "width 1.5s ease",
                }}
              />
            </div>
            <div
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.35)",
                marginTop: 8,
              }}
            >
              2 de 6 fases completadas
            </div>
          </div>
        </aside>

        <main
          className="totto-main"
          style={{ flex: 1, overflow: "auto", padding: 32 }}
        >
          {activeSpace === "dashboard" && (
            <div
              className="totto-fade-in"
              style={{
                opacity: 0,
                transform: "translateY(12px)",
              }}
            >
              <div style={{ marginBottom: 32 }}>
                <h1
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                    marginBottom: 6,
                    color: "white",
                  }}
                >
                  Proyecto TOTTO
                </h1>
                <p
                  style={{
                    fontSize: 14,
                    color: "rgba(255,255,255,0.4)",
                    maxWidth: 600,
                  }}
                >
                  Sistema de Manuales Inteligentes & Capacitación — 450+
                  tiendas · 45 países
                </p>
              </div>

              <div
                className="totto-kpi-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
                  gap: 12,
                  marginBottom: 28,
                }}
              >
                {[
                  {
                    label: "Documentos",
                    value: 25,
                    suffix: "",
                    color: "#00e5c3",
                  },
                  {
                    label: "Módulos Training",
                    value: 5,
                    suffix: "",
                    color: "#8b5cf6",
                  },
                  {
                    label: "Archivos Subidos",
                    value: 47,
                    suffix: "",
                    color: "#ff6b35",
                  },
                  {
                    label: "Formatos Export",
                    value: 6,
                    suffix: "",
                    color: "#3b82f6",
                  },
                ].map((kpi, index) => (
                  <div
                    key={kpi.label}
                    style={{
                      padding: "20px 18px",
                      borderRadius: 12,
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "rgba(255,255,255,0.35)",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        marginBottom: 8,
                      }}
                    >
                      {kpi.label}
                    </div>
                    <div
                      style={{
                        fontSize: 32,
                        fontWeight: 800,
                        color: kpi.color,
                        letterSpacing: "-0.04em",
                      }}
                    >
                      <AnimatedNumber
                        target={kpi.value}
                        duration={800 + index * 200}
                      />
                      {kpi.suffix}
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  padding: 24,
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  marginBottom: 24,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 20,
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 700 }}>
                    Pipeline de Desarrollo
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,0.3)",
                    }}
                  >
                    Fase activa:{" "}
                    <span style={{ color: "#00e5c3" }}>Desarrollo</span>
                  </div>
                </div>

                <div
                  className="totto-phase-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(120px, 1fr))",
                    gap: 8,
                    marginBottom: 24,
                  }}
                >
                  {PHASES.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedPhase(item.id)}
                      style={{
                        padding: "14px 8px",
                        borderRadius: 10,
                        cursor: "pointer",
                        background:
                          selectedPhase === item.id
                            ? item.status === "complete"
                              ? "rgba(0,229,195,0.1)"
                              : item.status === "active"
                                ? "rgba(139,92,246,0.1)"
                                : "rgba(255,255,255,0.04)"
                            : "rgba(255,255,255,0.02)",
                        border:
                          selectedPhase === item.id
                            ? `1px solid ${
                                item.status === "complete"
                                  ? "rgba(0,229,195,0.3)"
                                  : item.status === "active"
                                    ? "rgba(139,92,246,0.3)"
                                    : "rgba(255,255,255,0.1)"
                              }`
                            : "1px solid rgba(255,255,255,0.04)",
                        transition: "all 0.25s",
                        fontFamily: "inherit",
                        color:
                          item.status === "pending"
                            ? "rgba(255,255,255,0.25)"
                            : "white",
                      }}
                    >
                      <div style={{ fontSize: 18, marginBottom: 6 }}>
                        {item.icon}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          marginBottom: 4,
                        }}
                      >
                        {item.label}
                      </div>
                      <div
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          color: getPhaseAccent(item.status),
                        }}
                      >
                        {item.status === "complete"
                          ? "✓ Listo"
                          : item.status === "active"
                            ? `${item.progress}%`
                            : "Pendiente"}
                      </div>
                    </button>
                  ))}
                </div>

                {phase && (
                  <div
                    className="totto-phase-detail"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                      gap: 20,
                      padding: 20,
                      borderRadius: 10,
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          marginBottom: 8,
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span>{phase.icon}</span> Fase {phase.id}: {phase.label}
                      </div>
                      <p
                        style={{
                          fontSize: 13,
                          color: "rgba(255,255,255,0.5)",
                          lineHeight: 1.6,
                          marginBottom: 16,
                        }}
                      >
                        {phase.description}
                      </p>
                      <div
                        style={{
                          fontSize: 11,
                          color: "rgba(255,255,255,0.3)",
                          marginBottom: 4,
                        }}
                      >
                        {phase.docs} documentos generados
                      </div>
                      {phase.status === "active" && (
                        <div
                          style={{
                            marginTop: 12,
                            height: 4,
                            borderRadius: 2,
                            background: "rgba(255,255,255,0.06)",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${phase.progress}%`,
                              borderRadius: 2,
                              background:
                                "linear-gradient(90deg, #8b5cf6, #a78bfa)",
                            }}
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "rgba(255,255,255,0.35)",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          marginBottom: 12,
                        }}
                      >
                        Tareas
                      </div>
                      {phase.tasks.map((task, index) => {
                        const taskDone =
                          phase.status === "complete" ||
                          (phase.status === "active" && index < 2);

                        return (
                          <div
                            key={task}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              padding: "8px 0",
                              borderBottom:
                                index < phase.tasks.length - 1
                                  ? "1px solid rgba(255,255,255,0.04)"
                                  : "none",
                            }}
                          >
                            <div
                              style={{
                                width: 18,
                                height: 18,
                                borderRadius: 5,
                                border: taskDone
                                  ? "none"
                                  : "1.5px solid rgba(255,255,255,0.15)",
                                background: taskDone ? "#00e5c3" : "transparent",
                                display: "grid",
                                placeItems: "center",
                                fontSize: 10,
                                color: "#07090f",
                                fontWeight: 800,
                                flexShrink: 0,
                              }}
                            >
                              {taskDone && "✓"}
                            </div>
                            <span
                              style={{
                                fontSize: 13,
                                color:
                                  phase.status === "pending"
                                    ? "rgba(255,255,255,0.25)"
                                    : "rgba(255,255,255,0.7)",
                                textDecoration: taskDone
                                  ? "line-through"
                                  : "none",
                                textDecorationColor: "rgba(255,255,255,0.15)",
                              }}
                            >
                              {task}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div
                style={{
                  padding: 20,
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}
                >
                  Actividad Reciente
                </div>
                {RECENT_ACTIVITY.map((item, index) => (
                  <div
                    key={`${item.action}-${item.time}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 0",
                      borderBottom:
                        index < RECENT_ACTIVITY.length - 1
                          ? "1px solid rgba(255,255,255,0.04)"
                          : "none",
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        flexShrink: 0,
                        background: getActivityDot(item.type),
                      }}
                    />
                    <span
                      style={{
                        flex: 1,
                        fontSize: 13,
                        color: "rgba(255,255,255,0.6)",
                      }}
                    >
                      {item.action}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: "rgba(255,255,255,0.25)",
                        flexShrink: 0,
                      }}
                    >
                      {item.user} · {item.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSpace === "development" && (
            <div>
              <h1
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  marginBottom: 6,
                }}
              >
                Desarrollo de Contenido
              </h1>
              <p
                style={{
                  fontSize: 14,
                  color: "rgba(255,255,255,0.4)",
                  marginBottom: 28,
                }}
              >
                Manuales, guías y documentación del sistema TOTTO
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 12,
                }}
              >
                {[
                  {
                    title: "Manual de Operaciones",
                    version: "v2.3",
                    status: "En progreso",
                    color: "#8b5cf6",
                    pages: 84,
                  },
                  {
                    title: "Manual de Marca",
                    version: "v1.8",
                    status: "Completo",
                    color: "#00e5c3",
                    pages: 52,
                  },
                  {
                    title: "Guía de Apertura",
                    version: "v1.0",
                    status: "En progreso",
                    color: "#8b5cf6",
                    pages: 36,
                  },
                  {
                    title: "Protocolos de Servicio",
                    version: "v2.1",
                    status: "Completo",
                    color: "#00e5c3",
                    pages: 28,
                  },
                  {
                    title: "Manual Visual Merchandising",
                    version: "v0.5",
                    status: "Borrador",
                    color: "#ff6b35",
                    pages: 15,
                  },
                  {
                    title: "Guía de Inventarios",
                    version: "—",
                    status: "Planificado",
                    color: "rgba(255,255,255,0.15)",
                    pages: 0,
                  },
                ].map((doc) => (
                  <div
                    key={doc.title}
                    className="totto-card-hover"
                    style={{
                      padding: 20,
                      borderRadius: 12,
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      cursor: "pointer",
                      transition: "all 0.25s",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 12,
                        gap: 12,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          color: doc.color,
                          padding: "3px 8px",
                          borderRadius: 4,
                          background: `${doc.color}15`,
                        }}
                      >
                        {doc.status}
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          color: "rgba(255,255,255,0.25)",
                          fontFamily: "monospace",
                        }}
                      >
                        {doc.version}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        marginBottom: 8,
                      }}
                    >
                      {doc.title}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "rgba(255,255,255,0.3)",
                      }}
                    >
                      {doc.pages > 0
                        ? `${doc.pages} páginas`
                        : "Sin contenido aún"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSpace === "training" && (
            <div>
              <h1
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  marginBottom: 6,
                }}
              >
                Capacitación
              </h1>
              <p
                style={{
                  fontSize: 14,
                  color: "rgba(255,255,255,0.4)",
                  marginBottom: 28,
                }}
              >
                Módulos de aprendizaje y evaluación para la red TOTTO
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {TRAINING_MODULES.map((module) => (
                  <div
                    key={module.title}
                    className="totto-training-card"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      padding: "18px 20px",
                      borderRadius: 12,
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      opacity: module.status === "locked" ? 0.4 : 1,
                    }}
                  >
                    <ProgressRing progress={module.progress} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          marginBottom: 4,
                        }}
                      >
                        {module.title}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "rgba(255,255,255,0.35)",
                        }}
                      >
                        {module.lessons} lecciones · {module.duration}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color:
                          module.status === "complete"
                            ? "#00e5c3"
                            : module.status === "active"
                              ? "#8b5cf6"
                              : "rgba(255,255,255,0.2)",
                      }}
                    >
                      {module.status === "complete"
                        ? "✓ Completado"
                        : module.status === "active"
                          ? `${module.progress}%`
                          : "🔒 Bloqueado"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSpace === "uploads" && (
            <div>
              <h1
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  marginBottom: 6,
                }}
              >
                Archivos del Proyecto
              </h1>
              <p
                style={{
                  fontSize: 14,
                  color: "rgba(255,255,255,0.4)",
                  marginBottom: 28,
                }}
              >
                Sube, organiza y procesa documentos para el proyecto TOTTO
              </p>

              <div
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    triggerUploadSuccess();
                  }
                }}
                style={{
                  padding: "48px 24px",
                  borderRadius: 14,
                  border: `2px dashed ${
                    isDragging ? "#00e5c3" : "rgba(255,255,255,0.1)"
                  }`,
                  background: isDragging
                    ? "rgba(0,229,195,0.05)"
                    : "rgba(255,255,255,0.01)",
                  textAlign: "center",
                  marginBottom: 24,
                  transition: "all 0.3s",
                  cursor: "pointer",
                }}
                onClick={triggerUploadSuccess}
              >
                <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.5 }}>
                  ↑
                </div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    marginBottom: 6,
                  }}
                >
                  {isDragging
                    ? "Suelta aquí"
                    : "Arrastra archivos o haz clic para subir"}
                </div>
                <div
                  style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}
                >
                  PDF, DOCX, PPTX, XLSX, imágenes, videos — hasta 100MB
                </div>
              </div>

              {showUploadSuccess && (
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: 10,
                    marginBottom: 16,
                    background: "rgba(0,229,195,0.1)",
                    border: "1px solid rgba(0,229,195,0.2)",
                    fontSize: 13,
                    color: "#00e5c3",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  ✓ Archivo subido exitosamente y en cola de procesamiento
                </div>
              )}

              <div
                style={{
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  overflow: "hidden",
                }}
              >
                <div
                  className="totto-upload-head"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 100px 100px 60px",
                    padding: "10px 20px",
                    gap: 12,
                    fontSize: 10,
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.3)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  <span>Nombre</span>
                  <span>Tamaño</span>
                  <span>Fecha</span>
                  <span />
                </div>

                {UPLOADED_FILES.map((file, index) => {
                  const badge = getFileBadgeStyle(file.type);

                  return (
                    <div
                      key={file.name}
                      className="totto-upload-row"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 100px 100px 60px",
                        padding: "14px 20px",
                        gap: 12,
                        alignItems: "center",
                        borderBottom:
                          index < UPLOADED_FILES.length - 1
                            ? "1px solid rgba(255,255,255,0.04)"
                            : "none",
                        fontSize: 13,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          minWidth: 0,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            padding: "2px 6px",
                            borderRadius: 3,
                            background: badge.background,
                            color: badge.color,
                            textTransform: "uppercase",
                            flexShrink: 0,
                          }}
                        >
                          {file.type}
                        </span>
                        <span
                          style={{
                            color: "rgba(255,255,255,0.7)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {file.name}
                        </span>
                      </div>
                      <span
                        style={{
                          color: "rgba(255,255,255,0.3)",
                          fontSize: 12,
                        }}
                      >
                        {file.size}
                      </span>
                      <span
                        style={{
                          color: "rgba(255,255,255,0.3)",
                          fontSize: 12,
                        }}
                      >
                        {file.date}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          color: "#00e5c3",
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        Abrir
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeSpace === "distribution" && (
            <div>
              <h1
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  marginBottom: 6,
                }}
              >
                Distribución
              </h1>
              <p
                style={{
                  fontSize: 14,
                  color: "rgba(255,255,255,0.4)",
                  marginBottom: 28,
                }}
              >
                Exporta y distribuye contenido a múltiples formatos y
                plataformas
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 12,
                  marginBottom: 28,
                }}
              >
                {DISTRIBUTION_FORMATS.map((distribution) => (
                  <div
                    key={distribution.format}
                    style={{
                      padding: 20,
                      borderRadius: 12,
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div style={{ fontSize: 28, marginBottom: 10 }}>
                      {distribution.icon}
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        marginBottom: 4,
                      }}
                    >
                      {distribution.format}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background:
                            distribution.status === "ready"
                              ? "#00e5c3"
                              : distribution.status === "building"
                                ? "#fbbf24"
                                : "rgba(255,255,255,0.15)",
                        }}
                      />
                      <span
                        style={{
                          fontSize: 11,
                          color:
                            distribution.status === "ready"
                              ? "#00e5c3"
                              : distribution.status === "building"
                                ? "#fbbf24"
                                : "rgba(255,255,255,0.3)",
                          fontWeight: 600,
                        }}
                      >
                        {distribution.status === "ready"
                          ? `${distribution.count} listos`
                          : distribution.status === "building"
                            ? "En construcción"
                            : "Planificado"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  padding: 24,
                  borderRadius: 14,
                  background: "rgba(0,229,195,0.04)",
                  border: "1px solid rgba(0,229,195,0.1)",
                }}
              >
                <div
                  style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}
                >
                  Acciones Rápidas
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {[
                    "Generar PDF Completo",
                    "Exportar PPTX",
                    "Publicar en Web",
                    "Sincronizar LMS",
                  ].map((action, index) => (
                    <button
                      key={action}
                      type="button"
                      style={{
                        padding: "10px 18px",
                        borderRadius: 8,
                        background:
                          index === 0
                            ? "#00e5c3"
                            : "rgba(255,255,255,0.06)",
                        color:
                          index === 0 ? "#07090f" : "rgba(255,255,255,0.6)",
                        border: "none",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        transition: "all 0.2s",
                      }}
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <footer
        style={{
          padding: "12px 24px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          fontSize: 11,
          color: "rgba(255,255,255,0.25)",
        }}
      >
        <span>© Franquicias LATAM × TOTTO · Proyecto en desarrollo</span>
        <span style={{ fontFamily: "monospace" }}>
          Powered by Franquicias LATAM AI
        </span>
      </footer>

      <style jsx>{`
        .totto-fade-in {
          animation: totto-fade-up 0.5s ease forwards;
        }

        .totto-card-hover:hover {
          border-color: rgba(255, 255, 255, 0.12);
          transform: translateY(-2px);
        }

        @keyframes totto-fade-up {
          from {
            opacity: 0;
            transform: translateY(12px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 980px) {
          .totto-shell {
            flex-direction: column;
          }

          .totto-sidebar {
            width: 100% !important;
            border-right: none !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          }

          .totto-main {
            padding: 24px !important;
          }

          .totto-phase-detail {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 720px) {
          .totto-main {
            padding: 18px !important;
          }

          .totto-training-card {
            align-items: flex-start !important;
            flex-direction: column;
          }

          .totto-upload-head {
            display: none !important;
          }

          .totto-upload-row {
            grid-template-columns: 1fr !important;
            gap: 8px !important;
          }
        }
      `}</style>
    </div>
  );
}
