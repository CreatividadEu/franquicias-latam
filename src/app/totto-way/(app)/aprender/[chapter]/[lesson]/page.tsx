import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { requireTwSession } from "@/lib/totto-way/auth";
import { createTranslator, type TwMessageKey } from "@/lib/totto-way/i18n";
import { NAV_HREF } from "@/lib/totto-way/nav";
import { canCompleteLesson, lessonVideo, VIDEO_COMPLETION_RATIO } from "@/lib/totto-way/progress";
import { getLessonView } from "@/lib/totto-way/queries";
import { BlockRenderer } from "../../../../_components/BlockRenderer";
import { Eyebrow, XpChip } from "../../../../_components/atoms";
import { CompleteLessonButton } from "./_components/CompleteLessonButton";
import { QuizPanel } from "./_components/QuizPanel";
import { VideoPlayer } from "./_components/VideoPlayer";

export const dynamic = "force-dynamic";

type Params = Promise<{ chapter: string; lesson: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const session = await requireTwSession();
  const { chapter, lesson } = await params;
  const view = await getLessonView(session, chapter, lesson);
  return { title: view ? view.lesson.title : "Lección" };
}

export default async function LessonPage({ params }: { params: Params }) {
  const session = await requireTwSession();
  const { chapter: chapterSlug, lesson: lessonSlug } = await params;
  const view = await getLessonView(session, chapterSlug, lessonSlug);
  if (!view) notFound();

  const t = createTranslator(session.locale);
  const { lesson, chapter } = view;
  const chapterHref = `${NAV_HREF.learn}/${chapter.slug}`;
  const video = lessonVideo(lesson);
  const done = view.progress?.status === "COMPLETED";
  const gate = canCompleteLesson(lesson, view.progress ?? undefined);
  const gatePercent = Math.round(VIDEO_COMPLETION_RATIO * 100);

  return (
    <div className="tw-lesson">
      <Link href={chapterHref} className="tw-back">
        <ArrowLeft strokeWidth={1.8} />
        {t("lesson.back")}
      </Link>

      <div className="tw-lesson__head">
        <div style={{ display: "grid", gap: 6, minWidth: 0 }}>
          <Eyebrow>
            {lesson.missionCode} · {t(`types.${lesson.type}` as TwMessageKey)} ·{" "}
            {t("lesson.position", { index: view.position.index, total: view.position.total })}
          </Eyebrow>
          <h1 className="tw-title-md">{lesson.title}</h1>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span className="tw-small tw-muted">{t("common.minutesShort", { n: lesson.minutes })}</span>
          <XpChip xp={lesson.xp} />
        </div>
      </div>

      {lesson.type === "VIDEO" ? (
        <div style={{ marginBottom: 20 }}>
          <VideoPlayer
            lessonId={lesson.id}
            src={video.src}
            poster={video.poster}
            markers={video.markers}
            initialSeconds={view.progress?.videoSeconds ?? 0}
            gatePercent={gatePercent}
            labels={{
              play: t("lesson.play"),
              pause: t("lesson.pause"),
              missing: t("lesson.videoMissing"),
              watched: t("lesson.watched", { pct: "{{pct}}", gate: "{{gate}}" }),
              fullscreen: t("lesson.fullscreen"),
            }}
          />
        </div>
      ) : null}

      <div className="tw-lesson__layout">
        <article className="tw-lesson__body">
          <BlockRenderer blocks={lesson.blocks} />
        </article>

        <aside className="tw-aside">
          {lesson.quiz && lesson.quiz.questions.length > 0 ? (
            <QuizPanel
              lessonId={lesson.id}
              questions={lesson.quiz.questions.map((question) => ({ q: question.q, options: question.options }))}
              bonusXp={lesson.quiz.bonusXp}
              previousScore={view.quizScore}
              copy={{
                title: t("lesson.quizTitle"),
                submit: t("lesson.quizSubmit"),
                submitting: t("lesson.quizSubmitting"),
                retry: t("lesson.quizRetry"),
                score: t("lesson.quizScore", { score: "{{score}}", total: "{{total}}" }),
                perfect: t("lesson.quizPerfect"),
                bonus: t("lesson.quizBonus", { n: "{{n}}" }),
                answerAll: t("lesson.quizAnswerAll"),
              }}
            />
          ) : null}

          <CompleteLessonButton
            lessonId={lesson.id}
            xp={lesson.xp}
            chapterHref={chapterHref}
            alreadyDone={done}
            labels={{ complete: t("lesson.complete"), done: t("lesson.done"), working: t("lesson.working") }}
          />

          {!done && !gate.ok && gate.reason === "VIDEO_NOT_WATCHED" ? (
            <p className="tw-small tw-muted" style={{ textAlign: "center" }}>
              {t("lesson.watched", { pct: Math.round(gate.ratio * 100), gate: gatePercent })}
            </p>
          ) : null}

          <div className="tw-nudge">
            <span style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--tw-black)" }}>
              <Sparkles size={16} strokeWidth={1.8} />
              <b>{t("lesson.assistantTitle")}</b>
            </span>
            <span>{t("lesson.assistantBody")}</span>
          </div>
        </aside>
      </div>

      <nav className="tw-lesson__nav">
        {view.previous ? (
          <Link href={`${chapterHref}/${view.previous.slug}`} className="tw-btn tw-btn--outline tw-btn--sm">
            <ArrowLeft strokeWidth={1.8} />
            {t("lesson.previous")}
          </Link>
        ) : (
          <span />
        )}
        {view.next ? (
          <Link href={`${chapterHref}/${view.next.slug}`} className="tw-btn tw-btn--outline tw-btn--sm">
            {t("lesson.next")}
            <ArrowRight strokeWidth={1.8} />
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
