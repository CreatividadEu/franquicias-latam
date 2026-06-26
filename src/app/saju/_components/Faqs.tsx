"use client";

import { useState } from "react";

export function Faqs({ items }: { items: ReadonlyArray<{ q: string; a: string }> }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="saju-faqs">
      {items.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={f.q} className="saju-faq" data-open={isOpen}>
            <button
              className="saju-faq__q"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : i)}
            >
              <span>{f.q}</span>
              <svg
                className="saju-faq__icon"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                aria-hidden="true"
              >
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
            </button>
            <div className="saju-faq__a" role="region">
              <p>{f.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
