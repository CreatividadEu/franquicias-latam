export type BrandLogo = {
  src: string;
  alt: string;
};

export const homeClientLogos: BrandLogo[] = [
  { src: "/logos_clientes/logo_andres.svg", alt: "Andrés" },
  { src: "/logos_clientes/logo_bid.svg", alt: "BID" },
  { src: "/logos_clientes/logo_mercado_libre.svg", alt: "Mercado Libre" },
  { src: "/logos_clientes/logo_nutresa.svg", alt: "Nutresa" },
  { src: "/logos_clientes/logo_sodexo.svg", alt: "Sodexo" },
  { src: "/logos_clientes/logo_subway.svg", alt: "Subway" },
  { src: "/logos_clientes/logo_totto.svg", alt: "Totto" },
];

export const programInstitutionalLogos: BrandLogo[] = [
  {
    src: "/logo_bid_3.png",
    alt: "Banco Interamericano de Desarrollo (BID)",
  },
  { src: "/logo_onu_1.png", alt: "Naciones Unidas" },
  {
    src: "/logo_mintic_1.png",
    alt: "MinTIC — Ministerio de Tecnologías de la Información y las Comunicaciones",
  },
];

export const homeNavbarLinks = [
  { href: "#diagnostico", label: "Invierte" },
  { href: "#proceso", label: "Programa" },
  { href: "#video-hero", label: "Casos de Éxito" },
];

export const homeFooterProductLinks = [
  { href: "#proceso", label: "Proceso" },
  { href: "#plataforma", label: "Plataforma" },
  { href: "#casos", label: "Casos" },
];

export const homeFooterCompanyLinks = [
  { href: "#contacto", label: "Contacto" },
  { href: "/admin/login", label: "Admin", isInternal: true },
];

export const homeFooterLegalLinks = [
  { href: "#", label: "Términos" },
  { href: "#", label: "Privacidad" },
];
