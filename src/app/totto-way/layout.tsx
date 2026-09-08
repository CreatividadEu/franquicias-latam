import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./totto-way.css";

/**
 * Totto Way — layout del módulo (patrón saju): fuente de marca, metadata
 * noindex y el wrapper .tw-root que aísla el design system. <html>/<body>
 * siguen siendo del layout raíz.
 *
 * Solo se carga Centra No1 Medium (500): la Regular entregada es un TRIAL de
 * 64 glifos sin ñ ni acentos (docs/totto-way/BRAND.md). El cuerpo 400 usa
 * Satoshi (--font-inter) del layout raíz hasta tener la Regular licenciada.
 */
const centra = localFont({
  src: [{ path: "../../../public/fonts/totto/CentraNo1-Medium.ttf", weight: "500", style: "normal" }],
  variable: "--font-centra",
  display: "swap",
  fallback: ["Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
  adjustFontFallback: "Arial",
});

export const metadata: Metadata = {
  title: { default: "Totto Way", template: "%s · Totto Way" },
  description: "Plataforma de formación en tienda de TOTTO.",
  robots: { index: false, follow: false, nocache: true },
  icons: { icon: "/totto-way/logo-black.png" },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function TottoWayLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className={`tw-root ${centra.variable}`}>{children}</div>;
}
