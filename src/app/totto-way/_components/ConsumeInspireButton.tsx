"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { consumeInspire } from "../(app)/inspira/actions";
import { useToast } from "./TwToast";

export function ConsumeInspireButton({
  itemId,
  claimed,
  labels,
}: {
  itemId: string;
  claimed: boolean;
  labels: { mark: string; marked: string; working: string };
}) {
  const [done, setDone] = useState(claimed);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const { showToast } = useToast();
  const router = useRouter();

  if (done) {
    return (
      <span className="tw-chip tw-chip--soft">
        <Check size={12} strokeWidth={2.4} /> {labels.marked}
      </span>
    );
  }

  const run = () =>
    startTransition(async () => {
      setError(null);
      const result = await consumeInspire(itemId);
      if (!result.ok) {
        if (result.code === "ALREADY_CLAIMED") setDone(true);
        else setError(result.error);
        return;
      }
      setDone(true);
      showToast(`+${result.points} XP · ${result.title}`);
      router.refresh();
    });

  return (
    <div style={{ display: "grid", gap: 6 }}>
      <button type="button" className="tw-btn tw-btn--black tw-btn--sm" onClick={run} disabled={pending}>
        {pending ? labels.working : labels.mark}
      </button>
      {error ? (
        <p className="tw-small" style={{ color: "var(--tw-red)" }} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
