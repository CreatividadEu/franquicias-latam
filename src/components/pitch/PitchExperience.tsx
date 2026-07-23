"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { fases, type ClientConfig } from "@/config/clients";
import { persistBurn, track } from "@/lib/pitch";
import FinalScreen from "./FinalScreen";
import GridBackground from "./GridBackground";
import { EASE_SLIDE } from "./motionPresets";
import GuaranteeSlide from "./slides/GuaranteeSlide";
import IntroSlide from "./slides/IntroSlide";
import PhaseSlide from "./slides/PhaseSlide";
import WelcomeSlide from "./slides/WelcomeSlide";
import { useReducedMotionSafe } from "./useReducedMotionSafe";

// 0 intro · 1 bienvenida · 2–6 las 5 fases · 7 garantía · 8 final
const TOTAL = 9;
const ULTIMA = TOTAL - 1;

export default function PitchExperience({
  client,
  initialBurned,
}: {
  client: ClientConfig;
  initialBurned: boolean;
}) {
  const reduce = useReducedMotionSafe();
  const [slide, setSlide] = useState(0);
  const slideRef = useRef(0);
  const ultimoAvance = useRef(0);

  const avanzar = useCallback(() => {
    const ahora = Date.now();
    if (ahora - ultimoAvance.current < 500) return; // anti doble-tap
    if (slideRef.current >= ULTIMA) return;
    ultimoAvance.current = ahora;

    const siguiente = slideRef.current + 1;
    slideRef.current = siguiente;

    // Burn after viewing: cada avance persiste el progreso en localStorage +
    // cookie espejo. Cualquier carga posterior cae en la pantalla reducida.
    persistBurn(client.slug, siguiente);
    // Sin historial hacia atrás: cada avance reemplaza la entrada (y de paso
    // limpia ?reset=eagle de la URL).
    try {
      window.history.replaceState(null, "", window.location.pathname);
    } catch {
      /* entornos sin history */
    }
    if (siguiente === ULTIMA) track("view_completed", client.slug);
    setSlide(siguiente);
  }, [client.slug]);

  // La intro se auto-avanza al terminar; el guard evita que su timer dispare
  // un avance extra si el usuario ya la saltó con un tap.
  const finIntro = useCallback(() => {
    if (slideRef.current === 0) avanzar();
  }, [avanzar]);

  // Avance por teclado (desktop): Enter / Espacio / →
  useEffect(() => {
    if (initialBurned) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") {
        e.preventDefault();
        avanzar();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [avanzar, initialBurned]);

  const acento = { "--pt-acento": client.acento } as React.CSSProperties;

  // Pitch ya visto: solo existe la pantalla final reducida. El flujo completo
  // no se monta jamás.
  if (initialBurned) {
    return (
      <MotionConfig reducedMotion="user">
        <main className="fixed inset-0 overflow-hidden bg-[var(--pt-bg)]" style={acento}>
          <GridBackground />
          <FinalScreen client={client} reducida />
        </main>
      </MotionConfig>
    );
  }

  const variants = reduce
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        // Entrada: fade + deslizamiento desde la derecha.
        initial: { opacity: 0, x: 60, filter: "blur(0px)" },
        animate: { opacity: 1, x: 0, filter: "blur(0px)" },
        // Salida: se esfuma en horizontal con blur.
        exit: { opacity: 0, x: -140, filter: "blur(14px)" },
      };

  const contenido = () => {
    if (slide === 0) return <IntroSlide client={client} reduce={reduce} onFin={finIntro} />;
    if (slide === 1) return <WelcomeSlide client={client} />;
    if (slide <= 6) return <PhaseSlide fase={fases[slide - 2]} indice={slide - 2} total={fases.length} />;
    if (slide === 7) return <GuaranteeSlide />;
    return <FinalScreen client={client} />;
  };

  const conChrome = slide > 0 && slide < ULTIMA;

  return (
    <MotionConfig reducedMotion="user">
    <main
      data-pitch-flow
      className="fixed inset-0 select-none overflow-hidden bg-[var(--pt-bg)] touch-manipulation"
      style={acento}
      onClick={avanzar}
    >
      <GridBackground />

      {/* slide actual */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide}
          className="absolute inset-0"
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: reduce ? 0.25 : 0.55, ease: EASE_SLIDE }}
        >
          {contenido()}
        </motion.div>
      </AnimatePresence>

      {/* chrome: marca arriba · Continuar + progreso abajo */}
      <AnimatePresence>
        {conChrome && (
          <motion.div
            key="chrome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
          >
            <header
              className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5"
              style={{ paddingTop: "max(1.15rem, env(safe-area-inset-top))" }}
            >
              <span className="text-[9.5px] font-bold uppercase tracking-[0.32em] text-[var(--pt-blanco)]/45">
                Franquicias LATAM
              </span>
              <span className="text-[9.5px] font-medium uppercase tracking-[0.26em] text-[var(--pt-blanco)]/30">
                {client.nombre}
              </span>
            </header>

            <footer
              className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-3.5 px-6"
              style={{ paddingBottom: "max(1.2rem, env(safe-area-inset-bottom))" }}
            >
              {slide === 1 && (
                <p className="text-[10px] tracking-[0.14em] text-[var(--pt-blanco)]/30">
                  toca en cualquier parte para avanzar
                </p>
              )}
              {/* Sin onClick propio: el tap burbujea al onClick del main. */}
              <button
                type="button"
                className="rounded-full border border-white/12 bg-white/[0.04] px-8 py-3 text-sm font-medium tracking-wide text-[var(--pt-blanco)]/90 backdrop-blur-sm transition-colors hover:bg-white/[0.09]"
              >
                Continuar <span className="ml-1 text-[var(--pt-acento)]">→</span>
              </button>
              <div className="flex items-center gap-1.5" aria-hidden>
                {Array.from({ length: TOTAL }).map((_, i) => (
                  <span
                    key={i}
                    className={`h-[3px] rounded-full transition-all duration-500 ${
                      i === slide
                        ? "w-6 bg-[var(--pt-acento)]"
                        : i < slide
                          ? "w-2.5 bg-[var(--pt-acento)]/40"
                          : "w-2.5 bg-white/12"
                    }`}
                  />
                ))}
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
    </MotionConfig>
  );
}
