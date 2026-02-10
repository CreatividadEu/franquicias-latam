"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { ChatMessage as ChatMessageType } from "@/types";

interface ChatMessageProps {
  message: ChatMessageType;
  isNew?: boolean;
}

export function ChatMessage({ message, isNew = false }: ChatMessageProps) {
  const isBot = message.type === "bot";
  const [visible, setVisible] = useState(!isNew);

  useEffect(() => {
    if (isNew) {
      const timer = setTimeout(() => setVisible(true), 50);
      return () => clearTimeout(timer);
    }
  }, [isNew]);

  return (
    <div
      className={cn(
        "flex w-full transition-all duration-400 ease-out",
        isBot ? "justify-start" : "justify-end",
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-3"
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed backdrop-blur-xl",
          isBot
            ? "bg-white/10 text-white shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/20 rounded-bl-sm"
            : "bg-white/20 text-white rounded-br-sm shadow-[0_8px_32px_rgba(0,0,0,0.15)] border border-white/30"
        )}
      >
        {isBot && (
          <div className="flex items-center gap-2 mb-1">
            <div className="w-5 h-5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
              <span className="text-[10px] text-white font-bold">F</span>
            </div>
            <span className="text-xs font-semibold text-white/90">
              Franquicias LATAM
            </span>
          </div>
        )}
        <p className="whitespace-pre-line">{message.content}</p>
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex justify-start animate-in fade-in duration-200">
      <div className="bg-white/10 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/20 rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
            <span className="text-[10px] text-white font-bold">F</span>
          </div>
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
        </div>
      </div>
    </div>
  );
}
