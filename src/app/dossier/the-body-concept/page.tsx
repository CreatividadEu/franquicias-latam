import type { Metadata } from "next";
import { Montserrat, Quicksand } from "next/font/google";
import { TheBodyConceptDossier } from "@/components/dossier/TheBodyConceptDossier";

// Montserrat hace de Gotham (titulares en caja alta del dossier de la marca);
// Quicksand replica la sans redondeada del cuerpo de texto.
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-mont",
  display: "swap",
});

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-quick",
  display: "swap",
});

// Link abierto por decisión del cliente: sin llaves ni invitaciones. La página
// sigue sin indexarse — es una propuesta comercial, no contenido público.
export const metadata: Metadata = {
  title: "El Motor Financiero — The Body Concept · Confidencial",
  robots: { index: false, follow: false, nocache: true },
};

// Vencimiento de la ventana de pago inicial (7 días desde la emisión de la
// propuesta, 18 de julio de 2026 → 25 de julio, 23:59 Madrid). Al vencer, la
// barra de countdown se cierra pero la página sigue accesible.
const PAYMENT_WINDOW_DEADLINE = "2026-07-25T21:59:00Z";

export default function TheBodyConceptDossierPage() {
  return (
    <div className={`${montserrat.variable} ${quicksand.variable}`}>
      <TheBodyConceptDossier deadlineIso={PAYMENT_WINDOW_DEADLINE} />
    </div>
  );
}
