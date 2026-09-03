/**
 * Prompts del preload (§3) y esquemas ESTRICTOS de salida de IA. Los esquemas
 * de aquí no llevan defaults ni rangos (structured outputs los rechaza): la
 * normalización a los tipos de dominio (schemas.ts) ocurre en pipeline-core.
 * Español neutro; toda cifra generada se marca como estimación aguas abajo.
 */
import { z } from "zod";
import { MARKETING_AXES, OPEX_KEYS, painAreaSchema, painSourceSchema } from "./schemas";
import type { SandboxSectorId } from "./types";

// ── Esquemas de salida (estrictos) ───────────────────────────────────────────

const confidence = z.enum(["low", "med", "high"]);

export const aiOfferingSchema = z.object({
  currency: z.string().describe("Código ISO 4217 de la moneda de los precios (COP, MXN, USD…). Si no aparece, la del país."),
  items: z.array(
    z.object({
      name: z.string().describe("Nombre tal como aparece en el documento"),
      category: z.string().describe("Categoría o sección del menú/catálogo"),
      price: z.number().describe("Precio de venta unitario. 0 si no aparece."),
      estimatedCogs: z.number().describe("Costo estimado de insumos/componentes por unidad, misma moneda"),
      cogsConfidence: confidence,
      components: z.array(
        z.object({
          name: z.string(),
          estCost: z.number().describe("Costo estimado del componente, misma moneda"),
        }),
      ),
      popularityGuess: z.enum(["high", "med", "low"]).describe("Estimación de rotación relativa"),
    }),
  ),
  notes: z.string().describe("Supuestos de costeo y observaciones, 1–3 frases"),
});
export type AiOffering = z.infer<typeof aiOfferingSchema>;

export const aiPainsSchema = z.object({
  pains: z.array(
    z.object({
      title: z.string().describe("Dolor en 4–9 palabras"),
      evidence: z.string().describe("Cita TEXTUAL del documento (máx. 240 caracteres). Vacío si no hay cita literal."),
      source: painSourceSchema,
      area: painAreaSchema,
      severity: z.number().describe("1–5: frecuencia × impacto en ventas o experiencia"),
      lever: z.string().describe("Palanca operativa concreta, una frase"),
      standardTitle: z.string().describe("Nombre del manual o proceso que lo resuelve"),
    }),
  ),
  strengths: z.array(
    z.object({
      title: z.string().describe("Fortaleza en 3–8 palabras"),
      evidence: z.string().describe("Cita TEXTUAL. Vacío si no hay cita literal."),
    }),
  ),
});
export type AiPains = z.infer<typeof aiPainsSchema>;

const aiAxis = z.object({
  score: z.number().describe("0–100"),
  evidence: z.string().describe("Una línea de evidencia (máx. 160 caracteres)"),
  quickWin: z.string().describe("Una acción ejecutable en 2 semanas (máx. 160 caracteres)"),
});

export const aiMarketingAuditSchema = z.object({
  scores: z.object({
    marca: aiAxis,
    contenido: aiAxis,
    conversion: aiAxis,
    presencia_local: aiAxis,
    atraccion_franquiciados: aiAxis,
  }),
  inputs: z.object({
    instagramHandle: z.string().nullable(),
    followers: z.number().nullable(),
    postingCadence: z.enum(["diaria", "semanal", "quincenal", "esporadica", "ninguna"]).nullable(),
    hasWebsite: z.boolean().nullable(),
    googleRating: z.number().nullable(),
    adSpendGuess: z.number().nullable().describe("Pauta mensual estimada en USD"),
  }),
});
export type AiMarketingAudit = z.infer<typeof aiMarketingAuditSchema>;

export const aiOpexSchema = z.object({
  currency: z.string().describe("ISO 4217 de las cifras"),
  monthlySales: z.number().nullable().describe("Ventas mensuales promedio. null si no aparecen."),
  lines: z.array(
    z.object({
      key: z.enum(OPEX_KEYS),
      label: z.string().describe("Etiqueta corta en español"),
      monthlyValue: z.number().describe("Valor mensual en la moneda indicada"),
      confidence: confidence,
      evidence: z.string().describe("De dónde sale la cifra (máx. 120 caracteres)"),
    }),
  ),
  notes: z.string(),
});
export type AiOpex = z.infer<typeof aiOpexSchema>;

