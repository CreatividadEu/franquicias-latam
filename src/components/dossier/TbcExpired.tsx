// Pantalla de expiración de la propuesta The Body Concept. Mismo rol que
// DossierExpired (Pampa Malbec) pero con la identidad menta de la marca.
const WA_URL =
  "https://wa.me/34695126804?text=" +
  encodeURIComponent(
    "Hola Daniel — soy de The Body Concept. El link de la propuesta expiró; ¿me generas un acceso nuevo?",
  );

export function TbcExpired() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(160deg, #a3deba 0%, #8fd3ab 55%, #7cc79c 100%)",
        fontFamily: "var(--font-quick), 'Quicksand', sans-serif",
        padding: "2rem",
        textAlign: "center",
        color: "#1e4632",
      }}
    >
      <div style={{ maxWidth: 520 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/dossier/tbc/wordmark-white.png"
          alt="The Body Concept"
          style={{ width: 220, margin: "0 auto 2.2rem", display: "block" }}
        />
        <p
          style={{
            fontFamily: "var(--font-mont), 'Montserrat', sans-serif",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.85)",
            marginBottom: "0.9rem",
          }}
        >
          Propuesta confidencial
        </p>
        <h1
          style={{
            fontFamily: "var(--font-mont), 'Montserrat', sans-serif",
            fontSize: "clamp(1.7rem, 4.5vw, 2.4rem)",
            fontWeight: 800,
            color: "#fff",
            lineHeight: 1.15,
            marginBottom: "1.1rem",
          }}
        >
          Este acceso ha expirado.
        </h1>
        <p style={{ fontSize: 17, lineHeight: 1.65, marginBottom: "2rem" }}>
          La ventana de lectura de esta propuesta se ha cerrado. Si el
          proyecto sigue sobre la mesa, pídenos un acceso nuevo y lo emitimos
          en minutos.
        </p>
        <a
          href={WA_URL}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "inline-block",
            background: "#fff",
            color: "#2c7a52",
            fontFamily: "var(--font-mont), 'Montserrat', sans-serif",
            fontWeight: 700,
            fontSize: 15,
            padding: "0.95rem 2.1rem",
            borderRadius: 999,
            textDecoration: "none",
            boxShadow: "0 10px 30px rgba(30,70,50,0.25)",
          }}
        >
          Solicitar acceso nuevo →
        </a>
        <p
          style={{
            marginTop: "1.4rem",
            fontSize: 13.5,
            color: "rgba(255,255,255,0.9)",
          }}
        >
          Franquicias LATAM · dseneor@franquiciaslatam.co
        </p>
      </div>
    </main>
  );
}
