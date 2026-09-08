import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireTwSession } from "@/lib/totto-way/auth";
import { intlLocale } from "@/lib/totto-way/i18n";
import { getStudioAnalytics } from "@/lib/totto-way/studio";
import { Eyebrow, TwProgress } from "../../../_components/atoms";

export const metadata: Metadata = { title: "Estudio · Analítica" };
export const dynamic = "force-dynamic";

const EDITOR_ROLES = ["TW_FORMADOR", "ADMIN"] as const;

export default async function StudioAnalyticsPage() {
  const session = await requireTwSession({ roles: EDITOR_ROLES });
  const analytics = await getStudioAnalytics(session);
  const format = new Intl.DateTimeFormat(intlLocale(session.locale), { day: "2-digit", month: "short" });

  return (
    <>
      <Link href="/totto-way/estudio" className="tw-back">
        <ArrowLeft strokeWidth={1.8} /> Estudio
      </Link>
      <div style={{ display: "grid", gap: 6, marginBottom: 20 }}>
        <Eyebrow>Analítica</Eyebrow>
        <h1 className="tw-title-lg">Cómo va el contenido</h1>
      </div>

      <div className="tw-kpis">
        <div className="tw-kpi tw-kpi--black">
          <span className="tw-eyebrow tw-eyebrow--yellow">Colaboradores</span>
          <span className="tw-stat">{analytics.learners}</span>
        </div>
        <div className="tw-kpi">
          <span className="tw-eyebrow">Lecciones publicadas</span>
          <span className="tw-stat">{analytics.lessons.length}</span>
        </div>
        <div className="tw-kpi tw-kpi--yellow">
          <span className="tw-eyebrow">Fragmentos en el Asistente</span>
          <span className="tw-stat">{analytics.kbChunks}</span>
        </div>
      </div>

      <section style={{ display: "grid", gap: 12, marginBottom: 26 }}>
        <h2 className="tw-title-sm">Finalización por lección</h2>
        <div className="tw-table">
          {analytics.lessons.map((lesson) => (
            <div key={lesson.lessonId} className="tw-team-row">
              <span className="tw-rank">{String(lesson.chapter).padStart(2, "0")}</span>
              <div className="tw-team-row__body">
                <span className="tw-team-row__name">{lesson.title}</span>
                <span className="tw-team-row__meta">
                  {lesson.completed} de {analytics.learners} completada{lesson.completed === 1 ? "" : "s"}
                  {lesson.quizAverage !== null ? ` · quiz ${lesson.quizAverage} % (${lesson.quizAttempts} intentos)` : ""}
                </span>
              </div>
              <TwProgress value={lesson.completionPct} label={`${lesson.title} ${lesson.completionPct}%`} />
              <span className="tw-table__points">{lesson.completionPct}%</span>
              <span />
            </div>
          ))}
        </div>
      </section>

      <section style={{ display: "grid", gap: 12 }}>
        <h2 className="tw-title-sm">Lo que más preguntan al Asistente</h2>
        <p className="tw-small tw-muted">
          Agregado y anónimo: no se guarda quién preguntó. Si algo se repite mucho, probablemente falte en el manual.
        </p>
        {analytics.questions.length === 0 ? (
          <p className="tw-muted tw-small">Todavía nadie ha preguntado nada.</p>
        ) : (
          <div className="tw-table">
            {analytics.questions.map((question) => (
              <div key={question.question} className="tw-table__row">
                <span className="tw-rank">{question.count}</span>
                <span style={{ minWidth: 0 }}>
                  <span className="tw-table__name">{question.sample}</span>
                  <span className="tw-table__sub" style={{ display: "block" }}>
                    Última vez: {format.format(question.lastAskedAt)}
                  </span>
                </span>
                <span />
                <span />
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
