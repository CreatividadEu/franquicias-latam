"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type SuccessfulFranchise = {
  id: string;
  name: string;
  stat: string;
  description: string;
  imageUrl?: string;
};

const successfulFranchises: SuccessfulFranchise[] = [
  {
    id: "cafe-quindio",
    name: "Café Quindío",
    stat: "50 + Puntos Internacional",
    imageUrl: "/fotos_home/franquicia_cafe_quindio.jpg",
    description: "Marca líder de café colombiano.",
  },
  {
    id: "mercado-libre",
    name: "Mercado Libre",
    stat: "28,9 Billones USD / año",
    imageUrl: "/fotos_home/franquicias_mercado_libre.jpg",
    description: "La empresa más grande de LATAM.",
  },
  {
    id: "sodexo",
    name: "Sodexo",
    stat: "24 Billones EUR / año",
    imageUrl: "/fotos_home/franquicias_sodexo.jpg",
    description: "Líder global de food services.",
  },
  {
    id: "totto",
    name: "Totto",
    stat: "450 Tiendas Globales",
    imageUrl: "/fotos_home/franquicias_totto.jpg",
    description: "Marca líder global de mochilas.",
  },
  {
    id: "crem-helado",
    name: "Crem Helado",
    stat: "200 Mill. USD / año.",
    imageUrl: "/fotos_home/franquicias_crem_helado.jpg",
    description: "Líder de helados regional.",
  },
  {
    id: "andres-carne-de-res",
    name: "Andrés Carne de Res",
    stat: "Premiado World's Best Restaurants",
    imageUrl: "/fotos_home/franquicias_andres.jpg",
    description: "Marca icónica de Colombia.",
  },
];

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

function WorkCard({ item }: { item: SuccessfulFranchise }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <article className="w-[280px] shrink-0 sm:w-[320px] md:w-[344px] lg:w-[360px]">
      <div className="relative h-[429px] overflow-hidden rounded-[24px] bg-[#d4d4d4]">
        {item.imageUrl && !imageFailed && (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="(min-width: 1024px) 360px, (min-width: 768px) 344px, (min-width: 640px) 320px, 280px"
            className="object-cover"
            onError={() => setImageFailed(true)}
          />
        )}
        <div className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 md:bottom-6">
          <span className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-white/20 bg-slate-900/45 px-5 py-2.5 text-sm font-semibold tracking-tight text-white shadow-lg backdrop-blur-md md:px-6 md:py-3 md:text-base">
            {item.stat}
          </span>
        </div>
      </div>

      <h3 className="mt-4 text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">
        {item.name}
      </h3>
      <p className="mt-2 max-w-[28rem] text-sm leading-relaxed text-slate-600 md:text-base">
        {item.description}
      </p>
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

  const stopSnap = useCallback(() => {
    snapAnimationRef.current = null;
  }, []);

  const animateToOffset = useCallback(
    (nextValue: number) => {
      if (loopWidthRef.current <= 0) {
        setOffset(nextValue);
        return;
      }

      const target = normalizeOffset(nextValue);
      if (prefersReducedMotion) {
        stopSnap();
        setOffset(target);
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
        setOffset(target);
        return;
      }

      snapAnimationRef.current = {
        from: xRef.current,
        to: destination,
        startTime: null,
      };
    },
    [normalizeOffset, prefersReducedMotion, setOffset, stopSnap],
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

      const computed = window.getComputedStyle(trackRef.current);
      const parsedGap = Number.parseFloat(computed.columnGap || computed.gap || "");
      const groupGap = Number.isFinite(parsedGap) ? parsedGap : DEFAULT_GAP;
      const firstCard = firstLoopRef.current.firstElementChild as HTMLElement | null;
      const cardWidth = firstCard?.getBoundingClientRect().width ?? 0;

      loopWidthRef.current = firstLoopRef.current.getBoundingClientRect().width + groupGap;
      cardStrideRef.current = cardWidth > 0 ? cardWidth + groupGap : 0;
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
    const cleanupAnimation = () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = null;
      lastFrameRef.current = null;
    };

    if (prefersReducedMotion) {
      snapAnimationRef.current = null;
      cleanupAnimation();
      return cleanupAnimation;
    }

    const tick = (timestamp: number) => {
      if (lastFrameRef.current === null) {
        lastFrameRef.current = timestamp;
      }

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

        setOffset(nextOffset);

        if (progress >= 1) {
          snapAnimationRef.current = null;
        }
      } else if (
        !isHoveredRef.current &&
        !isDraggingRef.current &&
        loopWidthRef.current > 0
      ) {
        setOffset(xRef.current + SCROLL_SPEED * deltaSeconds);
      }

      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);
    return cleanupAnimation;
  }, [prefersReducedMotion, setOffset]);

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    const horizontalDelta =
      Math.abs(event.deltaX) > 0 ? event.deltaX : event.shiftKey ? event.deltaY : 0;

    if (horizontalDelta === 0) return;

    event.preventDefault();
    stopSnap();
    setOffset(xRef.current + horizontalDelta);
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

    if (event.pointerType === "mouse") {
      event.currentTarget.style.cursor = "grabbing";
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || activePointerIdRef.current !== event.pointerId) return;

    event.preventDefault();
    const deltaX = event.clientX - dragStartXRef.current;
    dragDeltaXRef.current = deltaX;
    setOffset(dragStartOffsetRef.current - deltaX);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || activePointerIdRef.current !== event.pointerId) return;

    isDraggingRef.current = false;
    activePointerIdRef.current = null;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (event.pointerType === "mouse") {
      event.currentTarget.style.cursor = "grab";
    }

    snapToClosestCard(dragDeltaXRef.current);
  };

  return (
    <section
      id="work"
      aria-label="Work and clients"
      className="bg-transparent pt-8 md:pt-10 pb-16 sm:pb-20 lg:pb-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.2rem]">
            Casos de Éxito
          </h2>
          <p className="mt-5 text-base font-medium text-slate-600 sm:text-lg">
            Algunos de nuestros Casos de Éxito más relevantes.
          </p>
        </div>
      </div>

      <div className="mx-auto mt-12 w-full max-w-[1100px] px-4 sm:px-6 lg:px-0">
        <div
          ref={viewportRef}
          className="cursor-grab select-none overflow-hidden active:cursor-grabbing"
          style={{ ...EDGE_MASK, touchAction: "pan-y" }}
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
          onDragStart={(event) => event.preventDefault()}
        >
          <div
            ref={trackRef}
            className="flex w-max gap-6 will-change-transform"
            style={{ transform: "translate3d(0,0,0)" }}
          >
            {[0, 1].map((loopIndex) => (
              <div
                key={`work-loop-${loopIndex}`}
                ref={loopIndex === 0 ? firstLoopRef : null}
                className="flex shrink-0 gap-6"
              >
                {successfulFranchises.map((item, cardIndex) => (
                  <WorkCard key={`work-card-${loopIndex}-${item.id}-${cardIndex}`} item={item} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
