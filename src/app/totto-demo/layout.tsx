import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TOTTO × Franquicias LATAM — Manuales Inteligentes",
  description:
    "Demo exclusiva de manuales operativos y capacitación con IA para TOTTO",
};

export default function TottoDemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap"
        rel="stylesheet"
      />
      {children}
    </>
  );
}
