/**
 * i18n del Sandbox. Toda la copy vive en /messages/sandbox.{es,en}.json (§1);
 * aquí solo hay el diccionario tipado y un `t()` con rutas de puntos e
 * interpolación `{{var}}`. Sin dependencia externa: la plataforma no tiene
 * infraestructura de i18n y el Sandbox es el único módulo bilingüe.
 */
import es from "../../../messages/sandbox.es.json";
import en from "../../../messages/sandbox.en.json";

export type SandboxLocale = "es" | "en";
export const SANDBOX_LOCALES: readonly SandboxLocale[] = ["es", "en"];

export type SandboxMessages = typeof es;

/** Rutas de puntos hacia hojas string del diccionario (autocompletado en t()). */
type Leaves<T, P extends string = ""> = T extends string
  ? P
  : T extends readonly unknown[]
    ? never
    : {
        [K in keyof T & string]: Leaves<T[K], P extends "" ? K : `${P}.${K}`>;
      }[keyof T & string];

export type SandboxMessageKey = Leaves<SandboxMessages>;

export const SANDBOX_MESSAGES: Record<SandboxLocale, SandboxMessages> = {
  es,
  // El JSON en inglés debe tener exactamente la misma forma (tests/sandbox-i18n).
  en: en as SandboxMessages,
};

export function isSandboxLocale(value: unknown): value is SandboxLocale {
  return value === "es" || value === "en";
}

export function getSandboxMessages(locale: SandboxLocale): SandboxMessages {
  return SANDBOX_MESSAGES[locale] ?? SANDBOX_MESSAGES.es;
}

type Vars = Record<string, string | number>;

function lookup(messages: SandboxMessages, key: string): unknown {
  return key.split(".").reduce<unknown>((node, part) => {
    if (node && typeof node === "object" && part in (node as Record<string, unknown>)) {
      return (node as Record<string, unknown>)[part];
    }
    return undefined;
  }, messages);
}

export function interpolate(template: string, vars?: Vars): string {
  if (!vars) return template;
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, name: string) =>
    name in vars ? String(vars[name]) : `{{${name}}}`,
  );
}

/**
 * Traduce una hoja del diccionario. Si la clave no existe devuelve la propia
 * clave (visible en QA, nunca un blanco) y cae al español cuando el inglés
 * no la tiene.
 */
export function translate(
  locale: SandboxLocale,
  key: SandboxMessageKey,
  vars?: Vars,
): string {
  const primary = lookup(getSandboxMessages(locale), key);
  const value =
    typeof primary === "string" ? primary : lookup(SANDBOX_MESSAGES.es, key);
  return typeof value === "string" ? interpolate(value, vars) : key;
}

export type Translator = (key: SandboxMessageKey, vars?: Vars) => string;

export function createTranslator(locale: SandboxLocale): Translator {
  return (key, vars) => translate(locale, key, vars);
}

/** Devuelve todas las rutas de hojas (string o array) de un diccionario. */
export function collectLeafPaths(node: unknown, prefix = ""): string[] {
  if (typeof node === "string" || Array.isArray(node)) return [prefix];
  if (node && typeof node === "object") {
    return Object.entries(node as Record<string, unknown>).flatMap(([k, v]) =>
      collectLeafPaths(v, prefix ? `${prefix}.${k}` : k),
    );
  }
  return [];
}
