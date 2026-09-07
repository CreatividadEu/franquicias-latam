"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { useToast } from "@/app/totto-way/_components/TwToast";
import { completeLesson } from "../actions";

export function CompleteLessonButton({
  lessonId,
  xp,
  chapterHref,
  alreadyDone,
  labels,
}: {
  lessonId: string;
  xp: number;
  chapterHref: string;
  alreadyDone: boolean;
  labels: { complete: string; done: string; working: string };
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  const router = useRouter();

  if (alreadyDone) {
    return (
      <button type="button" className="tw-btn tw-btn--black tw-btn--block" disabled>
        <Check strokeWidth={1.8} />
        {labels.done}
      </button>
    );
  }

  const run = () =>
    startTransition(async () => {
      setError(null);
      const result = await completeLesson(lessonId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      showToast(`+${result.points} XP · ${result.title}`);
      router.push(chapterHref);
      router.refresh();
    });

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <button type="button" className="tw-btn tw-btn--yellow tw-btn--block tw-btn--lg" onClick={run} disabled={pending}>
        {pending ? labels.working : `${labels.complete} · +${xp} XP`}
      </button>
      {error ? (
        <p className="tw-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
