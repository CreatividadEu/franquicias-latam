// ─────────────────────────────────────────────────────────────────────────────
// Pitch "burn after viewing" (/p/[slug]) — configuración central de prospectos.
//
// Para duplicar la experiencia para un nuevo prospecto:
//   1. Sube su logo a /public/logos/<slug>.svg (claro, para fondo oscuro).
//   2. Agrega un objeto ClientConfig en `clients` (la clave es el slug).
//   → La experiencia queda viva en /p/<slug>, con su propio flag de burn
//     (`flatam_<slug>_burned`) y su propio color de acento.
// ─────────────────────────────────────────────────────────────────────────────

export type ClientConfig = {
  slug: string;
  nombre: string;
  tagline: string;
  /** Logo claro del cliente (se ve sobre #0B0F0A). */
  logoSrc: string;
  /** Color de acento (hex) — tiñe botones, ripples, chips y highlights. */
  acento: string;
  /** Titular de bienvenida en dos líneas; la segunda va en acento. */
  headline: [string, string];
  /** Sub-copy de bienvenida: el éxito que puede tener la marca si franquicia. */
  subcopy: string;
  /** Link de pago (Stripe) del botón final. */
  checkoutUrl: string;
  precioLabel: string;
};

export const clients: Record<string, ClientConfig> = {
  bajopar: {
    slug: "bajopar",
    nombre: "Bajo Par",
    tagline: "Minigolf · Food & Drinks · Bogotá",
    logoSrc: "/logos/bajopar.svg",
    acento: "#A8F542",
    headline: ["Bajo Par ya juega bajo par.", "Ahora toca jugar en más campos."],
    subcopy:
      "El concepto ya demostró lo difícil: la gente llega, juega, come, vuelve y lo cuenta. Una marca que se vive así no está hecha para un solo campo — está hecha para multiplicarse en franquicia. Y ese salto no se improvisa: se construye con sistema.",
    checkoutUrl: "https://buy.stripe.com/00w00k7PMgOq8rr3UZ5c41C",
    precioLabel: "€500",
  },
};

export function getClient(slug: string): ClientConfig | undefined {
  return clients[slug];
}

/** Clave del flag burn-after-viewing (localStorage + cookie espejo). */
export function burnKey(slug: string): string {
  return `flatam_${slug}_burned`;
}

// ── Marquee de marcas ────────────────────────────────────────────────────────
// Se leen de /public. Si `archivo` falta o el archivo no existe, se renderiza
// el nombre en tipografía elegante como fallback. `invertir` es para los
// vectores oscuros (#3d3d3d) de /public/logos_clientes, que se invierten para
// leerse sobre el fondo oscuro del pitch.

export type Marca = {
  nombre: string;
  archivo?: string;
  invertir?: boolean;
};

export const marcasPortafolio: Marca[] = [
  { nombre: "SAJÚ", archivo: "/logos/saju.svg" },
  { nombre: "Totto", archivo: "/logos_clientes/logo_totto.svg", invertir: true },
  { nombre: "Sodexo", archivo: "/logos_clientes/logo_sodexo.svg", invertir: true },
  { nombre: "Mercado Libre", archivo: "/logos_clientes/logo_mercado_libre.svg", invertir: true },
  { nombre: "Casano", archivo: "/logos/casano.svg" },
  { nombre: "Grupo Nutresa", archivo: "/logos_clientes/logo_nutresa.svg", invertir: true },
  { nombre: "Subway", archivo: "/logos_clientes/logo_subway.svg", invertir: true },
  { nombre: "Andrés Carne de Res", archivo: "/logos_clientes/logo_andres.svg", invertir: true },
  { nombre: "BID", archivo: "/logos_clientes/logo_bid.svg", invertir: true },
  // Slots libres: agrega el .svg en /public/logos y referencia aquí.
  { nombre: "Propaís" },
  { nombre: "Don Benitez" },
  { nombre: "Pampa Malbec" },
  { nombre: "The Body Concept" },
];

// ── Las 5 fases del Bootcamp ─────────────────────────────────────────────────
// Solo nombre + misión + beneficio. Nada de metodología, herramientas ni
// entregables: el pitch no debe ser reverse-engineerable.

export type Fase = {
  nombre: string;
  mision: string;
  beneficio: string;
};

export const fases: Fase[] = [
  {
    nombre: "Estrategia",
    mision: "Definir hacia dónde crece la marca.",
    beneficio: "Indicadores de desempeño claros que nos comprometemos a mover.",
  },
  {
    nombre: "Finanzas",
    mision: "Convertir tu unidad de franquicia en un modelo de rentabilidad medible.",
    beneficio: "Decisiones con números, no con intuición.",
  },
  {
    nombre: "Manuales",
    mision: "Empaquetar la experiencia para que se replique sin el fundador.",
    beneficio: "La marca opera idéntica en cualquier punto.",
  },
  {
    nombre: "Legal",
    mision: "Blindar marca, operación y know-how.",
    beneficio: "Vendes franquicias protegido.",
  },
  {
    nombre: "Mercadeo",
    mision: "Construir el sistema para que las franquicias se vendan.",
    beneficio: "Pipeline de candidatos — los leads son tuyos.",
  },
];

// ── La garantía ──────────────────────────────────────────────────────────────

export const garantia = {
  titulo: ["O crece", "o crece."] as const,
  texto:
    "O subes o mejoras los indicadores de desempeño establecidos en la estrategia en estos 3 meses — o seguimos trabajando con la misma frecuencia e intensidad hasta lograrlo.",
  enfasis: "Sin costo adicional. Por contrato.",
  pasos: [
    "Separas el cupo",
    "Abrimos tu expediente",
    "Auditamos tu operación en sitio",
    "Llegas a la primera reunión con avances ya hechos",
  ],
  nota: "Reuniones disponibles todos los días — incluidos domingos — con hasta 5 horas agendables por semana.",
};
