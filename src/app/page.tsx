"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { SectorOption } from "@/types";
import { LatamDepthBackground } from "@/components/LatamDepthBackground";

const countries = [
  { flag: "\u{1F1E8}\u{1F1F4}", name: "Colombia" },
  { flag: "\u{1F1F2}\u{1F1FD}", name: "M\u00e9xico" },
  { flag: "\u{1F1E6}\u{1F1F7}", name: "Argentina" },
  { flag: "\u{1F1E8}\u{1F1F1}", name: "Chile" },
  { flag: "\u{1F1F5}\u{1F1EA}", name: "Per\u00fa" },
  { flag: "\u{1F1EA}\u{1F1E8}", name: "Ecuador" },
];

const clientLogos = [
  { src: "/logos_clientes/logo_andres.svg", alt: "Andrés" },
  { src: "/logos_clientes/logo_bid.svg", alt: "BID" },
  { src: "/logos_clientes/logo_mercado_libre.svg", alt: "Mercado Libre" },
  { src: "/logos_clientes/logo_nutresa.svg", alt: "Nutresa" },
  { src: "/logos_clientes/logo_sodexo.svg", alt: "Sodexo" },
  { src: "/logos_clientes/logo_subway.svg", alt: "Subway" },
  { src: "/logos_clientes/logo_totto.svg", alt: "Totto" },
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
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState("quiz");
  const [openFaqs, setOpenFaqs] = useState<Set<number>>(new Set());
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [hasRevealed, setHasRevealed] = useState(false);
  const [runFirstNudge, setRunFirstNudge] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );
  const cardRef = useRef<HTMLDivElement | null>(null);

  // Hero quiz embed
  const [heroSectors, setHeroSectors] = useState<SectorOption[]>([]);
  const [heroSelected, setHeroSelected] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/sectors")
      .then((r) => r.json())
      .then(setHeroSectors)
      .catch(console.error);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (event: MediaQueryListEvent) =>
      setPrefersReducedMotion(event.matches);
    mediaQuery.addEventListener("change", onChange);
    return () => mediaQuery.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (
      prefersReducedMotion ||
      hasRevealed ||
      heroSectors.length === 0 ||
      !cardRef.current
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setHasRevealed(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.35 }
    );

    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [hasRevealed, heroSectors.length, prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion || hasRevealed) return;
    const fallback = window.setTimeout(() => {
      setHasRevealed(true);
    }, 1200);
    return () => window.clearTimeout(fallback);
  }, [hasRevealed, prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion || runFirstNudge || heroSectors.length === 0) {
      return;
    }

    const timer = window.setTimeout(
      () => setRunFirstNudge(true),
      hasRevealed ? 350 : 1200
    );

    return () => window.clearTimeout(timer);
  }, [hasRevealed, heroSectors.length, prefersReducedMotion, runFirstNudge]);

  const toggleHeroSector = (id: string) => {
    setHeroSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleHeroSubmit = () => {
    const names = heroSectors
      .filter((s) => heroSelected.includes(s.id))
      .map((s) => `${s.emoji} ${s.name}`);
    const params = new URLSearchParams({
      sectors: heroSelected.join(","),
      sectorNames: names.join(","),
    });
    router.push(`/quiz?${params.toString()}`);
  };

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prev) => {
      document.body.style.overflow = !prev ? "hidden" : "";
      return !prev;
    });
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaqs((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const showForm = () => {
    setFormModalOpen(true);
    document.body.style.overflow = "hidden";
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
        if (mobileMenuOpen) {
          setMobileMenuOpen(false);
          document.body.style.overflow = "";
        }
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#171717]">
      {/* ─── Navigation ─── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-1.5 sm:py-2">
          <div className="flex items-center justify-between">
            <Image
              src="/logo_latam/franquicias_latam_logo.png"
              alt="Franquicias LATAM"
              width={640}
              height={160}
              className="h-[6.4rem] sm:h-32 w-auto"
              priority
            />

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#proceso" className="nav-link">
                Proceso
              </a>
              <a href="#plataforma" className="nav-link">
                Plataforma
              </a>
              <a href="#casos" className="nav-link">
                Casos
              </a>
              <a href="#pricing" className="nav-link">
                Precios
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 -mr-2"
              aria-label="Toggle menu"
            >
              {!mobileMenuOpen ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>

            <Link
              href="/quiz"
              className="hidden md:block bg-[#2860E7] text-white px-5 lg:px-6 py-2 sm:py-2.5 rounded-lg hover:bg-[#1F52CC] transition-all font-medium text-sm sm:text-base focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(40,96,231,0.35)]"
            >
              Comenzar
            </Link>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`mobile-menu fixed inset-y-0 right-0 w-64 bg-white shadow-xl z-50 md:hidden ${
            mobileMenuOpen ? "open" : ""
          }`}
        >
          <div className="p-6 pt-20">
            <div className="flex flex-col gap-6">
              <a
                href="#proceso"
                onClick={toggleMobileMenu}
                className="text-lg font-medium"
              >
                Proceso
              </a>
              <a
                href="#plataforma"
                onClick={toggleMobileMenu}
                className="text-lg font-medium"
              >
                Plataforma
              </a>
              <a
                href="#casos"
                onClick={toggleMobileMenu}
                className="text-lg font-medium"
              >
                Casos
              </a>
              <a
                href="#pricing"
                onClick={toggleMobileMenu}
                className="text-lg font-medium"
              >
                Precios
              </a>
              <Link
                href="/quiz"
                onClick={toggleMobileMenu}
                className="bg-[#2860E7] text-white px-6 py-3 rounded-lg text-center font-semibold mt-4 hover:bg-[#1F52CC] transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(40,96,231,0.35)]"
              >
                Comenzar
              </Link>
            </div>
          </div>
        </div>
        {mobileMenuOpen && (
          <div
            onClick={toggleMobileMenu}
            className="fixed inset-0 bg-black/50 md:hidden z-40"
          />
        )}
      </nav>

      {/* ─── Hero Section ─── */}
      <LatamDepthBackground
        intensity="normal"
        className="min-h-[70vh] pt-12 sm:pt-16 lg:pt-20 pb-16 sm:pb-24 lg:pb-32"
      >
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-block mb-4 sm:mb-6">
              <span className="section-label bg-gray-100 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">
                Quiz Inteligente (2 min)
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-[0.945]">
              Tu franquicia ideal
              <br className="hidden sm:block" /> en minutos.
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-6 sm:mb-8 leading-relaxed max-w-3xl mx-auto px-2">
              Te conectamos con las mejores franquicias en LATAM.
              <br className="hidden sm:block" />
              <span className="text-gray-500">
                Sin complicaciones. Sin intermediarios.
              </span>
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 px-2">
              <Link
                href="/quiz"
                className="bg-[#2860E7] text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-lg hover:bg-[#1F52CC] transition-all font-semibold text-base sm:text-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(40,96,231,0.35)]"
              >
                Comenzar Quiz
              </Link>
              <a
                href="#proceso"
                className="bg-white border-2 border-gray-200 text-black px-6 sm:px-8 py-3.5 sm:py-4 rounded-lg hover:border-gray-800 transition-all font-semibold text-base sm:text-lg"
              >
                Ver el proceso
              </a>
            </div>

            <p className="text-base sm:text-lg text-gray-500 font-extrabold mb-6 sm:mb-8">
              Más de 750 franquicias líderes desarrolladas.
            </p>

            {/* Logo Carousel (Client logos) */}
            <div className="logo-carousel-container overflow-hidden mb-8 sm:mb-12">
              <div className="logo-carousel flex items-center gap-10 sm:gap-16">
                {[...clientLogos, ...clientLogos].map((logo, i) => (
                  <div
                    key={`${logo.alt}-${i}`}
                    className="logo-item flex-shrink-0"
                  >
                    <Image
                      src={logo.src}
                      alt={logo.alt}
                      width={120}
                      height={40}
                      className="h-11 sm:h-14 w-auto object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Quiz Embed */}
            <div className="relative z-40 max-w-3xl mx-auto mt-8 sm:mt-12 lg:mt-16">
              <div
                ref={cardRef}
                className="hero-image hero-quiz-glass rounded-xl sm:rounded-2xl px-[1.77rem] py-[2.06rem] sm:px-[2.36rem] sm:py-[2.66rem]"
              >
                <p className="text-center text-sm text-gray-500 mb-1">
                  Paso 1 de 5
                </p>
                <h3 className="text-center text-lg sm:text-xl font-semibold mb-1">
                  Selecciona los sectores que te interesan
                </h3>
                {heroSelected.length === 0 && (
                  <p className="text-center text-[0.90rem] text-gray-500 mb-4">
                    Empieza seleccionando uno o más sectores 👇
                  </p>
                )}

                {heroSectors.length === 0 ? (
                  <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                      {heroSectors.map((sector, index) => {
                        const isSelected = heroSelected.includes(sector.id);
                        const shouldHideBeforeReveal =
                          !hasRevealed && !prefersReducedMotion;
                        const shouldNudge =
                          index === 0 &&
                          runFirstNudge &&
                          !prefersReducedMotion;
                        return (
                          <button
                            key={sector.id}
                            data-first-option={index === 0 ? "true" : undefined}
                            onClick={() => toggleHeroSector(sector.id)}
                            className={`quiz-option-button flex items-center gap-2 px-3 sm:px-4 py-3 rounded-lg border-2 text-left ${
                              isSelected
                                ? "bg-[#EEF3FF] border-[#2F5BFF] text-neutral-900 ring-1 ring-[#2F5BFF]/25"
                                : "bg-white border-gray-200 text-gray-900 hover:bg-gray-50"
                            } ${
                              shouldHideBeforeReveal
                                ? "opacity-0 translate-y-3 [filter:blur(1px)] pointer-events-none"
                                : "opacity-100 translate-y-0 [filter:blur(0px)] pointer-events-auto"
                            } ${shouldNudge ? "quiz-option-nudge-pulse" : ""}`}
                            style={{
                              transitionDelay:
                                hasRevealed && !prefersReducedMotion
                                  ? `${index * 60}ms`
                                  : "0ms",
                            }}
                          >
                            <span className="text-lg sm:text-xl">{sector.emoji}</span>
                            <span className="text-sm font-medium">{sector.name}</span>
                            {isSelected && (
                              <span className="ml-auto w-4 h-4 rounded-full bg-[#2F5BFF] flex items-center justify-center flex-shrink-0">
                                <svg className="w-2.5 h-2.5 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" stroke="currentColor">
                                  <path d="M5 13l4 4L19 7" />
                                </svg>
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {heroSelected.length > 0 && (
                      <button
                        onClick={handleHeroSubmit}
                        className="w-full mt-4 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold rounded-xl py-4 shadow-sm active:scale-[0.98] transition-all"
                      >
                        Continuar ({heroSelected.length} seleccionado{heroSelected.length > 1 ? "s" : ""})
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </LatamDepthBackground>

      {/* ─── Platform Features (Stoika OS section) ─── */}
      <section id="plataforma" className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <span className="section-label mb-3 sm:mb-4 block">
              Plataforma
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              Tu match perfecto. Siempre.
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-2">
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
            <div className="hero-image bg-gradient-to-br from-blue-50 to-purple-50 aspect-[4/3] sm:aspect-video relative overflow-hidden">
              {activeView === "quiz" ||
              activeView === "matching" ||
              activeView === "resultados" ||
              activeView === "contacto" ? (
                <Image
                  src={
                    activeView === "quiz"
                      ? "/fotos_home/franquicias_screen.png"
                      : activeView === "matching"
                        ? "/fotos_home/screen_resultados.png"
                        : activeView === "resultados"
                          ? "/fotos_home/franquicias-personalizadas.png"
                          : "/fotos_home/contacto.png"
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
                    <p className="text-gray-700 font-medium text-base sm:text-lg">
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
              className="inline-block bg-[#2860E7] text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-lg hover:bg-[#1F52CC] transition-all font-semibold text-base sm:text-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(40,96,231,0.35)]"
            >
              Comenzar Quiz
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Feature Block 1: Proceso ─── */}
      <section id="proceso" className="py-16 sm:py-20 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <span className="section-label mb-3 sm:mb-4 block">
                Proceso
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
                Financiados por el
                <br className="hidden sm:block" /> Banco Interamericano de
                Desarrollo.
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8">
                Hemos sido reconocidos y premiados por diferentes gobiernos y organizaciones internacionales. 
              </p>

              <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
                {[
                  "Financiado por BID",
                  "Ganadores Retos 4.0",
                  "Locomotora de la Innovación",
                  "MinTIC Colombia",
                  "Plataforma Validada",
                  "Tecnología Propia",
                ].map((chip) => (
                  <span
                    key={chip}
                    className="feature-chip px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium"
                  >
                    {chip}
                  </span>
                ))}
              </div>

              <Link
                href="/quiz"
                className="inline-block bg-black text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-lg hover:bg-gray-800 transition-all font-semibold text-base sm:text-lg"
              >
                Comenzar Quiz
              </Link>
            </div>

            <div className="order-1 lg:order-2 scroll-fade-in">
              <div className="hero-image bg-gradient-to-br from-green-50 to-emerald-50 aspect-square flex items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">
                    💬
                  </div>
                  <p className="text-gray-700 font-medium">Quiz Inteligente</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Feature Block 2: Matching ─── */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            <div className="order-1 scroll-fade-in">
              <div className="hero-image bg-gradient-to-br from-orange-50 to-red-50 aspect-square flex items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">
                    🎯
                  </div>
                  <p className="text-gray-700 font-medium">
                    Matching Inteligente
                  </p>
                </div>
              </div>
            </div>

            <div className="order-2">
              <span className="section-label mb-3 sm:mb-4 block">
                Matching
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
                Deja de buscar.
                <br className="hidden sm:block" /> Deja que te encontremos.
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-4 sm:mb-6">
                La mayor&iacute;a de inversionistas pierden tiempo evaluando
                franquicias que no se ajustan a su perfil, presupuesto o
                mercado.
              </p>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8">
                Nuestro algoritmo analiza tu perfil y te muestra solo las
                mejores opciones&hellip; autom&aacute;ticamente.
              </p>

              <div className="flex flex-wrap gap-2 sm:gap-3">
                {[
                  "Compatibilidad",
                  "Score 0-100",
                  "Ranking",
                  "Filtros inteligentes",
                ].map((chip) => (
                  <span
                    key={chip}
                    className="feature-chip px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Feature Block 3: Resultados ─── */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <span className="section-label mb-3 sm:mb-4 block">
                Resultados
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
                Opciones concretas.
                <br className="hidden sm:block" /> Contacto directo.
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8">
                No te dejamos &ldquo;con ideas&rdquo;.
                <br className="hidden sm:block" />
                Te dejamos con franquicias concretas, puntuaci&oacute;n de
                compatibilidad y contacto directo con cada marca.
              </p>

              <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
                {[
                  "Top matches",
                  "Contacto directo",
                  "Info completa",
                  "Comparaci\u00f3n",
                ].map((chip) => (
                  <span
                    key={chip}
                    className="feature-chip px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium"
                  >
                    {chip}
                  </span>
                ))}
              </div>

              <Link
                href="/quiz"
                className="inline-block bg-black text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-lg hover:bg-gray-800 transition-all font-semibold text-base sm:text-lg"
              >
                Comenzar
              </Link>
            </div>

            <div className="order-1 lg:order-2 scroll-fade-in">
              <div className="hero-image bg-gradient-to-br from-purple-50 to-pink-50 aspect-square flex items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">
                    📊
                  </div>
                  <p className="text-gray-700 font-medium">
                    Resultados &amp; Match Score
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Benefits ─── */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              What you get in 2 minutes
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {[
              {
                icon: "📊",
                title: "Match Score",
                desc: "Puntuaci\u00f3n de compatibilidad para cada franquicia basada en tu perfil.",
              },
              {
                icon: "💎",
                title: "+50 Franquicias",
                desc: "Cat\u00e1logo verificado de franquicias en Latinoam\u00e9rica.",
              },
              {
                icon: "💰",
                title: "6 Pa\u00edses",
                desc: "Presencia en Colombia, M\u00e9xico, Argentina, Chile, Per\u00fa y Ecuador.",
              },
              {
                icon: "🎛\ufe0f",
                title: "Quiz Inteligente",
                desc: "5 preguntas clave para encontrar tu franquicia ideal.",
              },
              {
                icon: "\u2699\ufe0f",
                title: "Verificaci\u00f3n SMS",
                desc: "Proceso seguro con verificaci\u00f3n telef\u00f3nica en cada paso.",
              },
              {
                icon: "🚀",
                title: "Contacto Directo",
                desc: "Conexi\u00f3n inmediata con las franquicias que mejor se ajustan.",
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
                <p className="text-gray-600 text-sm sm:text-base">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Case Studies ─── */}
      <section id="casos" className="py-16 sm:py-20 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Built for investors.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {[
              {
                icon: "👔",
                gradient: "from-blue-100 to-blue-200",
                label: "Retail / Moda",
                title: "Inversi\u00f3n desde $50K",
                desc: "Franquicias de moda y retail con alta rotaci\u00f3n y modelos probados en LATAM.",
              },
              {
                icon: "🍽\ufe0f",
                gradient: "from-orange-100 to-orange-200",
                label: "Gastronom\u00eda",
                title: "Inversi\u00f3n desde $100K",
                desc: "Franquicias de alimentos y bebidas con reconocimiento de marca y soporte operativo.",
              },
              {
                icon: "💆",
                gradient: "from-green-100 to-green-200",
                label: "Salud / Bienestar",
                title: "Inversi\u00f3n desde $200K",
                desc: "Franquicias de salud y est\u00e9tica en uno de los sectores de mayor crecimiento.",
                extraClass: "sm:col-span-2 lg:col-span-1",
              },
            ].map((c) => (
              <div
                key={c.label}
                className={`bg-white rounded-xl sm:rounded-2xl overflow-hidden hover:shadow-xl transition-all scroll-fade-in ${
                  c.extraClass || ""
                }`}
              >
                <div
                  className={`bg-gradient-to-br ${c.gradient} h-36 sm:h-48 flex items-center justify-center`}
                >
                  <div className="text-4xl sm:text-5xl">{c.icon}</div>
                </div>
                <div className="p-6 sm:p-8">
                  <span className="section-label">{c.label}</span>
                  <h3 className="text-xl sm:text-2xl font-bold mt-2 sm:mt-3 mb-2 sm:mb-3">
                    {c.title}
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    {c.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Elige c&oacute;mo quieres empezar.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
            {/* Quiz Gratis */}
            <div className="price-card glass-card p-6 sm:p-8 rounded-xl sm:rounded-2xl">
              <h3 className="text-xl sm:text-2xl font-bold mb-2">
                Quiz Gratis
              </h3>
              <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                Matching + recomendaciones + score
              </p>
              <div className="mb-4 sm:mb-6">
                <span className="text-xs sm:text-sm text-gray-500">
                  2 minutos
                </span>
              </div>
              <Link
                href="/quiz"
                className="block w-full text-center bg-gray-100 text-black px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-gray-200 transition-all font-semibold text-sm sm:text-base"
              >
                Comenzar quiz
              </Link>
            </div>

            {/* Asesor&iacute;a Premium (Recommended) */}
            <div className="price-card bg-black text-white p-6 sm:p-8 rounded-xl sm:rounded-2xl relative sm:col-span-2 lg:col-span-1">
              <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-white text-black px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-semibold">
                  Recomendado
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 mt-2 sm:mt-0">
                Asesor&iacute;a Premium
              </h3>
              <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">
                Quiz + acompa&ntilde;amiento + an&aacute;lisis personalizado
              </p>
              <div className="mb-4 sm:mb-6">
                <span className="text-xs sm:text-sm text-gray-400">
                  Soporte dedicado durante tu b&uacute;squeda
                </span>
              </div>
              <button
                onClick={showForm}
                className="block w-full text-center bg-white text-black px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-gray-100 transition-all font-semibold text-sm sm:text-base"
              >
                Solicitar asesor&iacute;a
              </button>
            </div>

            {/* Enterprise */}
            <div className="price-card glass-card p-6 sm:p-8 rounded-xl sm:rounded-2xl">
              <h3 className="text-xl sm:text-2xl font-bold mb-2">
                Enterprise
              </h3>
              <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                Para grupos de inversi&oacute;n + acceso completo
              </p>
              <div className="mb-4 sm:mb-6">
                <span className="text-xs sm:text-sm text-gray-500">
                  Multi-franquicia + soporte dedicado
                </span>
              </div>
              <button
                onClick={showForm}
                className="block w-full text-center bg-gray-100 text-black px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-gray-200 transition-all font-semibold text-sm sm:text-base"
              >
                Agendar llamada
              </button>
            </div>
          </div>

          <p className="text-center text-xs sm:text-sm text-gray-500 mt-6 sm:mt-8">
            El quiz es 100% gratuito y sin compromiso
          </p>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gray-50">
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
                  <div className="mt-3 sm:mt-4 text-gray-600 text-sm sm:text-base">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section id="contacto" className="py-16 sm:py-20 lg:py-24 bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
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
            className="inline-block bg-white text-black px-8 sm:px-10 py-4 sm:py-5 rounded-lg hover:bg-gray-100 transition-all font-bold text-base sm:text-lg w-full sm:w-auto"
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

      {/* ─── Footer ─── */}
      <footer className="bg-white border-t border-gray-100 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-2 sm:col-span-1">
              <div className="mb-3 sm:mb-4">
                <Image
                  src="/logo_latam/franquicias_latam_logo.png"
                  alt="Franquicias LATAM"
                  width={640}
                  height={160}
                  className="h-[6.4rem] sm:h-32 w-auto"
                />
              </div>
              <p className="text-gray-600 text-xs sm:text-sm">
                Plataforma de franquicias para inversionistas en
                Latinoam&eacute;rica.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
                Producto
              </h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                <li>
                  <a href="#proceso" className="hover:text-black">
                    Proceso
                  </a>
                </li>
                <li>
                  <a href="#plataforma" className="hover:text-black">
                    Plataforma
                  </a>
                </li>
                <li>
                  <a href="#casos" className="hover:text-black">
                    Casos
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
                Empresa
              </h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                <li>
                  <a href="#contacto" className="hover:text-black">
                    Contacto
                  </a>
                </li>
                <li>
                  <Link href="/admin/login" className="hover:text-black">
                    Admin
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
                Legal
              </h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                <li>
                  <a href="#" className="hover:text-black">
                    T&eacute;rminos
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-black">
                    Privacidad
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-gray-500">
            &copy; 2026 Franquicias LATAM. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
