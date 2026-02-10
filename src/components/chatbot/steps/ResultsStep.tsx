"use client";

import { motion } from "framer-motion";
import { FranchiseCard } from "@/components/franchise/FranchiseCard";
import type { MatchedFranchise } from "@/types";

interface ResultsStepProps {
  results: MatchedFranchise[];
}

type FranchiseWithSlug = MatchedFranchise & { slug: string };

function slugifyFranchiseName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

export function ResultsStep({ results }: ResultsStepProps) {
  const handleRestart = () => {
    window.location.reload();
  };

  const usedSlugs = new Set<string>();
  const resultsWithSlug: FranchiseWithSlug[] = results.map((franchise) => {
    const baseSlug = slugifyFranchiseName(franchise.name) || "franquicia";

    let uniqueSlug = baseSlug;
    if (usedSlugs.has(uniqueSlug)) {
      uniqueSlug = `${baseSlug}-${franchise.id.slice(0, 8).toLowerCase()}`;
    }

    let suffix = 2;
    while (usedSlugs.has(uniqueSlug)) {
      uniqueSlug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    usedSlugs.add(uniqueSlug);
    return { ...franchise, slug: uniqueSlug };
  });

  if (results.length === 0) {
    return (
      <motion.div
        className="p-6 text-center space-y-4"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="w-14 h-14 mx-auto bg-neutral-100 border border-neutral-200 rounded-full flex items-center justify-center">
          <span className="text-2xl">🔍</span>
        </div>
        <div>
          <p className="text-neutral-900 font-medium text-base sm:text-lg">
            No encontramos franquicias que coincidan exactamente
          </p>
          <p className="text-neutral-500 text-sm sm:text-base mt-1 leading-relaxed">
            Nuestro equipo se pondra en contacto contigo pronto con opciones personalizadas.
          </p>
        </div>
        <button
          onClick={handleRestart}
          className="px-6 py-2 rounded-xl bg-neutral-100 border border-neutral-200 text-neutral-900 hover:bg-neutral-200 transition-all"
        >
          Intentar de nuevo
        </button>
      </motion.div>
    );
  }

  return (
    <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
      {/* Header */}
      <motion.div
        className="text-center space-y-1 pb-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-xl font-bold text-neutral-900">
          ¡Encontramos {results.length} {results.length === 1 ? 'franquicia' : 'franquicias'} para ti!
        </h2>
        <p className="text-sm text-neutral-600">
          Estas son las mejores opciones según tus preferencias
        </p>
      </motion.div>

      {/* Responsive Grid: 1 col on mobile, 2 on md, 3 on lg */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {resultsWithSlug.map((franchise) => (
          <motion.div key={franchise.id} variants={itemVariants}>
            <FranchiseCard franchise={franchise} />
          </motion.div>
        ))}
      </motion.div>

      {/* Info Banner */}
      <motion.div
        className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-center mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
          📧 Te enviaremos más detalles a tu email. Un asesor se pondrá en contacto contigo pronto.
        </p>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        className="flex gap-2 pt-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <motion.button
          onClick={handleRestart}
          className="flex-1 px-4 py-2 rounded-xl bg-neutral-100 border border-neutral-200 text-neutral-900 hover:bg-neutral-200 transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Buscar de nuevo
        </motion.button>
        <motion.button
          onClick={() => (window.location.href = "/")}
          className="flex-1 min-h-12 px-4 py-3 rounded-xl bg-[#2F5BFF] hover:bg-[#264BDB] active:bg-[#1F3FC4] text-white text-base sm:text-lg font-semibold shadow-sm transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Ir al inicio
        </motion.button>
      </motion.div>
    </div>
  );
}
