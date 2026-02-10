"use client";

import { useEffect, useRef } from "react";

type Density = "low" | "medium";

type HeroParticlesProps = {
  density?: Density;
  className?: string;
};

type Particle = {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  alpha: number;
  blur: number;
  fill: string;
  shadow: string;
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export function HeroParticles({
  density = "medium",
  className = "",
}: HeroParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const isDevDebug =
      process.env.NODE_ENV !== "production" &&
      new URLSearchParams(window.location.search).get("particles") === "debug";

    let reduceMotion = mediaQuery.matches;
    let isVisible = !document.hidden;
    let rafId = 0;
    let lastTime = 0;
    let frameAccumulator = 0;
    let width = 1;
    let height = 1;
    let dpr = 1;

    const particles: Particle[] = [];
    const targetFrameMs = 1000 / 30;

    const createParticles = () => {
      particles.length = 0;
      const area = width * height;
      const isMobile = width < 768;
      const rawCount = Math.round(area / (density === "low" ? 26000 : 18000));
      const count = isMobile
        ? clamp(rawCount, 14, 30)
        : clamp(rawCount, 24, 60);

      for (let i = 0; i < count; i += 1) {
        const hasLargeRadius = Math.random() < 0.12;
        const hasBlur = Math.random() < 0.18;
        const useBlueTint = Math.random() < 0.25;
        const alpha = isDevDebug
          ? 0.35 + Math.random() * 0.35
          : 0.03 + Math.random() * 0.05;

        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: hasLargeRadius ? 2.2 + Math.random() * 0.8 : 1 + Math.random() * 1.2,
          vx: (Math.random() < 0.5 ? -1 : 1) * (0.02 + Math.random() * 0.04),
          vy: (Math.random() < 0.5 ? -1 : 1) * (0.015 + Math.random() * 0.03),
          alpha,
          blur: hasBlur ? 0.5 + Math.random() * 1 : 0,
          fill: isDevDebug
            ? i % 3 === 0
              ? "rgb(255, 80, 80)"
              : i % 3 === 1
                ? "rgb(80, 255, 120)"
                : "rgb(80, 140, 255)"
            : useBlueTint
              ? "rgb(47, 91, 255)"
              : "rgb(255, 255, 255)",
          shadow: isDevDebug
            ? "rgba(60, 120, 255, 0.35)"
            : useBlueTint
              ? "rgba(47, 91, 255, 0.10)"
              : "rgba(255, 255, 255, 0.08)",
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.fill;
        ctx.shadowBlur = p.blur;
        ctx.shadowColor = p.shadow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    };

    const update = (deltaMs: number) => {
      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];
        p.x += p.vx * deltaMs;
        p.y += p.vy * deltaMs;

        if (p.x < -p.r * 2) p.x = width + p.r * 2;
        else if (p.x > width + p.r * 2) p.x = -p.r * 2;

        if (p.y < -p.r * 2) p.y = height + p.r * 2;
        else if (p.y > height + p.r * 2) p.y = -p.r * 2;
      }
    };

    const animate = (time: number) => {
      if (!isVisible || reduceMotion) {
        rafId = 0;
        return;
      }

      if (!lastTime) lastTime = time;
      const delta = time - lastTime;
      lastTime = time;
      frameAccumulator += delta;

      if (frameAccumulator >= targetFrameMs) {
        const step = Math.min(frameAccumulator, 50);
        frameAccumulator = 0;
        update(step);
        draw();
      }

      rafId = window.requestAnimationFrame(animate);
    };

    const start = () => {
      if (!rafId && !reduceMotion && isVisible) {
        lastTime = 0;
        frameAccumulator = 0;
        rafId = window.requestAnimationFrame(animate);
      }
    };

    const stop = () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      createParticles();
      draw();
    };

    const handleVisibility = () => {
      isVisible = !document.hidden;
      if (isVisible) start();
      else stop();
    };

    const handleMotionChange = (event: MediaQueryListEvent) => {
      reduceMotion = event.matches;
      if (reduceMotion) {
        stop();
        draw();
      } else {
        start();
      }
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();
    if (!reduceMotion) start();

    document.addEventListener("visibilitychange", handleVisibility);
    mediaQuery.addEventListener("change", handleMotionChange);

    return () => {
      stop();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      mediaQuery.removeEventListener("change", handleMotionChange);
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none opacity-100 ${className}`.trim()}
      aria-hidden="true"
    />
  );
}
