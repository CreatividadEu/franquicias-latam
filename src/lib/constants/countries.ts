/**
 * CANONICAL COUNTRY LIST
 *
 * This is the single source of truth for all country data across the platform.
 * Includes all Latin American countries (except Cuba) + Spain + United States.
 *
 * DO NOT duplicate this list elsewhere in the codebase.
 */

export const COUNTRIES = [
  // Latin America
  { code: "AR", name: "Argentina", flag: "🇦🇷", phoneCode: "+54" },
  { code: "BO", name: "Bolivia", flag: "🇧🇴", phoneCode: "+591" },
  { code: "BR", name: "Brazil", flag: "🇧🇷", phoneCode: "+55" },
  { code: "CL", name: "Chile", flag: "🇨🇱", phoneCode: "+56" },
  { code: "CO", name: "Colombia", flag: "🇨🇴", phoneCode: "+57" },
  { code: "CR", name: "Costa Rica", flag: "🇨🇷", phoneCode: "+506" },
  { code: "DO", name: "Dominican Republic", flag: "🇩🇴", phoneCode: "+1-809" },
  { code: "EC", name: "Ecuador", flag: "🇪🇨", phoneCode: "+593" },
  { code: "SV", name: "El Salvador", flag: "🇸🇻", phoneCode: "+503" },
  { code: "GT", name: "Guatemala", flag: "🇬🇹", phoneCode: "+502" },
  { code: "HN", name: "Honduras", flag: "🇭🇳", phoneCode: "+504" },
  { code: "MX", name: "Mexico", flag: "🇲🇽", phoneCode: "+52" },
  { code: "NI", name: "Nicaragua", flag: "🇳🇮", phoneCode: "+505" },
  { code: "PA", name: "Panama", flag: "🇵🇦", phoneCode: "+507" },
  { code: "PY", name: "Paraguay", flag: "🇵🇾", phoneCode: "+595" },
  { code: "PE", name: "Peru", flag: "🇵🇪", phoneCode: "+51" },
  { code: "UY", name: "Uruguay", flag: "🇺🇾", phoneCode: "+598" },
  { code: "VE", name: "Venezuela", flag: "🇻🇪", phoneCode: "+58" },

  // Spain & USA
  { code: "ES", name: "Spain", flag: "🇪🇸", phoneCode: "+34" },
  { code: "US", name: "United States", flag: "🇺🇸", phoneCode: "+1" },
] as const;

/**
 * Type-safe country code
 */
export type CountryCode = typeof COUNTRIES[number]["code"];

/**
 * Type-safe country object
 */
export type Country = typeof COUNTRIES[number];

/**
 * Get country by code
 */
export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find((c) => c.code === code);
}

/**
 * Get country name by code
 */
export function getCountryName(code: string): string | undefined {
  return getCountryByCode(code)?.name;
}

/**
 * Validate if a country code is supported
 */
export function isValidCountryCode(code: string): code is CountryCode {
  return COUNTRIES.some((c) => c.code === code);
}

/**
 * Get all country codes
 */
export function getCountryCodes(): CountryCode[] {
  return COUNTRIES.map((c) => c.code);
}
