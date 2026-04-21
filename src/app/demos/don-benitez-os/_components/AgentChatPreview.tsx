"use client";

import type { ChatMessage } from "../_lib/types";

export function AgentChatPreview({
  messages,
  candidateName,
  showCursor = true,
}: {
  messages: ChatMessage[];
  candidateName: string;
  showCursor?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-fl-border bg-fl-base/50 p-4">
      <div className="flex items-center gap-2 pb-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fl-teal opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-fl-teal" />
        </span>
        <span className="text-xs text-fl-muted">
          Conversación activa · Clawdbot ↔ {candidateName}
        </span>
      </div>
      <div className="max-h-72 space-y-2 overflow-y-auto">
        {messages.map((m, i) => {
          const isBot = m.from === "bot";
          const isLast = i === messages.length - 1;
          return (
            <div
              key={i}
              className={`flex ${isBot ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[78%] rounded-xl px-3 py-2 text-sm leading-snug ${
                  isBot
                    ? "bg-fl-teal/10 text-fl-text"
                    : "bg-fl-surface text-fl-text"
                }`}
              >
                <p className="text-[10px] uppercase tracking-wider text-fl-muted">
                  {isBot ? "Clawdbot" : candidateName.split(" ")[0]}
                </p>
                <p className="mt-0.5">
                  {m.text}
                  {isBot && isLast && showCursor && (
                    <span className="ml-1 inline-block h-3.5 w-1.5 animate-pulse bg-fl-teal align-middle" />
                  )}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
