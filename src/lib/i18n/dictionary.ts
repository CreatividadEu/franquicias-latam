/**
 * Diccionario tipado genérico: toda la copy de un módulo vive en
 * /messages/<modulo>.{es,en}.json y aquí solo hay `t()` con rutas de puntos
 * e interpolación `{{var}}`. Sin dependencia externa (la plataforma no tiene
 * infraestructura de i18n). Extraído del patrón del Sandbox para que Totto
 * Way lo reutilice; el Sandbox puede migrar a esta versión cuando se mergee.
 */

export type Locale = "es" | "en";
export const LOCALES: readonly Locale[] = ["es", "en"];

export function isLocale(value: unknown): value is Locale {
  return value === "es" || value === "en";
}

/** Rutas de puntos hacia hojas string del diccionario (autocompletado en t()). */
export type Leaves<T, P extends string = ""> = T extends string
  ? P
  : T extends readonly unknown[]
    ? never
    : {
        [K in keyof T & string]: Leaves<T[K], P extends "" ? K : `${P}.${K}`>;
      }[keyof T & string];

export type Vars = Record<string, string | number>;

function lookup(messages: unknown, key: string): unknown {
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

export type Dictionary<M extends object> = {
  messages: Record<Locale, M>;
  fallback: Locale;
  get(locale: Locale): M;
  /**
   * Traduce una hoja. Si la clave no existe devuelve la propia clave (visible
   * en QA, nunca un blanco) y cae al idioma base cuando el otro no la tiene.
   */
  translate(locale: Locale, key: Leaves<M>, vars?: Vars): string;
  createTranslator(locale: Locale): (key: Leaves<M>, vars?: Vars) => string;
};

export function createDictionary<M extends object>(
  messages: Record<Locale, M>,
  fallback: Locale = "es",
): Dictionary<M> {
  const get = (locale: Locale) => messages[locale] ?? messages[fallback];
  const translate = (locale: Locale, key: Leaves<M>, vars?: Vars) => {
    const primary = lookup(get(locale), key as string);
    const value = typeof primary === "string" ? primary : lookup(messages[fallback], key as string);
    return typeof value === "string" ? interpolate(value, vars) : (key as string);
  };
  return {
    messages,
    fallback,
    get,
    translate,
    createTranslator: (locale) => (key, vars) => translate(locale, key, vars),
  };
}
