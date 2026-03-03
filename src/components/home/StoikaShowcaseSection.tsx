"use client";

import Image from "next/image";
import Link from "next/link";

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
  return (
    <section className="stoika-showcase relative overflow-hidden bg-slate-950 py-20 sm:py-24 lg:py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_12%,rgba(16,185,129,0.18),transparent_28%),radial-gradient(circle_at_18%_22%,rgba(14,165,233,0.12),transparent_26%),radial-gradient(circle_at_82%_26%,rgba(45,212,191,0.1),transparent_24%),linear-gradient(180deg,rgba(2,6,23,0.82)_0%,rgba(2,6,23,0.94)_42%,rgba(2,6,23,1)_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(2,6,23,0.2)_58%,rgba(2,6,23,0.7)_100%)]"
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
          <p className="text-base font-bold uppercase tracking-[0.22em] text-amber-300/85 sm:text-lg">
            OPTIMIZA TUS FINANZAS
          </p>
          <h2 className="mt-5 text-4xl font-semibold leading-[0.98] tracking-tight text-white sm:text-5xl lg:text-[4.35rem]">
            Libera tu Caja en 30 D&iacute;as.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg lg:text-xl">
            S&eacute; parte de Nuestro Famoso Programa de Optimizaci&oacute;n
            Financiera y accede a nuestra plataforma Stoika - de desarollo
            propio.
          </p>
          <div className="mt-8">
            <Link
              href="#contacto"
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-7 py-3.5 text-sm font-semibold text-slate-950 shadow-[0_16px_36px_-22px_rgba(16,185,129,0.5)] transition-all duration-300 hover:-translate-y-[1px] hover:bg-emerald-400 hover:shadow-[0_22px_46px_-24px_rgba(16,185,129,0.58)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300/25 sm:px-8 sm:text-base"
            >
              Ver Stoika en acci&oacute;n
            </Link>
          </div>
        </div>

        <div className="relative mx-auto mt-14 w-full max-w-[1080px]">
          <div className="stoika-showcase__float relative aspect-[16/10] w-full overflow-hidden rounded-3xl border border-white/10 bg-slate-900/40 ring-1 ring-white/10 shadow-[0_0_34px_rgba(16,185,129,0.18),0_30px_90px_-36px_rgba(15,23,42,0.8)]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-[1px] rounded-[23px] bg-[linear-gradient(145deg,rgba(255,255,255,0.08),transparent_18%,transparent_72%,rgba(16,185,129,0.12))]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/32 to-transparent"
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
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.03)_0%,rgba(2,6,23,0)_18%,rgba(2,6,23,0)_82%,rgba(2,6,23,0.08)_100%)]"
            />
            <div
              aria-hidden="true"
              className="stoika-showcase__scanline pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-[linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.02)_30%,rgba(16,185,129,0.2)_50%,rgba(255,255,255,0.02)_70%,transparent_100%)] opacity-20 blur-2xl"
            />
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
