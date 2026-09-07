"use client";

import { useState, useTransition } from "react";
import { Check, X } from "lucide-react";
import type { QuizResult } from "@/lib/totto-way/progress";
import { useToast } from "@/app/totto-way/_components/TwToast";
import { submitQuiz } from "../actions";

export type QuizCopy = {
  title: string;
  submit: string;
  submitting: string;
  retry: string;
  score: string;
  perfect: string;
  bonus: string;
  answerAll: string;
};

export function QuizPanel({
  lessonId,
  questions,
  bonusXp,
  previousScore,
  copy,
}: {
  lessonId: string;
  questions: { q: string; options: string[] }[];
  bonusXp: number;
  previousScore: number | null;
  copy: QuizCopy;
}) {
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
  const [results, setResults] = useState<QuizResult[] | null>(null);
  const [score, setScore] = useState<number | null>(previousScore);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const { showToast } = useToast();

  const complete = answers.every((answer) => answer !== null);

  const send = () => {
    if (!complete) {
      setError(copy.answerAll);
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await submitQuiz({ lessonId, answers });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setResults(result.results);
      setScore(result.score);
      if (result.bonusAwarded > 0) showToast(`+${result.bonusAwarded} XP · ${copy.perfect}`);
    });
  };

  return (
    <section className="tw-card" style={{ display: "grid", gap: 14 }}>
      <div className="tw-section__head">
        <h3 className="tw-title-sm">{copy.title}</h3>
        <span className="tw-chip tw-chip--soft">+{bonusXp} XP</span>
      </div>

      <div className="tw-quiz">
        {questions.map((question, qi) => {
          const result = results?.[qi];
          return (
            <div key={qi} className="tw-quiz__q">
              <p className="tw-quiz__title">
                {qi + 1}. {question.q}
              </p>
              {question.options.map((option, oi) => {
                const selected = answers[qi] === oi;
                let state = "";
                if (result) {
                  if (oi === result.correctIndex) state = " is-correct";
                  else if (selected) state = " is-wrong";
                } else if (selected) {
                  state = " is-selected";
                }
                return (
                  <button
                    key={oi}
                    type="button"
                    className={`tw-quiz__option${state}`}
                    disabled={!!results || pending}
                    onClick={() => setAnswers((prev) => prev.map((value, index) => (index === qi ? oi : value)))}
                  >
                    {result && oi === result.correctIndex ? <Check size={15} strokeWidth={2} /> : null}
                    {result && selected && !result.correct ? <X size={15} strokeWidth={2} /> : null}
                    <span>{option}</span>
                  </button>
                );
              })}
              {result?.explanation ? <p className="tw-quiz__feedback">{result.explanation}</p> : null}
            </div>
          );
        })}
      </div>

      {error ? (
        <p className="tw-error" role="alert">
          {error}
        </p>
      ) : null}

      {results ? (
        <>
          <div className="tw-quiz__score">
            <span>{copy.score.replace("{{score}}", String(score ?? 0)).replace("{{total}}", String(questions.length))}</span>
            {score === questions.length ? <span className="tw-chip tw-chip--yellow">{copy.bonus.replace("{{n}}", String(bonusXp))}</span> : null}
          </div>
          {score !== questions.length ? (
            <button
              type="button"
              className="tw-btn tw-btn--outline tw-btn--sm"
              onClick={() => {
                setResults(null);
                setAnswers(questions.map(() => null));
              }}
            >
              {copy.retry}
            </button>
          ) : null}
        </>
      ) : (
        <button type="button" className="tw-btn tw-btn--black tw-btn--block" onClick={send} disabled={pending}>
          {pending ? copy.submitting : copy.submit}
        </button>
      )}
    </section>
  );
}
