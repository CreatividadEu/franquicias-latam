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
    stat: "17 PDV",
    description: "Marca icónica de Colombia.",
  },
];

const EDGE_MASK = {
  WebkitMaskImage:
    "linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 8%, rgba(0,0,0,1) 92%, rgba(0,0,0,0) 100%)",
  maskImage:
    "linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 8%, rgba(0,0,0,1) 92%, rgba(0,0,0,0) 100%)",
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

function WorkCard({ item }: { item: SuccessfulFranchise }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <article className="w-[280px] shrink-0 sm:w-[320px] md:w-[344px] lg:w-[360px]">
      <div className="relative h-[429px] overflow-hidden rounded-[24px] bg-gradient-to-br from-slate-300 via-slate-200 to-slate-100">
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
