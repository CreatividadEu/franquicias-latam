import { Resend } from "resend";

const resendKey = process.env.RESEND_API_KEY;
export const resend = resendKey ? new Resend(resendKey) : null;

export async function sendLeadNotification(lead: {
  name: string;
  email: string;
  phone: string;
  country: string;
  investmentRange: string;
  matchCount: number;
}) {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@franquiciaslatam.co";

  if (!resend) {
    console.log("[DEV] Would send email to:", adminEmail, lead);
    return;
  }

  await resend.emails.send({
    from: "Franquicias LATAM <notificaciones@franquiciaslatam.co>",
    to: adminEmail,
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
