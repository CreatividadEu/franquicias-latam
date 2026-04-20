import type { Metadata } from "next";

import { BenitezShell } from "@/components/benitez-os/benitez-shell";

export const metadata: Metadata = {
  title: {
    default: "Benítez OS",
    template: "%s | Benítez OS",
  },
  description:
    "Demo SaaS para una cadena multi-sede: talento, formación, operación y rentabilidad en una sola plataforma.",
};

export default function BenitezOsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BenitezShell>{children}</BenitezShell>;
}
