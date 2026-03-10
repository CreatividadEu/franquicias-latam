"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";


export function StoikaShowcaseSection() {
  useEffect(() => {
    const element = document.getElementById("stoika-parallax");
    if (!element) return;

    const prefersReducedMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    if (prefersReducedMotion) {
      element.style.transform = "translateY(0px) scale(1)";
      element.style.opacity = "1";
      return;
    }

    let hasRevealed = false;
    let frameId = 0;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          hasRevealed = true;
          element.style.transform = "translateY(0px) scale(1)";
          element.style.opacity = "1";
          handleScroll();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(element);

    const updateParallax = () => {
      frameId = 0;
      if (!hasRevealed) return;

      const scrollY = window.scrollY;
      const offset = Math.min(scrollY * 0.08, 30);
      element.style.transform = `translateY(-${offset}px) scale(1)`;
    };

    const handleScroll = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(updateParallax);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, []);

  return (
    <section className="stoika-showcase relative overflow-hidden bg-transparent py-20 sm:py-24 lg:py-28">

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-base font-bold uppercase tracking-[0.22em] text-[#B8953B] sm:text-lg">
            CONTROL FINANCIERO INTELIGENTE
          </p>
          <h2 className="mt-5 text-4xl font-semibold leading-[0.98] tracking-tight text-slate-900 sm:text-5xl lg:text-[4.35rem]">
            Libera tu Caja en 30 D&iacute;as.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-900 sm:text-lg lg:text-xl">
            S&eacute; parte de Nuestro Famoso Programa de Optimizaci&oacute;n
            Financiera y accede a nuestra plataforma Stoika - de desarollo
            propio.
          </p>
          <div className="mt-8">
            <Link
              href="https://franquicias.ai"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#3B82F6] px-7 py-3.5 text-base font-bold text-white shadow-[0_20px_40px_-15px_rgba(37,99,235,0.45)] backdrop-blur-sm transition-all duration-300 ease-out hover:-translate-y-[2px] hover:from-[#1D4ED8] hover:to-[#2563EB] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(37,99,235,0.24)] sm:px-8 sm:text-lg"
            >
              Aplica al Programa
            </Link>
          </div>
        </div>

        <div className="relative mx-auto mt-14 w-full max-w-[1080px] overflow-visible">
          <div
            id="stoika-parallax"
            className="relative overflow-visible will-change-transform transition-all duration-700 ease-out"
            style={{
              transform: "translateY(40px) scale(0.98)",
              opacity: 0,
              willChange: "transform, opacity",
            }}
          >
            <div className="stoika-showcase__float relative aspect-[16/10] w-full overflow-hidden rounded-3xl border border-black/8 bg-white shadow-[0_4px_40px_rgba(0,0,0,0.1)]">

            <div className="absolute inset-0">
              <Image
                src="/fotos_home/stoika_dashboard.png"
                alt="Dashboard de Stoika"
                fill
                className="object-cover object-top"
                sizes="(max-width: 1280px) 100vw, 1080px"
                priority={false}
              />
            </div>

          </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .stoika-showcase__float {
          animation: stoika-showcase-float 12s ease-in-out infinite;
        }

        @keyframes stoika-showcase-float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-2px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .stoika-showcase__float {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
