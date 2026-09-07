"use client";

import { Plus, Trash2 } from "lucide-react";
import type { QuizQuestion } from "@/lib/totto-way/content";

export function QuizEditor({ questions, onChange }: { questions: QuizQuestion[]; onChange: (questions: QuizQuestion[]) => void }) {
  const update = (index: number, question: QuizQuestion) => onChange(questions.map((item, i) => (i === index ? question : item)));

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {questions.map((question, index) => (
        <div key={index} className="tw-block-edit">
          <div className="tw-block-edit__head">
            <span className="tw-eyebrow">Pregunta {index + 1}</span>
            <button type="button" className="tw-icon-btn" aria-label="Quitar pregunta" onClick={() => onChange(questions.filter((_, i) => i !== index))}>
              <Trash2 strokeWidth={1.8} />
            </button>
          </div>
          <input className="tw-input" style={{ height: 40 }} value={question.q} placeholder="Enunciado" onChange={(event) => update(index, { ...question, q: event.target.value })} />
          {question.options.map((option, oi) => (
            <label key={oi} style={{ display: "grid", gridTemplateColumns: "auto minmax(0,1fr) auto", gap: 8, alignItems: "center" }}>
              <input
                type="radio"
                name={`correct-${index}`}
                checked={question.correctIndex === oi}
                onChange={() => update(index, { ...question, correctIndex: oi })}
                aria-label={`Opción ${oi + 1} correcta`}
              />
              <input
                className="tw-input"
                style={{ height: 40 }}
                value={option}
                placeholder={`Opción ${oi + 1}`}
                onChange={(event) => update(index, { ...question, options: question.options.map((x, j) => (j === oi ? event.target.value : x)) })}
              />
              <button
                type="button"
                className="tw-icon-btn"
                aria-label="Quitar opción"
                disabled={question.options.length <= 2}
                onClick={() =>
                  update(index, {
                    ...question,
                    options: question.options.filter((_, j) => j !== oi),
                    correctIndex: question.correctIndex > oi ? question.correctIndex - 1 : Math.min(question.correctIndex, question.options.length - 2),
                  })
                }
              >
                <Trash2 strokeWidth={1.8} />
              </button>
            </label>
          ))}
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className="tw-btn tw-btn--ghost tw-btn--sm" disabled={question.options.length >= 6} onClick={() => update(index, { ...question, options: [...question.options, ""] })}>
              <Plus strokeWidth={1.8} /> Opción
            </button>
          </div>
          <input
            className="tw-input"
            style={{ height: 40 }}
            value={question.explanation ?? ""}
            placeholder="Explicación que se muestra al responder (opcional)"
            onChange={(event) => update(index, { ...question, explanation: event.target.value })}
          />
        </div>
      ))}

      <button
        type="button"
        className="tw-btn tw-btn--outline tw-btn--sm"
        style={{ justifySelf: "start" }}
        disabled={questions.length >= 10}
        onClick={() => onChange([...questions, { q: "", options: ["", ""], correctIndex: 0 }])}
      >
        <Plus strokeWidth={1.8} /> Pregunta
      </button>
    </div>
  );
}