export const aiIdeasSchema = z.object({
  ideas: z.array(
    z.object({
      title: z.string().describe("Título de campaña (máx. 60 caracteres)"),
      channel: z.string().describe("Canal principal: Instagram Reels, Google Business, WhatsApp, TikTok, alianzas locales, punto de venta…"),
      hook: z.string().describe("Gancho creativo en una frase (máx. 140 caracteres)"),
      heroItem: z.string().describe("Plato/producto héroe que protagoniza la campaña"),
      metric: z.string().describe("KPI de éxito en una línea"),
    }),
  ),
});
export type AiIdeas = z.infer<typeof aiIdeasSchema>;

// ── Prompts ──────────────────────────────────────────────────────────────────

export type BrandContext = {
  brandName: string;
  sector: SandboxSectorId;
  country: string;
  city: string | null;
};

const SECTOR_LABEL: Record<SandboxSectorId, string> = {
  restaurante: "restaurante / alimentos y bebidas",
  retail: "retail / comercio",
  servicios: "servicios",
  otro: "otro",
};

export function brandContextText(brand: BrandContext): string {
  const where = [brand.city, brand.country].filter(Boolean).join(", ");
  return `Marca: ${brand.brandName}\nSector: ${SECTOR_LABEL[brand.sector]}\nUbicación: ${where || "no indicada"}`;
}

const PREAMBLE = `Eres analista senior de Franquicias LATAM. Preparas el "preload" de una sesión Sandbox: la información que un consultor usará en vivo, frente al dueño del negocio, para abrirlo como si fuera un proyecto real de franquicia.

Reglas generales:
- Trabaja SOLO con lo que aparece en los documentos. Lo que no esté, lo estimas con criterio de sector y lo marcas con baja confianza. Nunca presentes una estimación como dato.
- Español neutro de Latinoamérica, tono profesional, concreto y respetuoso con el negocio. Sin emojis.
- Las cifras van como números puros (sin símbolos de moneda ni separadores de miles).
- No inventes citas: una "evidence" textual solo puede ser un fragmento literal del documento.`;

export const OFFERING_SYSTEM = `${PREAMBLE}

Tarea: extraer la oferta (menú, catálogo o lista de servicios) y estimar el costo de cada ítem.
- Un ítem por producto vendible. Ignora encabezados, descripciones de la marca y textos legales.
- Si hay más de 60 ítems, prioriza los platos/productos principales y los de mayor precio; deja fuera variaciones menores.
- Costeo por sector:
  · Restaurante: componentes = ingredientes principales con costo estimado; el costo total suele estar entre 28 % y 38 % del precio en LATAM, ajusta por tipo de plato.
  · Retail: componentes = costo de mercancía y empaque; el costo total suele estar entre 40 % y 60 % del precio.
  · Servicios: componentes = horas de personal (a costo hora) e insumos; el costo total suele estar entre 30 % y 50 % del precio.
- cogsConfidence: high solo si el documento trae costos o recetas; med si el ítem es estándar del sector; low si estimas casi todo.
- popularityGuess: high para los clásicos, combos y lo que el propio documento destaca.
- Los precios se dejan en la moneda del documento; indica su código ISO en currency.`;

export const PAINS_SYSTEM = `${PREAMBLE}

Tarea: a partir de reseñas, comentarios de redes o notas de visita (OSINT), identificar los dolores operativos del negocio y sus fortalezas.
- Máximo 8 dolores y 4 fortalezas, ordenados por severidad.
- Cada dolor lleva una cita TEXTUAL como evidencia (fragmento literal, máx. 240 caracteres, en su idioma original). Si no existe una cita literal, deja evidence vacío.
- area: servicio, producto, tiempos, limpieza, ventas, equipo o comunicación.
- severity 1–5 combinando frecuencia (cuántas veces aparece) e impacto en ventas o experiencia.
- lever: la palanca operativa que lo corrige, una frase concreta (qué se hace distinto mañana).
- standardTitle: el nombre del manual o proceso de franquicia que lo resuelve, p. ej. "Estándar de tiempos de servicio en mesa" o "Guion de venta sugerida".
- Incluye al menos un dolor de ventas si hay señales de ticket bajo, poca venta sugerida o dependencia del dueño.`;

