"use client";

import { useState } from "react";
import { track } from "./track";

/**
 * YouTube episode card with a click-to-play facade: renders the thumbnail
 * until the user taps play, so the page never eager-loads 4 YT iframes.
 */
export function EpisodeCard({
  id,
  kicker,
  title,
}: {
  id: string;
  kicker: string;
  title: string;
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <article className="saju-pod-card">
      <div className="saju-pod-card__media">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            className="saju-pod-card__poster"
            aria-label={`Reproducir: ${title}`}
            onClick={() => {
              setPlaying(true);
              track("cta_click", { label: "podcast_play", video: id });
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- YT thumb needs onError fallback (maxres → hq) */}
            <img
              src={`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`}
              alt=""
              loading="lazy"
              onError={(e) => {
                const img = e.currentTarget;
                if (!img.dataset.fallback) {
                  img.dataset.fallback = "1";
                  img.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
                }
              }}
            />
            <span className="saju-pod-card__play" aria-hidden>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5.5v13l11-6.5z" />
              </svg>
            </span>
          </button>
        )}
      </div>
      <div className="saju-pod-card__meta">
        <span className="saju-pod-card__kicker">{kicker}</span>
        <h3 className="saju-pod-card__title">{title}</h3>
      </div>
    </article>
  );
}
