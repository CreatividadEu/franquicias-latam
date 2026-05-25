import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Talent OS · Demo",
  description: "Demo aislado de Talent OS para Don Benítez.",
  robots: { index: false, follow: false },
};

export default function DemosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
