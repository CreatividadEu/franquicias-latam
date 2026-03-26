"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  CircleAlert,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, formatCurrency } from "@/lib/utils";
import {
  programApplicationHref,
  sandboxBenchmarks,
  sandboxBounds,
  sandboxDefaults,
} from "@/components/program-landing/programLandingData";

type InputMode = "known" | "estimated";

type ModeToggleProps = {
  value: InputMode;
  onChange: (value: InputMode) => void;
};

type NumberFieldProps = {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
  min?: number;
  helper?: string;
  disabled?: boolean;
  optional?: boolean;
};

type OutputMetricCardProps = {
  label: string;
  value: number;
  accentClassName: string;
  description: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function parseNumericInput(rawValue: string, fallback: number, min = 0) {
  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.max(parsed, min);
}

function useAnimatedNumber(value: number, duration = 420) {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValueRef = useRef(value);

  useEffect(() => {
    const startValue = previousValueRef.current;
    previousValueRef.current = value;

    if (Math.abs(startValue - value) < 1) {
      const frame = window.requestAnimationFrame(() => setDisplayValue(value));
      return () => window.cancelAnimationFrame(frame);
    }

    let frame = 0;
    const startAt = window.performance.now();

    const animate = (now: number) => {
      const progress = Math.min((now - startAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextValue = startValue + (value - startValue) * eased;
      setDisplayValue(nextValue);

      if (progress < 1) {
        frame = window.requestAnimationFrame(animate);
      }
    };

    frame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frame);
  }, [duration, value]);

  return displayValue;
}

function ModeToggle({ value, onChange }: ModeToggleProps) {
  return (
    <div className="inline-flex gap-1 rounded-full bg-slate-100 p-1">
      <button
        type="button"
        aria-pressed={value === "known"}
        onClick={() => onChange("known")}
        className={cn(
          "rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] transition",
          value === "known"
            ? "bg-white text-slate-900 shadow-sm"
            : "text-slate-500 hover:text-slate-700",
        )}
      >
        Dato real
      </button>
      <button
        type="button"
        aria-pressed={value === "estimated"}
        onClick={() => onChange("estimated")}
        className={cn(
          "rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] transition",
          value === "estimated"
            ? "bg-white text-[#2860E7] shadow-sm"
            : "text-slate-500 hover:text-slate-700",
        )}
      >
        No lo sé
      </button>
    </div>
  );
}

function NumberField({
  id,
  label,
  value,
  onChange,
  prefix,
  suffix,
  step = 1,
  min = 0,
  helper,
  disabled,
  optional,
}: NumberFieldProps) {
  return (
    <div className="rounded-[24px] border border-black/8 bg-white p-4 shadow-[0_10px_28px_-24px_rgba(15,23,42,0.18)]">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label htmlFor={id} className="text-sm font-semibold text-slate-900">
            {label}
            {optional && (
              <span className="ml-2 text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                opcional
              </span>
            )}
          </label>
        </div>
        <div className="relative">
          {prefix && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
              {prefix}
            </span>
          )}
          <Input
            id={id}
            type="number"
            inputMode="decimal"
            min={min}
            step={step}
            value={Number.isFinite(value) ? value : ""}
            disabled={disabled}
            onChange={(event) =>
              onChange(parseNumericInput(event.target.value, value, min))
            }
            className={cn(
              "h-12 rounded-2xl border-black/8 bg-white text-base text-slate-900 shadow-none",
              prefix ? "pl-8" : "",
              suffix ? "pr-12" : "",
              disabled ? "cursor-not-allowed bg-slate-50 text-slate-400" : "",
            )}
          />
          {suffix && (
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
              {suffix}
            </span>
          )}
        </div>
        <p className="text-xs leading-relaxed text-slate-500">
          {helper}
        </p>
      </div>
    </div>
  );
}

function OutputMetricCard({
  label,
  value,
  accentClassName,
  description,
}: OutputMetricCardProps) {
  const animatedValue = useAnimatedNumber(value);

  return (
    <article className="rounded-[24px] border border-black/8 bg-white p-4 shadow-[0_16px_36px_-28px_rgba(15,23,42,0.18)]">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className={cn("mt-3 text-3xl font-bold tracking-tight sm:text-[2.1rem]", accentClassName)}>
        {formatCurrency(animatedValue)}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        {description}
      </p>
    </article>
  );
}

export function OpportunityLab() {
  const [monthlySales, setMonthlySales] = useState(sandboxDefaults.monthlySales);
  const [grossMarginPct, setGrossMarginPct] = useState(
    sandboxDefaults.grossMarginPct,
  );
  const [grossMarginMode, setGrossMarginMode] = useState<InputMode>("known");
  const [ebitdaPct, setEbitdaPct] = useState(sandboxDefaults.ebitdaPct);
  const [ebitdaMode, setEbitdaMode] = useState<InputMode>("known");
  const [unitCount, setUnitCount] = useState(sandboxDefaults.unitCount);
  const [averageTicket, setAverageTicket] = useState(
    sandboxDefaults.averageTicket,
  );
  const [averageTicketMode, setAverageTicketMode] =
    useState<InputMode>("known");
  const [improvementPct, setImprovementPct] = useState(
    sandboxDefaults.improvementPct,
  );
  const [openings24m, setOpenings24m] = useState(sandboxDefaults.openings24m);
  const [entryFee, setEntryFee] = useState(sandboxDefaults.entryFee);
  const [royaltyPct, setRoyaltyPct] = useState(sandboxDefaults.royaltyPct);

  const resolvedGrossMarginPct =
    grossMarginMode === "estimated"
      ? sandboxBenchmarks.grossMarginPct
      : clamp(
          grossMarginPct,
          sandboxBounds.grossMarginPct.min,
          sandboxBounds.grossMarginPct.max,
        );

  const resolvedEbitdaPct =
    ebitdaMode === "estimated"
      ? sandboxBenchmarks.ebitdaPct
      : clamp(
          ebitdaPct,
          sandboxBounds.ebitdaPct.min,
          Math.min(sandboxBounds.ebitdaPct.max, resolvedGrossMarginPct - 4),
        );

  const resolvedAverageTicket =
    averageTicketMode === "estimated"
      ? sandboxBenchmarks.averageTicket
      : Math.max(1, averageTicket);

  const salesAnnual = monthlySales * 12;
  const currentEbitdaAnnual = salesAnnual * (resolvedEbitdaPct / 100);
  const potentialEbitdaPct = clamp(
    Math.max(
      resolvedEbitdaPct,
      resolvedEbitdaPct + clamp(improvementPct, 0, sandboxBounds.improvementPct.max),
    ),
    resolvedEbitdaPct,
    32,
  );
  const potentialEbitdaAnnual = salesAnnual * (potentialEbitdaPct / 100);
  const capturableCash = potentialEbitdaAnnual - currentEbitdaAnnual;
  const franchiseEntryRevenue = openings24m * entryFee;
  const royaltyAnnualEstimate =
    salesAnnual *
    (royaltyPct / 100) *
    openings24m *
    sandboxDefaults.royaltyCaptureFactor;
  const expansionPotential24m = franchiseEntryRevenue + royaltyAnnualEstimate;
  const opportunityCost = capturableCash + expansionPotential24m;
  const salesPerUnit = monthlySales / Math.max(unitCount, 1);
  const monthlyTransactions = monthlySales / resolvedAverageTicket;
  const monthlyTransactionsPerUnit = monthlyTransactions / Math.max(unitCount, 1);
  const estimatedFields = [
    grossMarginMode === "estimated"
      ? `Margen bruto benchmark ${sandboxBenchmarks.grossMarginPct}%`
      : null,
    ebitdaMode === "estimated"
      ? `EBITDA benchmark ${sandboxBenchmarks.ebitdaPct}%`
      : null,
    averageTicketMode === "estimated"
      ? `Ticket benchmark ${formatCurrency(sandboxBenchmarks.averageTicket)}`
      : null,
  ].filter(Boolean) as string[];

  const maxVisualValue = Math.max(
    potentialEbitdaAnnual,
    currentEbitdaAnnual,
    expansionPotential24m,
    1,
  );
  const animatedOpportunityCost = useAnimatedNumber(opportunityCost);

  const barItems = [
    {
      label: "EBITDA actual",
      value: currentEbitdaAnnual,
      className: "bg-slate-900",
    },
    {
      label: "EBITDA potencial",
      value: potentialEbitdaAnnual,
      className: "bg-[linear-gradient(90deg,#2563EB_0%,#38BDF8_100%)]",
    },
    {
      label: "Expansión 24m",
      value: expansionPotential24m,
      className: "bg-[linear-gradient(90deg,#F97316_0%,#FB923C_100%)]",
    },
  ];

  const summaryText = `Con los datos ingresados, este negocio podría estar dejando sobre la mesa aproximadamente ${formatCurrency(
    opportunityCost,
  )} entre mejora operativa anual y oportunidad de expansión estimada a 24 meses. ${
    estimatedFields.length > 0
      ? `Como faltan algunos indicadores clave, la simulación sigue corriendo con benchmarks visibles para mantener una lectura comercial útil.`
      : `La lectura usa tus datos como base y muestra una brecha clara entre la operación actual y el potencial capturable si se estructura como modelo franquiciable.`
  }`;

  return (
    <section
      id="video-hero"
      className="section-grid-bg relative overflow-hidden py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="section-label">Laboratorio de expansión en vivo</p>
          <h2 className="mt-4 text-3xl font-bold leading-[1.02] tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Simula la brecha entre tu operación actual y una expansión
            franquiciable.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-700 sm:text-lg">
            Diseñado para usar en llamada: ingresas datos reales o estimados y
            el sistema traduce el caso en una lectura comercial inmediata.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[0.98fr_1.02fr] lg:items-start">
          <div className="space-y-4">
            <div className="rounded-[28px] border border-black/8 bg-white p-5 shadow-[0_18px_42px_-32px_rgba(15,23,42,0.18)] sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2860E7]">
                    Inputs del negocio
                  </p>
                  <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                    Modela el caso en vivo.
                  </h3>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                  <SlidersHorizontal className="size-3.5" aria-hidden="true" />
                  Ajuste comercial
                </span>
              </div>

              <div className="mt-5 space-y-4">
                <NumberField
                  id="monthly-sales"
                  label="Ventas mensuales actuales"
                  value={monthlySales}
                  onChange={setMonthlySales}
                  prefix="$"
                  min={1000}
                  step={1000}
                  helper="Usa una cifra mensual razonable para mantener la simulación útil."
                />

                <div className="rounded-[24px] border border-black/8 bg-white p-4 shadow-[0_10px_28px_-24px_rgba(15,23,42,0.18)]">
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <label
                        htmlFor="gross-margin"
                        className="text-sm font-semibold text-slate-900"
                      >
                        Margen bruto actual
                      </label>
                      <ModeToggle
                        value={grossMarginMode}
                        onChange={setGrossMarginMode}
                      />
                    </div>
                    <div className="relative">
                      <Input
                        id="gross-margin"
                        type="number"
                        min={sandboxBounds.grossMarginPct.min}
                        max={sandboxBounds.grossMarginPct.max}
                        step={1}
                        value={
                          grossMarginMode === "estimated"
                            ? sandboxBenchmarks.grossMarginPct
                            : grossMarginPct
                        }
                        disabled={grossMarginMode === "estimated"}
                        onChange={(event) =>
                          setGrossMarginPct(
                            parseNumericInput(
                              event.target.value,
                              grossMarginPct,
                              sandboxBounds.grossMarginPct.min,
                            ),
                          )
                        }
                        className={cn(
                          "h-12 rounded-2xl border-black/8 bg-white pr-12 text-base text-slate-900 shadow-none",
                          grossMarginMode === "estimated"
                            ? "cursor-not-allowed bg-slate-50 text-slate-400"
                            : "",
                        )}
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                        %
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-500">
                      {grossMarginMode === "estimated"
                        ? `Usando benchmark estimado: ${sandboxBenchmarks.grossMarginPct}%.`
                        : "Si no tienes el dato exacto, cambia a “No lo sé” y seguimos con benchmark visible."}
                    </p>
                  </div>
                </div>

                <div className="rounded-[24px] border border-black/8 bg-white p-4 shadow-[0_10px_28px_-24px_rgba(15,23,42,0.18)]">
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <label
                        htmlFor="ebitda"
                        className="text-sm font-semibold text-slate-900"
                      >
                        EBITDA actual
                      </label>
                      <ModeToggle value={ebitdaMode} onChange={setEbitdaMode} />
                    </div>
                    <div className="relative">
                      <Input
                        id="ebitda"
                        type="number"
                        min={sandboxBounds.ebitdaPct.min}
                        max={sandboxBounds.ebitdaPct.max}
                        step={0.5}
                        value={
                          ebitdaMode === "estimated"
                            ? sandboxBenchmarks.ebitdaPct
                            : ebitdaPct
                        }
                        disabled={ebitdaMode === "estimated"}
                        onChange={(event) =>
                          setEbitdaPct(
                            parseNumericInput(
                              event.target.value,
                              ebitdaPct,
                              sandboxBounds.ebitdaPct.min,
                            ),
                          )
                        }
                        className={cn(
                          "h-12 rounded-2xl border-black/8 bg-white pr-12 text-base text-slate-900 shadow-none",
                          ebitdaMode === "estimated"
                            ? "cursor-not-allowed bg-slate-50 text-slate-400"
                            : "",
                        )}
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                        %
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-500">
                      {ebitdaMode === "estimated"
                        ? `Usando benchmark estimado: ${sandboxBenchmarks.ebitdaPct}%.`
                        : "Dato clave para leer caja capturable y readiness de expansión."}
                    </p>
                  </div>
                </div>

                <NumberField
                  id="unit-count"
                  label="Número de unidades actuales"
                  value={unitCount}
                  onChange={setUnitCount}
                  min={1}
                  step={1}
                  helper="Nos ayuda a leer si ya existe experiencia operando más de una unidad."
                />

                <div className="rounded-[24px] border border-black/8 bg-white p-4 shadow-[0_10px_28px_-24px_rgba(15,23,42,0.18)]">
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <label
                        htmlFor="average-ticket"
                        className="text-sm font-semibold text-slate-900"
                      >
                        Ticket promedio
                        <span className="ml-2 text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                          opcional
                        </span>
                      </label>
                      <ModeToggle
                        value={averageTicketMode}
                        onChange={setAverageTicketMode}
                      />
                    </div>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                        $
                      </span>
                      <Input
                        id="average-ticket"
                        type="number"
                        min={1}
                        step={1}
                        value={
                          averageTicketMode === "estimated"
                            ? sandboxBenchmarks.averageTicket
                            : averageTicket
                        }
                        disabled={averageTicketMode === "estimated"}
                        onChange={(event) =>
                          setAverageTicket(
                            parseNumericInput(event.target.value, averageTicket, 1),
                          )
                        }
                        className={cn(
                          "h-12 rounded-2xl border-black/8 bg-white pl-8 text-base text-slate-900 shadow-none",
                          averageTicketMode === "estimated"
                            ? "cursor-not-allowed bg-slate-50 text-slate-400"
                            : "",
                        )}
                      />
                    </div>
                    <p className="text-xs leading-relaxed text-slate-500">
                      {averageTicketMode === "estimated"
                        ? `Usando benchmark estimado: ${formatCurrency(
                            sandboxBenchmarks.averageTicket,
                          )}.`
                        : "Sirve para convertir ventas en volumen transaccional y leer demanda."}
                    </p>
                  </div>
                </div>

                <div className="rounded-[24px] border border-black/8 bg-white p-4 shadow-[0_10px_28px_-24px_rgba(15,23,42,0.18)]">
                  <div className="flex items-center justify-between gap-3">
                    <label
                      htmlFor="improvement-range"
                      className="text-sm font-semibold text-slate-900"
                    >
                      Mejora operativa posible
                    </label>
                    <span className="rounded-full bg-[#EEF3FF] px-3 py-1.5 text-sm font-semibold text-[#2860E7]">
                      {improvementPct}%
                    </span>
                  </div>
                  <input
                    id="improvement-range"
                    type="range"
                    min={sandboxBounds.improvementPct.min}
                    max={sandboxBounds.improvementPct.max}
                    step={1}
                    value={improvementPct}
                    onChange={(event) =>
                      setImprovementPct(Number(event.target.value))
                    }
                    className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-[#2860E7]"
                  />
                  <p className="mt-3 text-xs leading-relaxed text-slate-500">
                    Desliza un upside razonable para simular optimización
                    operativa sin llevar el modelo a valores absurdos.
                  </p>
                </div>

                <div className="rounded-[24px] border border-black/8 bg-white p-4 shadow-[0_10px_28px_-24px_rgba(15,23,42,0.18)]">
                  <div className="flex items-center justify-between gap-3">
                    <label
                      htmlFor="openings-range"
                      className="text-sm font-semibold text-slate-900"
                    >
                      Aperturas potenciales por franquicia en 24 meses
                    </label>
                    <span className="rounded-full bg-orange-50 px-3 py-1.5 text-sm font-semibold text-orange-700">
                      {openings24m}
                    </span>
                  </div>
                  <input
                    id="openings-range"
                    type="range"
                    min={sandboxBounds.openings24m.min}
                    max={sandboxBounds.openings24m.max}
                    step={1}
                    value={openings24m}
                    onChange={(event) =>
                      setOpenings24m(Number(event.target.value))
                    }
                    className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-orange-500"
                  />
                  <p className="mt-3 text-xs leading-relaxed text-slate-500">
                    Úsalo como hipótesis comercial del caso, no como promesa.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <NumberField
                    id="entry-fee"
                    label="Canon de entrada estimado"
                    value={entryFee}
                    onChange={setEntryFee}
                    prefix="$"
                    min={0}
                    step={1000}
                    helper="Ticket de entrada proyectado para nuevas franquicias."
                  />
                  <NumberField
                    id="royalty-pct"
                    label="Royalty promedio"
                    value={royaltyPct}
                    onChange={setRoyaltyPct}
                    suffix="%"
                    min={sandboxBounds.royaltyPct.min}
                    step={0.5}
                    helper="Usamos un factor conservador para el royalty anual estimado."
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[30px] border border-black/8 bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(248,250,252,1)_100%)] p-5 shadow-[0_18px_42px_-30px_rgba(15,23,42,0.2)] sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2860E7]">
                    Resumen ejecutivo
                  </p>
                  <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                    Lectura orientativa del potencial.
                  </h3>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600 ring-1 ring-black/8">
                  <Sparkles className="size-3.5" aria-hidden="true" />
                  Estimado
                </span>
              </div>

              {estimatedFields.length > 0 && (
                <div className="mt-5 rounded-[24px] border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-amber-600 ring-1 ring-amber-200">
                      <CircleAlert className="size-5" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Faltan datos críticos, pero la simulación puede seguir.
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-700">
                        Benchmarks activos: {estimatedFields.join(" · ")}.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <OutputMetricCard
                  label="EBITDA anual actual estimado"
                  value={currentEbitdaAnnual}
                  accentClassName="text-slate-900"
                  description="Lectura base de caja anual con la operación actual."
                />
                <OutputMetricCard
                  label="EBITDA anual potencial optimizado"
                  value={potentialEbitdaAnnual}
                  accentClassName="text-[#1D4ED8]"
                  description="Escenario optimizado usando la mejora operativa modelada."
                />
                <OutputMetricCard
                  label="Caja capturable anual estimada"
                  value={capturableCash}
                  accentClassName="text-emerald-600"
                  description="Brecha anual entre el escenario actual y el optimizado."
                />
                <OutputMetricCard
                  label="Potencial de expansión franquiciada 24m"
                  value={expansionPotential24m}
                  accentClassName="text-orange-600"
                  description="Canon de entrada + royalty anual estimado con factor conservador."
                />
              </div>

              <div className="mt-4 rounded-[24px] border border-black/8 bg-slate-900 p-5 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                  Costo de oportunidad por no actuar
                </p>
                <p className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-[2.75rem]">
                  {formatCurrency(animatedOpportunityCost)}
                </p>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/70">
                  Lo que este negocio podría no capturar entre mejora operativa
                  y expansión si posterga estructurar su modelo franquiciable.
                </p>
              </div>

              <div className="mt-4 rounded-[24px] border border-black/8 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">
                    Relación visual del caso
                  </p>
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    estimado
                  </span>
                </div>
                <div className="mt-4 space-y-4">
                  {barItems.map((item) => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="font-medium text-slate-700">
                          {item.label}
                        </span>
                        <span className="font-semibold text-slate-900">
                          {formatCurrency(item.value)}
                        </span>
                      </div>
                      <div className="mt-2 h-2.5 rounded-full bg-slate-100">
                        <div
                          className={cn("h-2.5 rounded-full", item.className)}
                          style={{
                            width: `${(item.value / maxVisualValue) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <article className="rounded-[24px] border border-black/8 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Señal operativa
                  </p>
                  <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
                    {formatCurrency(salesPerUnit)}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    ventas mensuales por unidad actual.
                  </p>
                </article>
                <article className="rounded-[24px] border border-black/8 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Demanda modelada
                  </p>
                  <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
                    {Math.round(monthlyTransactionsPerUnit).toLocaleString("en-US")}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    transacciones mensuales por unidad con el ticket modelado.
                  </p>
                </article>
              </div>

              <div className="mt-4 rounded-[24px] border border-[#2860E7]/12 bg-[#EEF3FF] p-5">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#2860E7] ring-1 ring-[#2860E7]/12">
                    <TrendingUp className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Resumen narrativo
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-700 sm:text-base">
                      {summaryText}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href={programApplicationHref}>
                    Usar este diagnóstico para aplicar
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a href={programApplicationHref}>Aplicar al Programa</a>
                </Button>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-slate-500">
                Simulación orientativa para fines comerciales y de diagnóstico.
                No reemplaza la modelación financiera detallada del programa.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
