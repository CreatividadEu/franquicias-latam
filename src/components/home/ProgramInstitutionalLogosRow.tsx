import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  programInstitutionalLogos,
  type BrandLogo,
} from "@/components/home/homeBrandData";

type ProgramInstitutionalLogosRowProps = {
  logos?: BrandLogo[];
  className?: string;
  imageClassName?: string;
};

export function ProgramInstitutionalLogosRow({
  logos = programInstitutionalLogos,
  className,
  imageClassName,
}: ProgramInstitutionalLogosRowProps) {
  return (
    <div
      className={cn(
        "mt-4 flex flex-wrap items-center gap-8 sm:flex-nowrap sm:gap-10",
        className,
      )}
      aria-label="Organizaciones aliadas"
    >
      {logos.map((logo) => (
        <figure
          key={logo.alt}
          className="flex h-12 min-w-0 items-center justify-center"
        >
          <Image
            src={logo.src}
            alt={logo.alt}
            width={800}
            height={300}
            loading="lazy"
            decoding="async"
            className={cn("h-10 w-auto object-contain sm:h-11 md:h-12", imageClassName)}
          />
        </figure>
      ))}
    </div>
  );
}
