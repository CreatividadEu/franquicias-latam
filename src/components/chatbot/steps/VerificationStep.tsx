"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface VerificationStepProps {
  onVerify: (code: string) => void;
  isLoading: boolean;
  error: string | null;
  phone: string;
}

export function VerificationStep({
  onVerify,
  isLoading,
  error,
  phone,
}: VerificationStepProps) {
  const [code, setCode] = useState("");
  const [resendTimer, setResendTimer] = useState(60);
  const canResend = resendTimer <= 0;

  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setTimeout(() => setResendTimer((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleComplete = (value: string) => {
    setCode(value);
    if (value.length === 6) {
      onVerify(value);
    }
  };

  const handleResend = async () => {
    setResendTimer(60);
    setCode("");

    await fetch("/api/sms/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
  };

  return (
    <div className="p-6 flex flex-col items-center gap-4">
      <motion.p
        className="text-sm sm:text-base text-neutral-600 text-center leading-relaxed"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Ingresa el codigo de 6 digitos
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <InputOTP
          maxLength={6}
          value={code}
          onChange={handleComplete}
          disabled={isLoading}
          containerClassName="gap-2"
        >
          <InputOTPGroup className="gap-2">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <InputOTPSlot
                key={index}
                index={index}
                className="w-12 h-14 bg-white border-2 border-neutral-200 rounded-xl text-neutral-900 text-lg font-bold shadow-sm data-[active=true]:border-neutral-900 data-[active=true]:ring-2 data-[active=true]:ring-neutral-900 transition-all"
              />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </motion.div>

      {error && (
        <motion.p
          className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-xl border border-red-200"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {error}
        </motion.p>
      )}

      {isLoading && (
        <motion.p
          className="text-sm text-neutral-900 animate-pulse flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <span className="w-4 h-4 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
          Verificando...
        </motion.p>
      )}

      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {canResend ? (
          <button
            onClick={handleResend}
            className="text-neutral-900 hover:text-neutral-700 text-sm sm:text-base font-medium px-4 py-2 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 transition-all"
          >
            Reenviar codigo
          </button>
        ) : (
          <p className="text-sm text-neutral-500">
            Reenviar en {resendTimer}s
          </p>
        )}
      </motion.div>

    </div>
  );
}
