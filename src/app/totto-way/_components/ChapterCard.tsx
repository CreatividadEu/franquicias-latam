import Link from "next/link";
import { Lock } from "lucide-react";
import type { ChapterCard as ChapterCardData } from "@/lib/totto-way/queries";
import { Chip, TwProgress } from "./atoms";

export function ChapterCard({
  chapter,
  href,
  labels,
}: {
  chapter: ChapterCardData;
  href: string;
  labels: { available: string; locked: string; draft: string; lessons: string };
}) {
  const number = String(chapter.number).padStart(2, "0");
  const locked = chapter.status !== "PUBLISHED" || !chapter.unlocked;
  const status =
    chapter.status !== "PUBLISHED" ? (
      <Chip tone="soft">{labels.draft}</Chip>
    ) : !chapter.unlocked ? (
      <Chip tone="soft">
        <Lock size={12} strokeWidth={1.8} /> {labels.locked}
      </Chip>
    ) : chapter.pct > 0 ? (
      <Chip tone="yellow">{chapter.pct}%</Chip>
    ) : (
      <Chip tone="outline">{labels.available}</Chip>
    );

  const inner = (
    <>
      <span className="tw-chapter__ghost" aria-hidden>
        {number}
      </span>
      <div className="tw-chapter__top">
        <span className="tw-eyebrow">{`Capítulo ${number}`}</span>
        {status}
      </div>
      <h3>{chapter.title}</h3>
      <p className="tw-chapter__sub">{chapter.subtitle}</p>
      <div className="tw-chapter__foot">
        <TwProgress value={chapter.pct} tone={locked ? "black" : "yellow"} thin />
        <span>{labels.lessons}</span>
      </div>
    </>
  );

  if (locked) {
    return <div className={`tw-chapter tw-chapter--locked`}>{inner}</div>;
  }
  return (
    <Link href={href} className="tw-chapter" style={{ borderTop: `4px solid ${chapter.color}` }}>
      {inner}
    </Link>
  );
}
