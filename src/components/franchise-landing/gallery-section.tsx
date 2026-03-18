"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { GalleryImageData } from "@/lib/franchise-mapper";

// ── Carousel constants (mirrors WorkCarousel) ─────────────────────────────────

const EDGE_MASK = {
  WebkitMaskImage:
    "linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 8%, rgba(0,0,0,1) 92%, rgba(0,0,0,0) 100%)",
  maskImage:
    "linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 8%, rgba(0,0,0,1) 92%, rgba(0,0,0,0) 100%)",
};

const SCROLL_SPEED = 38.4;
const DEFAULT_GAP = 24;
const DRAG_THRESHOLD = 40;
const SNAP_DURATION_MS = 280;

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

// ── Image-only card (no text overlays, no stat badge) ─────────────────────────

function GalleryCard({ item }: { item: GalleryImageData }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className="w-[280px] shrink-0 sm:w-[320px] md:w-[344px] lg:w-[360px]">
      <div className="relative h-[360px] overflow-hidden rounded-[24px] bg-[#d4d4d4]">
        {item.url && !imageFailed && (
          <Image
            src={item.url}
            alt={item.altText ?? item.label ?? "Imagen de galería"}
            fill
            sizes="(min-width: 1024px) 360px, (min-width: 768px) 344px, (min-width: 640px) 320px, 280px"
            className="object-cover"
            onError={() => setImageFailed(true)}
          />
        )}
      </div>
    </div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

export function GallerySection({ data }: { data: GalleryImageData[] }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const trackRef = useRef<HTMLDivElement | null>(null);
  const firstLoopRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);
  const xRef = useRef(0);
  const loopWidthRef = useRef(0);
  const cardStrideRef = useRef(0);
  const isHoveredRef = useRef(false);
  const isDraggingRef = useRef(false);
  const activePointerIdRef = useRef<number | null>(null);
  const dragStartXRef = useRef(0);
  const dragStartOffsetRef = useRef(0);
  const dragDeltaXRef = useRef(0);
  const snapAnimationRef = useRef<{
    from: number;
    to: number;
    startTime: number | null;
  } | null>(null);

  const applyTransform = useCallback(() => {
    if (!trackRef.current) return;
    trackRef.current.style.transform = `translate3d(${-xRef.current}px, 0, 0)`;
  }, []);

  const normalizeOffset = useCallback((value: number) => {
    const loopWidth = loopWidthRef.current;
    if (loopWidth <= 0) return 0;
    let normalized = value % loopWidth;
    if (normalized < 0) normalized += loopWidth;
    return normalized;
  }, []);

  const setScrollOffset = useCallback(
    (nextValue: number) => {
      xRef.current = normalizeOffset(nextValue);
      applyTransform();
    },
    [applyTransform, normalizeOffset],
  );

  const stopSnap = useCallback(() => {
    snapAnimationRef.current = null;
  }, []);

  const animateToOffset = useCallback(
    (nextValue: number) => {
      if (loopWidthRef.current <= 0) {
        setScrollOffset(nextValue);
        return;
      }
      const target = normalizeOffset(nextValue);
      if (prefersReducedMotion) {
        stopSnap();
        setScrollOffset(target);
        return;
      }
      let destination = target;
      let delta = destination - xRef.current;
      if (delta > loopWidthRef.current / 2) {
        destination -= loopWidthRef.current;
        delta = destination - xRef.current;
      } else if (delta < -loopWidthRef.current / 2) {
        destination += loopWidthRef.current;
        delta = destination - xRef.current;
      }
      if (Math.abs(delta) < 1) {
        stopSnap();
        setScrollOffset(target);
        return;
      }
      snapAnimationRef.current = { from: xRef.current, to: destination, startTime: null };
    },
    [normalizeOffset, prefersReducedMotion, setScrollOffset, stopSnap],
  );

  const snapToClosestCard = useCallback(
    (dragDeltaX: number) => {
      const stride = cardStrideRef.current;
      if (stride <= 0) return;
      const threshold = Math.max(DRAG_THRESHOLD, stride * 0.08);
      const baseIndex = Math.round(dragStartOffsetRef.current / stride);
      let targetIndex = baseIndex;
      if (Math.abs(dragDeltaX) > threshold) {
        targetIndex += dragDeltaX > 0 ? -1 : 1;
      }
      animateToOffset(targetIndex * stride);
    },
    [animateToOffset],
  );

  useEffect(() => {
    const measure = () => {
      if (!trackRef.current || !firstLoopRef.current) return;
      const firstCard = firstLoopRef.current.firstElementChild as HTMLElement | null;
      const cardWidth = firstCard?.getBoundingClientRect().width ?? 0;
      // loop div includes pr-6 (trailing padding = gap), so its width already equals one full loop stride
      loopWidthRef.current = firstLoopRef.current.getBoundingClientRect().width;
      cardStrideRef.current = cardWidth > 0 ? cardWidth + DEFAULT_GAP : 0;
      xRef.current = normalizeOffset(xRef.current);
      applyTransform();
    };

    measure();
    window.addEventListener("resize", measure);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && firstLoopRef.current) {
      observer = new ResizeObserver(() => measure());
      observer.observe(firstLoopRef.current);
    }

    return () => {
      window.removeEventListener("resize", measure);
      observer?.disconnect();
    };
  }, [applyTransform, normalizeOffset]);

  useEffect(() => {
    const cleanupAnimation = () => {
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastFrameRef.current = null;
    };

    if (prefersReducedMotion) {
      snapAnimationRef.current = null;
      cleanupAnimation();
      return cleanupAnimation;
    }

    const tick = (timestamp: number) => {
      if (lastFrameRef.current === null) lastFrameRef.current = timestamp;
      const deltaSeconds = (timestamp - lastFrameRef.current) / 1000;
      lastFrameRef.current = timestamp;

      if (snapAnimationRef.current) {
        if (snapAnimationRef.current.startTime === null) {
          snapAnimationRef.current.startTime = timestamp;
        }
        const elapsed = timestamp - snapAnimationRef.current.startTime;
        const progress = Math.min(elapsed / SNAP_DURATION_MS, 1);
        const easedProgress = 1 - (1 - progress) ** 3;
        const nextOffset =
          snapAnimationRef.current.from +
          (snapAnimationRef.current.to - snapAnimationRef.current.from) * easedProgress;
        setScrollOffset(nextOffset);
        if (progress >= 1) snapAnimationRef.current = null;
      } else if (
        !isHoveredRef.current &&
        !isDraggingRef.current &&
        loopWidthRef.current > 0
      ) {
        setScrollOffset(xRef.current + SCROLL_SPEED * deltaSeconds);
      }

      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);
    return cleanupAnimation;
  }, [prefersReducedMotion, setScrollOffset]);

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    const horizontalDelta =
      Math.abs(event.deltaX) > 0 ? event.deltaX : event.shiftKey ? event.deltaY : 0;
    if (horizontalDelta === 0) return;
    event.preventDefault();
    stopSnap();
    setScrollOffset(xRef.current + horizontalDelta);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    stopSnap();
    isDraggingRef.current = true;
    activePointerIdRef.current = event.pointerId;
    dragStartXRef.current = event.clientX;
    dragStartOffsetRef.current = xRef.current;
    dragDeltaXRef.current = 0;
    event.currentTarget.setPointerCapture(event.pointerId);
    if (event.pointerType === "mouse") event.currentTarget.style.cursor = "grabbing";
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || activePointerIdRef.current !== event.pointerId) return;
    event.preventDefault();
    const deltaX = event.clientX - dragStartXRef.current;
    dragDeltaXRef.current = deltaX;
    setScrollOffset(dragStartOffsetRef.current - deltaX);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || activePointerIdRef.current !== event.pointerId) return;
    isDraggingRef.current = false;
    activePointerIdRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (event.pointerType === "mouse") event.currentTarget.style.cursor = "grab";
    snapToClosestCard(dragDeltaXRef.current);
  };

  return (
    <section
      aria-label="Galería"
      className="bg-[#f8fafc] pt-16 pb-16 md:pt-24 md:pb-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#2563eb]">
            Bienvenidos
          </p>
          <h2
            className="mt-2 text-3xl font-bold text-[#171717] sm:text-4xl"
            style={{ fontFamily: "var(--font-heading, system-ui, sans-serif)" }}
          >
            Conoce Nuestra Franquicia
          </h2>
        </div>
      </div>

      <div className="mx-auto mt-10 w-full max-w-[1100px] px-4 sm:px-6 lg:px-0">
        <div
          ref={viewportRef}
          className="cursor-grab select-none overflow-hidden active:cursor-grabbing"
          style={{ ...EDGE_MASK, touchAction: "pan-y" }}
          onMouseEnter={() => { isHoveredRef.current = true; }}
          onMouseLeave={() => { isHoveredRef.current = false; }}
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onDragStart={(e) => e.preventDefault()}
        >
          <div
            ref={trackRef}
            className="flex w-max will-change-transform"
            style={{ transform: "translate3d(0,0,0)" }}
          >
            {[0, 1, 2, 3].map((loopIndex) => (
              <div
                key={`gallery-loop-${loopIndex}`}
                ref={loopIndex === 0 ? firstLoopRef : null}
                className="flex shrink-0 gap-6 pr-6"
              >
                {data.map((item, cardIndex) => (
                  <GalleryCard
                    key={`gallery-card-${loopIndex}-${item.id}-${cardIndex}`}
                    item={item}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
