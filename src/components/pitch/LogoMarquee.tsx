"use client";

import { useState } from "react";
import { marcasPortafolio, type Marca } from "@/config/clients";

function MarcaItem({ marca }: { marca: Marca }) {
  // Sin archivo (o si el archivo 404ea) se cae al nombre en tipografía.
  const [fallback, setFallback] = useState(!marca.archivo);

  return (
    <div
      className="pt-marquee-item flex h-10 shrink-0 items-center px-7"
      title={marca.nombre}
    >
      {fallback ? (
        <span className="pt-logo whitespace-nowrap text-[13px] font-semibold uppercase tracking-[0.24em] text-[var(--pt-blanco)]">
          {marca.nombre}
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- assets locales diminutos; el marquee no gana nada con next/image
        <img
          src={marca.archivo}
          alt={marca.nombre}
          className={`pt-logo h-8 w-auto max-w-[120px] object-contain${marca.invertir ? " pt-logo--invert" : ""}`}
          loading="lazy"
          draggable={false}
          onError={() => setFallback(true)}
        />
      )}
    </div>
  );
}

// Marquee infinito horizontal: el set de marcas se renderiza dos veces y la
// pista corre -50% en loop (keyframes en pitch.css; pausa con reduced motion).
export default function LogoMarquee() {
  return (
    <div
      className="w-full overflow-hidden"
      style={{
        maskImage: "linear-gradient(90deg, transparent, #000 14%, #000 86%, transparent)",
        WebkitMaskImage: "linear-gradient(90deg, transparent, #000 14%, #000 86%, transparent)",
      }}
    >
      <div className="pt-marquee-track flex w-max items-center">
        {[0, 1].map((copia) => (
          <div key={copia} aria-hidden={copia === 1} className="flex items-center">
            {marcasPortafolio.map((marca) => (
              <MarcaItem key={`${copia}-${marca.nombre}`} marca={marca} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
