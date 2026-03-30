"use client";

import { useState } from "react";
import styles from "./totto-demo.module.css";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Phase {
  id: string;
  name: string;
  title: string;
  actions: string[];
}

interface PipelineResult {
  phases: Phase[];
}

// ─── Pipeline Data ────────────────────────────────────────────────────────────

const PIPELINE_STAGES = [
  {
    num: "01",
    emoji: "🔍",
    name: "Levantamiento de Procesos",
    description:
      "Identificamos TODOS los procesos actuales de la tienda: ventas, inventario, atención, visual merchandising, apertura, cierre, y más. No asumimos: observamos, medimos y documentamos.",
    actions: [
      "Mapeo presencial de procesos en tienda",
      "Entrevistas con el mejor vendedor y el gerente",
      "Análisis de tiempos y movimientos",
      "Identificación de procesos informales (no documentados)",
      "Catalogación por área: ventas, operación, gestión",
    ],
    metrics: [
      { value: "45–80", label: "Procesos promedio por tienda" },
      { value: "62%", label: "% no documentados antes" },
      { value: "2–3 sem", label: "Duración de levantamiento" },
      { value: "Mapa + Video", label: "Formato de entrega" },
    ],
  },
  {
    num: "02",
    emoji: "🎯",
    name: "Evaluación & Optimización",
    description:
      "No documentamos el proceso 'tal como está'. Primero evaluamos cada proceso contra indicadores clave y objetivos del negocio. Luego, diseñamos la versión optimizada.",
    actions: [
      "Benchmark contra mejores prácticas de retail",
      "Análisis de impacto por KPI (ventas, NPS, ticket promedio)",
      "Identificación del 'mejor ejecutor' por proceso",
      "Rediseño de proceso con eliminación de desperdicios",
      "Validación con gerencia y operaciones",
    ],
    metrics: [
      { value: "+23%", label: "Mejora promedio en eficiencia" },
      { value: "30–40", label: "Procesos optimizados por tienda" },
      { value: "+12%", label: "Impacto en ticket promedio" },
      { value: "-35%", label: "Reducción de tiempos muertos" },
    ],
  },
  {
    num: "03",
    emoji: "📚",
    name: "Diseño del Plan de Capacitación",
    description:
      "Con los procesos optimizados, diseñamos un plan de capacitación estructurado por rol, nivel y frecuencia. Cada módulo tiene objetivos claros y evaluación medible.",
    actions: [
      "Arquitectura modular por rol (vendedor, gerente, cajero)",
      "Ruta de aprendizaje progresiva con certificación",
      "Mix de formatos: micro-learning, role-play, on-the-job",
      "Cronograma de implementación por cohorte",
      "Sistema de evaluación con rúbricas y puntajes",
    ],
    metrics: [
      { value: "12–18", label: "Módulos promedio por rol" },
      { value: "-40%", label: "Tiempo de ramp-up nuevo empleado" },
      { value: "Video + Quiz", label: "Formato preferido" },
      { value: "94%", label: "Tasa de completación" },
    ],
  },
  {
    num: "04",
    emoji: "🎬",
    name: "Creación de Contenido",
    description:
      "Producimos el contenido final: manuales visuales, videos de capacitación, infografías de proceso, guías de bolsillo y material digital. Todo con marca TOTTO y listo para implementar.",
    actions: [
      "Manuales digitales interactivos con navegación",
      "Videos de capacitación cortos (2–5 min)",
      "Infografías de proceso para zonas de trabajo",
      "Guías de bolsillo para consulta rápida",
      "Contenido listo para LMS o plataforma interna",
    ],
    metrics: [
      { value: "60–100", label: "Piezas de contenido promedio" },
      { value: "25–40", label: "Videos producidos" },
      { value: "4–6 sem", label: "Tiempo de producción" },
      { value: "PDF+MP4+LMS", label: "Formatos de entrega" },
    ],
  },
  {
    num: "05",
    emoji: "🚀",
    name: "Implementación del Plan",
    description:
      "No entregamos y nos vamos. Implementamos directamente: formamos a formadores, hacemos pilotos en tiendas clave, ajustamos y escalamos a toda la red.",
    actions: [
      "Programa 'Train the Trainer' para gerentes",
      "Piloto en 3–5 tiendas con medición pre/post",
      "Ajustes basados en feedback de campo",
      "Rollout escalonado por región/cluster",
      "Kit de implementación para cada tienda",
    ],
    metrics: [
      { value: "3–5", label: "Tiendas piloto recomendadas" },
      { value: "4 sem", label: "Tiempo de piloto" },
      { value: "20/mes", label: "Velocidad de rollout" },
      { value: "87%", label: "Adopción en primer mes" },
    ],
  },
  {
    num: "06",
    emoji: "📊",
    name: "Seguimiento & Resultados",
    description:
      "Medimos el impacto real. Dashboards de seguimiento, auditorías periódicas, actualización de contenido y mejora continua. Los manuales evolucionan con el negocio.",
    actions: [
      "Dashboard de KPIs por tienda y por proceso",
      "Auditorías mystery shopper mensuales",
      "Reportes de cumplimiento y desviación",
      "Ciclo de actualización trimestral de contenido",
      "Correlación directa con ventas y NPS",
    ],
    metrics: [
      { value: "+18%", label: "Mejora en ventas promedio" },
      { value: "+22 pts", label: "Mejora en NPS" },
      { value: "-30%", label: "Reducción de rotación" },
      { value: "8.4x", label: "ROI del proyecto" },
    ],
  },
];

