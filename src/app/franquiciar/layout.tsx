import type { Metadata } from "next";

// Empresarios funnel — served at the franquiciar.franquiciaslatam.com subdomain
// via the host-based rewrite in next.config.ts (also reachable at /franquiciar
// on the primary domain). Targets the "franquiciar mi negocio / cómo
// franquiciar" query cluster; the homepage stays thin.
export const metadata: Metadata = {
  title: "Franquiciar mi Negocio | Franquicias LATAM",
  description:
    "Convierte tu negocio en franquicia con la metodología de Franquicias LATAM, premiada por el BID, Naciones Unidas y MinTIC. Diagnóstico gratis, respuesta en 48h.",
  alternates: {
    canonical: "https://franquiciar.franquiciaslatam.com",
  },
  openGraph: {
    title: "Franquiciar mi Negocio | Franquicias LATAM",
    description:
      "Convierte tu negocio en franquicia con la metodología de Franquicias LATAM, premiada por el BID, Naciones Unidas y MinTIC.",
    url: "https://franquiciar.franquiciaslatam.com",
    locale: "es_419",
    type: "website",
  },
};

export default function FranquiciarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
