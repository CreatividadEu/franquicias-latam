import type { Metadata } from "next";
import { ProgramHero } from "@/components/program-landing/ProgramHero";
import { ProgramDifferenceSection } from "@/components/program-landing/ProgramDifferenceSection";
import { ProgramStepsSection } from "@/components/program-landing/ProgramStepsSection";
import { OpportunityLab } from "@/components/program-landing/OpportunityLab";
import { ProgramConsequencesSection } from "@/components/program-landing/ProgramConsequencesSection";
import { ProgramFitSection } from "@/components/program-landing/ProgramFitSection";
import { ProgramValidationSection } from "@/components/program-landing/ProgramValidationSection";
import { ProgramAdmissionSection } from "@/components/program-landing/ProgramAdmissionSection";
import { ProgramFinalCTA } from "@/components/program-landing/ProgramFinalCTA";
import { HomeSiteNavbar } from "@/components/site/HomeSiteNavbar";
import { HomeSiteFooter } from "@/components/site/HomeSiteFooter";

export const metadata: Metadata = {
  title: "Programa de Aceleración de Franquicias | Franquicias LATAM",
  description:
    "Aplica al Programa de Aceleración de Franquicias de Franquicias LATAM y modela en vivo el potencial de expansión de tu negocio.",
};

export default function ProgramaAceleracionFranquiciasPage() {
  return (
    <div className="min-h-screen text-[#171717]">
      <HomeSiteNavbar />

      <main>
        <ProgramHero />
        <ProgramDifferenceSection />
        <ProgramStepsSection />

        <div
          id="plataforma"
          className="scroll-mt-28 sm:scroll-mt-36"
          aria-hidden="true"
        />
        <OpportunityLab />
        <ProgramConsequencesSection />
        <ProgramFitSection />

        <div
          id="casos"
          className="scroll-mt-28 sm:scroll-mt-36"
          aria-hidden="true"
        />
        <ProgramValidationSection />
        <ProgramAdmissionSection />
        <ProgramFinalCTA />
      </main>

      <HomeSiteFooter />
    </div>
  );
}
