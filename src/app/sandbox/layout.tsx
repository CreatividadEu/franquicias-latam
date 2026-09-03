import type { Metadata, Viewport } from "next";
import { Instrument_Serif } from "next/font/google";
import "./sandbox.css";

// Tipografía editorial del canvas (titular de Estrategia, cifras del P&L).
// El chrome sigue en Satoshi (--font-inter, cargada en el layout raíz).
const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-sandbox-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sandbox · Franquicias LATAM",
  description: "Sesión interactiva privada de Franquicias LATAM.",
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = {
  themeColor: "#0A0F1E",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function SandboxLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div data-sandbox-scope className={serif.variable}>
      {children}
    </div>
  );
}
