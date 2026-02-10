"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ChoiceCard } from "../ChoiceCard";
import type { CountryOption } from "@/types";
import { chatbotInputClass } from "../uiStyles";

interface CountryStepProps {
  onSelect: (countryId: string, countryName: string) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2 },
  },
};

export function CountryStep({ onSelect }: CountryStepProps) {
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/countries")
      .then((r) => r.json())
      .then(setCountries)
      .catch(console.error);
  }, []);

  const filteredCountries = useMemo(() => {
    if (!search.trim()) return countries;
    const searchLower = search.toLowerCase();
    return countries.filter((c) =>
      c.name.toLowerCase().includes(searchLower)
    );
  }, [countries, search]);

  if (countries.length === 0) {
    return (
      <div className="p-6 flex justify-center">
        <div className="w-6 h-6 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-3">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar país..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={chatbotInputClass}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-900 text-base"
          >
            ✕
          </button>
        )}
      </div>

      {/* Scrollable Grid */}
      <motion.div
        className="grid grid-cols-2 gap-3 sm:gap-4 max-h-[400px] overflow-y-auto pr-1"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        key={search} // Re-animate when search changes
      >
        {filteredCountries.map((country) => (
          <motion.div key={country.id} variants={cardVariants}>
            <ChoiceCard
              emoji={country.flag}
              label={country.name}
              selected={false}
              onClick={() =>
                onSelect(country.id, `${country.flag} ${country.name}`)
              }
              size="small"
            />
          </motion.div>
        ))}
      </motion.div>

      {filteredCountries.length === 0 && (
        <p className="text-center text-neutral-500 text-sm py-4">
          No se encontraron países
        </p>
      )}
    </div>
  );
}
