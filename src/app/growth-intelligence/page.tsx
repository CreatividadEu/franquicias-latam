import type { Metadata } from "next";
import { GrowthIntelligenceLanding } from "@/components/growth-intelligence/GrowthIntelligenceLanding";

export const metadata: Metadata = {
  title: "Sistema Growth Intelligence | Franquicias LATAM",
  description:
    "Diagnóstico estratégico para detectar señales de crecimiento, fugas de caja, cuellos de botella y la ruta correcta para escalar tu negocio.",
};

export default function GrowthIntelligencePage() {
  return <GrowthIntelligenceLanding />;
}
