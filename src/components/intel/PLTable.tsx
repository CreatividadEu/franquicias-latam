"use client";

import { PL_BASE_NOTE, PL_HEADERS, SECTIONS } from "@/lib/intel/copy";
import { mShort, pctFromRatio, signedM } from "@/lib/intel/format";
import type { ModelResult, PLRow } from "@/lib/intel/totto-model";
import Section from "./Section";

/** Un delta es bueno si mueve la línea en la dirección que le conviene. */
function deltaColor(row: PLRow): string {
  if (Math.abs(row.delta) < 0.5) return "var(--text-3)";
  const good = row.goodWhen === "higher" ? row.delta > 0 : row.delta < 0;
  return good ? "var(--pos)" : "var(--neg)";
}

export default function PLTable({ result }: { result: ModelResult }) {
  const inaction = result.plan.id === 0;
  const note = inaction ? PL_BASE_NOTE.inaction : PL_BASE_NOTE.plan;

  return (
    <Section title={SECTIONS.pl} note={note}>
      <div className="-mx-6 overflow-x-auto px-6">
        <table className="intel-table" style={{ minWidth: 460 }}>
          <thead>
            <tr>
              <th scope="col">{PL_HEADERS.line}</th>
              <th scope="col">{PL_HEADERS.base}</th>
              <th scope="col">{PL_HEADERS.scenario}</th>
              <th scope="col">{PL_HEADERS.delta}</th>
            </tr>
          </thead>
          <tbody>
            {result.pl.map((row) => (
              <tr key={row.label} data-emphasis={row.emphasis ? "true" : undefined}>
                <td>{row.label}</td>
                <td className="mono" style={{ color: "var(--text-3)" }}>
                  {row.emphasis ? "—" : mShort(row.base)}
                </td>
                <td className="mono">{row.emphasis ? "—" : mShort(row.scenario)}</td>
                <td className="mono" style={{ color: deltaColor(row) }}>
                  {signedM(row.delta)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="intel-hint mt-4">
        Cifras en COP M. {inaction
          ? "El escenario de inacción se contrasta con un mundo sin falsificación: el Δ EBITDA equivale, por construcción, al daño anual completo."
          : `El daño evitado de la simulación se reparte entre las líneas a prorrata de su peso en la pila de daño (contención anual efectiva ${pctFromRatio(result.effAnnual, 0)}); el Δ EBITDA coincide con el beneficio acumulado a 12 meses que alimentan el ROI y el payback.`}
      </p>
    </Section>
  );
}
