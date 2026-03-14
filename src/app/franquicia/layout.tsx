import { Space_Grotesk, Inter } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export default function FranchisiaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${spaceGrotesk.variable} ${inter.variable}`}>
      {children}
    </div>
  );
}
