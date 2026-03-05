import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const satoshi = localFont({
  src: [
    { path: "../../public/fonts/Satoshi-Light.ttf", weight: "300", style: "normal" },
    { path: "../../public/fonts/Satoshi-Regular.ttf", weight: "400", style: "normal" },
    { path: "../../public/fonts/Satoshi-Medium.ttf", weight: "500", style: "normal" },
    { path: "../../public/fonts/Satoshi-Bold.ttf", weight: "700", style: "normal" },
    { path: "../../public/fonts/Satoshi-Black.ttf", weight: "900", style: "normal" },
  ],
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
