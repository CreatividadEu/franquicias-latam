import type { Metadata } from "next";
import { Jost, Poppins } from "next/font/google";
import "./saju.css";

// Live-store typography: Jost (headings) + Poppins (body). Self-hosted by next/font.
const jost = Jost({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jost",
  display: "swap",
});
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-poppins",
  display: "swap",
});

const TITLE = "Sajú · Franquicia Master en LATAM — presentada por Franquicias LATAM";
const DESCRIPTION =
  "La marca de gafas de Colombia que se está convirtiendo en la No.1 de LATAM abre Franquicia Master. Inversión desde $35K. Aplica a la oportunidad presentada por Franquicias LATAM.";

export const metadata: Metadata = {
  metadataBase: new URL("https://franquiciaslatam.com"),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/saju" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    locale: "es_CO",
    siteName: "Franquicias LATAM",
    images: [{ url: "/saju/saju-mono.png", width: 320, height: 320, alt: "Sajú" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/saju/saju-mono.png"],
  },
  icons: { icon: "/saju/saju-mono.png" },
  robots: { index: true, follow: true },
};

export default function SajuLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`saju-root ${jost.variable} ${poppins.variable}`}>
      {/* Progressive enhancement: if JS is disabled, force scroll-reveal content
          visible so no-JS users / crawlers never see a blank page. With JS, the
          base CSS keeps it hidden until Reveal animates it in. */}
      <noscript>
        <style>{`.saju-reveal{opacity:1 !important;transform:none !important}`}</style>
      </noscript>
      {children}
    </div>
  );
}
