"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FranchiseCard } from "@/components/franchise/FranchiseCard";
import type { MatchedFranchise } from "@/types";

interface ResultsStepProps {
  results: MatchedFranchise[];
  backToResultsUrl?: string;
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

export function ResultsStep({ results, backToResultsUrl }: ResultsStepProps) {
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
        <Link
          href="/quiz"
          className="px-6 py-2 rounded-xl bg-neutral-100 border border-neutral-200 text-neutral-900 hover:bg-neutral-200 transition-all"
        >
          Volver al quiz
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="p-6 space-y-4">
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
        {results.map((franchise) => (
          <motion.div key={franchise.id} variants={itemVariants}>
            <FranchiseCard
              franchise={franchise}
              backToResultsUrl={backToResultsUrl}
            />
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
        <motion.div
          className="flex-1"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link
            href="/quiz"
            className="block w-full px-4 py-2 text-center rounded-xl bg-neutral-100 border border-neutral-200 text-neutral-900 hover:bg-neutral-200 transition-all"
          >
            Buscar de nuevo
          </Link>
        </motion.div>
        <motion.div
          className="flex-1"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link
            href="/"
            className="block w-full min-h-12 px-4 py-3 text-center rounded-xl bg-[#2F5BFF] hover:bg-[#264BDB] active:bg-[#1F3FC4] text-white text-base sm:text-lg font-semibold shadow-sm transition-all"
          >
            Ir al inicio
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
