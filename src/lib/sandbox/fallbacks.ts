/**
 * Datos de respaldo del Sandbox (§8): la demo nunca se bloquea por falta de
 * uploads. Sin menú → ítems genéricos del sector con costos de referencia;
 * sin OSINT → 6 dolores universales del sector; sin marketing → defaults del
 * quick-form; sin notas de gastos → benchmarks OPEX por sector y país. Todo
 * queda marcado (source benchmark/fallback, estimate true). Cifras en USD.
 */
import { COUNTRIES } from "@/lib/constants/countries";
import type { OfferingItem, OpexKey, OpexLineSchemaInput, PainItem, MarketingIdea } from "./schemas";
import type { SandboxSectorId } from "./types";

// ── País ─────────────────────────────────────────────────────────────────────

const COUNTRY_ALIASES: Record<string, string> = {
  mexico: "MX",
  méxico: "MX",
  peru: "PE",
  perú: "PE",
  brasil: "BR",
  espana: "ES",
  españa: "ES",
  "estados unidos": "US",
  usa: "US",
  eeuu: "US",
  "republica dominicana": "DO",
  "república dominicana": "DO",
  panama: "PA",
  panamá: "PA",
};

function fold(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/** "Colombia" | "CO" | "México" → "CO" / "MX"; desconocido → null. */
export function countryCodeFromText(value: string | null | undefined): string | null {
  if (!value) return null;
  const raw = value.trim();
  if (/^[A-Za-z]{2}$/.test(raw)) {
    const code = raw.toUpperCase();
    return COUNTRIES.some((c) => c.code === code) ? code : null;
  }
  const folded = fold(raw);
  const alias = COUNTRY_ALIASES[folded] ?? COUNTRY_ALIASES[raw.toLowerCase()];
  if (alias) return alias;
  const match = COUNTRIES.find((c) => fold(c.name) === folded);
  return match?.code ?? null;
}

// ── Oferta genérica por sector ───────────────────────────────────────────────

type GenericItem = { name: string; category: string; price: number; cogs: number; ingredients: string[]; popular?: boolean };

const GENERIC_ITEMS: Record<SandboxSectorId, GenericItem[]> = {
  restaurante: [
    { name: "Plato fuerte de la casa", category: "Fuertes", price: 9.5, cogs: 3.2, ingredients: ["Proteína", "Acompañamiento", "Salsa"], popular: true },
    { name: "Combo del día", category: "Combos", price: 6.5, cogs: 2.4, ingredients: ["Proteína", "Guarnición", "Bebida"], popular: true },
    { name: "Entrada para compartir", category: "Entradas", price: 5.5, cogs: 1.6, ingredients: ["Base", "Topping"] },
    { name: "Bebida natural", category: "Bebidas", price: 2.2, cogs: 0.5, ingredients: ["Fruta", "Azúcar", "Vaso"], popular: true },
    { name: "Postre de la casa", category: "Postres", price: 3.2, cogs: 0.9, ingredients: ["Base", "Cobertura"] },
    { name: "Adicional / acompañamiento", category: "Adicionales", price: 2.5, cogs: 0.7, ingredients: ["Porción"] },
  ],
  retail: [
    { name: "Producto estrella", category: "Core", price: 25, cogs: 11, ingredients: ["Mercancía", "Empaque"], popular: true },
    { name: "Producto de entrada", category: "Core", price: 12, cogs: 6, ingredients: ["Mercancía", "Empaque"], popular: true },
    { name: "Accesorio complementario", category: "Complementos", price: 8, cogs: 3, ingredients: ["Mercancía"] },
    { name: "Kit / pack", category: "Packs", price: 40, cogs: 19, ingredients: ["Mercancía", "Empaque especial"] },
    { name: "Línea premium", category: "Premium", price: 60, cogs: 26, ingredients: ["Mercancía", "Empaque"] },
    { name: "Servicio o garantía extendida", category: "Servicios", price: 10, cogs: 2, ingredients: ["Tiempo de personal"] },
  ],
  servicios: [
    { name: "Servicio base", category: "Servicios", price: 30, cogs: 9, ingredients: ["1 h de personal", "Insumos"], popular: true },
    { name: "Servicio premium", category: "Servicios", price: 60, cogs: 18, ingredients: ["1.5 h de personal", "Insumos premium"] },
    { name: "Paquete mensual", category: "Paquetes", price: 120, cogs: 40, ingredients: ["4 h de personal", "Insumos"], popular: true },
    { name: "Diagnóstico inicial", category: "Entrada", price: 15, cogs: 4, ingredients: ["0.5 h de personal"] },
    { name: "Complemento / add-on", category: "Complementos", price: 12, cogs: 3, ingredients: ["Insumo"] },
  ],
  otro: [
    { name: "Producto o servicio principal", category: "Core", price: 20, cogs: 8, ingredients: ["Componente principal"], popular: true },
    { name: "Producto o servicio secundario", category: "Core", price: 12, cogs: 5, ingredients: ["Componente"] },
    { name: "Complemento", category: "Complementos", price: 6, cogs: 2, ingredients: ["Componente"] },
    { name: "Paquete", category: "Packs", price: 35, cogs: 15, ingredients: ["Componentes"] },
  ],
};

export function fallbackOfferingItems(sector: SandboxSectorId): OfferingItem[] {
  return GENERIC_ITEMS[sector].map((g, i) => {
    const per = g.ingredients.length ? g.cogs / g.ingredients.length : 0;
    return {
      id: `fallback-${sector}-${i + 1}`,
      name: g.name,
      category: g.category,
      price: g.price,
      currency: "USD",
      estimatedCogs: g.cogs,
      cogsConfidence: "low" as const,
      ingredients: g.ingredients.map((name) => ({ name, estCost: Number(per.toFixed(2)) })),
      isHero: false,
      heroReason: "",
      estimate: true,
    };
  });
}

export const FALLBACK_OFFERING_NOTE =
  "Sin menú o catálogo cargado: ítems genéricos del sector con costos de referencia en USD. Sustitúyelos en vivo con los reales.";

// ── Dolores universales por sector ───────────────────────────────────────────

type GenericPain = Omit<PainItem, "id" | "evidence" | "source">;

const UNIVERSAL_PAINS: Record<SandboxSectorId, GenericPain[]> = {
  restaurante: [
    { title: "El ticket promedio depende de quién atienda", area: "ventas", severity: 4, lever: "Guion de venta sugerida con el plato héroe en cada mesa.", standardTitle: "Guion de venta sugerida" },
    { title: "Tiempos de espera irregulares en hora pico", area: "tiempos", severity: 4, lever: "Estándar de tiempos por estación y tablero de comandas.", standardTitle: "Estándar de tiempos de servicio" },
    { title: "El sabor cambia según el cocinero", area: "producto", severity: 5, lever: "Fichas de receta con gramajes y fotos de emplatado.", standardTitle: "Manual de recetas y emplatado" },
    { title: "Nadie sabe cuánto cuesta cada plato", area: "ventas", severity: 4, lever: "Costeo por ítem actualizado cada mes con precios de compra.", standardTitle: "Costeo por ítem" },
    { title: "El negocio se cae cuando el dueño no está", area: "equipo", severity: 5, lever: "Checklist de apertura, turno y cierre con responsable.", standardTitle: "Checklists de operación diaria" },
    { title: "Rotación alta y entrenamiento a la carrera", area: "equipo", severity: 3, lever: "Ruta de entrenamiento de 5 días con evaluación práctica.", standardTitle: "Ruta de entrenamiento inicial" },
  ],
  retail: [
    { title: "La conversión depende del vendedor de turno", area: "ventas", severity: 4, lever: "Guion de abordaje y cierre con producto estrella.", standardTitle: "Guion de venta en piso" },
    { title: "Inventario sin control: faltantes y sobrantes", area: "producto", severity: 5, lever: "Conteo cíclico semanal y mínimos por SKU.", standardTitle: "Estándar de inventario" },
    { title: "La exhibición cambia según quién abra", area: "comunicación", severity: 3, lever: "Planograma fotográfico por temporada.", standardTitle: "Manual de exhibición (planograma)" },
    { title: "Sin margen claro por producto", area: "ventas", severity: 4, lever: "Costeo por SKU con margen objetivo.", standardTitle: "Costeo por SKU" },
    { title: "El dueño es el único que compra y negocia", area: "equipo", severity: 4, lever: "Manual de compras con proveedores y condiciones.", standardTitle: "Manual de compras" },
    { title: "Atención desigual y reclamos sin protocolo", area: "servicio", severity: 3, lever: "Protocolo de atención y manejo de reclamos.", standardTitle: "Protocolo de servicio y reclamos" },
  ],
  servicios: [
    { title: "La calidad depende de quién ejecuta el servicio", area: "producto", severity: 5, lever: "Protocolo paso a paso por servicio con checklist de calidad.", standardTitle: "Protocolo de servicio" },
    { title: "Agenda y tiempos sin estándar", area: "tiempos", severity: 4, lever: "Tiempos estándar por servicio y agenda con buffers.", standardTitle: "Estándar de tiempos y agenda" },
    { title: "Pocos clientes vuelven o recompran", area: "ventas", severity: 4, lever: "Guion de recompra y paquete mensual al cerrar cada servicio.", standardTitle: "Guion de recompra" },
    { title: "Sin costeo por hora de personal", area: "ventas", severity: 3, lever: "Costo hora por rol y margen por servicio.", standardTitle: "Costeo por servicio" },
    { title: "El dueño atiende, vende y administra", area: "equipo", severity: 5, lever: "Roles y responsabilidades con delegación gradual.", standardTitle: "Manual de roles y responsabilidades" },
    { title: "Comunicación con el cliente improvisada", area: "comunicación", severity: 3, lever: "Plantillas de WhatsApp para confirmación, seguimiento y reseña.", standardTitle: "Protocolo de comunicación con clientes" },
  ],
  otro: [
    { title: "El negocio depende del dueño", area: "equipo", severity: 5, lever: "Checklists y roles con responsable por turno.", standardTitle: "Checklists de operación" },
    { title: "Los procesos viven en la cabeza del equipo", area: "producto", severity: 4, lever: "Documentar los 5 procesos críticos con fotos y pasos.", standardTitle: "Manual de procesos críticos" },
    { title: "Ventas sin guion ni venta sugerida", area: "ventas", severity: 4, lever: "Guion de venta con producto héroe.", standardTitle: "Guion de venta" },
    { title: "Sin costeo por producto o servicio", area: "ventas", severity: 4, lever: "Costeo por ítem y margen objetivo.", standardTitle: "Costeo por ítem" },
    { title: "Tiempos y calidad irregulares", area: "tiempos", severity: 3, lever: "Estándares de tiempo y control de calidad.", standardTitle: "Estándar de tiempos y calidad" },
    { title: "Entrenamiento informal del personal nuevo", area: "equipo", severity: 3, lever: "Ruta de entrenamiento con evaluación.", standardTitle: "Ruta de entrenamiento" },
  ],
};

export function fallbackPains(sector: SandboxSectorId): PainItem[] {
  return UNIVERSAL_PAINS[sector].map((p, i) => ({
    id: `universal-${sector}-${i + 1}`,
    ...p,
    evidence: "",
    source: "other" as const,
  }));
}

// ── Ideas de campaña de respaldo ─────────────────────────────────────────────

export function fallbackIdeas(brandName: string, heroItems: string[]): MarketingIdea[] {
  const hero = heroItems[0] ?? "el producto héroe";
  return [
    {
      id: "idea-1",
      title: `Campaña del plato héroe: ${hero}`,
      channel: "Instagram Reels",
      hook: `Tres reels de 15 s mostrando cómo se hace ${hero} y por qué la gente vuelve por él.`,
      heroItem: hero,
      metric: "Attach rate del héroe y vistas por reel en 30 días",
    },
    {
      id: "idea-2",
      title: "Reseñas que venden",
      channel: "Google Business",
      hook: `Cada cliente satisfecho recibe un QR para dejar reseña; ${brandName} responde todas en 24 h.`,
      heroItem: hero,
      metric: "Reseñas nuevas por semana y calificación promedio",
    },
    {
      id: "idea-3",
      title: "Detrás del mostrador",
      channel: "WhatsApp y comunidad local",
      hook: "Lista de difusión con la historia del equipo y una oferta exclusiva del héroe cada 15 días.",
      heroItem: hero,
      metric: "Recompra de clientes de la lista en 30 días",
    },
  ];
}

// ── Benchmarks OPEX ──────────────────────────────────────────────────────────

/** % de las ventas mensuales por línea (referencia LATAM, negocio unitario). */
export const OPEX_BENCHMARK_PCT: Record<SandboxSectorId, Record<OpexKey, number>> = {
  restaurante: { rent: 0.1, payroll: 0.25, utilities: 0.04, marketing: 0.03, other: 0.08 },
  retail: { rent: 0.12, payroll: 0.18, utilities: 0.03, marketing: 0.04, other: 0.06 },
  servicios: { rent: 0.12, payroll: 0.35, utilities: 0.03, marketing: 0.05, other: 0.07 },
  otro: { rent: 0.11, payroll: 0.26, utilities: 0.035, marketing: 0.04, other: 0.07 },
};

/** Ventas mensuales de referencia (USD) de un restaurante unitario por país. */
const BASE_MONTHLY_SALES_USD: Record<string, number> = {
  CO: 25_000,
  MX: 35_000,
  EC: 20_000,
  PE: 22_000,
  CL: 40_000,
  AR: 30_000,
  PA: 35_000,
  GT: 20_000,
  CR: 30_000,
  DO: 25_000,
  UY: 30_000,
  PY: 18_000,
  BO: 15_000,
  SV: 18_000,
  HN: 16_000,
  NI: 14_000,
  VE: 12_000,
  BR: 30_000,
  ES: 45_000,
  US: 80_000,
};

const SECTOR_SALES_FACTOR: Record<SandboxSectorId, number> = {
  restaurante: 1,
  retail: 1.2,
  servicios: 0.6,
  otro: 0.9,
};

export const OPEX_LABELS: Record<OpexKey, string> = {
  rent: "Arriendo",
  payroll: "Nómina",
  utilities: "Servicios públicos",
  marketing: "Marketing",
  other: "Otros gastos",
};

export function benchmarkMonthlySalesUsd(sector: SandboxSectorId, countryText: string | null | undefined): number {
  const code = countryCodeFromText(countryText);
  const base = (code && BASE_MONTHLY_SALES_USD[code]) || 25_000;
  return Math.round(base * SECTOR_SALES_FACTOR[sector]);
}

export function benchmarkOpexLines(sector: SandboxSectorId, monthlySales: number): OpexLineSchemaInput[] {
  const pct = OPEX_BENCHMARK_PCT[sector];
  return (Object.keys(pct) as OpexKey[]).map((key) => ({
    key,
    label: OPEX_LABELS[key],
    value: Math.round(monthlySales * pct[key]),
    confidence: "low" as const,
    source: "benchmark" as const,
    estimate: true,
  }));
}
