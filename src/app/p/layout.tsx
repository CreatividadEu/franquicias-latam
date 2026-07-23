import type { Viewport } from "next";
import { Poppins } from "next/font/google";
import "./pitch.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0B0F0A",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function PitchLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div data-pitch-scope className={poppins.variable}>
      {children}
    </div>
  );
}
