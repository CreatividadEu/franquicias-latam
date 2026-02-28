"use client";

import Image from "next/image";
import { useState } from "react";

// Add real client images under `public/images/work/` and replace each `imageUrl` below.
type WorkItem = {
  title: string;
  description: string;
  imageUrl: string;
  metric1: string;
  metric2: string;
};

const WORK_ITEMS: WorkItem[] = [
  {
    title: "Café Central",
    description: "Escalamiento comercial con expansión regional y mayor ticket promedio.",
    imageUrl: "/images/work/1.jpg",
    metric1: "85% Revenue Growth",
    metric2: "70% Organic Traffic Growth",
  },
  {
    title: "Urban Retail Co.",
    description: "Optimización de adquisición y estructura para abrir nuevas sedes.",
    imageUrl: "/images/work/2.jpg",
    metric1: "62% Lead-to-Sale Lift",
    metric2: "48% CAC Reduction",
  },
  {
    title: "Vital Health Group",
    description: "Posicionamiento de marca y crecimiento sostenido en unidades activas.",
    imageUrl: "/images/work/3.jpg",
    metric1: "91% Retention Increase",
    metric2: "54% Pipeline Growth",
  },
  {
    title: "Norte Servicios",
    description: "Sistema replicable con mejor control operativo y financiero.",
    imageUrl: "/images/work/4.jpg",
    metric1: "73% EBITDA Expansion",
    metric2: "39% Time-to-Launch Cut",
  },
  {
    title: "Andes Food Concepts",
    description: "Campañas de performance para acelerar demanda en mercados clave.",
    imageUrl: "/images/work/5.jpg",
    metric1: "4.1x ROAS Improvement",
    metric2: "66% Qualified Traffic Lift",
  },
  {
    title: "Blue Horizon Clinics",
    description: "Arquitectura de crecimiento para consolidar una red multiciudad.",
    imageUrl: "/images/work/6.jpg",
    metric1: "58% Conversion Uplift",
    metric2: "44% Faster Expansion",
  },
];

function WorkCard({ item }: { item: WorkItem }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <article className="w-full">
      <div className="relative h-[429px] overflow-hidden rounded-[24px] bg-gradient-to-br from-slate-300 via-slate-200 to-slate-100">
        {!imageFailed && (
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            sizes="344px"
            className="object-cover"
            onError={() => setImageFailed(true)}
          />
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-5 flex flex-col items-center gap-2 px-4">
          <span className="rounded-full border border-[rgba(255,255,255,0.2)] bg-[rgba(13,13,13,0.2)] px-4 py-2 text-sm text-white backdrop-blur-md">
            {item.metric1}
          </span>
          <span className="rounded-full border border-[rgba(255,255,255,0.2)] bg-[rgba(13,13,13,0.2)] px-4 py-2 text-sm text-white backdrop-blur-md">
            {item.metric2}
          </span>
        </div>
      </div>

      <h3 className="mt-5 text-xl font-semibold text-slate-900">{item.title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
    </article>
  );
}

export function WorkCarousel() {
  const visibleWorkItems = WORK_ITEMS.slice(0, 3);

  return (
    <section
      id="work"
      aria-label="Work and clients"
      className="bg-white pt-8 md:pt-10 pb-16 sm:pb-20 lg:pb-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.2rem]">
            Success You Can See
          </h2>
          <p className="mt-5 text-base text-slate-600 sm:text-lg">
            A glimpse into our most impactful projects and success stories.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-12">
          {visibleWorkItems.map((item) => (
            <WorkCard key={item.title} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
