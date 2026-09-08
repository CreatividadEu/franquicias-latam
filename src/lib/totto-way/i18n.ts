/**
 * i18n de Totto Way. Base es-CO en messages/totto-way.es.json; el inglés
 * debe tener exactamente la misma forma (tests/totto-way-i18n.test.ts).
 */
import es from "../../../messages/totto-way.es.json";
import en from "../../../messages/totto-way.en.json";
import { createDictionary, isLocale, type Leaves, type Locale } from "@/lib/i18n/dictionary";

export type TwLocale = Locale;
export type TwMessages = typeof es;
export type TwMessageKey = Leaves<TwMessages>;

export const TW_DICTIONARY = createDictionary<TwMessages>({ es, en: en as TwMessages }, "es");
export const TW_MESSAGES = TW_DICTIONARY.messages;

export const isTwLocale = isLocale;
export const getTwMessages = TW_DICTIONARY.get;
export const translate = TW_DICTIONARY.translate;
export const createTranslator = TW_DICTIONARY.createTranslator;
export type TwTranslator = ReturnType<typeof createTranslator>;

export function resolveTwLocale(value: unknown): TwLocale {
  return isLocale(value) ? value : "es";
}
