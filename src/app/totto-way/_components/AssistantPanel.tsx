"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Send, Sparkles, X } from "lucide-react";

/**
 * Asistente Totto Way: panel flotante 380×620 en escritorio y hoja completa en
 * móvil. Consume el SSE de /api/totto-way/assistant, así que la respuesta se
 * ve escribirse; las citas y las acciones llegan como eventos aparte.
 */

type Citation = { title: string; href: string | null; quote: string };
type Action = { type: string; href: string; label: string };
type Message = { role: "user" | "assistant"; text: string; citations?: Citation[]; actions?: Action[] };

type AssistantContextValue = { open: (lessonId?: string | null) => void };
const AssistantCtx = createContext<AssistantContextValue>({ open: () => {} });

export function useAssistant() {
  return useContext(AssistantCtx);
}

export type AssistantCopy = {
  title: string;
  subtitle: string;
  placeholder: string;
  send: string;
  close: string;
  thinking: string;
  intro: string;
  suggestions: string[];
  sources: string;
  errorGeneric: string;
};

export function AssistantProvider({ copy, children }: { copy: AssistantCopy; children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState(false);
  const threadId = useRef<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  // Se recuerda quién abrió el panel para devolverle el foco al cerrarlo.
  const openerRef = useRef<HTMLElement | null>(null);

  const open = useCallback((lesson?: string | null) => {
    openerRef.current = typeof document !== "undefined" ? (document.activeElement as HTMLElement | null) : null;
    setLessonId(lesson ?? null);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    openerRef.current?.focus?.();
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    // El foco entra al panel al abrirlo; si no, el teclado se queda fuera.
    inputRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  useEffect(() => {
    const node = listRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, streaming]);

  const ask = useCallback(
    async (question: string) => {
      const text = question.trim();
      if (!text || streaming) return;
      setDraft("");
      setMessages((prev) => [...prev, { role: "user", text }, { role: "assistant", text: "" }]);
      setStreaming(true);

      try {
        const response = await fetch("/api/totto-way/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, threadId: threadId.current, lessonId }),
        });

        if (!response.ok || !response.body) {
          const payload = (await response.json().catch(() => null)) as { error?: string } | null;
          setMessages((prev) => {
            const next = [...prev];
            next[next.length - 1] = { role: "assistant", text: payload?.error ?? copy.errorGeneric };
            return next;
          });
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        const patch = (update: (message: Message) => Message) =>
          setMessages((prev) => {
            const next = [...prev];
            next[next.length - 1] = update(next[next.length - 1]);
            return next;
          });

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const frames = buffer.split("\n\n");
          buffer = frames.pop() ?? "";

          for (const frame of frames) {
            const eventLine = frame.split("\n").find((line) => line.startsWith("event: "));
            const dataLine = frame.split("\n").find((line) => line.startsWith("data: "));
            if (!eventLine || !dataLine) continue;
            const event = eventLine.slice(7).trim();
            const payload = JSON.parse(dataLine.slice(6));

            if (event === "delta") {
              patch((message) => ({ ...message, text: message.text + payload.text }));
            } else if (event === "cite") {
              patch((message) => ({ ...message, citations: [...(message.citations ?? []), payload as Citation] }));
            } else if (event === "action") {
              patch((message) => ({ ...message, actions: [...(message.actions ?? []), payload as Action] }));
            } else if (event === "done") {
              threadId.current = payload.threadId;
            } else if (event === "error") {
              patch((message) => ({ ...message, text: message.text || payload.message }));
            }
          }
        }
      } catch {
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = { role: "assistant", text: copy.errorGeneric };
          return next;
        });
      } finally {
        setStreaming(false);
      }
    },
    [copy.errorGeneric, lessonId, streaming],
  );

  return (
    <AssistantCtx.Provider value={{ open }}>
      {children}
      {isOpen ? (
        <>
          <div className="tw-assistant__backdrop" onClick={close} role="presentation" />
          <section className="tw-assistant" role="dialog" aria-label={copy.title}>
            <header className="tw-assistant__head">
              <span className="tw-assistant__avatar" aria-hidden>
                <Sparkles strokeWidth={1.8} />
              </span>
              <div style={{ minWidth: 0 }}>
                <div className="tw-assistant__title">{copy.title}</div>
                <div className="tw-assistant__sub">{copy.subtitle}</div>
              </div>
              <button type="button" className="tw-assistant__close" onClick={close} aria-label={copy.close}>
                <X strokeWidth={1.8} />
              </button>
            </header>

            <div className="tw-assistant__list" ref={listRef}>
              {messages.length === 0 ? (
                <>
                  <div className="tw-bubble tw-bubble--assistant">{copy.intro}</div>
                  <div className="tw-assistant__chips">
                    {copy.suggestions.map((suggestion) => (
                      <button key={suggestion} type="button" className="tw-chip tw-chip--outline" onClick={() => ask(suggestion)}>
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </>
              ) : null}

              {messages.map((message, index) => (
                <div key={index} className={`tw-bubble tw-bubble--${message.role}`}>
                  {message.text || (streaming && index === messages.length - 1 ? <em className="tw-assistant__typing">{copy.thinking}</em> : null)}

                  {message.actions?.length ? (
                    <div className="tw-assistant__actions">
                      {message.actions.map((action) => (
                        <Link key={action.href} href={action.href} className="tw-btn tw-btn--yellow tw-btn--sm" onClick={() => setIsOpen(false)}>
                          {action.label}
                          <ArrowRight strokeWidth={1.8} />
                        </Link>
                      ))}
                    </div>
                  ) : null}

                  {message.citations?.length ? (
                    <div className="tw-assistant__cites">
                      <span className="tw-eyebrow tw-eyebrow--muted">{copy.sources}</span>
                      {dedupe(message.citations).map((citation) => (
                        <span key={citation.title} className="tw-assistant__cite">
                          {citation.href ? (
                            <Link href={citation.href} onClick={() => setIsOpen(false)}>
                              {citation.title}
                            </Link>
                          ) : (
                            citation.title
                          )}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            <form
              className="tw-assistant__composer"
              onSubmit={(event) => {
                event.preventDefault();
                void ask(draft);
              }}
            >
              <input
                ref={inputRef}
                className="tw-input"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={copy.placeholder}
                aria-label={copy.placeholder}
                maxLength={1000}
              />
              <button type="submit" className="tw-assistant__send" disabled={streaming || draft.trim().length < 2} aria-label={copy.send}>
                <Send strokeWidth={1.8} />
              </button>
            </form>
          </section>
        </>
      ) : null}
    </AssistantCtx.Provider>
  );
}

function dedupe(citations: Citation[]): Citation[] {
  const seen = new Set<string>();
  return citations.filter((citation) => {
    if (seen.has(citation.title)) return false;
    seen.add(citation.title);
    return true;
  });
}

/** Botón que abre el Asistente con el contexto de una lección. */
export function AssistantLink({ lessonId, label, hint }: { lessonId: string; label: string; hint: string }) {
  const { open } = useAssistant();
  return (
    <button type="button" className="tw-nudge tw-nudge--button" onClick={() => open(lessonId)}>
      <span style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--tw-black)" }}>
        <Sparkles size={16} strokeWidth={1.8} />
        <b>{label}</b>
      </span>
      <span>{hint}</span>
    </button>
  );
}
