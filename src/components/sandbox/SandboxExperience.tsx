"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { recordSandboxEvent, setSandboxLocale } from "@/lib/sandbox/actions";
import { createTranslator, getSandboxMessages, type SandboxLocale } from "@/lib/sandbox/i18n";
import {
  SANDBOX_PHASE_IDS,
  nextPhase,
  phaseIndex,
  prevPhase,
  type SandboxPhaseId,
} from "@/lib/sandbox/phases";
import type { SandboxClientSession } from "@/lib/sandbox/types";
import BrandLockup from "./BrandLockup";
import IntroScreen from "./IntroScreen";
import LocaleToggle from "./LocaleToggle";
import PhasePlaceholder from "./PhasePlaceholder";
import PresenterRail from "./PresenterRail";
import ProgressRail from "./ProgressRail";
import ReportScreen from "./ReportScreen";
import SandboxBackground from "./SandboxBackground";
import { useReducedMotionSafe } from "./hooks";
import { PHASE_TRANSITION, phaseVariants } from "./motion";
import { SandboxContextProvider, type NavReason, type SandboxContextValue } from "./SandboxProvider";

type Props = {
  session: SandboxClientSession;
  presenter: boolean;
  initialPhase: SandboxPhaseId;
  calendarUrl: string | null;
};

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

/** Sincroniza `?fase=` sin re-render del server (Supabase + URL, sin localStorage). */
function syncPhaseParam(phase: SandboxPhaseId) {
  try {
    const url = new URL(window.location.href);
    if (phase === "intro") url.searchParams.delete("fase");
    else url.searchParams.set("fase", phase);
    window.history.replaceState(window.history.state, "", url.toString());
  } catch {
    /* entornos sin history */
  }
}

/**
 * Shell de la sesión: chrome de Franquicias LATAM (lockup, rail, idioma),
 * canvas con el acento del cliente, transición horizontal entre fases y rail
 * del presentador. Toda la interacción se registra en Supabase vía actions.
 */
