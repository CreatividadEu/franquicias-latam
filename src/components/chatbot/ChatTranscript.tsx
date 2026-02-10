"use client";

import { forwardRef, ReactNode } from "react";
import type { ChatMessage as ChatMessageType } from "@/types";

interface ChatTranscriptProps {
  messages: ChatMessageType[];
  children?: ReactNode;
}

export const ChatTranscript = forwardRef<HTMLDivElement, ChatTranscriptProps>(
  ({ messages, children }, ref) => {
    return (
      <div
        ref={ref}
        className="flex-1 overflow-y-auto px-6 py-3 sm:py-4 space-y-4 scroll-smooth"
      >
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {children}
      </div>
    );
  }
);

ChatTranscript.displayName = "ChatTranscript";

interface MessageBubbleProps {
  message: ChatMessageType;
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isBot = message.type === "bot";

  return (
    <div className={`flex ${isBot ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[86%] sm:max-w-[74%] rounded-2xl px-4 py-3 ${
          isBot
            ? "bg-neutral-100 text-neutral-900"
            : "bg-neutral-900 text-white"
        }`}
      >
        <p className="text-base sm:text-lg leading-relaxed">{message.content}</p>
      </div>
    </div>
  );
}
