"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CONSOLE,
  STEP_A,
  STEP_B,
  STEP_C,
  STEP_D,
  type ConsoleStepId,
} from "@/lib/totto/caso001";
import {
  useAnchorScroll,
  useInView,
  useMediaQuery,
  useReducedMotion,
  useTypedLines,
} from "./hooks";
import { Evidence, cx } from "./parts";
import s from "./caso001.module.css";

const STEP_IDS: ConsoleStepId[] = ["A", "B", "C", "D"];

/**
 * Consola Stoik Intel: el momento demo. Cuatro pasos que el presentador
 * recorre en vivo con clic, flechas o auto-play, y que escalan de un barrido
 * de listados hasta la bodega física en Cúcuta.
 */
export default function StoikConsole() {
  const [active, setActive] = useState<ConsoleStepId>("A");
  const [autoplay, setAutoplay] = useState(false);
  const [rootRef, inView] = useInView<HTMLDivElement>({ threshold: 0.25 });
  const tabsRef = useRef<Array<HTMLButtonElement | null>>([]);

  const activeIndex = STEP_IDS.indexOf(active);
  // El auto-play se apaga solo al llegar a D: se deriva en vez de guardarse,
  // así el último paso se queda quieto sin un setState de rebote.
  const autoRunning = autoplay && active !== "D";

  const select = useCallback((id: ConsoleStepId, focus = false) => {
    setActive(id);
    if (focus) tabsRef.current[STEP_IDS.indexOf(id)]?.focus();
  }, []);

  // Auto-play: avanza A → D mientras la consola esté a la vista.
  useEffect(() => {
    if (!autoRunning || !inView) return;
    const timer = setTimeout(() => {
      setActive(STEP_IDS[STEP_IDS.indexOf(active) + 1]);
    }, 7000);
    return () => clearTimeout(timer);
  }, [autoRunning, inView, active]);

  const onTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const map: Record<string, number> = {
      ArrowRight: activeIndex + 1,
      ArrowLeft: activeIndex - 1,
      Home: 0,
      End: STEP_IDS.length - 1,
    };
    const next = map[event.key];
    if (next === undefined) return;
    event.preventDefault();
    setAutoplay(false);
    const clamped = Math.min(Math.max(next, 0), STEP_IDS.length - 1);
    select(STEP_IDS[clamped], true);
  };

  return (
    <div ref={rootRef} className={s.console}>
      <div className={s.consoleBar}>
        <span className={s.dots} aria-hidden="true">
          <i className={cx(s.dot, s.dotRed)} />
          <i className={cx(s.dot, s.dotGold)} />
          <i className={cx(s.dot, s.dotGreen)} />
        </span>
        <span className={s.consoleTitle}>{CONSOLE.eyebrow}</span>
        <span className={s.consoleRight}>
          <button
            type="button"
            className={cx(s.autoBtn, autoRunning && s.autoBtnOn)}
            aria-pressed={autoRunning}
            onClick={() => {
              const next = !autoRunning;
              setAutoplay(next);
              // Reencender en el último paso reinicia el recorrido.
              if (next && active === "D") setActive("A");
            }}
          >
            {autoRunning ? CONSOLE.autoplayOnLabel : CONSOLE.autoplayLabel}
          </button>
          <span className={s.live}>
            <i className={s.livePulse} aria-hidden="true" />
            {CONSOLE.liveLabel}
          </span>
        </span>
      </div>

      <div className={s.steps} role="tablist" aria-label={CONSOLE.title}>
        {CONSOLE.steps.map((step, index) => {
          const state =
            step.id === active ? "active" : index < activeIndex ? "done" : "idle";
          return (
            <button
              key={step.id}
              ref={(node) => {
                tabsRef.current[index] = node;
              }}
              type="button"
              role="tab"
              id={`caso001-tab-${step.id}`}
              aria-selected={step.id === active}
              aria-controls={`caso001-panel-${step.id}`}
              tabIndex={step.id === active ? 0 : -1}
              className={cx(
                s.step,
                state === "active" && s.stepActive,
                state === "done" && s.stepDone,
              )}
              onClick={() => {
                setAutoplay(false);
                select(step.id);
              }}
              onKeyDown={onTabKeyDown}
            >
              <i className={s.stepTick} aria-hidden="true" />
              {step.tab}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`caso001-panel-${active}`}
        aria-labelledby={`caso001-tab-${active}`}
        tabIndex={0}
        key={active}
        className={s.panel}
      >
        {active === "A" ? <PanelA live={inView} /> : null}
        {active === "B" ? <PanelB /> : null}
        {active === "C" ? <PanelC live={inView} /> : null}
        {active === "D" ? <PanelD /> : null}
      </div>
    </div>
  );
}

// ── A · Barrido ─────────────────────────────────────────────────────────────

type TermLine =
  | { kind: "text"; text: string }
  | { kind: "prompt"; text: string }
  | { kind: "hit"; title: string; score: number; signal: string };

function buildTermLines(): TermLine[] {
  return [
    ...STEP_A.bootLines.map((text) => ({ kind: "text" as const, text })),
    { kind: "prompt" as const, text: STEP_A.command },
    ...STEP_A.scanLines.map((text) => ({ kind: "text" as const, text })),
    ...STEP_A.listings.map((hit) => ({
      kind: "hit" as const,
      title: hit.title,
      score: hit.score,
      signal: hit.signal,
    })),
    ...STEP_A.tailLines.map((text) => ({ kind: "text" as const, text })),
  ];
}

function PanelA({ live }: { live: boolean }) {
  const lines = buildTermLines();
  const { printed, done } = useTypedLines(lines.length, live);
  const reduced = useReducedMotion();

  return (
    <>
      <h3 className={s.panelTitle}>{STEP_A.title}</h3>
      <p className={cx(s.body, s.reveal, s.revealIn)} style={{ marginTop: 12 }}>
        {STEP_A.body}
      </p>

      <div className={s.panelSplit}>
        <div>
          <div className={s.terminal} aria-live="polite" aria-atomic="false">
            {lines.slice(0, printed).map((line, index) => {
              if (line.kind === "prompt") {
                return (
                  <div key={index} className={s.termLine}>
                    <span className={s.termPrompt}>{"stoik $ "}</span>
                    <span className={s.termCmd}>{line.text}</span>
                  </div>
                );
              }
              if (line.kind === "hit") {
                return (
                  <div key={index} className={cx(s.termLine, s.termHit)}>
                    <span className={s.termHitTitle}>{`> ${line.title}`}</span>
                    <span
                      className={line.score >= 90 ? s.termScore : s.termScoreLow}
                    >{`score ${line.score}`}</span>
                    <span className={s.termSignal}>{`señal: ${line.signal}`}</span>
                  </div>
                );
              }
              return (
                <div key={index} className={s.termLine}>
                  {line.text}
                </div>
              );
            })}
            {!done && !reduced ? <i className={s.caret} aria-hidden="true" /> : null}
          </div>

          <div className={s.kpiRow}>
            {STEP_A.kpis.map((kpi) => (
              <div key={kpi.label} className={s.kpi}>
                <p className={s.kpiValue}>{kpi.value}</p>
                <p className={s.kpiLabel}>{kpi.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={cx(s.card, s.cardPad)}>
          <p className={s.eyebrow}>{STEP_A.scoringTitle}</p>
          <ul className={s.ruleList}>
            {STEP_A.scoring.map((rule) => (
              <li key={rule.rule} className={s.ruleItem}>
                <span>{rule.rule}</span>
                <span className={s.rulePoints}>{rule.points}</span>
              </li>
            ))}
          </ul>
          <p className={s.note} style={{ marginTop: 14 }}>
            {STEP_A.scoringNote}
          </p>
        </div>
      </div>
    </>
  );
}

// ── B · Reconocimiento ──────────────────────────────────────────────────────

function PanelB() {
  return (
    <>
      <h3 className={s.panelTitle}>{STEP_B.title}</h3>
      <p className={s.body} style={{ marginTop: 12 }}>
        {STEP_B.body}
      </p>

      <div className={s.panelSplit}>
        <Evidence slug={STEP_B.evidence} />

        <div>
          <div className={s.grid2}>
            {STEP_B.features.map((feature) => (
              <div key={feature.name} className={cx(s.card, s.cardPad)}>
                <p className={s.traitTitle}>{feature.name}</p>
                <p className={s.note} style={{ marginTop: 8 }}>
                  {feature.note}
                </p>
              </div>
            ))}
          </div>

          <div className={s.chips} style={{ marginTop: 18 }}>
            {STEP_B.stack.map((chip) => (
              <span key={chip} className={s.chip}>
                {chip}
              </span>
            ))}
          </div>

          <div className={cx(s.card, s.cardPad)} style={{ marginTop: 18 }}>
            <p className={s.eyebrow}>{STEP_B.multiplierTitle}</p>
            <p className={s.body} style={{ marginTop: 10 }}>
              {STEP_B.multiplier}
            </p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <Evidence slug={STEP_B.multiplierEvidence} />
      </div>
    </>
  );
}

// ── C · El grafo ────────────────────────────────────────────────────────────

/**
 * El grafo tiene dos plantas. En pantalla ancha la red corre de izquierda a
 * derecha y colapsa en el núcleo; en móvil se apila y el núcleo baja, porque
 * escalar la versión ancha dejaría las etiquetas ilegibles.
 */
const GRAPH_WIDE = {
  width: 760,
  height: 400,
  pill: { w: 136, h: 44 },
  box: { w: 156, h: 44 },
  coreBox: { w: 192, h: 80 },
  coreFrom: "right" as const,
  people: [
    { x: 92, y: 66 },
    { x: 92, y: 200 },
    { x: 92, y: 334 },
  ],
  warehouses: [
    { x: 330, y: 66 },
    { x: 330, y: 200 },
    { x: 330, y: 334 },
  ],
  core: { x: 620, y: 200 },
};

const GRAPH_NARROW = {
  width: 380,
  height: 580,
  pill: { w: 146, h: 42 },
  box: { w: 196, h: 42 },
  coreBox: { w: 236, h: 76 },
  coreFrom: "below" as const,
  people: [
    { x: 82, y: 54 },
    { x: 82, y: 172 },
    { x: 82, y: 290 },
  ],
  warehouses: [
    { x: 274, y: 54 },
    { x: 274, y: 172 },
    { x: 274, y: 290 },
  ],
  core: { x: 190, y: 486 },
};

function PanelC({ live }: { live: boolean }) {
  const reduced = useReducedMotion();
  const narrow = useMediaQuery("(max-width: 760px)");
  const g = narrow ? GRAPH_NARROW : GRAPH_WIDE;
  const [drawn, setDrawn] = useState(0);
  // Con movimiento reducido el grafo aparece ya resuelto, sin trazado escalonado.
  const phase = reduced ? 4 : drawn;

  useEffect(() => {
    if (!live || reduced) return;
    const timers = [1, 2, 3, 4].map((step) =>
      setTimeout(() => setDrawn(step), 260 + step * 460),
    );
    return () => timers.forEach(clearTimeout);
  }, [live, reduced]);

  return (
    <>
      <h3 className={s.panelTitle}>{STEP_C.title}</h3>
      <p className={s.body} style={{ marginTop: 12 }}>
        {STEP_C.body}
      </p>

      <div className={cx(s.panelSplit, s.panelSplitWide)}>
        <div className={s.graphWrap}>
          <svg
            className={cx(s.graph, narrow && s.graphNarrow)}
            viewBox={`0 0 ${g.width} ${g.height}`}
            role="img"
            aria-label={`Grafo de resolución de entidad: ${STEP_C.people
              .map((p) => `${p.label} con bodega ${p.warehouse}`)
              .join("; ")}. Todas las aristas colapsan en un nodo central rotulado ${
              STEP_C.core.label
            } con ${STEP_C.core.value}.`}
          >
            {/* Aristas: persona → bodega → núcleo, más los cruces por señales
                compartidas entre cuentas. */}
            <g>
              {g.people.map((person, i) => (
                <line
                  key={`pw-${i}`}
                  className={cx(s.edge, phase >= 3 && s.edgeOn)}
                  x1={person.x + g.pill.w / 2}
                  y1={person.y}
                  x2={g.warehouses[i].x - g.box.w / 2}
                  y2={g.warehouses[i].y}
                  style={{ transitionDelay: `${i * 90}ms` }}
                />
              ))}
              {g.warehouses.map((warehouse, i) => (
                <line
                  key={`wc-${i}`}
                  className={cx(s.edge, phase >= 4 && s.edgeOn)}
                  x1={g.coreFrom === "right" ? warehouse.x + g.box.w / 2 : warehouse.x}
                  y1={g.coreFrom === "right" ? warehouse.y : warehouse.y + g.box.h / 2}
                  x2={g.coreFrom === "right" ? g.core.x - g.coreBox.w / 2 : g.core.x}
                  y2={g.coreFrom === "right" ? g.core.y : g.core.y - g.coreBox.h / 2}
                  style={{ transitionDelay: `${140 + i * 90}ms` }}
                />
              ))}
              {[0, 1].map((i) => (
                <line
                  key={`pp-${i}`}
                  className={cx(s.edge, phase >= 3 && s.edgeOn)}
                  x1={g.people[i].x}
                  y1={g.people[i].y + g.pill.h / 2}
                  x2={g.people[i + 1].x}
                  y2={g.people[i + 1].y - g.pill.h / 2}
                  style={{ transitionDelay: `${240 + i * 90}ms` }}
                />
              ))}
            </g>

            {STEP_C.people.map((person, i) => (
              <g
                key={person.id}
                className={cx(s.nodeG, phase >= 1 && s.nodeOn)}
                style={{ transitionDelay: `${i * 110}ms` }}
              >
                <rect
                  className={s.nodeShape}
                  x={g.people[i].x - g.pill.w / 2}
                  y={g.people[i].y - g.pill.h / 2}
                  width={g.pill.w}
                  height={g.pill.h}
                  rx={g.pill.h / 2}
                />
                <text
                  className={s.nodeLabel}
                  x={g.people[i].x}
                  y={g.people[i].y + 4}
                  textAnchor="middle"
                >
                  {person.label}
                </text>
              </g>
            ))}

            {STEP_C.people.map((person, i) => (
              <g
                key={`${person.id}-wh`}
                className={cx(s.nodeG, phase >= 2 && s.nodeOn)}
                style={{ transitionDelay: `${i * 110}ms` }}
              >
                <rect
                  className={cx(s.nodeShape, s.nodeShapeWarehouse)}
                  x={g.warehouses[i].x - g.box.w / 2}
                  y={g.warehouses[i].y - g.box.h / 2}
                  width={g.box.w}
                  height={g.box.h}
                  rx={10}
                />
                <text
                  className={s.nodeSub}
                  x={g.warehouses[i].x}
                  y={g.warehouses[i].y + 3}
                  textAnchor="middle"
                >
                  {person.warehouse}
                </text>
              </g>
            ))}

            <g className={cx(s.nodeG, phase >= 4 && s.nodeOn)}>
              <rect
                className={s.coreHalo}
                x={g.core.x - g.coreBox.w / 2}
                y={g.core.y - g.coreBox.h / 2}
                width={g.coreBox.w}
                height={g.coreBox.h}
                rx={18}
              />
              <rect
                className={s.coreShape}
                x={g.core.x - g.coreBox.w / 2}
                y={g.core.y - g.coreBox.h / 2}
                width={g.coreBox.w}
                height={g.coreBox.h}
                rx={18}
              />
              <text
                className={s.coreLabel}
                x={g.core.x}
                y={g.core.y - 4}
                textAnchor="middle"
              >
                {STEP_C.core.label}
              </text>
              <text
                className={s.coreValue}
                x={g.core.x}
                y={g.core.y + 20}
                textAnchor="middle"
              >
                {STEP_C.core.value}
              </text>
            </g>
          </svg>
        </div>

        <div className={cx(s.card, s.cardPad)}>
          <p className={s.eyebrow}>Señales que unen las cuentas</p>
          <ul className={s.ruleList}>
            {STEP_C.signals.map((signal) => (
              <li key={signal} className={s.ruleItem}>
                <span>{signal}</span>
                <span className={s.rulePoints}>match</span>
              </li>
            ))}
          </ul>
          <p className={cx(s.eyebrow, s.eyebrowRed)} style={{ marginTop: 16 }}>
            {STEP_C.resolution}
          </p>
          <p className={s.note} style={{ marginTop: 8 }}>
            {STEP_C.caption}
          </p>
        </div>
      </div>
    </>
  );
}

// ── D · La capa profunda ────────────────────────────────────────────────────

function PanelD() {
  const scrollTo = useAnchorScroll();
  const codeLines = STEP_D.code.split("\n");
  const hot = new Set<number>(STEP_D.highlightLines);

  return (
    <>
      <h3 className={s.panelTitle}>{STEP_D.title}</h3>
      <p className={s.body} style={{ marginTop: 12 }}>
        {STEP_D.body}
      </p>

      <div className={s.panelSplit}>
        <pre className={s.code}>
          <code>
            {codeLines.map((line, index) => (
              <span
                key={index}
                className={cx(s.codeLine, hot.has(index) && s.codeLineHot)}
              >
                {line || " "}
                {"\n"}
              </span>
            ))}
          </code>
        </pre>

        <div>
          <p className={s.quoteBig}>{STEP_D.quote}</p>
          <div className={s.kpiRow}>
            {STEP_D.kpis.map((kpi) => (
              <div key={kpi.label} className={s.kpi}>
                <p className={s.kpiValue}>{kpi.value}</p>
                <p className={s.kpiLabel}>{kpi.label}</p>
              </div>
            ))}
          </div>
          <button
            type="button"
            className={s.linkBtn}
            onClick={() => scrollTo(STEP_D.ctaTarget)}
          >
            {STEP_D.cta}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M8 3v10m0 0 4-4m-4 4-4-4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