export default function SandboxExperience({ session, presenter, initialPhase, calendarUrl }: Props) {
  const reduceMotion = useReducedMotionSafe();
  const [locale, setLocaleState] = useState<SandboxLocale>(session.locale);
  const [phase, setPhase] = useState<SandboxPhaseId>(initialPhase);
  const [visited, setVisited] = useState<SandboxPhaseId[]>(() =>
    SANDBOX_PHASE_IDS.slice(0, phaseIndex(initialPhase) + 1),
  );
  const [direction, setDirection] = useState<1 | -1>(1);
  const [presenterOpen, setPresenterOpen] = useState(false);
  const [phaseStartedAt, setPhaseStartedAt] = useState(() => Date.now());

  const phaseRef = useRef<SandboxPhaseId>(initialPhase);
  const phaseStartRef = useRef<number>(Date.now());
  const sessionStartRef = useRef<number>(Date.now());

  const t = useMemo(() => createTranslator(locale), [locale]);
  const messages = useMemo(() => getSandboxMessages(locale), [locale]);

  const track = useCallback(
    (type: string, payload?: Record<string, unknown>) => {
      void recordSandboxEvent({ slug: session.slug, phase: phaseRef.current, type, payload, presenter });
    },
    [session.slug, presenter],
  );

  // Apertura de sesión (una vez). En desktop el presentador abre con el rail visible.
  useEffect(() => {
    track("session_open", {
      initialPhase,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      ua: navigator.userAgent.slice(0, 160),
    });
    if (presenter && window.matchMedia("(min-width: 1024px)").matches) {
      setPresenterOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goTo = useCallback(
    (target: SandboxPhaseId, reason: NavReason = "jump") => {
      const from = phaseRef.current;
      if (target === from) return;
      const elapsedSec = Math.round((Date.now() - phaseStartRef.current) / 1000);
      void recordSandboxEvent({
        slug: session.slug,
        phase: from,
        type: "phase_complete",
        payload: { to: target, reason, elapsedSec },
        presenter,
      });

      setDirection(phaseIndex(target) > phaseIndex(from) ? 1 : -1);
      phaseRef.current = target;
      phaseStartRef.current = Date.now();
      setPhase(target);
      setPhaseStartedAt(phaseStartRef.current);
      setVisited((v) => (v.includes(target) ? v : [...v, target]));
      syncPhaseParam(target);

      void recordSandboxEvent({
        slug: session.slug,
        phase: target,
        type: "phase_enter",
        payload: { from, reason },
        presenter,
      });
    },
    [session.slug, presenter],
  );

  const next = useCallback(() => {
    const n = nextPhase(phaseRef.current);
    if (n) goTo(n, "next");
  }, [goTo]);

  const back = useCallback(() => {
    const p = prevPhase(phaseRef.current);
    if (p) goTo(p, "back");
  }, [goTo]);

  const setLocale = useCallback(
    (nextLocale: SandboxLocale) => {
      if (nextLocale === locale) return;
      setLocaleState(nextLocale);
      track("locale_change", { from: locale, to: nextLocale });
      void setSandboxLocale(session.slug, nextLocale);
    },
    [locale, session.slug, track],
  );

  // Atajos del presentador: ← → cambian de fase, N muestra u oculta el rail.
  useEffect(() => {
    if (!presenter) return;
    const onKey = (e: KeyboardEvent) => {
      if (isEditableTarget(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        back();
      } else if (e.key === "n" || e.key === "N") {
        setPresenterOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [presenter, next, back]);

  const accentStyle = {
    "--sb-accent": session.accent.onNavy,
    "--sb-accent-raw": session.accent.raw,
  } as CSSProperties;

  const ctx: SandboxContextValue = {
    session,
    presenter,
    locale,
    setLocale,
    t,
    messages,
    phase,
    visited,
    goTo,
    next,
    back,
    track,
    reduceMotion,
    calendarUrl,
  };

  const content =
    phase === "intro" ? (
      <IntroScreen />
    ) : phase === "reporte" ? (
      <ReportScreen />
    ) : (
      <PhasePlaceholder phase={phase} />
    );

  const railOpen = presenter && presenterOpen;

  return (
    <SandboxContextProvider value={ctx}>
      <MotionConfig reducedMotion="user">
        <div style={accentStyle} className="relative flex min-h-dvh flex-col">
          <SandboxBackground />

          <header
            className="relative z-30 grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-3 px-5 pt-4 pb-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)] sm:px-8 sm:pt-5"
            style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
          >
            <BrandLockup
              brandName={session.brandName}
              logoUrl={session.logoUrl}
              flLabel={t("common.franquiciasLatam")}
            />
            <div className="hidden sm:block">
              <ProgressRail />
            </div>
            <div className="flex items-center justify-end gap-2">
              <LocaleToggle />
              {presenter && (
                <button
                  type="button"
                  onClick={() => setPresenterOpen((o) => !o)}
                  aria-pressed={presenterOpen}
                  className="sb-chip border-[var(--sb-teal)]/40 text-[var(--sb-teal)] transition-colors hover:border-[var(--sb-teal)]"
                >
                  {t("chrome.presenterToggle")}
                </button>
              )}
            </div>
            <div className="col-span-2 sm:hidden">
              <ProgressRail compact />
            </div>
          </header>

          <div
            className={`relative z-10 flex flex-1 ${
              railOpen ? "lg:grid lg:grid-cols-[minmax(0,1fr)_340px]" : ""
            }`}
          >
            <main className="flex min-w-0 flex-1 flex-col">
              <AnimatePresence mode="wait" initial={false} custom={direction}>
                <motion.section
                  key={phase}
                  custom={direction}
                  variants={phaseVariants(reduceMotion)}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={PHASE_TRANSITION}
                  className="flex flex-1 flex-col"
                >
                  {content}
                </motion.section>
              </AnimatePresence>
            </main>

            {presenter && (
              <PresenterRail
                key={presenterOpen ? "open" : "closed"}
                open={presenterOpen}
                onClose={() => setPresenterOpen(false)}
                sessionStartedAt={sessionStartRef.current}
                phaseStartedAt={phaseStartedAt}
              />
            )}
          </div>
        </div>
      </MotionConfig>
    </SandboxContextProvider>
  );
}
