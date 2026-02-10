"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { CountryOption } from "@/types";
import {
  chatbotHelperTextClass,
  chatbotInputClass,
  chatbotPrimaryButtonClass,
} from "../uiStyles";

interface ContactStepProps {
  countryId: string | null;
  onSubmit: (name: string, email: string, phone: string) => void;
  isLoading: boolean;
}

const inputVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.3 },
  }),
};

export function ContactStep({
  countryId,
  onSubmit,
  isLoading,
}: ContactStepProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneCode, setPhoneCode] = useState("+57");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!countryId) return;
    fetch("/api/countries")
      .then((r) => r.json())
      .then((countries: CountryOption[]) => {
        const country = countries.find((c) => c.id === countryId);
        if (country) setPhoneCode(country.phoneCode);
      })
      .catch(console.error);
  }, [countryId]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = "Nombre requerido";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Email invalido";
    if (!phone.trim() || phone.length < 7)
      newErrors.phone = "Telefono invalido";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(name.trim(), email.trim(), `${phoneCode}${phone.trim()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      {/* Name Input */}
      <motion.div custom={0} variants={inputVariants} initial="hidden" animate="visible">
        <input
          type="text"
          placeholder="Tu nombre completo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`${chatbotInputClass} ${
            errors.name ? "border-red-400 focus:ring-red-400 focus:border-red-400" : ""
          }`}
          autoComplete="name"
        />
        {errors.name && (
          <span className="text-sm text-red-500 mt-1 block">{errors.name}</span>
        )}
      </motion.div>

      {/* Email Input */}
      <motion.div custom={1} variants={inputVariants} initial="hidden" animate="visible">
        <input
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`${chatbotInputClass} ${
            errors.email ? "border-red-400 focus:ring-red-400 focus:border-red-400" : ""
          }`}
          autoComplete="email"
        />
        {errors.email && (
          <span className="text-sm text-red-500 mt-1 block">{errors.email}</span>
        )}
      </motion.div>

      {/* Phone Input */}
      <motion.div custom={2} variants={inputVariants} initial="hidden" animate="visible">
        <div className="flex gap-2">
          <div className="flex items-center px-3 bg-neutral-50 rounded-xl text-base font-medium text-neutral-900 min-w-[76px] justify-center border border-neutral-200">
            {phoneCode}
          </div>
          <input
            type="tel"
            placeholder="Numero de celular"
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value.replace(/[^0-9]/g, ""))
            }
            className={`${chatbotInputClass} ${
              errors.phone ? "border-red-400 focus:ring-red-400 focus:border-red-400" : ""
            } flex-1`}
            autoComplete="tel"
          />
        </div>
        {errors.phone && (
          <span className="text-sm text-red-500 mt-1 block">{errors.phone}</span>
        )}
      </motion.div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={isLoading}
        className={chatbotPrimaryButtonClass}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        whileHover={!isLoading ? { scale: 1.01 } : undefined}
        whileTap={!isLoading ? { scale: 0.98 } : undefined}
      >
        {isLoading ? (
          <span className="flex items-center gap-2 justify-center">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Enviando...
          </span>
        ) : (
          "Enviar codigo de verificacion"
        )}
      </motion.button>

      <motion.p
        className={`${chatbotHelperTextClass} text-center`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        🔒 Tu informacion esta segura y no sera compartida
      </motion.p>
    </form>
  );
}
