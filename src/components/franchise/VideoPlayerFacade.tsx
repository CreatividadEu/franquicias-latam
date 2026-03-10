"use client";

import { useState } from "react";
import { Play } from "lucide-react";

function buildAutoplayEmbedUrl(url: string): string {
  if (url.includes("youtube.com/watch")) {
    const match = url.match(/[?&]v=([^&]+)/);
    return match?.[1]
      ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0`
      : url;
  }
  if (url.includes("youtu.be/")) {
    const match = url.match(/youtu\.be\/([^?]+)/);
    return match?.[1]
      ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0`
      : url;
  }
  if (url.includes("youtube.com/embed/")) {
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}autoplay=1`;
  }
  if (url.includes("vimeo.com/")) {
    const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    return match?.[1]
      ? `https://player.vimeo.com/video/${match[1]}?autoplay=1`
      : url;
  }
  return url;
}

function getYoutubeThumbnail(url: string): string | null {
  let id: string | null = null;
  if (url.includes("youtube.com/watch")) {
    id = url.match(/[?&]v=([^&]+)/)?.[1] ?? null;
  } else if (url.includes("youtu.be/")) {
    id = url.match(/youtu\.be\/([^?]+)/)?.[1] ?? null;
  } else if (url.includes("youtube.com/embed/")) {
    id = url.match(/embed\/([^?]+)/)?.[1] ?? null;
  }
  return id ? `https://i.ytimg.com/vi/${id}/maxresdefault.jpg` : null;
}

export function VideoPlayerFacade({
  videoUrl,
  imageUrl,
  title,
}: {
  videoUrl: string;
  imageUrl?: string | null;
  title: string;
}) {
  const [playing, setPlaying] = useState(false);
  const thumbnail = getYoutubeThumbnail(videoUrl) ?? imageUrl ?? null;

  if (playing) {
    return (
      <iframe
        className="h-full w-full"
        src={buildAutoplayEmbedUrl(videoUrl)}
        title={`Video de ${title}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`Reproducir video de ${title}`}
      className="group relative flex h-full w-full items-center justify-center bg-stone-950 focus-visible:outline-none"
    >
      {/* Thumbnail */}
      {thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbnail}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover opacity-80 transition-opacity duration-300 group-hover:opacity-70"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-stone-800 to-stone-950" />
      )}

      {/* Vignette */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-stone-950/50 via-transparent to-transparent" />

      {/* Play pill */}
      <div className="relative z-10 flex items-center gap-3 rounded-full bg-white/95 px-6 py-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-sm transition-all duration-200 group-hover:scale-105 group-hover:bg-white group-hover:shadow-[0_12px_40px_rgba(0,0,0,0.45)] active:scale-[0.98]">
        <span className="flex size-8 items-center justify-center rounded-full bg-stone-950">
          <Play className="size-3.5 translate-x-px fill-white text-white" />
        </span>
        <span className="text-sm font-semibold tracking-wide text-stone-950">
          Ver video
        </span>
      </div>
    </button>
  );
}
