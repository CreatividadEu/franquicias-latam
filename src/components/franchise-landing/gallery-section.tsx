"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { GalleryImageData } from "@/lib/franchise-mapper";

function Lightbox({
  images,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  images: GalleryImageData[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const img = images[index];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ background: "rgba(0,0,0,0.9)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="relative max-h-[80vh] w-full max-w-5xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-video overflow-hidden rounded-xl">
          <Image
            src={img.url}
            alt={img.altText ?? img.label ?? ""}
            fill
            className="object-contain"
          />
        </div>
        {img.label && (
          <p className="mt-3 text-center text-sm text-[#8A8F9E]">{img.label}</p>
        )}
      </motion.div>

      <button
        onClick={onClose}
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors"
        style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}
        aria-label="Cerrar"
      >
        <X className="h-5 w-5" />
      </button>

      {index > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-white transition-colors"
          style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}
          aria-label="Anterior"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      {index < images.length - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-white transition-colors"
          style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}
          aria-label="Siguiente"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
    </motion.div>
  );
}

export function GallerySection({ data }: { data: GalleryImageData[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <section className="bg-[#0A0F1E] py-20 md:py-28" aria-label="Galería">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-12 space-y-2"
        >
          <p className="text-xs font-medium uppercase tracking-widest text-[#00F0FF]">
            Galería
          </p>
          <h2
            className="text-3xl font-bold text-[#F0F0F5] sm:text-4xl"
            style={{ fontFamily: "var(--font-heading, system-ui, sans-serif)" }}
          >
            Conoce el espacio
          </h2>
        </motion.div>

        <div className="columns-2 gap-4 md:columns-3">
          {data.map((img, i) => (
            <motion.button
              key={img.id}
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              onClick={() => setLightboxIndex(i)}
              className="group mb-4 block w-full overflow-hidden rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00F0FF]"
              style={{ border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={img.url}
                  alt={img.altText ?? img.label ?? "Gallery image"}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            images={data}
            index={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onPrev={() => setLightboxIndex((i) => Math.max(0, (i ?? 1) - 1))}
            onNext={() =>
              setLightboxIndex((i) => Math.min(data.length - 1, (i ?? 0) + 1))
            }
          />
        )}
      </AnimatePresence>
    </section>
  );
}
