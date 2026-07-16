"use client";

import { useEffect, useRef } from "react";

type InstgrmWindow = Window & {
  instgrm?: { Embeds?: { process?: () => void } };
};

/**
 * Instagram reel embed. Renders the official blockquote and loads embed.js
 * once (shared across instances); the script swaps it for the real player.
 */
export function InstagramReel({ permalink }: { permalink: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const process = () => (window as InstgrmWindow).instgrm?.Embeds?.process?.();
    if ((window as InstgrmWindow).instgrm?.Embeds) {
      process();
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src^="https://www.instagram.com/embed.js"]',
    );
    if (existing) {
      existing.addEventListener("load", process, { once: true });
      process();
      return;
    }
    const s = document.createElement("script");
    s.src = "https://www.instagram.com/embed.js";
    s.async = true;
    s.onload = process;
    document.body.appendChild(s);
  }, []);

  return (
    <div className="saju-igreel" ref={ref}>
      <blockquote
        className="instagram-media"
        data-instgrm-permalink={`${permalink}?utm_source=ig_embed&utm_campaign=loading`}
        data-instgrm-version="14"
      >
        <a href={permalink} target="_blank" rel="noopener noreferrer">
          Ver el reel de @saju en Instagram
        </a>
      </blockquote>
    </div>
  );
}
