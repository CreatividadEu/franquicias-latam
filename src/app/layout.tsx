import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const satoshi = localFont({
  src: "../../public/fonts/Satoshi-Variable.ttf",
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Franquicias LATAM - Encuentra tu franquicia ideal",
  description:
    "Plataforma de franquicias en Latinoamerica. Encuentra la franquicia perfecta para invertir en Colombia, Mexico, Argentina, Chile, Peru y Ecuador.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${satoshi.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
