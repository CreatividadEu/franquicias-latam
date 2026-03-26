import Image from "next/image";
import { cn } from "@/lib/utils";
import { homeClientLogos, type BrandLogo } from "@/components/home/homeBrandData";

type ClientLogoMarqueeProps = {
  logos?: BrandLogo[];
  className?: string;
  logoClassName?: string;
  ariaLabel?: string;
};

export function ClientLogoMarquee({
  logos = homeClientLogos,
  className,
  logoClassName,
  ariaLabel = "Marcas desarrolladas con nuestra metodología",
}: ClientLogoMarqueeProps) {
  return (
    <div className={cn("logo-carousel-container overflow-hidden", className)}>
      <div className="logo-carousel flex items-center gap-10 sm:gap-16" aria-label={ariaLabel}>
        {[...logos, ...logos].map((logo, index) => (
          <div key={`${logo.alt}-${index}`} className="logo-item flex-shrink-0">
            <Image
              src={logo.src}
              alt={logo.alt}
              width={120}
              height={40}
              className={cn("h-11 w-auto object-contain sm:h-14", logoClassName)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
