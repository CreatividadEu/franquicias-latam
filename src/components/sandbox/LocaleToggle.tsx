"use client";

import { useSandbox } from "./SandboxProvider";

/** Conmutador ES/EN (§1). Muestra el idioma al que se cambia. */
export default function LocaleToggle() {
  const { locale, setLocale, t } = useSandbox();
  return (
    <button
      type="button"
      onClick={() => setLocale(locale === "es" ? "en" : "es")}
      aria-label={t("common.languageName")}
      className="sb-chip transition-colors hover:border-[var(--sb-border-strong)]"
    >
      {t("common.language")}
    </button>
  );
}
