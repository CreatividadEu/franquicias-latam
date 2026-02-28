"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

// Add real client images under `public/images/work/` and replace each `imageUrl` below.
type WorkItem = {
  title: string;
  description: string;
  imageUrl: string;
  metric1: string;
  metric2: string;
};

const WORK_ITEMS: WorkItem[] = [
  {
    title: "Café Central",
    description: "Escalamiento comercial con expansión regional y mayor ticket promedio.",
    imageUrl: "/images/work/1.jpg",
    metric1: "85% Revenue Growth",
    metric2: "70% Organic Traffic Growth",
  },
  {
    title: "Urban Retail Co.",
    description: "Optimización de adquisición y estructura para abrir nuevas sedes.",
    imageUrl: "/images/work/2.jpg",
    metric1: "62% Lead-to-Sale Lift",
    metric2: "48% CAC Reduction",
  },
  {
    title: "Vital Health Group",
    description: "Posicionamiento de marca y crecimiento sostenido en unidades activas.",
    imageUrl: "/images/work/3.jpg",
    metric1: "91% Retention Increase",
    metric2: "54% Pipeline Growth",
  },
  {
    title: "Norte Servicios",
    description: "Sistema replicable con mejor control operativo y financiero.",
    imageUrl: "/images/work/4.jpg",
    metric1: "73% EBITDA Expansion",
    metric2: "39% Time-to-Launch Cut",
  },
  {
    title: "Andes Food Concepts",
    description: "Campañas de performance para acelerar demanda en mercados clave.",
    imageUrl: "/images/work/5.jpg",
    metric1: "4.1x ROAS Improvement",
    metric2: "66% Qualified Traffic Lift",
  },
  {
    title: "Blue Horizon Clinics",
    description: "Arquitectura de crecimiento para consolidar una red multiciudad.",
    imageUrl: "/images/work/6.jpg",
    metric1: "58% Conversion Uplift",
    metric2: "44% Faster Expansion",
  },
];

const EDGE_MASK = {
  WebkitMaskImage:
    "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
  maskImage:
    "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
};

const SCROLL_SPEED = 32;
const DEFAULT_GAP = 24;

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setPrefersReducedMotion(media.matches);
    onChange();

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    }

    media.addListener(onChange);
    return () => media.removeListener(onChange);
  }, []);

  return prefersReducedMotion;
}

function WorkCard({ item }: { item: WorkItem }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <article className="w-[344px] shrink-0">
      <div className="relative h-[429px] overflow-hidden rounded-[24px] bg-gradient-to-br from-slate-300 via-slate-200 to-slate-100">
        {!imageFailed && (
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            sizes="344px"
            className="object-cover"
            onError={() => setImageFailed(true)}
          />
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-5 flex flex-col items-center gap-2 px-4">
          <span className="rounded-full border border-[rgba(255,255,255,0.2)] bg-[rgba(13,13,13,0.2)] px-4 py-2 text-sm text-white backdrop-blur-md">
            {item.metric1}
          </span>
          <span className="rounded-full border border-[rgba(255,255,255,0.2)] bg-[rgba(13,13,13,0.2)] px-4 py-2 text-sm text-white backdrop-blur-md">
            {item.metric2}
          </span>
        </div>
      </div>

      <h3 className="mt-5 text-xl font-semibold text-slate-900">{item.title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
    </article>
  );
}

export function WorkCarousel() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const trackRef = useRef<HTMLDivElement | null>(null);
  const firstLoopRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);
  const xRef = useRef(0);
  const loopWidthRef = useRef(0);
  const isHoveredRef = useRef(false);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartOffsetRef = useRef(0);

  const applyTransform = useCallback(() => {
    if (!trackRef.current) return;
    trackRef.current.style.transform = `translate3d(${-xRef.current}px, 0, 0)`;
  }, []);

  const normalizeOffset = useCallback((value: number) => {
    const loopWidth = loopWidthRef.current;
    if (loopWidth <= 0) return 0;

    let normalized = value % loopWidth;
    if (normalized < 0) {
      normalized += loopWidth;
    }
    return normalized;
  }, []);

  const setOffset = useCallback(
    (nextValue: number) => {
      xRef.current = normalizeOffset(nextValue);
      applyTransform();
    },
    [applyTransform, normalizeOffset],
  );

  useEffect(() => {
    const measure = () => {
      if (!trackRef.current || !firstLoopRef.current) return;

      const computed = window.getComputedStyle(trackRef.current);
      const parsedGap = Number.parseFloat(computed.columnGap || computed.gap || "");
      const groupGap = Number.isFinite(parsedGap) ? parsedGap : DEFAULT_GAP;
      loopWidthRef.current = firstLoopRef.current.getBoundingClientRect().width + groupGap;
      xRef.current = normalizeOffset(xRef.current);
      applyTransform();
    };

    measure();

    const resizeHandler = () => measure();
    window.addEventListener("resize", resizeHandler);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && firstLoopRef.current) {
      observer = new ResizeObserver(() => measure());
      observer.observe(firstLoopRef.current);
    }

    return () => {
      window.removeEventListener("resize", resizeHandler);
      observer?.disconnect();
    };
  }, [applyTransform, normalizeOffset]);

  useEffect(() => {
    if (prefersReducedMotion) {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = null;
      lastFrameRef.current = null;
      return;
    }

    const tick = (timestamp: number) => {
      if (lastFrameRef.current === null) {
        lastFrameRef.current = timestamp;
      }

      const deltaSeconds = (timestamp - lastFrameRef.current) / 1000;
      lastFrameRef.current = timestamp;

      if (!isHoveredRef.current && !isDraggingRef.current && loopWidthRef.current > 0) {
        setOffset(xRef.current + SCROLL_SPEED * deltaSeconds);
      }

      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = null;
      lastFrameRef.current = null;
    };
  }, [prefersReducedMotion, setOffset]);

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    const horizontalDelta =
      Math.abs(event.deltaX) > 0 ? event.deltaX : event.shiftKey ? event.deltaY : 0;

    if (horizontalDelta === 0) return;

    event.preventDefault();
    setOffset(xRef.current + horizontalDelta);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;

    isDraggingRef.current = true;
    dragStartXRef.current = event.clientX;
    dragStartOffsetRef.current = xRef.current;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const deltaX = event.clientX - dragStartXRef.current;
    setOffset(dragStartOffsetRef.current - deltaX);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <section
      id="work"
      aria-label="Work and clients"
      className="bg-white pt-8 md:pt-10 pb-16 sm:pb-20 lg:pb-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.2rem]">
            Success You Can See
          </h2>
          <p className="mt-5 text-base text-slate-600 sm:text-lg">
            A glimpse into our most impactful projects and success stories.
          </p>
        </div>
      </div>

      <div className="mt-12">
        <div
          ref={viewportRef}
          className="cursor-grab select-none overflow-hidden active:cursor-grabbing"
          style={EDGE_MASK}
          onMouseEnter={() => {
            isHoveredRef.current = true;
          }}
          onMouseLeave={() => {
            isHoveredRef.current = false;
          }}
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div
            ref={trackRef}
            className="flex w-max gap-6 px-4 will-change-transform sm:px-6 lg:px-8"
            style={{ transform: "translate3d(0,0,0)" }}
          >
            {[0, 1].map((loopIndex) => (
              <div
                key={`work-loop-${loopIndex}`}
                ref={loopIndex === 0 ? firstLoopRef : null}
                className="flex shrink-0 gap-6"
              >
                {WORK_ITEMS.map((item, cardIndex) => (
                  <WorkCard key={`work-card-${loopIndex}-${cardIndex}`} item={item} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
