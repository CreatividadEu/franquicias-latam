/**
 * Diccionario tipado genérico: toda la copy de un módulo vive en
 * /messages/<modulo>.<locale>.json y aquí solo hay `t()` con rutas de puntos e
 * interpolación `{{var}}`. Sin dependencia externa (la plataforma no tiene
 * infraestructura de i18n).
 *
 * Los idiomas se resuelven por **cadena de respaldo**: un locale regional solo
 * necesita declarar lo que cambia (es-MX no repite 257 claves para decir
 * "mochila" en vez de "morral") y cae a su base para el resto.
 */

export type Vars = Record<string, string | number>;

/**
 * Un idioma regional solo declara lo que cambia, y puede hacerlo a cualquier
 * profundidad del árbol: `Partial` no basta porque es superficial.
 */
export type DeepPartial<T> = T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;

/** Rutas de puntos hacia hojas string del diccionario (autocompletado en t()). */
export type Leaves<T, P extends string = ""> = T extends string
  ? P
  : T extends readonly unknown[]
    ? never
    : {
        [K in keyof T & string]: Leaves<T[K], P extends "" ? K : `${P}.${K}`>;
      }[keyof T & string];

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

export type DictionaryConfig<L extends string> = {
  /** Idioma completo del que cuelgan todos los demás. */
  base: L;
  /** A qué idioma cae cada uno cuando le falta una clave. Sin entrada, cae al base. */
  fallbacks?: Partial<Record<L, L>>;
};

export type Dictionary<L extends string, M extends object> = {
  locales: readonly L[];
  base: L;
  isLocale(value: unknown): value is L;
  /** Cadena de resolución de un idioma, del más específico al base. */
  chain(locale: L): L[];
  get(locale: L): M;
  /**
   * Traduce una hoja recorriendo la cadena de respaldo. Si no existe en
   * ninguno devuelve la propia clave, que es visible en QA y nunca un blanco.
   */
  translate(locale: L, key: Leaves<M>, vars?: Vars): string;
  createTranslator(locale: L): (key: Leaves<M>, vars?: Vars) => string;
};

export function createDictionary<L extends string, M extends object>(
  messages: Record<L, DeepPartial<M>>,
  config: DictionaryConfig<L>,
): Dictionary<L, M> {
  const locales = Object.keys(messages) as L[];
  const base = config.base;
  const fallbacks: Partial<Record<L, L>> = config.fallbacks ?? {};

  const chain = (locale: L): L[] => {
    const seen: L[] = [];
    let current: L | undefined = locales.includes(locale) ? locale : base;
    while (current && !seen.includes(current)) {
      seen.push(current);
      current = fallbacks[current];
    }
    if (!seen.includes(base)) seen.push(base);
    return seen;
  };

  const translate = (locale: L, key: Leaves<M>, vars?: Vars): string => {
    for (const step of chain(locale)) {
      const value = lookup(messages[step], key as string);
      if (typeof value === "string") return interpolate(value, vars);
    }
    return key as string;
  };

  return {
    locales,
    base,
    isLocale: (value: unknown): value is L => typeof value === "string" && (locales as string[]).includes(value),
    chain,
    get: (locale: L) => (messages[locales.includes(locale) ? locale : base] ?? messages[base]) as M,
    translate,
    createTranslator: (locale) => (key, vars) => translate(locale, key, vars),
  };
}
