import { ImageResponse } from "next/og";
import { getProposal } from "@/lib/propuestas/data";

export const alt = "Propuesta privada — Franquicias LATAM";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** OG por cliente: preview lindo al compartir el link por WhatsApp. */
export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resolved = await getProposal(slug);
  // La ruta OG no recibe ?k=: si la propuesta está protegida con
  // accessKey, renderizamos la versión genérica (sin nombre ni oferta).
  const proposal = resolved && !resolved.accessKey ? resolved : null;
  const cliente = proposal?.cliente ?? "su marca";
  const acc = proposal?.acento ?? "#00F0FF";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#0A0F1E",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-200px",
            left: "300px",
            width: "700px",
            height: "500px",
            borderRadius: "9999px",
            background: `radial-gradient(closest-side, ${acc}33, transparent 70%)`,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-220px",
            right: "-80px",
            width: "600px",
            height: "450px",
            borderRadius: "9999px",
            background: "radial-gradient(closest-side, #7B61FF2E, transparent 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            color: "#8A8F9E",
            fontSize: "22px",
            letterSpacing: "6px",
            textTransform: "uppercase",
          }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "9999px",
              background: acc,
              display: "flex",
            }}
          />
          Franquicias LATAM · Propuesta privada
        </div>
        <div
          style={{
            marginTop: "36px",
            color: "#F0F0F5",
            fontSize: "76px",
            fontWeight: 700,
            letterSpacing: "-3px",
            lineHeight: 1.05,
            display: "flex",
            flexWrap: "wrap",
          }}
        >
          Hecho a medida para {cliente}.
        </div>
        <div
          style={{
            marginTop: "28px",
            color: "#8A8F9E",
            fontSize: "32px",
            letterSpacing: "-0.5px",
            display: "flex",
          }}
        >
          El futuro de su red de franquicias. En 5 fases.
        </div>
        {proposal ? (
          <div
            style={{
              marginTop: "56px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              color: acc,
              fontSize: "24px",
              fontWeight: 600,
            }}
          >
            Cupo {proposal.mesObjetivo} · {proposal.descuentoPct}% dcto
          </div>
        ) : null}
      </div>
    ),
    { ...size },
  );
}
