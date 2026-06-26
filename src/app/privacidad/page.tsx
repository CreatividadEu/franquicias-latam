import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de privacidad · Franquicias LATAM",
  description:
    "Cómo Franquicias LATAM trata los datos personales recolectados a través de sus páginas de oportunidades de franquicia.",
  robots: { index: true, follow: true },
};

// NOTE: Lightweight placeholder so consent links resolve. Replace with the
// canonical Franquicias LATAM privacy policy when available.
export default function PrivacidadPage() {
  return (
    <main
      style={{
        maxWidth: 760,
        margin: "0 auto",
        padding: "4rem 1.5rem 6rem",
        lineHeight: 1.7,
      }}
    >
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
        Política de privacidad
      </h1>
      <p style={{ color: "#666", marginBottom: "2rem" }}>
        Franquicias LATAM · última actualización {new Date().getFullYear()}
      </p>

      <section style={{ display: "grid", gap: "1.5rem" }}>
        <p>
          En Franquicias LATAM tratamos tus datos personales de acuerdo con la legislación aplicable
          de protección de datos. Esta página describe, de forma resumida, cómo recolectamos y usamos
          la información que nos compartes a través de nuestras páginas de oportunidades de franquicia,
          incluyendo la de Sajú.
        </p>
        <div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            Qué recolectamos
          </h2>
          <p>
            Nombre, correo electrónico, teléfono/WhatsApp, país y ciudad de interés, capacidad de
            inversión, experiencia empresarial y los mensajes que decidas enviarnos a través del
            formulario de aplicación.
          </p>
        </div>
        <div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>Para qué</h2>
          <p>
            Para evaluar tu perfil como candidato a franquiciado, contactarte sobre la oportunidad y,
            cuando corresponda, presentar tu solicitud a la marca (Sajú). No vendemos tus datos.
          </p>
        </div>
        <div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>Tus derechos</h2>
          <p>
            Puedes solicitar acceso, actualización o eliminación de tus datos escribiendo a Franquicias
            LATAM. Al enviar el formulario autorizas este tratamiento; puedes revocar tu autorización
            en cualquier momento.
          </p>
        </div>
      </section>

      <p style={{ marginTop: "3rem" }}>
        <a href="/saju" style={{ color: "#108474", textDecoration: "underline" }}>
          ← Volver a la oportunidad Sajú
        </a>
      </p>
    </main>
  );
}
