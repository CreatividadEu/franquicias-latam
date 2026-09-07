import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireTwSession } from "@/lib/totto-way/auth";
import { getStudioChapter, getStudioLesson } from "@/lib/totto-way/studio";
import { Eyebrow } from "../../../../_components/atoms";
import { LessonForm } from "../../_components/LessonForm";

export const metadata: Metadata = { title: "Estudio · Lección" };
export const dynamic = "force-dynamic";

const EDITOR_ROLES = ["TW_FORMADOR", "ADMIN"] as const;

type Params = Promise<{ chapter: string; lesson: string }>;

export default async function StudioLessonPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Promise<{ mision?: string }>;
}) {
  const session = await requireTwSession({ roles: EDITOR_ROLES });
  const { chapter: chapterSlug, lesson: lessonSlug } = await params;
  const { mision } = await searchParams;

  // `nueva` es la ruta reservada para crear una lección dentro del capítulo.
  const isNew = lessonSlug === "nueva";
  const chapterView = await getStudioChapter(session, chapterSlug);
  if (!chapterView) notFound();

  const view = isNew ? null : await getStudioLesson(session, chapterSlug, lessonSlug);
  if (!isNew && !view) notFound();

  const missions = chapterView.missions.map((mission) => ({ id: mission.id, code: mission.code, title: mission.title }));
  if (missions.length === 0) {
    return (
      <>
        <Link href={`/totto-way/estudio/${chapterSlug}`} className="tw-back">
          <ArrowLeft strokeWidth={1.8} /> Volver al capítulo
        </Link>
        <p className="tw-muted">Crea antes una misión: toda lección cuelga de una.</p>
      </>
    );
  }

  const initial = view
    ? {
        id: view.lesson.id,
        title: view.lesson.title,
        type: view.lesson.type,
        minutes: view.lesson.minutes,
        xp: view.lesson.xp,
        missionId: view.lesson.missionId,
        keyTakeaway: view.lesson.keyTakeaway,
        ruleBanner: view.lesson.ruleBanner ?? "",
        posterUrl: view.lesson.posterUrl ?? "",
        docRefs: view.lesson.docRefs.join(", "),
        blocks: view.lesson.blocks,
        quiz: view.lesson.quiz,
      }
    : {
        id: null,
        title: "",
        type: "READING" as const,
        minutes: 5,
        xp: 50,
        missionId: missions.find((mission) => mission.id === mision)?.id ?? missions[0].id,
        keyTakeaway: "",
        ruleBanner: "",
        posterUrl: "",
        docRefs: "",
        blocks: [],
        quiz: null,
      };

  return (
    <div style={{ maxWidth: 860 }}>
      <Link href={`/totto-way/estudio/${chapterSlug}`} className="tw-back">
        <ArrowLeft strokeWidth={1.8} /> Volver al capítulo
      </Link>
      <div style={{ display: "grid", gap: 6, marginBottom: 18 }}>
        <Eyebrow>
          Capítulo {String(chapterView.chapter.number).padStart(2, "0")} · {chapterView.chapter.title}
        </Eyebrow>
        <h1 className="tw-title-md">{view ? view.lesson.title : "Nueva lección"}</h1>
      </div>
      <LessonForm chapterId={chapterView.chapter.id} chapterSlug={chapterSlug} missions={missions} initial={initial} />
    </div>
  );
}
