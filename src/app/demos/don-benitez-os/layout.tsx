import type { Metadata } from "next";
import { DemoShell } from "./_components/DemoShell";

export const metadata: Metadata = {
  title: {
    default: "Don Benítez OS",
    template: "%s · Don Benítez OS",
  },
  description:
    "Sistema operativo para cadena de 10 puntos de comida mexicana en Colombia. Demo de FranquiciaOS con IA generativa.",
};

export default function DonBenitezOsLayout({ children }: { children: React.ReactNode }) {
  return <DemoShell>{children}</DemoShell>;
}
