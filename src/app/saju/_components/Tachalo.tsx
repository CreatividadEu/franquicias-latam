import type { ReactNode } from "react";

/** The "táchalo" strikethrough device — a yellow hand-struck bar over a word. */
export function Strike({ children }: { children: ReactNode }) {
  return (
    <em className="saju-strike" aria-hidden={false}>
      {children}
    </em>
  );
}

/** Small uppercase eyebrow label with a leading rule. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="saju-eyebrow-row">
      <span className="saju-eyebrow">{children}</span>
    </div>
  );
}
