"use client";

import { useState } from "react";
import { secondaryBtn } from "./sandbox-ui";

export function CopyButton({ value, label = "Copiar enlace", className }: { value: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={className ?? secondaryBtn}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch {
          window.prompt("Copia el enlace:", value);
        }
      }}
    >
      {copied ? "✓ Copiado" : label}
    </button>
  );
}
