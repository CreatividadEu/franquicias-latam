/**
 * Notificaciones de Totto Way sobre Resend (PLAN §10). Una sola plantilla con
 * los tokens de marca; si no hay `RESEND_API_KEY` se registra en consola y no
 * se lanza, igual que el resto de la plataforma.
 */
import { resend } from "@/lib/resend";

const FROM = "Totto Way <notificaciones@franquiciaslatam.co>";
// `.trim()` no es cosmético: la variable guardada en Vercel arrastra un salto
// de línea y sin recortarlo todos los enlaces de los recordatorios salen rotos.
const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "https://franquiciaslatam.co").trim().replace(/\/+$/, "");

type Cta = { label: string; path: string };

function template(options: { eyebrow: string; title: string; body: string; cta?: Cta; footer?: string }): string {
  const { eyebrow, title, body, cta, footer } = options;
  return `<!doctype html>
<html lang="es"><body style="margin:0;padding:24px;background:#F4F4F4;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#111">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#fff;border-radius:18px;overflow:hidden">
    <tr><td style="background:#000;padding:22px 26px">
      <div style="color:#FCCE01;font-size:11px;letter-spacing:.14em;text-transform:uppercase;font-weight:500">${eyebrow}</div>
      <div style="color:#fff;font-size:24px;letter-spacing:-.03em;font-weight:500;margin-top:8px">${title}</div>
    </td></tr>
    <tr><td style="padding:26px">
      <p style="margin:0;font-size:16px;line-height:1.5;color:#333">${body}</p>
      ${
        cta
          ? `<p style="margin:24px 0 0"><a href="${BASE_URL}${cta.path}" style="display:inline-block;background:#FCCE01;color:#000;text-decoration:none;padding:14px 22px;border-radius:12px;font-weight:500;font-size:15px">${cta.label}</a></p>`
          : ""
      }
      ${footer ? `<p style="margin:22px 0 0;font-size:13px;color:#666">${footer}</p>` : ""}
    </td></tr>
    <tr><td style="padding:16px 26px;border-top:1px solid #E5E5E5;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#999">
      Totto Way · ¿Listos? ¡Vamos!
    </td></tr>
  </table>
</body></html>`;
}

async function send(to: string, subject: string, html: string, tag: string): Promise<boolean> {
  if (!resend) {
    console.log(`[totto-way/notify] (sin RESEND_API_KEY) ${tag} → ${to}: ${subject}`);
    return false;
  }
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
    return true;
  } catch (error) {
    console.error(`[totto-way/notify] fallo enviando ${tag} a ${to}:`, error);
    return false;
  }
}

/** El líder validó un checkpoint: el colaborador cobra su XP. */
export function notifyCheckpointValidated(input: {
  to: string;
  name: string | null;
  chapter: string;
  xp: number;
  validatedBy: string | null;
}) {
  const who = input.validatedBy ? ` por ${input.validatedBy}` : "";
  return send(
    input.to,
    `Checkpoint validado · +${input.xp} XP`,
    template({
      eyebrow: "Checkpoint validado",
      title: `+${input.xp} XP para ti`,
      body: `${input.name ?? "Hola"}: tu checkpoint de <b>${input.chapter}</b> quedó validado${who}. Los puntos ya están en tu cuenta y en la Liga de tu tienda.`,
      cta: { label: "Ver mi viaje", path: "/totto-way/mi-viaje" },
    }),
    "checkpoint",
  );
}

/** Recordatorio diario con la lección pendiente. */
export function notifyDailyReminder(input: { to: string; name: string | null; lesson: string; xp: number }) {
  return send(
    input.to,
    "Tu lección de hoy en Totto Way",
    template({
      eyebrow: "Hoy en tienda",
      title: input.lesson,
      body: `${input.name ?? "Hola"}: te quedan pocos minutos para sumar <b>+${input.xp} XP</b> y mover a tu tienda en la Liga.`,
      cta: { label: "Continuar lección", path: "/totto-way/aprender" },
      footer: "Puedes desactivar este recordatorio desde tu perfil.",
    }),
    "reminder",
  );
}

/** Aviso al líder: gente sin actividad en más de una semana. */
export function notifyInactivity(input: { to: string; leaderName: string | null; members: string[]; days: number }) {
  const list = input.members.map((name) => `<li style="margin:4px 0">${name}</li>`).join("");
  return send(
    input.to,
    `${input.members.length} persona(s) sin avanzar en Totto Way`,
    template({
      eyebrow: "Panel líder",
      title: "Tu equipo necesita un empujón",
      body: `${input.leaderName ?? "Hola"}: estas personas llevan más de ${input.days} días sin registrar actividad.<ul style="margin:14px 0 0;padding-left:18px">${list}</ul>`,
      cta: { label: "Abrir el panel", path: "/totto-way/lider" },
    }),
    "inactivity",
  );
}

/** Cambio de posición de la tienda en la Liga. */
export function notifyLeagueChange(input: { to: string; name: string | null; store: string; position: number; delta: number }) {
  const up = input.delta > 0;
  return send(
    input.to,
    `${input.store} ahora es #${input.position} en la Liga`,
    template({
      eyebrow: "Liga de la Expedición",
      title: up ? `Subieron a #${input.position}` : `Ahora van #${input.position}`,
      body: `${input.name ?? "Hola"}: <b>${input.store}</b> ${up ? "subió" : "bajó"} ${Math.abs(input.delta)} posición(es) esta semana.`,
      cta: { label: "Ver la Liga", path: "/totto-way/liga" },
    }),
    "league",
  );
}

/** El colaborador pide, desde el Asistente, que le validen un checkpoint. */
export function notifyCheckpointRequest(input: {
  to: string;
  leaderName: string | null;
  memberName: string | null;
  chapter: string;
  note: string;
}) {
  return send(
    input.to,
    `${input.memberName ?? "Un colaborador"} pide validar un checkpoint`,
    template({
      eyebrow: "Checkpoint pendiente",
      title: input.chapter,
      body: `${input.leaderName ?? "Hola"}: <b>${input.memberName ?? "un colaborador"}</b> terminó el capítulo y pide que le valides el checkpoint.<br><br>“${input.note}”`,
      cta: { label: "Abrir el panel", path: "/totto-way/lider" },
    }),
    "checkpoint-request",
  );
}
