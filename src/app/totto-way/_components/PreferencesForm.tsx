"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { PreferencesInput } from "../(app)/perfil/actions";
import { updatePreferences } from "../(app)/perfil/actions";
import { useToast } from "./TwToast";

export type PreferencesCopy = {
  locale: string;
  reminder: string;
  reminderHint: string;
  league: string;
  leagueHint: string;
  save: string;
  saving: string;
  saved: string;
};

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} className="tw-switch" onClick={() => onChange(!checked)} />
  );
}

export function PreferencesForm({ initial, copy }: { initial: PreferencesInput; copy: PreferencesCopy }) {
  const [prefs, setPrefs] = useState<PreferencesInput>(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const { showToast } = useToast();
  const router = useRouter();

  const dirty =
    prefs.locale !== initial.locale ||
    prefs.dailyReminder !== initial.dailyReminder ||
    prefs.leagueAlerts !== initial.leagueAlerts;

  const save = () =>
    startTransition(async () => {
      setError(null);
      const result = await updatePreferences(prefs);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      showToast(copy.saved);
      router.refresh();
    });

  return (
    <div style={{ display: "grid", gap: 4 }}>
      <div className="tw-pref-row">
        <span className="tw-list-row__title">{copy.locale}</span>
        <div className="tw-seg">
          {(["es", "en"] as const).map((code) => (
            <button
              key={code}
              type="button"
              className={`tw-seg__btn${prefs.locale === code ? " is-active" : ""}`}
              onClick={() => setPrefs((prev) => ({ ...prev, locale: code }))}
            >
              {code === "es" ? "Español" : "English"}
            </button>
          ))}
        </div>
      </div>

      <div className="tw-pref-row">
        <span style={{ display: "grid", gap: 2 }}>
          <span className="tw-list-row__title">{copy.reminder}</span>
          <span className="tw-small tw-muted">{copy.reminderHint}</span>
        </span>
        <Switch checked={prefs.dailyReminder} label={copy.reminder} onChange={(value) => setPrefs((prev) => ({ ...prev, dailyReminder: value }))} />
      </div>

      <div className="tw-pref-row">
        <span style={{ display: "grid", gap: 2 }}>
          <span className="tw-list-row__title">{copy.league}</span>
          <span className="tw-small tw-muted">{copy.leagueHint}</span>
        </span>
        <Switch checked={prefs.leagueAlerts} label={copy.league} onChange={(value) => setPrefs((prev) => ({ ...prev, leagueAlerts: value }))} />
      </div>

      {error ? (
        <p className="tw-error" role="alert">
          {error}
        </p>
      ) : null}

      <button type="button" className="tw-btn tw-btn--black tw-btn--sm" onClick={save} disabled={pending || !dirty} style={{ justifySelf: "start", marginTop: 8 }}>
        {pending ? copy.saving : copy.save}
      </button>
    </div>
  );
}
