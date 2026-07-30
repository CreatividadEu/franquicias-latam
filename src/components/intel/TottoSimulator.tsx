"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  computeModel,
  DEFAULT_INPUTS,
  encodeState,
  INPUT_SPECS,
  type InputKey,
  type Inputs,
  type PlanId,
  type SimState,
} from "@/lib/intel/totto-model";
import { SECTIONS } from "@/lib/intel/copy";
import AssumptionsRail from "./AssumptionsRail";
import DamageAnatomy from "./DamageAnatomy";
import HeroTicker from "./HeroTicker";
import IntelHeader from "./IntelHeader";
import KpiGrid from "./KpiGrid";
import LegalPanel from "./LegalPanel";
import Methodology from "./Methodology";
import PLTable from "./PLTable";
import ScenarioSwitcher from "./ScenarioSwitcher";
import SimulationChart from "./SimulationChart";
import VerdictCard from "./VerdictCard";

const URL_DEBOUNCE_MS = 300;

/** Ruta + query que reproduce exactamente el estado actual. */
function stateUrl(state: SimState): string {
  const query = encodeState(state);
  return `${window.location.pathname}${query ? `?${query}` : ""}`;
}

export default function TottoSimulator({ initial }: { initial: SimState }) {
  const [inputs, setInputs] = useState<Inputs>(initial.inputs);
  const [plan, setPlan] = useState<PlanId>(initial.plan);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => computeModel(inputs, plan), [inputs, plan]);

  // El estado vive en la URL: así un enlace con los supuestos calibrados se
  // puede enviar tal cual y abre el simulador en el mismo punto.
  useEffect(() => {
    const id = window.setTimeout(() => {
      window.history.replaceState(null, "", stateUrl({ inputs, plan }));
    }, URL_DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [inputs, plan]);

  const onInputChange = useCallback((key: InputKey, value: number) => {
    setInputs((prev) => (prev[key] === value ? prev : { ...prev, [key]: value }));
  }, []);

  const onReset = useCallback(() => setInputs(DEFAULT_INPUTS), []);

  const dirty = useMemo(
    () => INPUT_SPECS.some((spec) => inputs[spec.key] !== spec.default),
    [inputs],
  );

  const onCopyLink = useCallback(async () => {
    const url = `${window.location.origin}${stateUrl({ inputs, plan })}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Sin permiso de portapapeles (o contexto no seguro): la URL de la barra
      // ya refleja el estado, así que copiarla a mano sirve igual.
    }
  }, [inputs, plan]);

  return (
    <main className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-5 py-8 sm:px-8 sm:py-10">
      <IntelHeader />

      <HeroTicker danoPL={result.damage.danoPL} />

      <section aria-label={SECTIONS.scenarios}>
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 className="intel-section-title">{SECTIONS.scenarios}</h2>
          <button
            type="button"
            onClick={onCopyLink}
            className="mono cursor-pointer text-[11.5px] uppercase transition-colors hover:text-[var(--text)]"
            style={{ letterSpacing: "0.08em", color: copied ? "var(--pos)" : "var(--text-3)" }}
          >
            {copied ? "Enlace copiado" : "Copiar enlace del escenario"}
          </button>
        </div>
        <ScenarioSwitcher value={plan} onChange={setPlan} />
      </section>

      <KpiGrid result={result} />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <AssumptionsRail
          inputs={inputs}
          onChange={onInputChange}
          onReset={onReset}
          dirty={dirty}
        />

        <div className="flex min-w-0 flex-col gap-6">
          <DamageAnatomy result={result} />
          <SimulationChart result={result} />
          <PLTable result={result} />
          <LegalPanel result={result} />
        </div>
      </div>

      <VerdictCard result={result} />

      <Methodology />
    </main>
  );
}
