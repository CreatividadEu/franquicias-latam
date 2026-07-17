import { Fragment, type ReactNode } from "react";

/**
 * The "táchalo" strikethrough device — a yellow hand-struck bar over a word.
 * Multi-word phrases are struck word by word so the line can wrap on small
 * screens instead of overflowing (each word keeps its own nowrap bar).
 */
export function Strike({ children }: { children: ReactNode }) {
  const words =
    typeof children === "string" && children.includes(" ")
      ? children.split(" ")
      : null;
  return (
    <em className="saju-strike" aria-hidden={false}>
      {words ? (
        words.map((w, i) => (
          <Fragment key={`${w}-${i}`}>
            <span className="saju-strike__w">{w}</span>
            {i < words.length - 1 ? " " : null}
          </Fragment>
        ))
      ) : (
        <span className="saju-strike__w">{children}</span>
      )}
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
