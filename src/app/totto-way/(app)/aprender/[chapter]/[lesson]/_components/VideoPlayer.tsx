"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Maximize, Pause, Play, Video } from "lucide-react";
import { saveVideoProgress } from "../actions";

const SPEEDS = [1, 1.25, 1.5, 2] as const;
const REPORT_EVERY_MS = 10_000;

function clock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export type VideoPlayerProps = {
  lessonId: string;
  src: string | null;
  poster: string | null;
  markers: { sec: number; label: string }[];
  subtitlesSrc?: string | null;
  initialSeconds: number;
  gatePercent: number;
  labels: { play: string; pause: string; missing: string; watched: string; fullscreen: string };
  onRatioChange?: (ratio: number) => void;
};

/**
 * Player 16:9 de marca. Reporta el avance cada 10 s y al pausar; el servidor
 * conserva el máximo visto y es quien decide si la lección puede completarse.
 * Sin archivo de video muestra el screenshot del manual como poster.
 */
export function VideoPlayer({
  lessonId,
  src,
  poster,
  markers,
  subtitlesSrc,
  initialSeconds,
  gatePercent,
  labels,
  onRatioChange,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastReported = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(initialSeconds);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState<number>(1);
  const [started, setStarted] = useState(initialSeconds > 0);
  // El aviso de "has visto el N %" mide el MÁXIMO visto, no dónde está el
  // cursor: si no, rebobinar decía que se había visto menos y contradecía al
  // botón de completar, que sí usa el máximo guardado en servidor.
  const [maxSeconds, setMaxSeconds] = useState(initialSeconds);

  const report = useCallback(
    (seconds: number, total: number) => {
      lastReported.current = seconds;
      void saveVideoProgress({ lessonId, seconds, duration: total > 0 ? total : null }).then((result) => {
        if (result.ok) onRatioChange?.(result.ratio);
      });
    },
    [lessonId, onRatioChange],
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onLoaded = () => {
      setDuration(video.duration || 0);
      if (initialSeconds > 0 && initialSeconds < video.duration) video.currentTime = initialSeconds;
    };
    const onTime = () => {
      setCurrent(video.currentTime);
      setMaxSeconds((previous) => (video.currentTime > previous ? video.currentTime : previous));
    };
    const onPlay = () => {
      setPlaying(true);
      setStarted(true);
    };
    const onPause = () => {
      setPlaying(false);
      report(video.currentTime, video.duration || 0);
    };
    const onEnded = () => {
      setPlaying(false);
      report(video.duration || video.currentTime, video.duration || 0);
    };

    video.addEventListener("loadedmetadata", onLoaded);
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);

    const interval = setInterval(() => {
      if (!video.paused && Math.abs(video.currentTime - lastReported.current) >= REPORT_EVERY_MS / 1000) {
        report(video.currentTime, video.duration || 0);
      }
    }, REPORT_EVERY_MS);

    return () => {
      video.removeEventListener("loadedmetadata", onLoaded);
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
      clearInterval(interval);
    };
  }, [initialSeconds, report]);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play();
    else video.pause();
  };

  const seek = (event: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    const rect = event.currentTarget.getBoundingClientRect();
    video.currentTime = ((event.clientX - rect.left) / rect.width) * duration;
  };

  const cycleSpeed = () => {
    const next = SPEEDS[(SPEEDS.indexOf(speed as (typeof SPEEDS)[number]) + 1) % SPEEDS.length];
    setSpeed(next);
    if (videoRef.current) videoRef.current.playbackRate = next;
  };

  const pct = duration > 0 ? (current / duration) * 100 : 0;
  const watchedPct = duration > 0 ? Math.min(100, (maxSeconds / duration) * 100) : 0;

  if (!src) {
    return (
      <div className="tw-video">
        <div className="tw-video__frame">
          {poster ? <Image src={poster} alt="" fill sizes="920px" className="tw-video__poster" style={{ opacity: 0.22 }} /> : null}
          <div className="tw-video__missing">
            <Video strokeWidth={1.8} />
            <span className="tw-small">{labels.missing}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tw-video">
      <div className="tw-video__frame">
        <video ref={videoRef} poster={poster ?? undefined} playsInline preload="metadata" src={src}>
          {subtitlesSrc ? <track kind="subtitles" srcLang="es" label="Español" src={subtitlesSrc} default /> : null}
        </video>
        {!started ? (
          <button type="button" className="tw-video__play" onClick={toggle} aria-label={labels.play}>
            <Play strokeWidth={1.8} fill="currentColor" />
          </button>
        ) : null}
      </div>

      <div className="tw-video__bar">
        <button type="button" className="tw-video__btn" onClick={toggle} aria-label={playing ? labels.pause : labels.play}>
          {playing ? <Pause strokeWidth={1.8} /> : <Play strokeWidth={1.8} />}
        </button>
        <span className="tw-video__time">{clock(current)}</span>
        <div
          className="tw-video__scrub"
          onClick={seek}
          role="slider"
          tabIndex={0}
          aria-label="Progreso del video"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pct)}
          onKeyDown={(event) => {
            const video = videoRef.current;
            if (!video) return;
            if (event.key === "ArrowRight") video.currentTime = Math.min(duration, video.currentTime + 5);
            if (event.key === "ArrowLeft") video.currentTime = Math.max(0, video.currentTime - 5);
          }}
        >
          <div className="tw-video__scrub-fill" style={{ width: `${pct}%` }} />
          {duration > 0
            ? markers.map((marker) => (
                <span key={marker.sec} className="tw-video__marker" style={{ left: `${(marker.sec / duration) * 100}%` }} title={marker.label} />
              ))
            : null}
        </div>
        <span className="tw-video__time">{clock(duration)}</span>
        <button type="button" className="tw-video__speed" onClick={cycleSpeed} aria-label="Velocidad">
          {speed}×
        </button>
        <button
          type="button"
          className="tw-video__btn"
          onClick={() => void videoRef.current?.requestFullscreen?.()}
          aria-label={labels.fullscreen}
        >
          <Maximize strokeWidth={1.8} />
        </button>
      </div>
      <p className="tw-video__gate">
        {labels.watched.replace("{{pct}}", String(Math.round(watchedPct))).replace("{{gate}}", String(gatePercent))}
      </p>
    </div>
  );
}
