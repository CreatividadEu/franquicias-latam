"use client";

import type { ReactNode } from "react";
import { track } from "./track";

/** Anchor that smooth-scrolls to an in-page target and fires a cta_click event. */
export function CtaLink({
  href,
  children,
  className = "",
  label,
  target,
  rel,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  label?: string;
  target?: string;
  rel?: string;
}) {
  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    track("cta_click", { target: href, label });
    if (href.startsWith("#")) {
      const el = document.querySelector(href);
      if (el) {
        e.preventDefault();
        const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
        el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      }
    }
  };
  return (
    <a href={href} className={className} onClick={onClick} target={target} rel={rel}>
      {children}
    </a>
  );
}
