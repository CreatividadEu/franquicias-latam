"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, Trash2 } from "lucide-react";
import type { QuizQuestion, TwBlock } from "@/lib/totto-way/content";
import { useToast } from "@/app/totto-way/_components/TwToast";
import { deleteLesson, upsertLesson, upsertQuiz } from "../actions";
import { BlockEditor } from "./BlockEditor";
import { MediaUpload } from "./MediaUpload";
import { QuizEditor } from "./QuizEditor";

export type LessonFormValue = {
  id: string | null;
  title: string;
  type: "READING" | "VIDEO" | "CHECKLIST" | "CHECKPOINT";
  minutes: number;
  xp: number;
  missionId: string;
  keyTakeaway: string;
  ruleBanner: string;
  posterUrl: string;
  docRefs: string;
  blocks: TwBlock[];
  quiz: { questions: QuizQuestion[]; bonusXp: number } | null;
};

export function LessonForm({
  chapterId,
  chapterSlug,
  missions,
  initial,
}: {
  chapterId: string;
  chapterSlug: string;
  missions: { id: string; code: string; title: string }[];
  initial: LessonFormValue;
}) {
  const [value, setValue] = useState(initial);
  const [questions, setQuestions] = useState<QuizQuestion[]>(initial.quiz?.questions ?? []);
  const [bonusXp, setBonusXp] = useState(initial.quiz?.bonusXp ?? 40);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const { showToast } = useToast();
  const router = useRouter();

  const set = <K extends keyof LessonFormValue>(key: K, next: LessonFormValue[K]) => setValue((prev) => ({ ...prev, [key]: next }));

  const save = () =>
    startTransition(async () => {
      setError(null);
      const result = await upsertLesson({
        chapterId,
        lessonId: value.id,
        missionId: value.missionId,
        title: value.title,
        type: value.type,
        minutes: Number(value.minutes),
        xp: Number(value.xp),
        keyTakeaway: value.keyTakeaway,
        ruleBanner: value.ruleBanner || null,
        posterUrl: value.posterUrl || null,
        docRefs: value.docRefs.split(",").map((code) => code.trim()).filter(Boolean),
        blocks: value.blocks,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }

      const quiz = await upsertQuiz({ lessonId: result.data.lessonId, questions, bonusXp: Number(bonusXp) });
      if (!quiz.ok) {
        setError(quiz.error);
        return;
      }

      showToast("Lección guardada");
      if (!value.id) router.push(`/totto-way/estudio/${chapterSlug}/${result.data.slug}`);
      else router.refresh();
    });

  const remove = () =>
    startTransition(async () => {
      if (!value.id) return;
      const result = await deleteLesson(value.id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      showToast("Lección eliminada");
      router.push(`/totto-way/estudio/${chapterSlug}`);
    });

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <section className="tw-card" style={{ display: "grid", gap: 12 }}>
        <div className="tw-form-grid">
          <label className="tw-field" style={{ gridColumn: "1 / -1" }}>
            <span className="tw-label">Título</span>
            <input className="tw-input" value={value.title} onChange={(event) => set("title", event.target.value)} />
          </label>
          <label className="tw-field">
            <span className="tw-label">Misión</span>
            <select className="tw-select" value={value.missionId} onChange={(event) => set("missionId", event.target.value)}>
              {missions.map((mission) => (
                <option key={mission.id} value={mission.id}>
                  {mission.code} · {mission.title}
                </option>
              ))}
            </select>
          </label>
          <label className="tw-field">
            <span className="tw-label">Tipo</span>
            <select className="tw-select" value={value.type} onChange={(event) => set("type", event.target.value as LessonFormValue["type"])}>
              <option value="READING">Lectura</option>
              <option value="VIDEO">Video</option>
              <option value="CHECKLIST">Checklist</option>
              <option value="CHECKPOINT">Checkpoint</option>
            </select>
          </label>
          <label className="tw-field">
            <span className="tw-label">Minutos</span>
            <input className="tw-input" type="number" min={1} max={180} value={value.minutes} onChange={(event) => set("minutes", Number(event.target.value))} />
          </label>
          <label className="tw-field">
            <span className="tw-label">XP</span>
            <input className="tw-input" type="number" min={10} max={500} step={10} value={value.xp} onChange={(event) => set("xp", Number(event.target.value))} />
          </label>
          <label className="tw-field" style={{ gridColumn: "1 / -1" }}>
            <span className="tw-label">Traducción simple</span>
            <input className="tw-input" value={value.keyTakeaway} placeholder="La idea en una línea" onChange={(event) => set("keyTakeaway", event.target.value)} />
          </label>
          <label className="tw-field" style={{ gridColumn: "1 / -1" }}>
            <span className="tw-label">Regla (banda amarilla, opcional)</span>
            <input className="tw-input" value={value.ruleBanner} onChange={(event) => set("ruleBanner", event.target.value)} />
          </label>
          <div className="tw-field">
            <span className="tw-label">Póster</span>
            <input className="tw-input" value={value.posterUrl} placeholder="/totto-way/manual/p21.png" onChange={(event) => set("posterUrl", event.target.value)} />
            <MediaUpload kind="POSTER" label="Subir imagen" onUploaded={(url) => set("posterUrl", url)} />
          </div>
          <label className="tw-field">
            <span className="tw-label">Códigos DOC</span>
            <input className="tw-input" value={value.docRefs} placeholder="DOC-01-03, DOC-01-04" onChange={(event) => set("docRefs", event.target.value)} />
          </label>
        </div>
      </section>

      <section className="tw-card" style={{ display: "grid", gap: 12 }}>
        <h2 className="tw-title-sm">Bloques</h2>
        <BlockEditor blocks={value.blocks} onChange={(blocks) => set("blocks", blocks)} />
      </section>

      <section className="tw-card" style={{ display: "grid", gap: 12 }}>
        <div className="tw-section__head">
          <h2 className="tw-title-sm">Quiz</h2>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="tw-label">Bonus XP</span>
            <input className="tw-input" style={{ width: 90, height: 40 }} type="number" min={0} max={200} step={10} value={bonusXp} onChange={(event) => setBonusXp(Number(event.target.value))} />
          </label>
        </div>
        <QuizEditor questions={questions} onChange={setQuestions} />
      </section>

      {error ? (
        <p className="tw-error" role="alert">
          {error}
        </p>
      ) : null}

      <div style={{ display: "flex", gap: 10 }}>
        <button type="button" className="tw-btn tw-btn--black" onClick={save} disabled={pending}>
          <Save strokeWidth={1.8} />
          {pending ? "Guardando…" : "Guardar lección"}
        </button>
        {value.id ? (
          <button type="button" className="tw-btn tw-btn--ghost tw-btn--sm" onClick={remove} disabled={pending}>
            <Trash2 strokeWidth={1.8} /> Eliminar
          </button>
        ) : null}
      </div>
    </div>
  );
}
