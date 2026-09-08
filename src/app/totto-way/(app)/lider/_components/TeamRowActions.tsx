"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Star } from "lucide-react";
import { useToast } from "@/app/totto-way/_components/TwToast";
import { addRecognition, validateCheckpoint } from "../actions";

export type RowActionsCopy = {
  validate: string;
  validating: string;
  validated: string;
  noPending: string;
  recognition: string;
  recognitionPlaceholder: string;
  recognitionAdd: string;
  recognitionHint: string;
  cancel: string;
};

export function TeamRowActions({
  userId,
  pendingCheckpoint,
  copy,
}: {
  userId: string;
  pendingCheckpoint: { checkpointId: string; chapter: string; xp: number } | null;
  copy: RowActionsCopy;
}) {
  const [pending, startTransition] = useTransition();
  // Se guarda QUÉ checkpoint se acaba de validar, no un booleano: con un
  // booleano el líder no podía validar el segundo checkpoint de la misma
  // persona, porque el estado seguía en true tras refrescar.
  const [justValidated, setJustValidated] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  const router = useRouter();

  const validate = () =>
    startTransition(async () => {
      setError(null);
      const result = await validateCheckpoint({ userId, checkpointId: pendingCheckpoint!.checkpointId });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setJustValidated(pendingCheckpoint!.checkpointId);
      showToast(result.message);
      router.refresh();
    });

  const recognize = () =>
    startTransition(async () => {
      setError(null);
      const result = await addRecognition({ userId, title });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
      setTitle("");
      showToast(result.message);
      router.refresh();
    });

  return (
    <div style={{ display: "grid", gap: 6, justifyItems: "end" }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {justValidated && justValidated === pendingCheckpoint?.checkpointId ? (
          <span className="tw-chip">
            <Check size={12} strokeWidth={2.4} /> {copy.validated}
          </span>
        ) : pendingCheckpoint ? (
          <button type="button" className="tw-btn tw-btn--yellow tw-btn--sm" onClick={validate} disabled={pending}>
            {pending ? copy.validating : `${copy.validate} · +${pendingCheckpoint.xp}`}
          </button>
        ) : (
          <span className="tw-small tw-muted">{copy.noPending}</span>
        )}
        <button
          type="button"
          className="tw-btn tw-btn--ghost tw-btn--sm"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label={copy.recognition}
          title={copy.recognition}
        >
          <Star strokeWidth={1.8} />
        </button>
      </div>

      {open ? (
        <div style={{ display: "grid", gap: 6, justifyItems: "end", width: 260 }}>
          <input
            className="tw-input"
            style={{ height: 40 }}
            value={title}
            placeholder={copy.recognitionPlaceholder}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={120}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className="tw-btn tw-btn--ghost tw-btn--sm" onClick={() => setOpen(false)}>
              {copy.cancel}
            </button>
            <button type="button" className="tw-btn tw-btn--black tw-btn--sm" onClick={recognize} disabled={pending || title.trim().length < 3}>
              {copy.recognitionAdd}
            </button>
          </div>
          <span className="tw-small tw-muted">{copy.recognitionHint}</span>
        </div>
      ) : null}

      {error ? (
        <p className="tw-error tw-small" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
