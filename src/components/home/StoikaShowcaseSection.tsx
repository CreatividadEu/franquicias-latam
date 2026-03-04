"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

const stoikaRays = [
  "left-[-8%] top-[-18%] h-[160%] w-20 rotate-[42deg] bg-gradient-to-b from-emerald-300/20 via-cyan-300/8 to-transparent",
  "left-[6%] top-[-30%] h-[180%] w-24 rotate-[46deg] bg-gradient-to-b from-sky-300/16 via-emerald-300/8 to-transparent",
  "left-[24%] top-[-24%] h-[165%] w-28 rotate-[41deg] bg-gradient-to-b from-teal-300/14 via-sky-300/7 to-transparent",
  "left-[46%] top-[-28%] h-[175%] w-24 rotate-[44deg] bg-gradient-to-b from-emerald-300/18 via-cyan-300/8 to-transparent",
  "left-[62%] top-[-24%] h-[170%] w-24 rotate-[47deg] bg-gradient-to-b from-cyan-300/16 via-emerald-300/7 to-transparent",
  "left-[78%] top-[-20%] h-[165%] w-20 rotate-[43deg] bg-gradient-to-b from-sky-300/14 via-cyan-300/7 to-transparent",
  "right-[6%] top-[-26%] h-[176%] w-24 rotate-[48deg] bg-gradient-to-b from-emerald-300/16 via-teal-300/8 to-transparent",
  "right-[-8%] top-[-14%] h-[158%] w-20 rotate-[40deg] bg-gradient-to-b from-sky-300/15 via-cyan-300/6 to-transparent",
];

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
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at 20% 30%, rgba(16,185,129,0.08), transparent 44%), radial-gradient(circle at 80% 20%, rgba(59,130,246,0.12), transparent 48%), radial-gradient(circle at 48% 100%, rgba(249,115,22,0.05), transparent 58%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(255,255,255,0.08)_68%,rgba(255,255,255,0.22)_100%)]"
      />

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        {stoikaRays.map((rayClassName) => (
          <div
            key={rayClassName}
            className={`absolute rounded-full blur-3xl ${rayClassName}`}
          />
        ))}
      </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-base font-bold uppercase tracking-[0.22em] text-[#B8953B] sm:text-lg">
            CONTROL FINANCIERO INTELIGENTE
          </p>
          <h2 className="mt-5 text-4xl font-semibold leading-[0.98] tracking-tight text-slate-900 sm:text-5xl lg:text-[4.35rem]">
            Libera tu Caja en 30 D&iacute;as.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg lg:text-xl">
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
            <div className="stoika-showcase__float relative aspect-[16/10] w-full overflow-hidden rounded-3xl border border-black/5 bg-white/52 ring-1 ring-black/5 shadow-[0_0_34px_rgba(59,130,246,0.08),0_30px_90px_-36px_rgba(15,23,42,0.18)] backdrop-blur-xl">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-[1px] rounded-[23px] bg-[linear-gradient(145deg,rgba(255,255,255,0.42),transparent_18%,transparent_72%,rgba(59,130,246,0.08))]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/24 to-transparent"
            />

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

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0)_18%,rgba(255,255,255,0)_82%,rgba(15,23,42,0.04)_100%)]"
            />
            <div
              aria-hidden="true"
              className="stoika-showcase__scanline pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-[linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.04)_30%,rgba(59,130,246,0.14)_50%,rgba(255,255,255,0.04)_70%,transparent_100%)] opacity-15 blur-2xl"
            />
          </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .stoika-showcase__scanline {
          animation: stoika-showcase-scanline 11s ease-in-out infinite;
          transform: skewX(-14deg);
        }

        .stoika-showcase__float {
          animation: stoika-showcase-float 12s ease-in-out infinite;
        }

        @keyframes stoika-showcase-scanline {
          0% {
            transform: translateX(-28%) skewX(-14deg);
            opacity: 0;
          }
          18% {
            opacity: 0.12;
          }
          48% {
            opacity: 0.2;
          }
          82% {
            opacity: 0.1;
          }
          100% {
            transform: translateX(430%) skewX(-14deg);
            opacity: 0;
          }
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
          .stoika-showcase__scanline,
          .stoika-showcase__float {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
