import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, BarChart3, Check, PenSquare } from "lucide-react";
import { requireTwSession } from "@/lib/totto-way/auth";
import { getStudioChapters } from "@/lib/totto-way/studio";
import { Chip, Eyebrow } from "../../_components/atoms";
import { PublishButton } from "./_components/PublishButton";

export const metadata: Metadata = { title: "Estudio" };
export const dynamic = "force-dynamic";

const EDITOR_ROLES = ["TW_FORMADOR", "ADMIN"] as const;

export default async function StudioPage() {
  const session = await requireTwSession({ roles: EDITOR_ROLES });
  const chapters = await getStudioChapters(session);

  return (
    <>
      <div className="tw-toolbar">
        <div style={{ display: "grid", gap: 6 }}>
          <Eyebrow>Estudio de contenido</Eyebrow>
          <h1 className="tw-title-lg">Los 7 capítulos</h1>
        </div>
        <Link href="/totto-way/estudio/analitica" className="tw-btn tw-btn--outline tw-btn--sm">
          <BarChart3 strokeWidth={1.8} /> Analítica
        </Link>
      </div>

      <div className="tw-table">
        {chapters.map((chapter) => (
          <div key={chapter.id} className="tw-studio-row">
            <span className="tw-rank">{String(chapter.number).padStart(2, "0")}</span>
            <div className="tw-team-row__body">
              <Link href={`/totto-way/estudio/${chapter.slug}`} className="tw-team-row__name" style={{ textDecoration: "none" }}>
                {chapter.title}
              </Link>
              <span className="tw-team-row__meta">
                {chapter.missions} misiones · {chapter.lessons} lecciones
                {chapter.publishedAt ? ` · v${chapter.version}` : ""}
              </span>
              {chapter.issues.length > 0 ? (
                <span className="tw-team-row__meta tw-team-row__alert" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <AlertTriangle size={12} strokeWidth={2} />
                  {chapter.issues.length} {chapter.issues.length === 1 ? "pendiente" : "pendientes"} para publicar
                </span>
              ) : null}
            </div>
            <span>
              {chapter.status === "PUBLISHED" ? (
                <Chip tone="yellow">
                  <Check size={12} strokeWidth={2.4} /> Publicado
                </Chip>
              ) : (
                <Chip tone="soft">Borrador</Chip>
              )}
              {chapter.dirty ? (
                <span className="tw-chip tw-chip--red" style={{ marginLeft: 6 }}>
                  Cambios sin publicar
                </span>
              ) : null}
            </span>
            <Link href={`/totto-way/estudio/${chapter.slug}`} className="tw-btn tw-btn--ghost tw-btn--sm" aria-label={`Editar ${chapter.title}`}>
              <PenSquare strokeWidth={1.8} />
            </Link>
            <PublishButton chapterId={chapter.id} status={chapter.status} blocked={chapter.issues.length > 0} />
          </div>
        ))}
      </div>
    </>
  );
}
