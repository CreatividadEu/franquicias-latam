import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Búsqueda de Marcas Colombia",
  description: "Módulo embebible para búsqueda de marcas registradas en Colombia."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