const AREAS = [
  "Ventas",
  "Inventario",
  "Visual Merchandising",
  "Atención al Cliente",
  "Caja & Cierre",
  "Apertura & Cierre",
];

const KPIS = [
  "Ticket promedio",
  "Conversión",
  "NPS",
  "Unidades/tx",
  "Tiempo de atención",
];

const PHASE_COLORS = [
  "#00e5c3",
  "#00b89c",
  "#8b5cf6",
  "#ff6b35",
  "#3b82f6",
  "#f59e0b",
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function TottoDemoPage() {
  const [activeStage, setActiveStage] = useState<number | null>(null);

  // Form state
  const [area, setArea] = useState("Ventas");
  const [proceso, setProceso] = useState("");
  const [objetivo, setObjetivo] = useState("Incrementar ventas y ticket promedio");
  const [kpi, setKpi] = useState("Ticket promedio");
  const [tiendas, setTiendas] = useState(50);

  // Result state
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function toggleStage(idx: number) {
    setActiveStage((prev) => (prev === idx ? null : idx));
  }

  async function handleGenerate() {
    if (!proceso.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/totto-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ area, proceso, objetivo, kpi, tiendas }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }

      const data = await response.json();
      const text: string = data.content?.[0]?.text ?? "";

      // Strip potential backticks
      const cleaned = text.replace(/```json?/gi, "").replace(/```/g, "").trim();
      const parsed: PipelineResult = JSON.parse(cleaned);
      setResult(parsed);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al generar el plan. Intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      {/* ─── Nav ──────────────────────────────────────────────────── */}
      <nav className={styles.nav}>
        <a href="#" className={styles.navLogo}>
          Franquicias LATAM ×{" "}
          <span className={styles.navLogoTotto}>TOTTO</span>
        </a>
        <ul className={styles.navLinks}>
          <li><a href="#pipeline">Metodología</a></li>
          <li><a href="#demo">Demo en Vivo</a></li>
          <li><a href="#contacto">Contacto</a></li>
        </ul>
      </nav>

      {/* ─── Hero ─────────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroInner}>
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            Demo Exclusiva · Manuales & Capacitación
          </div>

          <h1 className={styles.heroH1}>
            No hacemos manuales.{" "}
            <span className={styles.heroTeal}>Rediseñamos</span>{" "}
            cómo opera{" "}
            <span className={styles.heroOutline}>tu tienda.</span>
          </h1>

          <p className={styles.heroSub}>
            Un manual no es un PDF con fotos del proceso actual. Es un sistema
            vivo que detecta las mejores prácticas, las convierte en hábito, las
            transforma en capacitación medible y las implementa con seguimiento
            real.
          </p>

          <a href="#demo" className={styles.heroCta}>
            Ver Demo en Vivo
          </a>

          <div className={styles.heroPills}>
            <span className={styles.pill}>TOTTO</span>
            <span className={styles.pill}>450+ Tiendas</span>
            <span className={styles.pill}>45 Países</span>
          </div>
        </div>
      </section>

      {/* ─── Pipeline ─────────────────────────────────────────────── */}
      <section id="pipeline" className={styles.pipeline}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p className={styles.sectionLabel}>Metodología</p>
          <h2 className={styles.sectionTitle}>6 Fases. Un Sistema Completo.</h2>
          <p className={styles.sectionSub}>
            Cada manual pasa por un proceso de ingeniería operativa que va mucho
            más allá de documentar: transformamos la operación.
          </p>

          <div className={styles.pipelineGrid}>
            {PIPELINE_STAGES.map((stage, idx) => (
              <div
                key={stage.num}
                className={`${styles.pipelineStage} ${activeStage === idx ? styles.pipelineStageActive : ""}`}
                onClick={() => toggleStage(idx)}
              >
                <span className={styles.stageEmoji}>{stage.emoji}</span>
                <span className={styles.stageNum}>Fase {stage.num}</span>
                <span className={styles.stageName}>{stage.name}</span>
              </div>
            ))}
          </div>

          {activeStage !== null && (
            <div className={styles.pipelinePanel}>
              <div>
                <h3 className={styles.panelTitle}>
                  {PIPELINE_STAGES[activeStage].name}
                </h3>
                <p className={styles.panelDesc}>
                  {PIPELINE_STAGES[activeStage].description}
                </p>
                <ul className={styles.actionsList}>
                  {PIPELINE_STAGES[activeStage].actions.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </div>
              <div className={styles.metricsGrid}>
                {PIPELINE_STAGES[activeStage].metrics.map((m) => (
                  <div key={m.label} className={styles.metricCard}>
                    <span className={styles.metricValue}>{m.value}</span>
                    <span className={styles.metricLabel}>{m.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─── Demo ─────────────────────────────────────────────────── */}
      <section id="demo" className={styles.demo}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p className={styles.sectionLabel}>Demo en Vivo</p>
          <h2 className={styles.sectionTitle}>Ingresa un proceso. Mira la magia.</h2>
          <p className={styles.sectionSub}>
            Selecciona un área, describe un proceso actual de tu tienda, y
            nuestro sistema genera automáticamente un plan de acción completo.
          </p>

          <div className={styles.demoGrid}>
            {/* Form */}
            <div className={styles.formCard}>
              <div>
                <span className={styles.fieldLabel}>Área de la Tienda</span>
                <div className={styles.chipGroup}>
                  {AREAS.map((a) => (
                    <button
                      key={a}
                      className={`${styles.chip} ${area === a ? styles.chipActive : ""}`}
                      onClick={() => setArea(a)}
                      type="button"
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className={styles.fieldLabel}>Proceso Actual</span>
                <textarea
                  className={styles.textarea}
                  placeholder="Ej: Cuando entra un cliente, el vendedor lo saluda y le pregunta qué busca. Si el cliente no sabe, le muestra las mochilas más vendidas..."
                  value={proceso}
                  onChange={(e) => setProceso(e.target.value)}
                />
              </div>

              <div>
                <span className={styles.fieldLabel}>Problema u Objetivo Principal</span>
                <select
                  className={styles.select}
                  value={objetivo}
                  onChange={(e) => setObjetivo(e.target.value)}
                >
                  <option>Incrementar ventas y ticket promedio</option>
                  <option>Mejorar la experiencia del cliente (NPS)</option>
                  <option>Reducir tiempos de operación</option>
                  <option>Estandarizar entre tiendas</option>
                  <option>Reducir errores y mermas</option>
                </select>
              </div>

              <div>
                <span className={styles.fieldLabel}>KPI más relevante</span>
                <div className={styles.chipGroup}>
                  {KPIS.map((k) => (
                    <button
                      key={k}
                      className={`${styles.chip} ${kpi === k ? styles.chipActive : ""}`}
                      onClick={() => setKpi(k)}
                      type="button"
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className={styles.fieldLabel}>Número de tiendas a impactar</span>
                <input
                  type="number"
                  className={styles.numberInput}
                  value={tiendas}
                  onChange={(e) => setTiendas(Number(e.target.value))}
                  min={1}
                />
              </div>

              <button
                className={styles.generateBtn}
                onClick={handleGenerate}
                disabled={loading || !proceso.trim()}
              >
                {loading ? (
                  <>
                    <span className={styles.spinner} />
                    Generando Plan...
                  </>
                ) : (
                  "⚡ Generar Plan de Acción"
                )}
              </button>
            </div>

            {/* Result */}
            <div className={styles.resultPanel}>
              {!result && !error && !loading && (
                <div className={styles.resultEmpty}>
                  <div className={styles.resultEmptyIcon}>⚙️</div>
                  <p className={styles.resultEmptyText}>
                    Ingresa un proceso y presiona Generar Plan de Acción para
                    ver la metodología en acción.
                  </p>
                </div>
              )}

              {loading && (
                <div className={styles.resultEmpty}>
                  <div className={styles.spinner} style={{ width: 32, height: 32, borderWidth: 3, borderTopColor: "var(--teal)", borderColor: "var(--navy-border)" }} />
                  <p className={styles.resultEmptyText} style={{ color: "var(--gray-light)" }}>
                    Analizando el proceso y generando el plan...
                  </p>
                </div>
              )}

              {error && !loading && (
                <div className={styles.resultError}>{error}</div>
              )}

              {result && !loading && (
                <>
                  <div className={styles.resultHeader}>
                    <span className={styles.resultDot} />
                    <div>
                      <p className={styles.resultTitle}>Plan de Acción Generado</p>
                      <span className={styles.resultMeta}>{tiendas} tiendas · {area}</span>
                    </div>
                  </div>

                  <div className={styles.resultPhases}>
                    {result.phases.map((phase, idx) => (
                      <div
                        key={phase.id}
                        className={styles.phaseCard}
                        style={{
                          borderLeftColor: PHASE_COLORS[idx] ?? "#00e5c3",
                          animationDelay: `${idx * 0.07}s`,
                        }}
                      >
                        <span
                          className={styles.phaseTag}
                          style={{ color: PHASE_COLORS[idx] ?? "#00e5c3" }}
                        >
                          {phase.id} · {phase.name}
                        </span>
                        <p className={styles.phaseCardTitle}>{phase.title}</p>
                        <ul className={styles.phaseActions}>
                          {phase.actions.map((action) => (
                            <li key={action}>{action}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────── */}
      <section id="contacto" className={styles.cta}>
        <div className={styles.ctaBg} />
        <h2 className={styles.ctaTitle}>
          ¿Listo para transformar la operación{" "}
          <span className={styles.heroTeal}>TOTTO</span>?
        </h2>
        <p className={styles.ctaSub}>
          Agenda una sesión estratégica con nuestro equipo y diseñemos juntos el
          plan de manuales y capacitación para toda la red.
        </p>
        <a
          href="mailto:dani@franquiciaslatam.com?subject=TOTTO%20-%20Proyecto%20Manuales%20%26%20Capacitaci%C3%B3n"
          className={styles.ctaBtn}
        >
          Agendar Sesión →
        </a>
      </section>

      {/* ─── Footer ───────────────────────────────────────────────── */}
      <footer className={styles.footer}>
        © 2026 Franquicias LATAM · Latinoamericana de Franquicias SAS · Bogotá, Colombia
      </footer>
    </div>
  );
}
