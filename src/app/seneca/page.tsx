"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { dossierToText } from "@/lib/seneca/engine";
import { RADAR_DATA, SIGNAL_LABELS, type SignalType } from "@/lib/seneca/radar";
import type { Dossier, SegmentId } from "@/lib/seneca/types";
import s from "./seneca.module.css";

type View = "analizar" | "radar";

const SEGMENT_CHIPS: { id: SegmentId | "auto"; label: string }[] = [
  { id: "auto", label: "Auto" },
  { id: "horeca", label: "HORECA" },
  { id: "construccion", label: "Construcción" },
  { id: "diseno", label: "Diseño" },
  { id: "retail", label: "Retail" },
  { id: "corporativo", label: "Corporativo" },
  { id: "b2c", label: "Persona B2C" },
];

const EXAMPLES: { name: string; segment?: SegmentId }[] = [
  { name: "Grupo Takami" },
  { name: "Constructora Amarilo" },
  { name: "Hoteles Estelar" },
  { name: "María Fernanda Suárez", segment: "b2c" },
];

const LOADING_STAGES = [
  "Clasificando segmento y subvertical…",
  "Rastreando señales públicas y sociales…",
  "Mapeando dolores de la operación…",
  "Identificando comité de compra…",
  "Cruzando portafolio Bamicol…",
  "Redactando playbook comercial…",
];

const POWER_CLASS: Record<string, string> = {
  decisor: s.powerDecisor,
  influenciador: s.powerInfluenciador,
  usuario: s.powerUsuario,
  bloqueador: s.powerBloqueador,
};

const TAG_CLASS: Record<SignalType, string> = {
  remodelacion: s.tagRemodelacion,
  apertura: s.tagApertura,
  quejas: s.tagQuejas,
  proyecto: s.tagProyecto,
  expansion: s.tagExpansion,
};

function scoreColor(v: number): string {
  if (v >= 85) return "#4cb782";
  if (v >= 70) return "#828fff";
  if (v >= 55) return "#f2994a";
  return "#eb5757";
}

function sevClass(sev: number): string {
  if (sev >= 5) return s.sevOn5;
  if (sev >= 3) return s.sevOn3;
  return s.sevOn1;
}

