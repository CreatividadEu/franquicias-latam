import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen, Check, FileText, Flag, ListChecks, Video } from "lucide-react";
import { requireTwSession } from "@/lib/totto-way/auth";
import { createTranslator, type TwMessageKey } from "@/lib/totto-way/i18n";
import { NAV_HREF } from "@/lib/totto-way/nav";
import { getChapterView } from "@/lib/totto-way/queries";
import { Chip, Eyebrow, TwProgress, XpChip } from "../../../_components/atoms";

export const dynamic = "force-dynamic";

const TYPE_ICON = { READING: BookOpen, VIDEO: Video, CHECKLIST: ListChecks, CHECKPOINT: Flag } as const;

export async function generateMetadata({ params }: { params: Promise<{ chapter: string }> }): Promise<Metadata> {
  const session = await requireTwSession();
  const view = await getChapterView(session, (await params).chapter);
  return { title: view ? view.snapshot.title : "Capítulo" };
}

export default async function ChapterPage({ params }: { params: Promise<{ chapter: string }> }) {
  const session = await requireTwSession();
  const { chapter: slug } = await params;
  const view = await getChapterView(session, slug);
  if (!view || !view.unlocked) notFound();

  const t = createTranslator(session.locale);
  const { snapshot, progress, checkpoint } = view;
  const number = String(snapshot.number).padStart(2, "0");
  const nextHref = view.nextLessonSlug ? `${NAV_HREF.learn}/${snapshot.slug}/${view.nextLessonSlug}` : null;

  return (
    <>
      <Link href={NAV_HREF.learn} className="tw-back">
        <ArrowLeft strokeWidth={1.8} />
        {t("chapter.back")}
      </Link>

      <div className="tw-banner" style={{ borderBottom: `4px solid ${snapshot.color}` }}>
        <span className="tw-banner__numeral">{number}</span>
        <div>
          <Eyebrow tone="yellow">{t("learn.eyebrow")}</Eyebrow>
          <h1>{snapshot.title}</h1>
          <p className="tw-muted tw-small" style={{ marginTop: 6 }}>
            {snapshot.subtitle}
          </p>
          <div className="tw-banner__meta">
            <TwProgress value={progress.pct} track="dark" label={t("chapter.progress", { done: progress.done, total: progress.total })} />
            <span className="tw-small tw-muted">{t("chapter.progress", { done: progress.done, total: progress.total })}</span>
          </div>
        </div>
      </div>

      <div className="tw-chapter-layout">
        <div>
          {view.missions.map((mission) => (
            <section key={mission.code} className="tw-mission">
              <div className="tw-mission__head">
                <span className="tw-mission__code">{mission.code}</span>
                <span className="tw-mission__title">{mission.title}</span>
              </div>
              {mission.lessons.map((lesson) => {
                const Icon = TYPE_ICON[lesson.type];
                return (
                  <Link
                    key={lesson.id}
                    href={`${NAV_HREF.learn}/${snapshot.slug}/${lesson.slug}`}
                    className={`tw-lesson-row${lesson.done ? " tw-lesson-row--done" : ""}`}
                  >
                    <span className="tw-icon-tile">
                      <Icon strokeWidth={1.8} />
                    </span>
                    <span className="tw-lesson-row__body">
                      <span className="tw-eyebrow">
                        {lesson.missionCode} · {t(`types.${lesson.type}` as TwMessageKey)}
                      </span>
                      <span className="tw-lesson-row__title">{lesson.title}</span>
                    </span>
                    <span className="tw-lesson-row__meta">
                      <span className="tw-small tw-muted">{t("common.minutesShort", { n: lesson.minutes })}</span>
                      <XpChip xp={lesson.xp} />
                      <span className={`tw-check${lesson.done ? "" : " tw-check--empty"}`} aria-hidden>
                        {lesson.done ? <Check strokeWidth={2.4} /> : null}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </section>
          ))}
        </div>

        <aside className="tw-aside">
          {nextHref ? (
            <Link href={nextHref} className="tw-btn tw-btn--yellow tw-btn--block">
              {progress.done > 0 ? t("chapter.continue") : t("chapter.start")}
              <ArrowRight strokeWidth={1.8} />
            </Link>
          ) : (
            <div className="tw-chip tw-chip--yellow" style={{ justifyContent: "center", padding: "12px" }}>
              <Check size={14} strokeWidth={2.4} /> {t("chapter.completed")}
            </div>
          )}

          <section className="tw-card" style={{ display: "grid", gap: 10 }}>
            <Eyebrow>{t("chapter.manual")}</Eyebrow>
            <p className="tw-small tw-muted">{t("chapter.manualBody")}</p>
            {view.manualUrl ? (
              <a className="tw-btn tw-btn--outline tw-btn--sm" href={view.manualUrl} target="_blank" rel="noreferrer">
                <FileText strokeWidth={1.8} />
                {t("chapter.manualOpen")}
              </a>
            ) : (
              <p className="tw-small tw-muted">{t("chapter.manualMissing")}</p>
            )}
          </section>

          {checkpoint ? (
            <section className="tw-card tw-card--yellow" style={{ display: "grid", gap: 10 }}>
              <div className="tw-section__head">
                <Eyebrow>{t("chapter.checkpoint")}</Eyebrow>
                <XpChip xp={checkpoint.xp} />
              </div>
              <h3 className="tw-title-sm">{checkpoint.title}</h3>
              <p className="tw-small">{checkpoint.instructions}</p>
              {checkpoint.validated ? (
                <Chip>
                  <Check size={12} strokeWidth={2.4} /> {t("chapter.checkpointValidated")}
                </Chip>
              ) : (
                <p className="tw-small" style={{ opacity: 0.75 }}>
                  {t("chapter.checkpointPending")}
                </p>
              )}
            </section>
          ) : null}
        </aside>
      </div>
    </>
  );
}
