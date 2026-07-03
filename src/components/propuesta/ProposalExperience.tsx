"use client";

import { useReducedMotion } from "framer-motion";
import { useRef } from "react";
import type { Proposal } from "@/lib/propuestas/types";
import { CajaLiberadaWidget } from "./CajaLiberadaWidget";
import { CierreSection } from "./CierreSection";
import { CountdownPill } from "./CountdownPill";
import { EscenariosWidget } from "./EscenariosWidget";
import { FloatingCta } from "./FloatingCta";
import { Hero } from "./Hero";
import { LegalWidget } from "./LegalWidget";
import { LogrosSection } from "./LogrosSection";
import { ManualesWidget } from "./ManualesWidget";
import { MercadeoWidget } from "./MercadeoWidget";
import { PhaseSection } from "./PhaseSection";
import { ProgressRail, type RailItem } from "./ProgressRail";
import { useActiveSection } from "./useActiveSection";
import { useCountdown } from "./useCountdown";

const FASES: RailItem[] = [
  { id: "fase-01", fase: "01", nombre: "Estrategia + Finanzas" },
  { id: "fase-02", fase: "02", nombre: "Modelo Financiero" },
  { id: "fase-03", fase: "03", nombre: "Manuales & Formación" },
  { id: "fase-04", fase: "04", nombre: "Legal" },
  { id: "fase-05", fase: "05", nombre: "Mercadeo" },
];

const ACENTO_DEFAULT = "#00F0FF"; // token fl-teal del repo

/** "#00F0FF" → "0 240 255" para usar rgb(var(--acc-rgb) / a). */
function hexATripletaRgb(hex: string): string {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) {
    return "0 240 255";
  }
  const n = parseInt(full, 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

type ProposalExperienceProps = {
  proposal: Proposal;
  /** Resuelto en el server (deadline explícito o createdAt + 7d) */
  deadlineIso: string;
};

/**
 * La experiencia completa: universo por mundos con scroll-snap,
 * rail de progreso, countdown pill y CTA flotante siempre alcanzable.
 */
export function ProposalExperience({
  proposal,
  deadlineIso,
}: ProposalExperienceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const countdown = useCountdown(deadlineIso, proposal.createdAt);

  const ids = ["inicio", ...FASES.map((f) => f.id), "logros", "cierre"];
  const activeId = useActiveSection(containerRef, ids);

  const jump = (id: string) => {
    containerRef.current
      ?.querySelector(`#${CSS.escape(id)}`)
      ?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  };

  const acc = proposal.acento ?? ACENTO_DEFAULT;
  const vars = {
    "--acc": acc,
    "--acc-rgb": hexATripletaRgb(acc),
  } as React.CSSProperties;

  return (
    <div className="prop-root relative" style={vars}>
      <div
        ref={containerRef}
        // snap-proximity (no mandatory): Chrome re-evalúa el snap-target con
        // cambios tardíos de layout y con mandatory puede re-anclar fases lejos
        // durante la carga — proximity mantiene el snap por mundos sin pelear
        // con el scroll programático de "Comenzar" / rail.
        className="h-dvh snap-y snap-proximity overflow-y-auto overscroll-contain scroll-smooth"
      >
        <Hero
          cliente={proposal.cliente}
          industria={proposal.industria}
          logoUrl={proposal.logoUrl}
          onComenzar={() => jump("fase-01")}
        />

        <PhaseSection
          id="fase-01"
          fase="01"
          nombre="Estrategia + Finanzas"
          headline={`Su negocio, dejándole más dinero. Desde el mes ${proposal.finanzas.mesInflexion}.`}
          subcopy="Primero optimizamos su flujo de caja libre. Payback casi inmediato — más utilidad para los dueños, mes a mes."
        >
          <CajaLiberadaWidget finanzas={proposal.finanzas} />
        </PhaseSection>

        <PhaseSection
          id="fase-02"
          fase="02"
          nombre="Modelo Financiero de Franquicias"
          headline="El modelo que hace vendible su marca."
          subcopy="Hasta 3 rutas de expansión. Unidades, retornos y crecimiento — en números claros."
        >
          <EscenariosWidget escenarios={proposal.escenarios} />
        </PhaseSection>

        <PhaseSection
          id="fase-03"
          fase="03"
          nombre="Manuales & Formación"
          headline="Estándar de marca. En cada persona, en cada local."
          subcopy="Sistemas de formación que estandarizan producto y experiencia. Sirven como anexos del contrato para hacer enforcement — y desde el día uno bajan rotación, errores y costos."
        >
          <ManualesWidget modulos={proposal.modulosManuales} />
        </PhaseSection>

        <PhaseSection
          id="fase-04"
          fase="04"
          nombre="Legal"
          headline="Su marca, blindada."
          subcopy="Protegemos marca, know-how y su relación con franquiciados. En alianza con Seneor Lawyers — parte de nuestro grupo, con +6.000 marcas protegidas y un equipo legal en tiempo real para consultas de alta complejidad, sin las esperas de siempre."
        >
          <LegalWidget />
        </PhaseSection>

        <PhaseSection
          id="fase-05"
          fase="05"
          nombre="Mercadeo"
          headline="Vender franquicias, vuelto sistema."
          subcopy="Un stack de tecnología y embudos que encuentra al franquiciado correcto y lo convierte. Y si hace falta, también vendemos su producto/servicio directo a consumidor."
          layout="stack"
        >
          <MercadeoWidget videos={proposal.videosMercadeo} />
        </PhaseSection>

        <LogrosSection videos={proposal.videosMercadeo} />

        <CierreSection proposal={proposal} countdown={countdown} />
      </div>

      <ProgressRail
        items={FASES}
        activeId={activeId}
        visible={activeId !== "inicio"}
        onJump={jump}
      />
      <CountdownPill
        countdown={countdown}
        mesObjetivo={proposal.mesObjetivo}
        descuentoPct={proposal.descuentoPct}
      />
      <FloatingCta
        visible={activeId !== "inicio" && activeId !== "cierre"}
        expired={countdown.expired}
        mesObjetivo={proposal.mesObjetivo}
        onClick={() => jump("cierre")}
      />
    </div>
  );
}