export default function SenecaPage() {
  const [view, setView] = useState<View>("analizar");
  const [query, setQuery] = useState("");
  const [segmentHint, setSegmentHint] = useState<SegmentId | "auto">("auto");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(0);
  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [radarSegment, setRadarSegment] = useState<SegmentId | "todos">("todos");
  const [radarSignal, setRadarSignal] = useState<SignalType | "todas">("todas");

  const inputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        setView("analizar");
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!loading) return;
    setStage(0);
    const t = setInterval(
      () => setStage((prev) => Math.min(prev + 1, LOADING_STAGES.length - 1)),
      1400
    );
    return () => clearInterval(t);
  }, [loading]);

  const analyze = useCallback(
    async (name: string, hint?: SegmentId, city?: string) => {
      const client = name.trim();
      if (client.length < 2) return;
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setView("analizar");
      setQuery(client);
      setLoading(true);
      setError(null);
      setDossier(null);

      try {
        const res = await fetch("/api/seneca", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ client, segment: hint, city }),
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error(
            res.status === 429
              ? "Límite de análisis por hora alcanzado. Intente de nuevo más tarde."
              : "No se pudo completar el análisis."
          );
        }
        const data = (await res.json()) as Dossier;
        setDossier(data);
        requestAnimationFrame(() =>
          resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
        );
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          setError((e as Error).message);
        }
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const copy = useCallback(async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied((prev) => (prev === key ? null : prev)), 1800);
    } catch {
      /* clipboard no disponible */
    }
  }, []);

  const radarRows = useMemo(() => {
    return RADAR_DATA.filter(
      (b) =>
        (radarSegment === "todos" || b.segment === radarSegment) &&
        (radarSignal === "todas" || b.signalType === radarSignal)
    ).sort((a, b) => b.heat - a.heat);
  }, [radarSegment, radarSignal]);

  const radarStats = useMemo(() => {
    const cities = new Set(RADAR_DATA.map((b) => b.city.split(" / ")[0]));
    return {
      total: RADAR_DATA.length,
      hot: RADAR_DATA.filter((b) => b.heat >= 85).length,
      cities: cities.size,
    };
  }, []);

  const submit = () => {
    void analyze(query, segmentHint === "auto" ? undefined : segmentHint);
  };

  return (
    <div className={s.root}>
      <div className={s.glow} aria-hidden />

      <nav className={s.nav}>
        <div className={s.navBrand}>
          <span className={s.navMark}>S</span>
          Seneca Int.
          <span className={s.navBadge}>× Bamicol</span>
        </div>
        <div className={s.navRight}>
          <button
            className={`${s.navTab} ${view === "analizar" ? s.navTabActive : ""}`}
            onClick={() => setView("analizar")}
          >
            Análisis
          </button>
          <button
            className={`${s.navTab} ${view === "radar" ? s.navTabActive : ""}`}
            onClick={() => setView("radar")}
          >
            Radar B2B
            <span style={{ marginLeft: 6, opacity: 0.6, fontSize: 11 }}>
              {RADAR_DATA.length}
            </span>
          </button>
        </div>
      </nav>

      <main className={s.shell}>
        {view === "analizar" && (
          <>
            <header className={s.hero}>
              <div className={s.eyebrow}>
                <span className={s.eyebrowDot} />
                Inteligencia comercial · Electrodomésticos de alta gama
              </div>
              <h1 className={s.h1}>
                Conozca a su cliente antes de la primera llamada.
              </h1>
              <p className={s.sub}>
                Escriba el nombre de un cliente potencial — empresa o persona — y
                Seneca mapea sus dolores, su comité de compra y el portafolio
                Bamicol que los resuelve. Con playbook de venta listo para usar.
              </p>
            </header>

            <section className={s.command}>
              <div className={s.commandBox}>
                <span className={s.commandIcon}>
                  <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
                    <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M11 11L14.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>
                <input
                  ref={inputRef}
                  className={s.commandInput}
                  placeholder="Nombre del cliente potencial… ej. Grupo Takami"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  maxLength={120}
                  autoFocus
                />
                <span className={s.kbd}>/</span>
                <button
                  className={s.analyzeBtn}
                  onClick={submit}
                  disabled={loading || query.trim().length < 2}
                >
                  {loading ? "Analizando…" : "Analizar"}
                </button>
              </div>

              <div className={s.chipsRow}>
                <span className={s.chipLabel}>Segmento</span>
                {SEGMENT_CHIPS.map((c) => (
                  <button
                    key={c.id}
                    className={`${s.chip} ${segmentHint === c.id ? s.chipActive : ""}`}
                    onClick={() => setSegmentHint(c.id)}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {!dossier && !loading && (
                <div className={s.examplesRow}>
                  {EXAMPLES.map((ex) => (
                    <button
                      key={ex.name}
                      className={s.exampleChip}
                      onClick={() => void analyze(ex.name, ex.segment)}
                    >
                      {ex.name} ↗
                    </button>
                  ))}
                </div>
              )}
            </section>

            {loading && (
              <div className={s.loading}>
                <div className={s.loadingBar}>
                  <div className={s.loadingFill} />
                </div>
                <div className={s.loadingStage} key={stage}>
                  {LOADING_STAGES[stage]}
                </div>
              </div>
            )}

            {error && (
              <div className={s.loading}>
                <div className={s.loadingStage} style={{ color: "#eb5757" }}>
                  {error}
                </div>
              </div>
            )}

            {dossier && !loading && (
              <div className={s.dossier} ref={resultRef}>
                <div className={s.dossierHead}>
                  <div className={s.dossierTitleWrap}>
                    <h2 className={s.dossierClient}>{dossier.client}</h2>
                    <div className={s.dossierMeta}>
                      <span className={`${s.badge} ${s.badgeAccent}`}>
                        {dossier.segmentLabel}
                      </span>
                      <span className={s.badge}>{dossier.subVertical}</span>
                      {dossier.city && <span className={s.badge}>{dossier.city}</span>}
                      <span className={s.badge}>
                        Confianza {dossier.confidence}%
                      </span>
                      <span
                        className={`${s.badge} ${dossier.source === "ai" ? s.badgeGreen : ""}`}
                      >
                        {dossier.source === "ai" ? "● IA en vivo" : "◦ Motor Seneca"}
                      </span>
                    </div>
                  </div>
                  <div className={s.scoreWrap}>
                    <div className={s.scoreRing}>
                      <svg width="86" height="86" viewBox="0 0 86 86">
                        <circle cx="43" cy="43" r="37" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="6" />
                        <circle
                          cx="43" cy="43" r="37" fill="none"
                          stroke={scoreColor(dossier.score)}
                          strokeWidth="6" strokeLinecap="round"
                          strokeDasharray={`${(dossier.score / 100) * 2 * Math.PI * 37} ${2 * Math.PI * 37}`}
                        />
                      </svg>
                      <div className={s.scoreValue}>
                        {dossier.score}
                        <span className={s.scoreCaption}>Score</span>
                      </div>
                    </div>
                    <div className={s.ticketBox}>
                      <div className={s.ticketLabel}>Ticket estimado</div>
                      <div className={s.ticketValue}>{dossier.ticketRange}</div>
                    </div>
                  </div>
                </div>

                <div className={s.summaryPanel}>{dossier.summary}</div>

                <div className={s.grid}>
                  <section className={s.panel}>
                    <h3 className={s.panelTitle}>
                      {dossier.labels.pains}
                      <em>{dossier.pains.length} detectados</em>
                    </h3>
                    {dossier.pains.map((p) => (
                      <article className={s.pain} key={p.title}>
                        <div className={s.painHead}>
                          <span className={s.painTitle}>{p.title}</span>
                          <span className={s.sevBar} title={`Severidad ${p.severity}/5`}>
                            {[1, 2, 3, 4, 5].map((i) => (
                              <span
                                key={i}
                                className={`${s.sevSeg} ${i <= p.severity ? sevClass(p.severity) : ""}`}
                              />
                            ))}
                          </span>
                        </div>
                        <p className={s.painDetail}>{p.detail}</p>
                        <div className={s.painSolution}>
                          <b>Bamicol →</b> {p.solution}
                        </div>
                      </article>
                    ))}
                  </section>

                  <section className={s.panel}>
                    <h3 className={s.panelTitle}>
                      {dossier.labels.buyers}
                      <em>{dossier.buyers.length} perfiles</em>
                    </h3>
                    {dossier.buyers.map((b) => (
                      <article className={s.buyer} key={b.role}>
                        <div className={s.buyerHead}>
                          <span className={s.buyerRole}>{b.role}</span>
                          <span className={`${s.powerTag} ${POWER_CLASS[b.power] ?? ""}`}>
                            {b.power}
                          </span>
                        </div>
                        <p className={s.buyerCares}>
                          <b>Le importa:</b> {b.cares}
                        </p>
                        <p className={s.buyerAngle}>
                          <b>Ángulo:</b> {b.angle}
                        </p>
                      </article>
                    ))}
                  </section>

                  <section className={`${s.panel} ${s.panelWide}`}>
                    <h3 className={s.panelTitle}>
                      Portafolio Bamicol recomendado
                      <em>match por segmento</em>
                    </h3>
                    <div className={s.productGrid}>
                      {dossier.products.map((p) => (
                        <article className={s.product} key={`${p.brand}-${p.line}`}>
                          <div className={s.productHead}>
                            <span className={s.productBrand}>{p.brand}</span>
                            <span className={s.productTag}>{p.tag}</span>
                          </div>
                          <div className={s.productLine}>{p.line}</div>
                          <div className={s.productWhy}>{p.why}</div>
                        </article>
                      ))}
                    </div>
                  </section>

                  <section className={s.panel}>
                    <h3 className={s.panelTitle}>Señales de mercado</h3>
                    {dossier.signals.map((sig) => (
                      <div className={s.signal} key={sig}>
                        <span className={s.signalDot} />
                        {sig}
                      </div>
                    ))}
                  </section>

                  <section className={s.panel}>
                    <h3 className={s.panelTitle}>
                      Guion de apertura
                      <button
                        className={s.copyBtn}
                        onClick={() => copy("opener", dossier.playbook.opener)}
                      >
                        {copied === "opener" ? "Copiado ✓" : "Copiar"}
                      </button>
                    </h3>
                    <div className={s.opener}>{dossier.playbook.opener}</div>
                  </section>

                  <section className={s.panel}>
                    <h3 className={s.panelTitle}>Preguntas de descubrimiento</h3>
                    <ol className={s.listNum}>
                      {dossier.playbook.discovery.map((q) => (
                        <li key={q}>{q}</li>
                      ))}
                    </ol>
                  </section>

                  <section className={s.panel}>
                    <h3 className={s.panelTitle}>Objeciones probables</h3>
                    {dossier.playbook.objections.map((o) => (
                      <article className={s.objection} key={o.objection}>
                        <div className={s.objectionQ}>{o.objection}</div>
                        <div className={s.objectionA}>{o.response}</div>
                      </article>
                    ))}
                  </section>

                  <section className={`${s.panel} ${s.panelWide}`}>
                    <h3 className={s.panelTitle}>Próximos pasos</h3>
                    <ol className={s.listNum}>
                      {dossier.playbook.nextSteps.map((st) => (
                        <li key={st}>{st}</li>
                      ))}
                    </ol>
                  </section>
                </div>

                <div className={s.actionsRow}>
                  <button
                    className={s.actionBtn}
                    onClick={() => copy("full", dossierToText(dossier))}
                  >
                    {copied === "full" ? "Dossier copiado ✓" : "⧉ Copiar dossier completo"}
                  </button>
                  <button className={s.actionBtn} onClick={() => window.print()}>
                    ⎙ Imprimir / PDF
                  </button>
                  <button
                    className={s.actionBtn}
                    onClick={() => {
                      setDossier(null);
                      setQuery("");
                      inputRef.current?.focus();
                    }}
                  >
                    ← Nuevo análisis
                  </button>
                </div>
              </div>
            )}

            {!dossier && !loading && !error && (
              <section className={s.how}>
                <div className={s.howCard}>
                  <div className={s.howNum}>01</div>
                  <div className={s.howTitle}>Escriba el nombre</div>
                  <div className={s.howText}>
                    Empresa o persona. Seneca clasifica el segmento — HORECA,
                    construcción, diseño, retail, corporativo o consumidor de
                    alto valor — y su subvertical.
                  </div>
                </div>
                <div className={s.howCard}>
                  <div className={s.howNum}>02</div>
                  <div className={s.howTitle}>Reciba el dossier</div>
                  <div className={s.howText}>
                    Dolores priorizados por severidad, comité de compra con
                    ángulo de entrada por rol, y el match exacto del portafolio
                    Bamicol: Sub-Zero, Wolf, Fhiaba, Bertazzoni, Franke, Teka.
                  </div>
                </div>
                <div className={s.howCard}>
                  <div className={s.howNum}>03</div>
                  <div className={s.howTitle}>Salga a vender</div>
                  <div className={s.howText}>
                    Guion de apertura, preguntas de descubrimiento, respuestas a
                    objeciones y próximos pasos. Cópielo a WhatsApp y agende la
                    reunión.
                  </div>
                </div>
              </section>
            )}
          </>
        )}

        {view === "radar" && (
          <>
            <header className={s.radarHead}>
              <div className={s.eyebrow}>
                <span className={s.eyebrowDot} />
                Radar B2B · Google Places + señales sociales
              </div>
              <h1 className={s.h1}>Oportunidades activas en Colombia.</h1>
              <p className={s.sub}>
                Negocios con señales de compra ahora: remodelaciones anunciadas,
                aperturas, proyectos en preventa y quejas de equipos en reseñas.
                Toque cualquiera para generar su dossier.
              </p>
            </header>

            <div className={s.radarStats}>
              <div className={s.stat}>
                <div className={s.statValue}>{radarStats.total}</div>
                <div className={s.statLabel}>Cuentas mapeadas</div>
              </div>
              <div className={s.stat}>
                <div className={s.statValue}>{radarStats.hot}</div>
                <div className={s.statLabel}>Oportunidades calientes</div>
              </div>
              <div className={s.stat}>
                <div className={s.statValue}>{radarStats.cities}</div>
                <div className={s.statLabel}>Ciudades</div>
              </div>
              <div className={s.stat}>
                <div className={s.statValue}>5</div>
                <div className={s.statLabel}>Industrias</div>
              </div>
            </div>

            <div className={s.filtersRow}>
              {(
                [
                  ["todos", "Todas las industrias"],
                  ["horeca", "HORECA"],
                  ["construccion", "Construcción"],
                  ["diseno", "Diseño"],
                  ["retail", "Retail"],
                  ["corporativo", "Corporativo"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  className={`${s.chip} ${radarSegment === id ? s.chipActive : ""}`}
                  onClick={() => setRadarSegment(id)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className={s.filtersRow}>
              {(
                [
                  ["todas", "Todas las señales"],
                  ["remodelacion", "Remodelación"],
                  ["apertura", "Apertura"],
                  ["proyecto", "Proyecto activo"],
                  ["quejas", "Quejas de equipo"],
                  ["expansion", "Expansión"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  className={`${s.chip} ${radarSignal === id ? s.chipActive : ""}`}
                  onClick={() => setRadarSignal(id)}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className={s.radarTable}>
              {radarRows.map((b, i) => (
                <button
                  key={b.name}
                  className={`${s.radarRow} ${b.heat >= 88 ? s.heatHot : ""}`}
                  onClick={() =>
                    void analyze(b.name, b.segment, b.city.split(" / ")[0])
                  }
                  title={`Generar dossier de ${b.name}`}
                >
                  <span className={s.radarRank}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className={s.radarName}>{b.name}</span>
                    <span className={s.radarSub}>{b.subVertical}</span>
                  </span>
                  <span className={s.radarCity}>
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                      <path d="M6 1C4 1 2.5 2.6 2.5 4.6C2.5 7.2 6 11 6 11C6 11 9.5 7.2 9.5 4.6C9.5 2.6 8 1 6 1Z" stroke="currentColor" strokeWidth="1.1" />
                      <circle cx="6" cy="4.6" r="1.2" fill="currentColor" />
                    </svg>
                    {b.city}
                  </span>
                  <span className={s.radarSignal}>
                    <span className={`${s.signalTag} ${TAG_CLASS[b.signalType]}`}>
                      {SIGNAL_LABELS[b.signalType]}
                    </span>
                    <br />
                    {b.signal}
                  </span>
                  <span className={s.radarRating}>
                    <span className={s.star}>★</span>
                    {b.rating.toFixed(1)}
                    <span style={{ color: "var(--faint, #62666d)" }}>
                      ({b.reviews.toLocaleString("es-CO")})
                    </span>
                  </span>
                  <span className={s.heatWrap}>
                    <span className={s.heatBarOuter}>
                      <span
                        className={s.heatBarInner}
                        style={{ width: `${b.heat}%`, display: "block" }}
                      />
                    </span>
                    <span className={s.heatValue}>{b.heat}</span>
                  </span>
                </button>
              ))}
            </div>
            <p className={s.radarFootnote}>
              Demo comercial: datos de rating, reseñas y señales son ilustrativos.
              En producción, el radar se alimenta de Google Places API y escucha
              social en tiempo real.
            </p>
          </>
        )}
      </main>

      <footer className={s.footer}>
        <span>
          Seneca Int. — Inteligencia comercial para Bamicol · Construido por
          Franquicias LATAM
        </span>
        <span className={s.srcBadge}>
          Sub-Zero · Wolf · Cove · Fhiaba · Bertazzoni · Franke · Teka
        </span>
      </footer>
    </div>
  );
}