export const MARKETING_SYSTEM = `${PREAMBLE}

Tarea: a partir de una auditoría o notas de marketing, puntuar de 0 a 100 cinco ejes y proponer una acción rápida por eje.
- Ejes: marca (identidad y consistencia), contenido (cadencia y calidad), conversion (del interés a la visita o compra), presencia_local (Google Business, reseñas, mapa), atraccion_franquiciados (¿alguien que quiera comprar una franquicia así la encontraría y confiaría?).
- Cada eje: score, una línea de evidencia sacada del documento y un quick win ejecutable en 2 semanas.
- Tono constructivo: se describe la brecha, no se juzga al negocio.
- inputs: rellena solo los datos que aparezcan (handle, seguidores, cadencia, web, calificación de Google, pauta); el resto en null.`;

export const OPEX_SYSTEM = `${PREAMBLE}

Tarea: a partir de notas de ventas y gastos, armar el esqueleto de OPEX mensual.
- Líneas posibles: rent (arriendo), payroll (nómina), utilities (servicios públicos), marketing, other (otros). Incluye solo las que el documento respalde; no rellenes las que falten.
- monthlyValue en la moneda del documento (ISO en currency). Si el documento trae cifras anuales o semanales, conviértelas a mensuales y dilo en evidence.
- monthlySales: ventas mensuales promedio si aparecen; si no, null.
- confidence: high si la cifra es literal del documento; med si la derivas; low si la estimas.`;

export const IDEAS_SYSTEM = `${PREAMBLE}

Tarea: proponer exactamente 3 conceptos de campaña para la marca, usando su oferta, sus dolores y sus fortalezas.
- Canales distintos entre sí (p. ej. Instagram Reels, Google Business, WhatsApp, TikTok, alianzas locales, punto de venta).
- Al menos una campaña gira alrededor del plato o producto héroe ("campaña del plato héroe").
- Cada idea: título corto, canal, gancho en una frase, heroItem y una métrica de éxito medible en 30 días.
- Ideas ejecutables por un negocio local con presupuesto bajo; nada de producciones costosas.`;

export function offeringUserPrompt(brand: BrandContext): string {
  return `${brandContextText(brand)}\n\nExtrae la oferta completa de los documentos adjuntos y estima el costo de cada ítem siguiendo las reglas del sistema.`;
}

export function painsUserPrompt(brand: BrandContext): string {
  return `${brandContextText(brand)}\n\nIdentifica dolores y fortalezas en los documentos adjuntos (reseñas, redes, notas de visita) siguiendo las reglas del sistema.`;
}

export function marketingUserPrompt(brand: BrandContext): string {
  return `${brandContextText(brand)}\n\nPuntúa los cinco ejes de marketing a partir de los documentos adjuntos siguiendo las reglas del sistema.`;
}

export function opexUserPrompt(brand: BrandContext): string {
  return `${brandContextText(brand)}\n\nArma el esqueleto de OPEX mensual a partir de los documentos adjuntos siguiendo las reglas del sistema.`;
}

export function ideasUserPrompt(input: {
  brand: BrandContext;
  heroItems: string[];
  pains: string[];
  strengths: string[];
}): string {
  const list = (items: string[], empty: string) => (items.length ? items.map((i) => `- ${i}`).join("\n") : `- ${empty}`);
  return `${brandContextText(input.brand)}

Ítems héroe (mayor margen estimado):
${list(input.heroItems, "sin datos de oferta")}

Dolores detectados:
${list(input.pains, "sin OSINT cargado")}

Fortalezas:
${list(input.strengths, "sin fortalezas detectadas")}

Propón las 3 campañas.`;
}

export const AXIS_KEY_MAP = {
  marca: "marca",
  contenido: "contenido",
  conversion: "conversión",
  presencia_local: "presencia_local",
  atraccion_franquiciados: "atracción_franquiciados",
} as const satisfies Record<string, (typeof MARKETING_AXES)[number]>;
