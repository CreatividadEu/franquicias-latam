import type { HTMLAttributes } from "react";

type ClientLogo = {
  src: string;
  alt: string;
};

type HomeClientLogosCarouselReplicaProps = {
  logos?: ClientLogo[];
} & HTMLAttributes<HTMLDivElement>;

const DEFAULT_CLIENT_LOGOS: ClientLogo[] = [
  { src: "/logos_clientes/logo_andres.svg", alt: "Andrés" },
  { src: "/logos_clientes/logo_bid.svg", alt: "BID" },
  { src: "/logos_clientes/logo_mercado_libre.svg", alt: "Mercado Libre" },
  { src: "/logos_clientes/logo_nutresa.svg", alt: "Nutresa" },
  { src: "/logos_clientes/logo_sodexo.svg", alt: "Sodexo" },
  { src: "/logos_clientes/logo_subway.svg", alt: "Subway" },
  { src: "/logos_clientes/logo_totto.svg", alt: "Totto" },
];

const MARQUEE_STYLES = `
  @keyframes fl-scroll-logos {
    0% {
      transform: translateX(0);
    }

    100% {
      transform: translateX(-50%);
    }
  }

  .fl-logo-carousel-container {
    position: relative;
    width: 100%;
  }

  .fl-logo-carousel {
    display: flex;
    animation: fl-scroll-logos 21s linear infinite;
    will-change: transform;
  }

  .fl-logo-carousel:hover {
    animation-play-state: paused;
  }

  .fl-logo-item {
    opacity: 0.9;
    filter: grayscale(100%);
    transition: all 0.3s ease;
  }

  .fl-logo-item:hover {
    opacity: 1;
    filter: grayscale(0%);
  }
`;

export function HomeClientLogosCarouselReplica({
  logos = DEFAULT_CLIENT_LOGOS,
  className = "",
  ...props
}: HomeClientLogosCarouselReplicaProps) {
  const repeatedLogos = [...logos, ...logos];
  const rootClassName = ["fl-logo-carousel-container overflow-hidden mb-8 sm:mb-12", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClassName} {...props}>
      <style>{MARQUEE_STYLES}</style>

      <div className="fl-logo-carousel flex items-center gap-10 sm:gap-16">
        {repeatedLogos.map((logo, index) => (
          <div key={`${logo.alt}-${index}`} className="fl-logo-item flex-shrink-0">
            {/* TODO: copy the original SVGs into /public/logos_clientes or pass a custom logos prop */}
            <img
              src={logo.src}
              alt={logo.alt}
              width={120}
              height={40}
              loading="lazy"
              decoding="async"
              className="h-11 w-auto object-contain sm:h-14"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export type { ClientLogo };
