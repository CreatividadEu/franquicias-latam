import type { ReactNode } from "react";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./standalone.css";

// ── Grupo standalone ────────────────────────────────────────────────────────
// Las rutas de este grupo se presentan solas: sin header, nav, footer ni
// widgets de la plataforma. El layout raíz sigue siendo el dueño de <html> y
// <body> (Next.js no permite reemplazarlo desde un grupo), así que standalone.css
// neutraliza lo poco que impone a nivel global — la capa blanca de fondo, el
// tracking apretado y el WhatsAppWidget flotante.

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-intel-sans",
  display: "swap",
  // Inter v4 expone el eje óptico: en los tamaños display el trazo se afina.
  axes: ["opsz"],
});

// Único punto de intercambio de fuentes: para pasar a un Berkeley Mono
// licenciado, basta cambiar esta declaración por un localFont() apuntando a
// /public/fonts y mantener la misma variable CSS.
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-intel-mono",
  display: "swap",
});

export default function StandaloneLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div
      className={`${sans.variable} ${mono.variable} intel-root antialiased min-h-dvh`}
    >
      {children}
    </div>
  );
}
