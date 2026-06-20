import type { ReactNode } from "react";
import { HomeSiteNavbar } from "@/components/site/HomeSiteNavbar";
import { HomeSiteFooter } from "@/components/site/HomeSiteFooter";

// Colombia market section shell — reuses the existing site chrome so /co reads
// as "Franquicias Colombia, by Franquicias LATAM". Root layout still provides
// <html>, fonts and the WhatsApp widget.
export default function ColombiaLayout({
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
