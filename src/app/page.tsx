"use client";

import {
  useState,
  useEffect,
  useRef,
  type FormEvent,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { HomeHeroMidnight } from "@/components/home/HomeHeroMidnight";
import {
  HomeHeroFranchise,
  MethodologyStrip,
} from "@/components/home/HomeHeroFranchise";
import { CalendlyCTASection } from "@/components/home/CalendlyCTASection";
import { StoikaShowcaseSection } from "@/components/home/StoikaShowcaseSection";
import { WorkCarousel } from "@/components/home/WorkCarousel";
import { HomeSiteFooter } from "@/components/site/HomeSiteFooter";

const countries = [
  { flag: "\u{1F1E8}\u{1F1F4}", name: "Colombia" },
  { flag: "\u{1F1F2}\u{1F1FD}", name: "M\u00e9xico" },
  { flag: "\u{1F1E6}\u{1F1F7}", name: "Argentina" },
  { flag: "\u{1F1E8}\u{1F1F1}", name: "Chile" },
  { flag: "\u{1F1F5}\u{1F1EA}", name: "Per\u00fa" },
  { flag: "\u{1F1EA}\u{1F1E8}", name: "Ecuador" },
];

const viewTitles: Record<string, string> = {
  quiz: "Quiz Inteligente",
  matching: "Matching de Compatibilidad",
  resultados: "Resultados Personalizados",
  contacto: "Contacto Directo",
};

const faqs = [
  {
    q: "\u00bfPara qui\u00e9n es esta plataforma?",
    a: "Para inversionistas que buscan franquicias en Latinoam\u00e9rica con presupuestos desde $50K. No necesitas experiencia previa en franquicias.",
  },
  {
    q: "\u00bfCu\u00e1nto tiempo toma el proceso?",
    a: "El quiz toma solo 2 minutos. Respondes 5 preguntas clave y recibes tus resultados de compatibilidad inmediatamente.",
  },
  {
    q: "\u00bfNecesito experiencia en franquicias?",
    a: "No. Nuestro algoritmo considera tu nivel de experiencia y te recomienda franquicias adecuadas para tu perfil, ya seas inversionista, operador o emprendedor.",
  },
  {
    q: "\u00bfEs gratis?",
    a: "El quiz y las recomendaciones son completamente gratuitos. Te conectamos directamente con las franquicias que mejor se ajustan a tu perfil sin costo.",
  },
  {
    q: "\u00bfC\u00f3mo funciona el matching?",
    a: "Analizamos tu perfil (sectores de inter\u00e9s, presupuesto, pa\u00eds y experiencia) y lo comparamos con nuestra base de m\u00e1s de 750 franquicias l\u00edderes desarrolladas usando un algoritmo de compatibilidad con score de 0 a 100.",
  },
  {
    q: "\u00bfQu\u00e9 pasa despu\u00e9s del quiz?",
    a: "Recibes una lista de franquicias compatibles con tu perfil, junto con puntuaci\u00f3n de match, rango de inversi\u00f3n e informaci\u00f3n de contacto para conectar directamente con cada marca.",
  },
];

export default function HomePage() {
  const [activeView, setActiveView] = useState("quiz");
  const [openFaqs, setOpenFaqs] = useState<Set<number>>(new Set());
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );
  const [tottoStatsVisible, setTottoStatsVisible] = useState(() =>
    typeof window !== "undefined" && typeof IntersectionObserver === "undefined"
  );
  const tottoStatsRef = useRef<HTMLDivElement | null>(null);
  const tottoStatsReady = prefersReducedMotion || tottoStatsVisible;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (event: MediaQueryListEvent) =>
      setPrefersReducedMotion(event.matches);
    mediaQuery.addEventListener("change", onChange);
    return () => mediaQuery.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || tottoStatsVisible || !tottoStatsRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setTottoStatsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(tottoStatsRef.current);
    return () => observer.disconnect();
  }, [prefersReducedMotion, tottoStatsVisible]);

  useEffect(() => {
    if (!isVideoOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsVideoOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isVideoOpen]);

  const toggleFaq = (index: number) => {
    setOpenFaqs((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const hideForm = () => {
    setFormModalOpen(false);
    setFormSubmitted(false);
    document.body.style.overflow = "";
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      hideForm();
    }, 3000);
  };

  // Scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll(".scroll-fade-in").forEach((el) => {
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // Escape key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        hideForm();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <div className="min-h-screen text-[#171717]">
      <HomeHeroMidnight />


      <HomeHeroFranchise />

      <section
        id="video-hero"
        className="relative isolate overflow-hidden scroll-mt-28 bg-transparent pt-20 md:pt-24 pb-10 md:pb-12"
      >
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-[14px] font-semibold uppercase tracking-[0.18em] text-slate-900 md:text-[17px]">
              CASOS DE ÉXITO · TOTTO X FRANQUICIAS LATAM
            </p>
            <h2 className="mt-4 text-[1.9rem] font-semibold leading-[1.05] tracking-tight text-slate-900 sm:text-[2.55rem] md:mt-5 md:text-[3.2rem]">
              Totto: de 0 a 450 tiendas.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-900 md:text-lg">
              Escala real con control: operación replicable, números sanos y crecimiento sostenido.
            </p>
          </div>

          <div className="relative mx-auto mt-10 w-full max-w-4xl md:mt-12">
            <div
              className={`pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/60 bg-white/70 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-md transition-opacity duration-200 md:left-6 md:text-sm ${
                isVideoOpen ? "opacity-0" : "opacity-100"
              }`}
            >
              Founder TOTTO
            </div>

            <div
              className={`pointer-events-none absolute right-4 top-10 z-10 rounded-full border border-white/60 bg-white/70 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-md transition-opacity duration-200 md:right-6 md:top-12 md:text-sm ${
                isVideoOpen ? "opacity-0" : "opacity-100"
              }`}
            >
              45 países · +US$200M/año
            </div>

            <div className="group relative overflow-hidden rounded-[28px] border border-slate-200/70 bg-slate-950 shadow-[0_24px_80px_rgba(15,23,42,0.18)] md:rounded-[34px]">
              <div className="relative aspect-[16/10] bg-slate-950 md:aspect-[16/9]">
                <div
                  role="button"
                  tabIndex={0}
                  aria-label="Abrir video del caso de éxito Totto x Franquicias LATAM"
                  onClick={() => setIsVideoOpen(true)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setIsVideoOpen(true);
                    }
                  }}
                  className="absolute inset-0 cursor-pointer"
                >
                  <Image
                    src="/fotos_home/cover_totto_franquicias.png"
                    alt="Caso de éxito Totto x Franquicias LATAM"
                    fill
                    className="object-cover"
                    priority={false}
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-slate-950/15" />
                  <div className="pointer-events-none absolute inset-0 grid place-items-center">
                    <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-black/35 ring-1 ring-white/25 shadow-[0_18px_50px_rgba(15,23,42,0.35)] backdrop-blur-sm md:h-20 md:w-20">
                      <span
                        className="ml-1 block h-0 w-0 border-y-[8px] border-y-transparent border-l-[14px] border-l-white md:border-y-[10px] md:border-l-[16px]"
                        aria-hidden="true"
                      />
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Reproducir video"
                  onClick={() => setIsVideoOpen(true)}
                  className={`absolute bottom-2 left-1/2 z-30 hidden max-w-[calc(100%-5rem)] -translate-x-1/2 scale-[0.8] items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 px-3 py-2 text-[11px] font-semibold tracking-tight text-white shadow-[0_12px_24px_-16px_rgba(59,130,246,0.75)] ring-1 ring-white/20 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_28px_60px_-22px_rgba(59,130,246,0.95)] active:translate-y-0 active:shadow-[0_14px_30px_-20px_rgba(59,130,246,0.55)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(59,130,246,0.28)] md:bottom-10 md:inline-flex md:max-w-[calc(100%-2rem)] md:scale-[1.15] md:gap-3 md:rounded-2xl md:px-8 md:py-4 md:text-base ${
                    isVideoOpen
                      ? "pointer-events-none opacity-0"
                      : "opacity-100"
                  }`}
                >
                  <span
                    className="grid h-7 w-7 place-items-center rounded-full bg-white/12 ring-1 ring-white/18 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] md:h-10 md:w-10"
                    aria-hidden="true"
                  >
                    <span className="text-xs text-white/95 md:text-lg">→</span>
                  </span>
                  <span className="whitespace-nowrap">Quiero escalar mi negocio</span>
                </button>
              </div>
            </div>
          </div>

          <div
            ref={tottoStatsRef}
            className="mt-10 mx-auto max-w-5xl overflow-hidden rounded-[28px] border border-black/8 bg-white shadow-[0_2px_24px_rgba(0,0,0,0.08)] md:mt-12"
          >
            <div className="grid grid-cols-1 divide-y divide-black/8 text-center sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              <div
                className={`totto-stat-item py-6 md:py-7 ${
                  tottoStatsReady ? "totto-stat-item--visible" : ""
                }`}
              >
                <p
                  className={`totto-stat-value text-4xl font-bold tracking-tight text-[#1877F2] md:text-5xl ${
                    tottoStatsReady ? "totto-stat-value--visible" : ""
                  }`}
                >
                  +450
                </p>
                <p className="mt-2 text-[15px] font-semibold text-slate-900 md:text-[17px]">
                  Tiendas
                </p>
              </div>
              <div
                className={`totto-stat-item py-6 md:py-7 ${
                  tottoStatsReady ? "totto-stat-item--visible" : ""
                }`}
                style={{ animationDelay: "90ms" }}
              >
                <p
                  className={`totto-stat-value text-4xl font-bold tracking-tight text-[#1877F2] md:text-5xl ${
                    tottoStatsReady ? "totto-stat-value--visible" : ""
                  }`}
                  style={{ animationDelay: "90ms" }}
                >
                  45
                </p>
                <p className="mt-2 text-[15px] font-semibold text-slate-900 md:text-[17px]">
                  Países
                </p>
              </div>
              <div
                className={`totto-stat-item py-6 md:py-7 ${
                  tottoStatsReady ? "totto-stat-item--visible" : ""
                }`}
                style={{ animationDelay: "180ms" }}
              >
                <p
                  className={`totto-stat-value text-4xl font-bold tracking-tight text-[#1877F2] md:text-5xl ${
                    tottoStatsReady ? "totto-stat-value--visible" : ""
                  }`}
                  style={{ animationDelay: "180ms" }}
                >
                  +US$200M
                </p>
                <p className="mt-2 text-[15px] font-semibold text-slate-900 md:text-[17px]">
                  Ventas anuales
                </p>
              </div>
            </div>
          </div>
          <style jsx>{`
            .totto-stat-item {
              opacity: 0;
              transform: translate3d(0, 14px, 0);
            }

            .totto-stat-item--visible {
              animation: totto-stat-in 620ms cubic-bezier(0.22, 1, 0.36, 1)
                both;
            }

            .totto-stat-value--visible {
              animation: totto-stat-pulse 760ms cubic-bezier(0.22, 1, 0.36, 1)
                both;
            }

            @keyframes totto-stat-in {
              0% {
                opacity: 0;
                transform: translate3d(0, 14px, 0);
              }
              100% {
                opacity: 1;
                transform: translate3d(0, 0, 0);
              }
            }

            @keyframes totto-stat-pulse {
              0% {
                opacity: 0;
                transform: scale(0.92);
                filter: drop-shadow(0 0 0 rgba(24, 119, 242, 0));
              }
              55% {
                opacity: 1;
                transform: scale(1.08);
                filter: drop-shadow(0 10px 22px rgba(24, 119, 242, 0.14));
              }
              100% {
                opacity: 1;
                transform: scale(1);
                filter: drop-shadow(0 8px 18px rgba(24, 119, 242, 0.08));
              }
            }
          `}</style>
        </div>
      </section>

      <WorkCarousel />

      <MethodologyStrip />

      <StoikaShowcaseSection />

      <CalendlyCTASection />

      {/* ─── Case Studies ─── */}
      <section id="casos" className="py-16 sm:py-20 lg:py-24 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Franquicias Nuevas
              <span className="mt-1 block text-[0.82em] font-semibold">
                Marzo 2026
              </span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {[
              {
                icon: "🍦",
                gradient: "from-sky-100 to-cyan-200",
                label: "Helados / Postres",
                title: "Crem Helado",
                desc: "Marca l\u00edder en helados con formatos adaptables e inversi\u00f3n desde $50K.",
                imageSrc: "/fotos_home/franquicias_crem_helado.jpg",
                imageAlt: "Crem Helado",
                href: "/franquicia/crem-helado",
              },
              {
                icon: "👓",
                gradient: "from-indigo-100 to-sky-200",
                label: "\u00d3ptica / Accesorios",
                title: "Lunettes Galer\u00eda \u00d3ptica",
                desc: "Cadena \u00f3ptica especializada con ticket s\u00f3lido e inversi\u00f3n desde $100K.",
                imageSrc: "/fotos_home/lunettes_head.jpg",
                imageAlt: "Lunettes Galer\u00eda \u00d3ptica",
                href: "/franquicia/lunettes-galeria-optica",
              },
              {
                icon: "🥪",
                gradient: "from-emerald-100 to-lime-200",
                label: "QSR / Restaurantes",
                title: "Subway",
                desc: "Cadena global de s\u00e1ndwiches con operaci\u00f3n estandarizada e inversi\u00f3n desde $200K.",
                imageSrc: "/fotos_home/subway-cover.jpg",
                imageAlt: "Subway",
                href: "/franquicia/subway",
                extraClass: "sm:col-span-2 lg:col-span-1",
              },
            ].map((c) => (
              <Link
                key={c.label}
                href={c.href}
                aria-label={`Ver franquicia ${c.title}`}
                className={`rounded-xl border border-black/8 bg-white shadow-[0_2px_14px_rgba(0,0,0,0.07)] sm:rounded-2xl overflow-hidden hover:shadow-[0_4px_24px_rgba(0,0,0,0.12)] transition-all scroll-fade-in ${
                  c.extraClass || ""
                }`}
              >
                <div
                  className={`bg-gradient-to-br ${c.gradient} relative h-36 sm:h-48 flex items-center justify-center`}
                >
                  {c.imageSrc ? (
                    <>
                      <Image
                        src={c.imageSrc}
                        alt={c.imageAlt ?? c.title}
                        fill
                        className="object-cover"
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      />
                      <div className="absolute inset-0 bg-slate-900/10" />
                    </>
                  ) : (
                    <div className="text-4xl sm:text-5xl">{c.icon}</div>
                  )}
                </div>
                <div className="p-6 sm:p-8">
                  <span className="section-label">{c.label}</span>
                  <h3 className="text-xl sm:text-2xl font-bold mt-2 sm:mt-3 mb-2 sm:mb-3">
                    {c.title}
                  </h3>
                  <p className="text-gray-900 text-sm sm:text-base">
                    {c.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Platform Features (Stoika OS section) ─── */}
      <section id="plataforma" className="py-16 sm:py-20 lg:py-24 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <span className="section-label mb-3 sm:mb-4 block">
              Plataforma
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              Tu Match Perfecto.
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-900 max-w-3xl mx-auto px-2">
              Nuestra plataforma analiza tu perfil de inversor y encuentra las
              franquicias que mejor se ajustan: sector, inversi&oacute;n,
              pa&iacute;s y experiencia.
            </p>
          </div>

          {/* Toggle Tabs */}
          <div className="toggle-tabs flex gap-2 sm:gap-4 mb-8 sm:mb-12 overflow-x-auto pb-2 px-2 sm:justify-center">
            {Object.keys(viewTitles).map((view, i) => {
              const TAB_COLORS = [
                { bg: "#371B7A", text: "#FFFFFF" },
                { bg: "#3B8446", text: "#FFFFFF" },
                { bg: "#F7D047", text: "#171717" },
                { bg: "#F2A6CB", text: "#171717" },
              ];
              const isActive = activeView === view;
              return (
                <button
                  key={view}
                  className={`toggle-btn px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base whitespace-nowrap flex-shrink-0 ${
                    isActive ? "active" : ""
                  }`}
                  style={
                    isActive
                      ? {
                          backgroundColor: TAB_COLORS[i].bg,
                          color: TAB_COLORS[i].text,
                        }
                      : undefined
                  }
                  onClick={() => setActiveView(view)}
                >
                  {viewTitles[view]}
                </button>
              );
            })}
          </div>

          {/* Mockup Display */}
          <div className="max-w-5xl mx-auto scroll-fade-in">
            <div className="hero-image bg-[#f0f0f0] aspect-[4/3] sm:aspect-video relative overflow-hidden">
              {activeView === "quiz" ||
              activeView === "matching" ||
              activeView === "resultados" ||
              activeView === "contacto" ? (
                <Image
                  src={
                    activeView === "quiz"
                      ? "/fotos_home/franquicias_screen.jpg"
                      : activeView === "matching"
                        ? "/fotos_home/iphone_resultados.jpeg"
                        : activeView === "resultados"
                          ? "/fotos_home/screen_results_franquicias.jpeg"
                          : "/fotos_home/screen_atencion.jpeg"
                  }
                  alt={
                    activeView === "quiz"
                      ? "Quiz Inteligente"
                      : activeView === "matching"
                        ? "Matching de Compatibilidad"
                        : activeView === "resultados"
                          ? "Resultados Personalizados"
                          : "Contacto Directo"
                  }
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 80vw"
                  priority
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl sm:text-5xl mb-2 sm:mb-3">
                      {activeView === "contacto" && "📞"}
                    </div>
                    <p className="text-gray-900 font-medium text-base sm:text-lg">
                      {viewTitles[activeView]}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="text-center mt-8 sm:mt-12">
            <Link
              href="/quiz"
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 px-7 sm:px-8 py-4 text-[15px] font-semibold tracking-tight text-white shadow-[0_18px_40px_-18px_rgba(59,130,246,0.75)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_28px_60px_-22px_rgba(59,130,246,0.95)] active:translate-y-0 active:shadow-[0_14px_30px_-20px_rgba(59,130,246,0.55)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(59,130,246,0.28)] sm:text-base"
            >
              Comenzar Quiz
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Benefits ─── */}
      <section className="py-16 sm:py-20 lg:py-24 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-[-0.01em] mb-4">
              Sobre Nosotros
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {[
              {
                icon: "📊",
                title: "Programa Validado",
                desc: "Programa respaldado por BID y ONU para escalar con metodolog\u00eda probada.",
              },
              {
                icon: "💎",
                title: "750+ Clientes L\u00edderes",
                desc: "Empresas que optimizaron margen, estructura y crecimiento sostenible.",
              },
              {
                icon: "💰",
                title: "Optimizamos tu Negocio",
                desc: "Mejoramos rentabilidad, orden financiero y control operativo real.",
              },
              {
                icon: "🏆",
                title: "Somos Premiados",
                desc: "Financiados y reconocidos por MinTIC y BID por impacto empresarial.",
              },
              {
                icon: "🏢",
                title: "Oficinas en Espa\u00f1a y LATAM",
                desc: "Presencia directa en Europa y Latinoam\u00e9rica para expansi\u00f3n estrat\u00e9gica.",
              },
              {
                icon: "🚀",
                title: "Sistema Integral",
                desc: "Estrategia, finanzas, operaci\u00f3n y marketing en un solo modelo.",
              },
            ].map((b) => (
              <div
                key={b.title}
                className="glass-card p-6 sm:p-8 rounded-xl sm:rounded-2xl hover:shadow-lg transition-all scroll-fade-in"
              >
                <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">
                  {b.icon}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">
                  {b.title}
                </h3>
                <p className="text-gray-900 text-sm sm:text-base">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {isVideoOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 px-4 py-8"
          onClick={() => setIsVideoOpen(false)}
        >
          <div className="relative mx-auto flex h-full items-center justify-center">
            <div
              className="relative aspect-video w-[min(92vw,1100px)] max-w-5xl overflow-hidden rounded-2xl bg-black shadow-[0_30px_90px_rgba(0,0,0,0.45)]"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                aria-label="Cerrar video"
                onClick={() => setIsVideoOpen(false)}
                className="absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-sm font-semibold text-white ring-1 ring-white/20 transition-colors duration-200 hover:bg-black/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                X
              </button>
              <iframe
                className="h-full w-full"
                src="https://www.youtube-nocookie.com/embed/r0Qc7FsEQRU?autoplay=1&rel=0&modestbranding=1&playsinline=1"
                title="Caso de éxito Totto x Franquicias LATAM"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* ─── FAQ ─── */}
      <section className="py-16 sm:py-20 lg:py-24 bg-transparent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Preguntas frecuentes
            </h2>
          </div>

          <div className="space-y-0">
            {faqs.map((faq, i) => (
              <div key={i} className="faq-item py-4 sm:py-6">
                <button
                  className="w-full flex justify-between items-start text-left"
                  onClick={() => toggleFaq(i)}
                >
                  <span className="text-base sm:text-xl font-semibold pr-4 sm:pr-8">
                    {faq.q}
                  </span>
                  <span className="text-xl sm:text-2xl flex-shrink-0">
                    {openFaqs.has(i) ? "\u2212" : "+"}
                  </span>
                </button>
                {openFaqs.has(i) && (
                  <div className="mt-3 sm:mt-4 text-gray-900 text-sm sm:text-base">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section id="contacto" className="relative overflow-hidden py-16 sm:py-20 lg:py-24 text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-4 inset-y-5 rounded-[28px] bg-[#111111] shadow-[0_8px_40px_rgba(0,0,0,0.25)] sm:inset-x-6 sm:inset-y-6 lg:inset-x-8"
        />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
            &iquest;Listo para encontrar
            <br className="hidden sm:block" /> tu franquicia ideal?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-8 sm:mb-12 max-w-2xl mx-auto">
            Si est&aacute;s buscando invertir en una franquicia en LATAM,
            nuestra plataforma te conecta con las mejores opciones para tu
            perfil.
          </p>
          <Link
            href="/quiz"
            className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 px-8 sm:px-10 py-4 sm:py-5 text-[15px] font-semibold tracking-tight text-white shadow-[0_18px_40px_-18px_rgba(59,130,246,0.75)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_28px_60px_-22px_rgba(59,130,246,0.95)] active:translate-y-0 active:shadow-[0_14px_30px_-20px_rgba(59,130,246,0.55)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(59,130,246,0.28)] sm:w-auto sm:text-base"
          >
            Comenzar Quiz Gratis
          </Link>
        </div>
      </section>

      {/* ─── Application Form Modal ─── */}
      {formModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5 sm:p-8">
              <div className="flex justify-between items-start mb-4 sm:mb-6">
                <h3 className="text-2xl sm:text-3xl font-bold">
                  Solicitar Asesor&iacute;a
                </h3>
                <button
                  onClick={hideForm}
                  className="text-gray-400 hover:text-gray-600 text-2xl p-1"
                >
                  &times;
                </button>
              </div>

              {!formSubmitted ? (
                <form onSubmit={handleFormSubmit} className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-1.5 sm:mb-2">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1.5 sm:mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1.5 sm:mb-2">
                      Pa&iacute;s
                    </label>
                    <select
                      required
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black text-base bg-white"
                    >
                      <option value="">Selecciona un pa&iacute;s</option>
                      {countries.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.flag} {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1.5 sm:mb-2">
                      Rango de inversi&oacute;n
                    </label>
                    <select
                      required
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black text-base bg-white"
                    >
                      <option value="">Selecciona un rango</option>
                      <option value="50-100k">$50K - $100K</option>
                      <option value="100-200k">$100K - $200K</option>
                      <option value="200k+">$200K+</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1.5 sm:mb-2">
                      Sector de inter&eacute;s
                    </label>
                    <select
                      required
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black text-base bg-white"
                    >
                      <option value="">Selecciona un sector</option>
                      <option value="gastronomia">Gastronom&iacute;a</option>
                      <option value="retail">Retail / Moda</option>
                      <option value="salud">Salud / Bienestar</option>
                      <option value="educacion">Educaci&oacute;n</option>
                      <option value="servicios">Servicios</option>
                      <option value="tecnologia">Tecnolog&iacute;a</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1.5 sm:mb-2">
                      WhatsApp
                    </label>
                    <input
                      type="tel"
                      required
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black text-base"
                      placeholder="+57 300 123 4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1.5 sm:mb-2">
                      &iquest;Cu&aacute;ndo planeas invertir?
                    </label>
                    <div className="flex gap-6">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="timeline"
                          value="1-3"
                          required
                          className="mr-2 w-4 h-4"
                        />
                        <span>1-3 meses</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="timeline"
                          value="3-6"
                          className="mr-2 w-4 h-4"
                        />
                        <span>3-6 meses</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="timeline"
                          value="6+"
                          className="mr-2 w-4 h-4"
                        />
                        <span>6+ meses</span>
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-black text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-lg hover:bg-gray-800 transition-all font-bold text-base sm:text-lg"
                  >
                    Enviar solicitud
                  </button>
                </form>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">
                    &#x2705;
                  </div>
                  <h4 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">
                    &iexcl;Perfecto!
                  </h4>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Revisaremos tu solicitud y te contactaremos
                    <br />
                    por WhatsApp en las pr&oacute;ximas 24 horas.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <HomeSiteFooter />
    </div>
  );
}
