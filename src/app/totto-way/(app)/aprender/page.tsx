import { requireTwSession } from "@/lib/totto-way/auth";
import { createTranslator } from "@/lib/totto-way/i18n";
import { NAV_HREF } from "@/lib/totto-way/nav";
import { getChapterCards } from "@/lib/totto-way/queries";
import { Eyebrow } from "../../_components/atoms";
import { ChapterCard } from "../../_components/ChapterCard";

export const dynamic = "force-dynamic";

export default async function LearnPage() {
  const session = await requireTwSession();
  const t = createTranslator(session.locale);
  const { cards } = await getChapterCards(session);

  return (
    <>
      <div style={{ display: "grid", gap: 8, marginBottom: 20 }}>
        <Eyebrow>{t("learn.eyebrow")}</Eyebrow>
        <h2 className="tw-title-lg">{t("learn.title")}</h2>
      </div>
      <div className="tw-chapter-grid">
        {cards.map((chapter) => (
          <ChapterCard
            key={chapter.id}
            chapter={chapter}
            href={`${NAV_HREF.learn}/${chapter.slug}`}
            labels={{
              available: t("learn.available"),
              locked: t("learn.locked"),
              draft: t("learn.draft"),
              lessons: t("learn.lessons", { done: chapter.lessonsDone, total: chapter.lessonsTotal }),
            }}
          />
        ))}
      </div>
    </>
  );
}
