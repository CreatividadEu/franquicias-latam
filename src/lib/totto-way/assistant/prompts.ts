/**
 * Prompt y contexto del Asistente Totto Way (PLAN §9). El texto base viene
 * del brief; el contexto por persona se añade después para no romper la caché
 * del prefijo.
 */
import type { KbHit } from "./retrieval";

export const ASSISTANT_MODEL = (process.env.TOTTO_WAY_AI_MODEL ?? "claude-sonnet-5").trim();
export const ASSISTANT_MAX_TOKENS = 2000;

/** Súbelo cuando cambie el prompt: invalida la caché de prefijo. */
export const PROMPT_VERSION = "2026-09-07.1";

export const SYSTEM_PROMPT = `Eres el Asistente Totto Way, guía de formación de TOTTO en tienda.

Cómo respondes:
- En español, breve: nunca más de 90 palabras.
- Cálido y directo, de tú, frases cortas. El tono de la marca es "¿Listos? ¡Vamos!".
- Usa SOLO la base de conocimiento que se te entrega. Si la respuesta no está ahí, dilo con claridad y sugiere preguntarle al líder de tienda. No inventes procesos, cifras ni nombres de herramientas.
- Cuando expliques un proceso, cierra con una línea que empiece por "Traducción simple:".
- Cita siempre de dónde sale lo que dices (capítulo y misión). Las citas se generan solas a partir de los documentos: apóyate en ellos al redactar.
- No uses emojis.

Herramientas:
- search_kb: búscala cuando la pregunta toque algo que no venga en los documentos entregados.
- open_lesson: cuando la respuesta viva en una lección concreta, ábrela para que la persona la lea completa.
- show_benefit: para preguntas de beneficios.
- log_checkpoint_request: solo si la persona pide que le validen un checkpoint.`;

export type AssistantContext = {
  name: string | null;
  roleTitle: string;
  store: string | null;
  country: string | null;
  lesson: { title: string; chapter: string } | null;
};

/** Bloque de contexto: va después del prompt estable, nunca dentro de él. */
export function contextBlock(context: AssistantContext): string {
  const lines = [
    `Persona: ${context.name ?? "colaborador"} · ${context.roleTitle}`,
    context.store ? `Tienda: ${context.store}${context.country ? ` (${context.country})` : ""}` : null,
    context.lesson ? `Está leyendo: ${context.lesson.chapter} · ${context.lesson.title}` : null,
  ].filter(Boolean);
  return `Contexto de quien pregunta:\n${lines.join("\n")}`;
}

/**
 * Los fragmentos recuperados viajan como bloques `document` con citas
 * activadas: así las citas vienen estructuradas del modelo y no hay que
 * confiar en que las escriba bien en el texto.
 */
export function documentBlocks(hits: KbHit[]) {
  return hits.map((hit) => ({
    type: "document" as const,
    source: { type: "text" as const, media_type: "text/plain" as const, data: hit.text },
    title: hit.title,
    citations: { enabled: true },
  }));
}

/** Normaliza una pregunta para agregarla sin guardar quién la hizo. */
export function normalizeQuestion(question: string): string {
  return question
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
}
