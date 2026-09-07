"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Undo2, UploadCloud } from "lucide-react";
import { useToast } from "@/app/totto-way/_components/TwToast";
import { publishChapter, unpublishChapter } from "../actions";

export function PublishButton({
  chapterId,
  status,
  blocked,
}: {
  chapterId: string;
  status: "DRAFT" | "PUBLISHED";
  blocked: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [issues, setIssues] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  const router = useRouter();

  const publish = () =>
    startTransition(async () => {
      setError(null);
      setIssues([]);
      const result = await publishChapter(chapterId);
      if (!result.ok) {
        setError(result.error);
        setIssues((result.issues ?? []).map((issue) => `${issue.path}: ${issue.message}`));
        return;
      }
      showToast(`Publicado · v${result.data.version} · ${result.data.chunks} fragmentos indexados`);
      router.refresh();
    });

  const unpublish = () =>
    startTransition(async () => {
      const result = await unpublishChapter(chapterId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      showToast("Capítulo devuelto a borrador");
      router.refresh();
    });

  return (
    <div style={{ display: "grid", gap: 6, justifyItems: "end" }}>
      <div style={{ display: "flex", gap: 8 }}>
        {status === "PUBLISHED" ? (
          <button type="button" className="tw-btn tw-btn--ghost tw-btn--sm" onClick={unpublish} disabled={pending}>
            <Undo2 strokeWidth={1.8} /> Despublicar
          </button>
        ) : null}
        <button type="button" className="tw-btn tw-btn--yellow tw-btn--sm" onClick={publish} disabled={pending || blocked}>
          <UploadCloud strokeWidth={1.8} />
          {pending ? "Publicando…" : status === "PUBLISHED" ? "Republicar" : "Publicar"}
        </button>
      </div>
      {error ? (
        <div className="tw-error tw-small" role="alert" style={{ textAlign: "left", maxWidth: 420 }}>
          {error}
          {issues.length > 0 ? (
            <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>
              {issues.slice(0, 6).map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
