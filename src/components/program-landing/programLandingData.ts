import {
  homeClientLogos,
  programInstitutionalLogos,
} from "@/components/home/homeBrandData";

export const cohortSpots = 8;
export const programApplicationHref = "/quiz";

export const programHeroMetrics = [
  {
    value: "87%",
    label: "alcanzan un modelo franquiciable con salida clara",
  },
  {
    value: "+9.4%",
    label: "mejora promedio en margen bruto capturable",
  },
  {
    value: "90 días",
    label: "para estructurar expansión con criterios reales",
  },
  {
    value: "750+",
    label: "proyectos desarrollados con nuestra metodología",
  },
];

export const programDifferenceCards = [
  {
    title: "Forma de trabajo",
    consulting: "Diagnósticos aislados y recomendaciones sueltas.",
    program:
      "Cohortes con framework probado, hitos claros y ritmo de implementación.",
  },
  {
    title: "Dependencia",
    consulting: "El negocio depende del consultor y de su disponibilidad.",
    program:
      "La empresa queda montada sobre un sistema replicable, medible y operable.",
  },
  {
    title: "Entregables",
    consulting: "Documentos que no siempre aterrizan en expansión.",
    program:
      "Diagnóstico, modelación, estándares, propuesta y estructura de crecimiento.",
  },
  {
    title: "Resultado final",
    consulting: "Más claridad, pero no necesariamente una red lista para vender.",
    program:
      "Un negocio listo para convertirse en franquicia rentable, vendible y escalable.",
  },
];

export const programSteps = [
  {
    step: "01",
    title: "Diagnóstico & Roadmap",
    description:
      "Leemos ventas, márgenes, EBITDA, estructura operativa, unit economics y capacidad real de expansión.",
    outcomes: [
      "Mapa de brechas críticas",
      "Lectura financiera para expansión",
      "Roadmap de decisiones y prioridades",
    ],
    detect:
      "Dónde se fuga margen, qué frena la replicabilidad y si la base actual soporta una red.",
  },
  {
    step: "02",
    title: "Sistema Replicable",
    description:
      "Traducimos el negocio en estándares, criterios, modelo financiero y sistema operativo franquiciable.",
    outcomes: [
      "Modelo financiero estructurado",
      "Estándares y criterios de operación",
      "Arquitectura lista para escalar",
    ],
    detect:
      "Qué debe estandarizarse, qué puede delegarse y qué piezas faltan para operar sin caos.",
  },
  {
    step: "03",
    title: "Expansión & Colocación",
    description:
      "Dejamos lista la propuesta de franquicia para salir al mercado con narrativa, filtros y lógica comercial.",
    outcomes: [
      "Oferta de franquicia lista",
      "Narrativa comercial de expansión",
      "Base para validación y colocación",
    ],
    detect:
      "Qué tan monetizable es la expansión y qué aperturas pueden capturarse en 24 meses.",
  },
];

export const programConsequenceCards = [
  {
    title: "Crecimiento lento",
    body:
      "Seguir abriendo solo unidades propias suele consumir más caja y más tiempo del necesario.",
  },
  {
    title: "Rentabilidad no capturada",
    body:
      "Operar sin estructura de expansión deja margen sobre la mesa aunque las ventas sigan creciendo.",
  },
  {
    title: "Expansión no monetizada",
    body:
      "Sin propuesta franquiciable no conviertes tu know-how en ingresos de entrada, royalties y red.",
  },
];

export const programFitGood = [
  "Negocios con demanda validada",
  "Empresas con intención real de expandirse",
  "Modelos con producto o servicio repetible",
  "Fundadores que quieren crecer como red y no solo vender más unidades",
];

export const programFitBad = [
  "Negocios sin validación mínima",
  "Empresas que buscan solo un logo o un manual",
  "Marcas sin capacidad de ejecución",
  "Equipos que no quieren ordenar números ni operación",
];

export const programAdmissionSteps = [
  "Aplicación inicial",
  "Revisión de fit",
  "Llamada de entrevista",
  "Admisión a cohorte",
  "Inicio del programa",
];

export const sandboxDefaults = {
  monthlySales: 85000,
  grossMarginPct: 57,
  ebitdaPct: 14,
  averageTicket: 18,
  unitCount: 3,
  improvementPct: 6,
  openings24m: 6,
  entryFee: 18000,
  royaltyPct: 6,
  royaltyCaptureFactor: 0.42,
};

export const sandboxBounds = {
  improvementPct: { min: 0, max: 18 },
  openings24m: { min: 1, max: 18 },
  ebitdaPct: { min: 0, max: 32 },
  grossMarginPct: { min: 20, max: 90 },
  royaltyPct: { min: 1, max: 12 },
};

export const sandboxBenchmarks = {
  grossMarginPct: 54,
  ebitdaPct: 13,
  averageTicket: 16,
};

export const programInstitutionalMentions = [
  "BID",
  "Naciones Unidas",
  "MinTIC",
  "Propaís",
  "Gobierno de Corea del Sur",
];

export const programClientTrustLogos = homeClientLogos;
export const programInstitutionalTrustLogos = programInstitutionalLogos;
