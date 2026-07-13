// Página de expiración del dossier: elegante, de marca, sin contenido.
// Server component puro (sin estado): el enforcement vive en la page.
export function DossierExpired() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 26,
        padding: "48px 24px",
        background: "#17130F",
        color: "#F4F0E8",
        fontFamily: "var(--font-archivo), system-ui, sans-serif",
        textAlign: "center",
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.34em",
          color: "#C9A44C",
        }}
      >
        FRANQUICIAS LATAM · CONFIDENCIAL
      </p>
      <div
        aria-hidden
        style={{
          width: 64,
          height: 1,
          background: "rgba(201, 164, 76, 0.45)",
        }}
      />
      <h1
        style={{
          margin: 0,
          fontFamily: "var(--font-cinzel), serif",
          fontWeight: 900,
          fontSize: "clamp(30px, 5vw, 52px)",
          lineHeight: 1.15,
          letterSpacing: "0.02em",
        }}
      >
        Este dossier
        <br />
        ha expirado
      </h1>
      <p
        style={{
          margin: 0,
          maxWidth: 460,
          fontSize: 15.5,
          lineHeight: 1.7,
          color: "#6E6860",
        }}
      >
        La ventana de esta propuesta se cerró. Si deseas retomar la
        conversación, nuestro equipo puede preparar una nueva propuesta para
        Pampa Malbec.
      </p>
      <a
        href="https://wa.me/34695126804?text=Hola%2C%20quisiera%20solicitar%20una%20nueva%20propuesta%20para%20Pampa%20Malbec"
        target="_blank"
        rel="noreferrer"
        style={{
          display: "inline-block",
          marginTop: 6,
          padding: "15px 34px",
          background: "#A31621",
          color: "#F4F0E8",
          fontSize: 13,
          fontWeight: 800,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          textDecoration: "none",
        }}
      >
        Solicitar nueva propuesta →
      </a>
      <p
        style={{
          margin: 0,
          fontSize: 11,
          letterSpacing: "0.22em",
          color: "#6E6860",
        }}
      >
        FRANQUICIASLATAM.COM
      </p>
    </main>
  );
}
