import type { Metadata, Viewport } from "next";
import Caso001 from "@/components/totto/Caso001";
import Caso001Gate, { isUnlocked } from "./gate";

export const metadata: Metadata = {
  title: "Caso 001 · Stoik Intel × Totto",
  description:
    "Cómo se rastreó una red de 214.025 unidades falsificadas de Totto desde un post de Facebook hasta su bodega en Cúcuta. Expediente confidencial.",
  // Confidencial: fuera de buscadores, de caché y de archivos.
  robots: { index: false, follow: false, nocache: true, noarchive: true },
};

export const viewport: Viewport = {
  themeColor: "#08080A",
  colorScheme: "dark",
};

type SearchParams = Record<string, string | string[] | undefined>;

export default async function Caso001Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  if (!(await isUnlocked())) return <Caso001Gate error={params.e === "1"} />;

  return <Caso001 />;
}
