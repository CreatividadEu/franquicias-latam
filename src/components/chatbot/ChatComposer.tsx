"use client";

import { useState } from "react";
import { Plus, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatComposerProps {
  onSend?: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatComposer({
  onSend,
  disabled = false,
  placeholder = "Escribe un mensaje…",
}: ChatComposerProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && onSend && !disabled) {
      onSend(message.trim());
      setMessage("");
    }
  };

  return (
    <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50/50">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        {/* Plus Button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full shrink-0 hover:bg-neutral-200"
          disabled={disabled}
        >
          <Plus className="h-5 w-5 text-neutral-600" />
        </Button>

        {/* Input */}
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 h-10 px-4 rounded-full bg-white border border-neutral-200 text-base text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#2F5BFF]/35 focus:border-[#2F5BFF] focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
        />

        {/* Send Button */}
        <Button
          type="submit"
          size="icon"
          className="h-10 w-10 rounded-full shrink-0 bg-[#2F5BFF] hover:bg-[#264BDB] active:bg-[#1F3FC4]"
          disabled={disabled || !message.trim()}
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
}
