import type { Metadata } from "next";
import { AlertTriangle, Download } from "lucide-react";
import { requireTwSession } from "@/lib/totto-way/auth";
import { createTranslator } from "@/lib/totto-way/i18n";
import { getLeaderView } from "@/lib/totto-way/queries";
import { storeInScope } from "@/lib/totto-way/scope";
import { Avatar, Eyebrow, TwProgress } from "../../_components/atoms";
import { StoreFilter } from "./_components/StoreFilter";
import { TeamRowActions } from "./_components/TeamRowActions";

export const metadata: Metadata = { title: "Panel líder" };
export const dynamic = "force-dynamic";

const LEADER_ROLES = ["TW_LIDER_TIENDA", "TW_JEFE_COMERCIAL", "FRANCHISE_OWNER", "TW_FORMADOR", "ADMIN"] as const;

type SearchParams = Promise<{ tienda?: string }>;

export default async function LeaderPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await requireTwSession({ roles: LEADER_ROLES });
  const params = await searchParams;
  const t = createTranslator(session.locale);

  // Un filtro de tienda fuera del scope se ignora, nunca amplía lo que se ve.
  const storeFilter = params.tienda && storeInScope(session.scope, params.tienda) ? params.tienda : null;
  const view = await getLeaderView(session, storeFilter);
  const exportHref = storeFilter ? `/api/totto-way/leader/export?tienda=${storeFilter}` : "/api/totto-way/leader/export";

  return (
    <>
      <div style={{ display: "grid", gap: 6, marginBottom: 20 }}>
        <Eyebrow>{t("leader.eyebrow")}</Eyebrow>
        <h1 className="tw-title-lg">{t("leader.title")}</h1>
      </div>

      <div className="tw-kpis">
        <div className="tw-kpi tw-kpi--black">
          <span className="tw-eyebrow tw-eyebrow--yellow">{t("leader.kpiActive")}</span>
          <span className="tw-stat">
            {view.kpis.active}/{view.kpis.total}
          </span>
        </div>
        <div className="tw-kpi">
          <span className="tw-eyebrow">{t("leader.kpiProgress")}</span>
          <span className="tw-stat">{view.kpis.averagePct}%</span>
        </div>
        <div className="tw-kpi">
          <span className="tw-eyebrow">{t("leader.kpiPending")}</span>
          <span className="tw-stat">{view.kpis.pendingCheckpoints}</span>
        </div>
        <div className="tw-kpi tw-kpi--yellow">
          <span className="tw-eyebrow">{t("leader.kpiLeague")}</span>
          <span className="tw-stat">{view.leaguePosition ? `#${view.leaguePosition}` : "—"}</span>
        </div>
      </div>

      <div className="tw-toolbar">
        {view.canFilter ? <StoreFilter stores={view.stores} value={view.storeFilter} allLabel={t("leader.filterAll")} /> : <span />}
        <a href={exportHref} className="tw-btn tw-btn--outline tw-btn--sm" download>
          <Download strokeWidth={1.8} />
          {t("leader.export")}
        </a>
      </div>

      {view.rows.length === 0 ? (
        <p className="tw-muted">{t("leader.empty")}</p>
      ) : (
        <div className="tw-table">
          {view.rows.map((row) => (
            <div key={row.userId} className="tw-team-row">
              <Avatar initials={row.initials} />
              <div className="tw-team-row__body">
                <span className="tw-team-row__name">{row.name}</span>
                <span className="tw-team-row__meta">
                  {row.roleTitle}
                  {row.currentLesson ? ` · ${row.currentLesson}` : ` · ${t("leader.allDone")}`}
                </span>
                {row.inactiveDays !== null && row.inactiveDays >= 7 ? (
                  <span className="tw-team-row__meta tw-team-row__alert" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <AlertTriangle size={12} strokeWidth={2} />
                    {t("leader.inactive", { n: row.inactiveDays })}
                  </span>
                ) : row.inactiveDays === null ? (
                  <span className="tw-team-row__meta tw-team-row__alert">{t("leader.never")}</span>
                ) : null}
              </div>
              <TwProgress value={row.pct} label={`${row.name} ${row.pct}%`} />
              <span className="tw-table__points tw-team-row__points">{row.points.toLocaleString("es-CO")}</span>
              <TeamRowActions
                userId={row.userId}
                pendingCheckpoint={row.pendingCheckpoint}
                copy={{
                  validate: t("leader.validate"),
                  validating: t("leader.validating"),
                  validated: t("leader.validated"),
                  noPending: t("leader.noPending"),
                  recognition: t("leader.recognition"),
                  recognitionPlaceholder: t("leader.recognitionPlaceholder"),
                  recognitionAdd: t("leader.recognitionAdd"),
                  recognitionHint: t("leader.recognitionHint"),
                  cancel: t("common.cancel"),
                }}
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
