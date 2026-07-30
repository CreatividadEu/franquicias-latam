import type { Metadata, Viewport } from "next";
import TottoSimulator from "@/components/intel/TottoSimulator";
import { decodeState } from "@/lib/intel/totto-model";
import PasscodeGate, { isUnlocked } from "./gate";

export const metadata: Metadata = {
  title: "SENECA · Simulador de Impacto — TOTTO Colombia",
  description:
    "Modelo interactivo del daño al P&L que la falsificación marcaria causa a Totto (Nalsani S.A.S.) en Colombia, y comparación de cuatro escenarios de respuesta. Documento de trabajo confidencial.",
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = {
  themeColor: "#08090A",
  colorScheme: "dark",
};

type SearchParams = Record<string, string | string[] | undefined>;

export default async function TottoIntelPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  if (!(await isUnlocked())) return <PasscodeGate error={params.e === "1"} />;

  // El estado llega hidratado desde la URL, así que el primer render del
  // servidor ya muestra los supuestos calibrados del enlace compartido.
  return <TottoSimulator initial={decodeState(params)} />;
}
