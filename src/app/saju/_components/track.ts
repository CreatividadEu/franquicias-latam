/**
 * Analytics stub — GA4 / Plausible / dataLayer ready.
 * Fires named events; no-ops cleanly when no analytics layer is present.
 */
export type SajuEvent =
  | "cta_click"
  | "form_start"
  | "form_submit_success"
  | "form_submit_error";

type Win = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  plausible?: (name: string, opts?: { props?: Record<string, unknown> }) => void;
};

export function track(event: SajuEvent, props: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const w = window as Win;
  const payload = { campaign: "saju-franquicias", source: "saju", ...props };
  try {
    w.dataLayer?.push({ event, ...payload });
    w.gtag?.("event", event, payload);
    w.plausible?.(event, { props: payload });
    if (process.env.NODE_ENV !== "production") {
      console.debug(`[saju:analytics] ${event}`, payload);
    }
  } catch {
    /* analytics must never break the page */
  }
}
