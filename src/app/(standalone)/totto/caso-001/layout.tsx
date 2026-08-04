import type { ReactNode } from "react";
import { JetBrains_Mono, Poppins } from "next/font/google";

// ── Tipografía del Caso 001 ─────────────────────────────────────────────────
// `next/font` descarga las fuentes en tiempo de build y las sirve desde este
// mismo dominio: no hay ninguna llamada a un CDN externo en el navegador, así
// que abrir el microsite no filtra la URL confidencial a terceros.

const display = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "800", "900"],
  variable: "--font-caso-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-caso-mono",
  display: "swap",
});

export default function Caso001Layout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <div className={`${display.variable} ${mono.variable}`}>{children}</div>;
}
