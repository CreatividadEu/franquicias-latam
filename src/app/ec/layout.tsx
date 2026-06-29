import type { ReactNode } from "react";
import { HomeSiteNavbar } from "@/components/site/HomeSiteNavbar";
import { HomeSiteFooter } from "@/components/site/HomeSiteFooter";

// Ecuador market section shell — reuses the existing site chrome so /ec reads
// as "Franquicias Ecuador, by Franquicias LATAM". Root layout still provides
// <html>, fonts and the WhatsApp widget.
export default function EcuadorLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen text-[#171717]">
      <HomeSiteNavbar />
      {children}
      <HomeSiteFooter />
    </div>
  );
}
