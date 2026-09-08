import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown, ChevronUp, Minus, Trophy } from "lucide-react";
import { requireTwSession } from "@/lib/totto-way/auth";
import { createTranslator, intlLocale, plural, type TwMessageKey, type TwTranslator } from "@/lib/totto-way/i18n";
import { SCORING_TABLE } from "@/lib/totto-way/league";
import { NAV_HREF } from "@/lib/totto-way/nav";
import { getLeagueView, type LeagueRow } from "@/lib/totto-way/queries";
import { Eyebrow, Placeholder } from "../../_components/atoms";

export const metadata: Metadata = { title: "Liga" };
export const dynamic = "force-dynamic";

type SearchParams = Promise<{ vista?: string; temporada?: string }>;

function Delta({ delta }: { delta: number | null }) {
  if (delta === null || delta === 0) {
    return (
      <span className="tw-delta" aria-label="Sin cambio">
        <Minus strokeWidth={2} />
      </span>
    );
  }
  const up = delta > 0;
  return (
    <span className={`tw-delta tw-delta--${up ? "up" : "down"}`} aria-label={`${up ? "Sube" : "Baja"} ${Math.abs(delta)}`}>
      {up ? <ChevronUp strokeWidth={2.4} /> : <ChevronDown strokeWidth={2.4} />}
      {Math.abs(delta)}
    </span>
  );
}

function Table({ rows, empty, youLabel, t, intl }: { rows: LeagueRow[]; empty: string; youLabel: string; t: TwTranslator; intl: string }) {
  if (rows.length === 0) return <p className="tw-muted tw-small">{empty}</p>;
  return (
    <div className="tw-table">
      {rows.map((row) => (
        <div key={row.entityId} className={`tw-table__row${row.me ? " tw-table__row--me" : ""}`}>
          <span className={`tw-rank${row.position === 1 ? " tw-rank--first" : ""}`}>{row.position}</span>
          <span style={{ minWidth: 0 }}>
            <span className="tw-table__name">
              {row.name}
              {row.me ? <span className="tw-chip" style={{ marginLeft: 8, fontSize: 10 }}>{youLabel}</span> : null}
            </span>
            <span className="tw-table__sub" style={{ display: "block" }}>
              {[row.place, row.members === null ? null : row.members === 1 ? t("league.member") : t("league.members", { n: row.members })]
                .filter(Boolean)
                .join(" · ")}
            </span>
          </span>
          <Delta delta={row.delta} />
          <span className="tw-table__points">{row.points.toLocaleString(intl)}</span>
        </div>
      ))}
    </div>
  );
}

function Toggle({ mode, seasonId, t }: { mode: "tienda" | "individual"; seasonId?: string; t: TwTranslator }) {
  const href = (value: string) => {
    const params = new URLSearchParams({ vista: value });
    if (seasonId) params.set("temporada", seasonId);
    return `${NAV_HREF.league}?${params.toString()}`;
  };
  return (
    <div className="tw-seg">
      <Link href={href("tienda")} className={`tw-seg__btn${mode === "tienda" ? " is-active" : ""}`}>
        {t("league.byStore")}
      </Link>
      <Link href={href("individual")} className={`tw-seg__btn${mode === "individual" ? " is-active" : ""}`}>
        {t("league.byPerson")}
      </Link>
    </div>
  );
}

export default async function LeaguePage({ searchParams }: { searchParams: SearchParams }) {
  const session = await requireTwSession();
  const params = await searchParams;
  const t = createTranslator(session.locale);
  const view = await getLeagueView(session, params.temporada);

  if (!view.enabled) return <Placeholder title={t("league.title")} body={t("league.off")} />;
  if (!view.season) return <Placeholder title={t("league.title")} body={t("league.empty")} />;

  const mode = params.vista === "individual" ? "individual" : "tienda";
  const rows = mode === "individual" ? view.people : view.stores;

  return (
    <>
      <div className="tw-league-head">
        <div style={{ display: "grid", gap: 6 }}>
          <Eyebrow>{t("league.eyebrow")}</Eyebrow>
          <h1 className="tw-title-lg">{t("league.title")}</h1>
        </div>
        <Toggle mode={mode} seasonId={params.temporada} t={t} />
      </div>

      {view.scoped && view.globalPosition ? (
        <p className="tw-small tw-muted" style={{ marginBottom: 12 }}>
          {t("league.scopedNote", { n: view.globalPosition })}
        </p>
      ) : null}

      <div className="tw-league-layout">
        <Table rows={rows} empty={t("league.empty")} youLabel={t("league.you")} t={t} intl={intlLocale(session.locale)} />

        <div style={{ display: "grid", gap: 16 }}>
          <section className="tw-card tw-card--yellow" style={{ display: "grid", gap: 8 }}>
            <div className="tw-section__head">
              {/* Sobre amarillo el eyebrow va en negro: en rojo se queda en 2,6:1. */}
              <Eyebrow tone="onYellow">{t("league.prize")}</Eyebrow>
              <Trophy strokeWidth={1.8} size={18} />
            </div>
            <span className="tw-countdown">
              {view.season.countdown.ended ? t("league.ended") : plural(t, "league.endsIn", view.season.countdown.days)}
            </span>
            <p className="tw-small">{view.season.prizeText}</p>
          </section>

          <section className="tw-card tw-card--black" style={{ display: "grid", gap: 12 }}>
            <h2 className="tw-title-sm" style={{ color: "#fff" }}>
              {t("league.howToEarn")}
            </h2>
            <div className="tw-scoring">
              {SCORING_TABLE.map((entry) => (
                <div key={entry.source} className="tw-scoring__row">
                  <span className="tw-muted">{t(`sources.${entry.source}` as TwMessageKey)}</span>
                  <span className="tw-chip tw-chip--yellow">{entry.points}</span>
                </div>
              ))}
            </div>
          </section>

          {view.seasons.length > 1 ? (
            <section className="tw-card" style={{ display: "grid", gap: 8 }}>
              <Eyebrow>{t("league.season")}</Eyebrow>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {view.seasons.map((season) => (
                  <Link
                    key={season.id}
                    href={`${NAV_HREF.league}?vista=${mode}&temporada=${season.id}`}
                    className={`tw-chip${season.id === view.season?.id ? "" : " tw-chip--soft"}`}
                    style={{ textDecoration: "none" }}
                  >
                    {season.name}
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </>
  );
}
