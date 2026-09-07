import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowLeft, Eye, Plus } from "lucide-react";
import { requireTwSession } from "@/lib/totto-way/auth";
import { getStudioChapter } from "@/lib/totto-way/studio";
import { Chip, Eyebrow, XpChip } from "../../../_components/atoms";
import { PublishButton } from "../_components/PublishButton";

export const metadata: Metadata = { title: "Estudio · Capítulo" };
export const dynamic = "force-dynamic";

const EDITOR_ROLES = ["TW_FORMADOR", "ADMIN"] as const;

export default async function StudioChapterPage({ params }: { params: Promise<{ chapter: string }> }) {
  const session = await requireTwSession({ roles: EDITOR_ROLES });
  const { chapter: slug } = await params;
  const view = await getStudioChapter(session, slug);
  if (!view) notFound();

  const { chapter, missions, checkpoint } = view;

  return (
    <>
      <Link href="/totto-way/estudio" className="tw-back">
        <ArrowLeft strokeWidth={1.8} /> Todos los capítulos
      </Link>

      <div className="tw-toolbar">
        <div style={{ display: "grid", gap: 6 }}>
          <Eyebrow>Capítulo {String(chapter.number).padStart(2, "0")}</Eyebrow>
          <h1 className="tw-title-md">{chapter.title}</h1>
          <p className="tw-small tw-muted">{chapter.subtitle}</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          {chapter.status === "PUBLISHED" ? (
            <Link href={`/totto-way/aprender/${chapter.slug}`} className="tw-btn tw-btn--outline tw-btn--sm">
              <Eye strokeWidth={1.8} /> Ver como alumno
            </Link>
          ) : null}
          <PublishButton chapterId={chapter.id} status={chapter.status} blocked={chapter.issues.length > 0} />
        </div>
      </div>

      {chapter.issues.length > 0 ? (
        <div className="tw-card" style={{ borderColor: "var(--tw-red)", marginBottom: 18 }}>
          <span className="tw-eyebrow" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <AlertTriangle size={13} strokeWidth={2} /> Pendientes para publicar
          </span>
          <ul style={{ margin: "8px 0 0", paddingLeft: 18 }} className="tw-small">
            {chapter.issues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {missions.map((mission) => (
        <section key={mission.id} className="tw-mission">
          <div className="tw-mission__head">
            <span className="tw-mission__code">{mission.code}</span>
            <span className="tw-mission__title">{mission.title}</span>
            <Link
              href={`/totto-way/estudio/${chapter.slug}/nueva?mision=${mission.id}`}
              className="tw-btn tw-btn--ghost tw-btn--sm"
              style={{ marginLeft: "auto" }}
            >
              <Plus strokeWidth={1.8} /> Lección
            </Link>
          </div>
          {mission.lessons.length === 0 ? (
            <p className="tw-small tw-muted" style={{ padding: "4px 2px" }}>
              Sin lecciones todavía.
            </p>
          ) : (
            mission.lessons.map((lesson) => (
              <Link key={lesson.id} href={`/totto-way/estudio/${chapter.slug}/${lesson.slug}`} className="tw-lesson-row">
                <span className="tw-rank">{lesson.order + 1}</span>
                <span className="tw-lesson-row__body">
                  <span className="tw-eyebrow">
                    {lesson.type} · {lesson.blocks} bloques{lesson.hasQuiz ? " · quiz" : ""}
                  </span>
                  <span className="tw-lesson-row__title">{lesson.title}</span>
                </span>
                <span className="tw-lesson-row__meta">
                  <span className="tw-small tw-muted">{lesson.minutes} min</span>
                  <XpChip xp={lesson.xp} />
                </span>
              </Link>
            ))
          )}
        </section>
      ))}

      {checkpoint ? (
        <section className="tw-card tw-card--yellow" style={{ display: "grid", gap: 8, maxWidth: 520 }}>
          <div className="tw-section__head">
            <Eyebrow>Checkpoint del capítulo</Eyebrow>
            <Chip>{checkpoint.xp} XP</Chip>
          </div>
          <h2 className="tw-title-sm">{checkpoint.title}</h2>
          <p className="tw-small">{checkpoint.instructions}</p>
        </section>
      ) : null}
    </>
  );
}
