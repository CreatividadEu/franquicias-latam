import type { ReactNode } from "react";
import { Lilita_One, Nunito } from "next/font/google";
import "./manual.css";

// ── Rutas /manual ───────────────────────────────────────────────────────────
// Manuales de operación entregables a un cliente: se presentan solos, sin
// header, nav, footer ni widgets de la plataforma. El layout raíz sigue siendo
// el dueño de <html> y <body> (Next.js no permite reemplazarlo desde aquí), así
// que manual.css neutraliza lo poco que impone a nivel global — la capa blanca
// de fondo, el tracking apretado y el WhatsAppWidget flotante.

// Display de una sola pieza: Lilita One solo trae el peso 400, que es
// justamente el trazo grueso de portada de manual de armado.
const display = Lilita_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-barril-display",
  display: "swap",
});

const body = Nunito({
  subsets: ["latin"],
  weight: ["500", "700", "800", "900"],
  variable: "--font-barril-body",
  display: "swap",
});

export default function ManualLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className={`${display.variable} ${body.variable} barril-root min-h-dvh`}>
      {children}
    </div>
  );
}
