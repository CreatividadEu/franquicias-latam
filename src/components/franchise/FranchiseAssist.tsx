"use client";

import { FormEvent, useCallback, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

type AssistMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

interface FranchiseAssistProps {
  franchiseId: string;
  initialQuestions: string[];
  fallbackMessage: string;
}

export function FranchiseAssist({
  franchiseId,
  initialQuestions,
  fallbackMessage,
}: FranchiseAssistProps) {
  const [messages, setMessages] = useState<AssistMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Soy tu Franchise Assist. Puedo responder con informacion cargada para esta franquicia.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  // Monotonic counter for message IDs. Pure (just a ref), so the
  // react-hooks/purity lint doesn't flag it the way Date.now() does.
  const messageIdRef = useRef(0);
  const nextId = useCallback((role: "user" | "assistant") => {
    messageIdRef.current += 1;
    return `${role}-${messageIdRef.current}`;
  }, []);

  const suggestedQuestions = useMemo(
    () => initialQuestions.filter(Boolean).slice(0, 3),
    [initialQuestions]
  );

  const submitQuestion = useCallback(
    async (question: string) => {
      const trimmed = question.trim();
      if (!trimmed || loading) return;

      const userMessage: AssistMessage = {
        id: nextId("user"),
        role: "user",
        content: trimmed,
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setLoading(true);

      try {
        const response = await fetch("/api/franchise-bot/ask", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            franchiseId,
            message: trimmed,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "No se pudo responder");
        }

        setMessages((prev) => [
          ...prev,
          {
            id: nextId("assistant"),
            role: "assistant",
            content: data.reply || fallbackMessage,
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: nextId("assistant"),
            role: "assistant",
            content: fallbackMessage,
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [fallbackMessage, franchiseId, loading, nextId],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submitQuestion(input);
  };

  return (
    <Card className="h-full gap-0 border-white/70 bg-white/65 py-0 shadow-[0_24px_65px_-30px_rgba(15,23,42,0.45)] backdrop-blur-xl">
      <CardContent className="flex h-full min-h-[360px] flex-col gap-4 p-5 sm:p-6">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
            Franchise Assist
          </p>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
            Mini Asistente de Franquicia
          </h2>
        </div>

        <div className="flex flex-1 flex-col gap-2 rounded-xl border border-white/80 bg-white/80 p-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                message.role === "assistant"
                  ? "rounded-bl-md bg-slate-100 text-slate-700"
                  : "ml-auto rounded-br-md bg-[#2860E7] text-white"
              }`}
            >
              {message.content}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Escribe tu pregunta..."
            className="border-slate-200 bg-white/85 text-slate-700"
            disabled={loading}
          />

          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question) => (
              <Button
                key={question}
                type="button"
                size="sm"
                variant="outline"
                onClick={() => submitQuestion(question)}
                disabled={loading}
                className="h-auto rounded-full border-slate-200 bg-white/90 px-3 py-1 text-xs text-slate-600"
              >
                {question}
              </Button>
            ))}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
