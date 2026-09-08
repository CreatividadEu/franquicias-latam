/**
 * i18n de Totto Way. Base es-CO en messages/totto-way.es.json.
 *
 * Idiomas: `es` (base, es-CO), `es-MX` (solo lo que cambia: mochila en vez de
 * morral, etc.), `en` y `pt-BR`, ambos completos. Los regionales caen a su
 * base por la cadena de respaldo del diccionario, así que añadir es-ES mañana
 * es un JSON con las cinco palabras que difieran.
 */
import es from "../../../messages/totto-way.es.json";
import esMX from "../../../messages/totto-way.es-MX.json";
import en from "../../../messages/totto-way.en.json";
import ptBR from "../../../messages/totto-way.pt-BR.json";
import { createDictionary, type DeepPartial, type Leaves } from "@/lib/i18n/dictionary";

export type TwMessages = typeof es;
export type TwMessageKey = Leaves<TwMessages>;
export type TwLocale = "es" | "es-MX" | "en" | "pt-BR";

export const TW_DICTIONARY = createDictionary<TwLocale, TwMessages>(
  {
    es,
    // es-MX solo declara lo que cambia; el resto cae al español base.
    "es-MX": esMX as DeepPartial<TwMessages>,
    en: en as TwMessages,
    "pt-BR": ptBR as TwMessages,
  },
  { base: "es", fallbacks: { "es-MX": "es", "pt-BR": "es", en: "es" } },
);

export const TW_LOCALES = TW_DICTIONARY.locales;
export const TW_MESSAGES = { es, "es-MX": esMX, en, "pt-BR": ptBR };

/** Etiqueta que ve el colaborador al elegir idioma en su perfil. */
export const TW_LOCALE_LABELS: Record<TwLocale, string> = {
  es: "Español",
  "es-MX": "Español (MX)",
  en: "English",
  "pt-BR": "Português",
};

/** Locale de `Intl` para fechas y números. */
export const TW_INTL_LOCALE: Record<TwLocale, string> = {
  es: "es-CO",
  "es-MX": "es-MX",
  en: "en-US",
  "pt-BR": "pt-BR",
};

export const isTwLocale = TW_DICTIONARY.isLocale;
export const getTwMessages = TW_DICTIONARY.get;
export const translate = TW_DICTIONARY.translate;
export const createTranslator = TW_DICTIONARY.createTranslator;
export type TwTranslator = ReturnType<typeof createTranslator>;

export function resolveTwLocale(value: unknown): TwLocale {
  return isTwLocale(value) ? value : "es";
}

/** Formateador de fechas y números acorde al idioma elegido. */
export function intlLocale(locale: TwLocale): string {
  return TW_INTL_LOCALE[locale] ?? "es-CO";
}

/**
 * Plural simple: la copy declara `clave` y `claveOne`, y aquí se elige. El
 * español, el inglés y el portugués comparten la misma regla (1 vs. resto),
 * así que no hace falta Intl.PluralRules.
 */
export function plural(t: TwTranslator, key: TwMessageKey, n: number, vars: Record<string, string | number> = {}): string {
  const singular = `${key}One` as TwMessageKey;
  return n === 1 ? t(singular, { n, ...vars }) : t(key, { n, ...vars });
}
