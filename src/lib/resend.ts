import { Resend } from "resend";

const resendKey = process.env.RESEND_API_KEY;
export const resend = resendKey ? new Resend(resendKey) : null;

// Recipient for every new-lead notification (quiz + landing/contact forms).
// Overridable via env; defaults to the sales inbox.
const LEADS_NOTIFICATION_EMAIL =
  process.env.LEADS_NOTIFICATION_EMAIL ||
  process.env.ADMIN_EMAIL ||
  "dseneor@franquiciaslatam.co";

const FROM = "Franquicias LATAM <notificaciones@franquiciaslatam.co>";

export async function sendLeadNotification(lead: {
  name: string;
  email: string;
  phone: string;
  country: string;
  investmentRange: string;
  matchCount: number;
}) {
  if (!resend) {
    console.log("[DEV] Would send lead email to:", LEADS_NOTIFICATION_EMAIL, lead);
    return;
  }

  await resend.emails.send({
    from: FROM,
    to: LEADS_NOTIFICATION_EMAIL,
    subject: `Nuevo lead: ${lead.name} - ${lead.country}`,
    html: `
      <h2>Nuevo Lead Recibido</h2>
      <table style="border-collapse:collapse;width:100%">
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Nombre</td><td style="padding:8px;border:1px solid #ddd">${lead.name}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Email</td><td style="padding:8px;border:1px solid #ddd">${lead.email}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Telefono</td><td style="padding:8px;border:1px solid #ddd">${lead.phone}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Pais</td><td style="padding:8px;border:1px solid #ddd">${lead.country}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Inversion</td><td style="padding:8px;border:1px solid #ddd">${lead.investmentRange}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Franquicias Matcheadas</td><td style="padding:8px;border:1px solid #ddd">${lead.matchCount}</td></tr>
      </table>
      <p style="margin-top:16px"><a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin">Ver en el panel de administracion</a></p>
    `,
  });
}

// Notification for landing-page / contact-form leads (form_leads table),
// including the homepage "Contactar" modal (sourceType = home_contact).
export async function sendFormLeadNotification(lead: {
  name: string;
  email: string;
  phone: string;
  sourceType: string;
  franchiseSlug: string;
  investmentRange?: string;
  city?: string | null;
  country?: string | null;
  message?: string | null;
}) {
  if (!resend) {
    console.log("[DEV] Would send form-lead email to:", LEADS_NOTIFICATION_EMAIL, lead);
    return;
  }

  const row = (label: string, value?: string | null) =>
    value
      ? `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">${label}</td><td style="padding:8px;border:1px solid #ddd">${value}</td></tr>`
      : "";

  await resend.emails.send({
    from: FROM,
    to: LEADS_NOTIFICATION_EMAIL,
    subject: `Nuevo lead: ${lead.name} (${lead.sourceType})`,
    html: `
      <h2>Nuevo Lead Recibido</h2>
      <table style="border-collapse:collapse;width:100%">
        ${row("Nombre", lead.name)}
        ${row("Email", lead.email)}
        ${row("Telefono", lead.phone)}
        ${row("Origen", lead.sourceType)}
        ${row("Listing / Franquicia", lead.franchiseSlug)}
        ${row("Inversion", lead.investmentRange)}
        ${row("Ciudad", lead.city)}
        ${row("Pais", lead.country)}
        ${row("Mensaje", lead.message)}
      </table>
      <p style="margin-top:16px"><a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin/leads">Ver en el panel de administracion</a></p>
    `,
  });
}
