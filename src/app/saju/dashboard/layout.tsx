import type { Metadata } from "next";
import { requireSajuAdmin } from "@/lib/saju/auth";
import "./dashboard.css";

/**
 * Centro de mando interno. Cuelga del layout de /saju (que aporta las fuentes
 * Jost + Poppins de la marca) pero con su propio sistema visual namespaced en
 * `.saju-cc`. Nada de esto debe indexarse: metadata noindex aquí y cabecera
 * `X-Robots-Tag` en next.config.ts.
 */
export const metadata: Metadata = {
  title: "SAJÚ · Centro de mando de expansión",
  description: "Panel interno de expansión internacional de Sajú.",
  robots: { index: false, follow: false, nocache: true },
  alternates: {},
};

export default async function SajuDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Guarda de segmento: sin sesión admin no se renderiza nada del panel.
  await requireSajuAdmin();

  return <div className="saju-cc">{children}</div>;
}
