"use client";

import { STAGE_COLOR, STAGE_LABEL, countryMeta } from "@/lib/saju/command-center";
import { formatDecimal } from "@/lib/saju/format";
import type { CountrySummary } from "@/lib/saju/metrics";
import { StageChip } from "./atoms";
import { useLeadDrawer } from "./LeadDrawerProvider";

/**
 * Una tarjeta por país activo: volumen, reparto por etapa con la rampa común,
 * avance promedio (posición media en el pipeline, 1–7) y el lead más caliente.
 */
export function CountryGrid({ countries }: { countries: CountrySummary[] }) {
  const { open } = useLeadDrawer();

  if (countries.length === 0) {
    return (
      <div className="cc-card cc-card--pad">
        <p className="cc-hint">Ningún país con leads activos bajo estos filtros.</p>
      </div>
    );
  }

  return (
    <div className="cc-grid-3">
      {countries.map((country) => {
        const meta = countryMeta(country.code);
        return (
          <div key={country.code} className="cc-card cc-card--pad">
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div>
                <p className="cc-label">
                  <span aria-hidden="true" style={{ marginRight: 6 }}>
                    {meta.flag}
                  </span>
                  {meta.name}
                </p>
                <p className="cc-num cc-num--lg" style={{ marginTop: 8 }}>
                  {country.total}
                </p>
                <p className="cc-hint">{country.total === 1 ? "lead activo" : "leads activos"}</p>
              </div>

              <div style={{ textAlign: "right" }}>
                <p className="cc-label">Avance medio</p>
                <p className="cc-num cc-num--md" style={{ marginTop: 8 }}>
                  {formatDecimal(country.avanceMedio)}
                  <span style={{ color: "var(--cc-muted)", fontSize: 13 }}> / 7</span>
                </p>
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <div
                className="cc-stackbar"
                role="img"
                aria-label={country.distribution
                  .map((entry) => `${STAGE_LABEL[entry.stage]}: ${entry.count}`)
                  .join(", ")}
              >
                {country.distribution.map((entry) => (
                  <span
                    key={entry.stage}
                    className="cc-stackbar__seg"
                    style={{
                      width: `${(entry.count / country.total) * 100}%`,
                      background: STAGE_COLOR[entry.stage].solid,
                    }}
                    title={`${STAGE_LABEL[entry.stage]} · ${entry.count}`}
                  />
                ))}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
                {country.distribution.map((entry) => (
                  <span key={entry.stage} className="cc-hint">
                    <span
                      className="cc-dot"
                      style={{
                        background: STAGE_COLOR[entry.stage].solid,
                        display: "inline-block",
                        marginRight: 4,
                      }}
                    />
                    {STAGE_LABEL[entry.stage]}{" "}
                    <span className="cc-num" style={{ fontSize: 12 }}>
                      {entry.count}
                    </span>
                  </span>
                ))}
              </div>
            </div>

            {country.hottest && (
              <div style={{ marginTop: 16, borderTop: "1px solid var(--cc-line)", paddingTop: 12 }}>
                <p className="cc-label" style={{ marginBottom: 6 }}>
                  Lead más avanzado
                </p>
                <button
                  type="button"
                  className="cc-btn"
                  style={{ width: "100%", justifyContent: "space-between", height: "auto", padding: "8px 10px" }}
                  onClick={() => country.hottest && open(country.hottest)}
                >
                  <span style={{ fontWeight: 600, fontSize: 13, textAlign: "left" }}>
                    {country.hottest.name}
                  </span>
                  <StageChip stage={country.hottest.stage} />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
