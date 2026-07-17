import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Seneca Int. — Inteligencia comercial para Bamicol",
  description:
    "Escriba el nombre de un cliente potencial y Seneca mapea sus dolores, su comité de compra y el portafolio Bamicol que los resuelve. Radar B2B de oportunidades en Colombia.",
};

export default function SenecaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
        rel="stylesheet"
      />
      {/* El widget global de WhatsApp de Franquicias LATAM no aplica en la demo Bamicol */}
      <style>{`.wa-widget{display:none!important}`}</style>
      {children}
    </>
  );
}
