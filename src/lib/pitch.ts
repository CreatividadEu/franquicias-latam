import { burnKey } from "@/config/clients";

// ── Burn after viewing ───────────────────────────────────────────────────────

/** Persiste el avance en localStorage + cookie espejo (un año). */
export function persistBurn(slug: string, progreso: number) {
  if (typeof window === "undefined") return;
  const key = burnKey(slug);
  try {
    window.localStorage.setItem(key, String(progreso));
  } catch {
    /* modo privado sin storage */
  }
  try {
    document.cookie = `${key}=${progreso}; Path=/; Max-Age=31536000; SameSite=Lax`;
  } catch {
    /* sin document */
  }
}

/**
 * Guard inline que corre ANTES del primer paint (script bloqueante servido
 * antes del flujo):
 *  - `?reset=eagle` limpia el flag (localStorage + cookie) para testear.
 *  - Si el server ya sirvió la versión quemada, re-sincroniza localStorage.
 *  - Si localStorage dice "visto" pero la cookie no llegó al server (p. ej.
 *    cookies borradas), oculta el flujo vía `html[data-pitch-burned]` y
 *    re-navega con `location.replace` para que el server sirva la pantalla
 *    final reducida. Sin FOUC: nada del flujo llega a pintarse.
 */
export function burnGuardScript(slug: string, serverBurned: boolean, reset: boolean): string {
  const key = JSON.stringify(burnKey(slug));
  let cuerpo: string;
  if (reset) {
    cuerpo =
      `try{localStorage.removeItem(k)}catch(e){}` +
      `document.cookie=k+"=; Path=/; Max-Age=0";`;
  } else if (serverBurned) {
    cuerpo = `try{if(!localStorage.getItem(k))localStorage.setItem(k,"1")}catch(e){}`;
  } else {
    cuerpo =
      `var v=null;try{v=localStorage.getItem(k)}catch(e){}` +
      `if(v){document.documentElement.setAttribute("data-pitch-burned","");` +
      `document.cookie=k+"="+encodeURIComponent(v)+"; Path=/; Max-Age=31536000; SameSite=Lax";` +
      `location.replace(location.pathname);}`;
  }
  return `(function(){try{var k=${key};${cuerpo}}catch(e){}})();`;
}

// ── Beacon de tracking ───────────────────────────────────────────────────────

export type PitchEvent = "view_completed" | "pay_click";

export function track(event: PitchEvent, slug: string) {
  if (typeof window === "undefined") return;
  try {
    const payload = JSON.stringify({ event, slug, ts: Date.now() });
    if (typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon("/api/track", new Blob([payload], { type: "application/json" }));
    } else {
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    /* los beacons nunca rompen la experiencia */
  }
}

// ── Utilidades de color ──────────────────────────────────────────────────────

/** `#A8F542` + alpha → `rgba(168, 245, 66, a)` (para keyframes de sombras). */
export function hexAlpha(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  if (Number.isNaN(n) || full.length !== 6) return `rgba(168, 245, 66, ${alpha})`;
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}
