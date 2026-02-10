"use client";

import { motion } from "framer-motion";

/**
 * GlassBackground - Animated gradient mesh background
 *
 * Provides a premium glassmorphism aesthetic with:
 * - Gradient mesh (indigo → purple → electric blue)
 * - Animated floating blobs for depth
 * - Fixed positioning behind chat container
 */
export function GlassBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient mesh */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%)",
        }}
      />

      {/* Animated gradient overlay blobs */}
      <motion.div
        className="absolute w-[800px] h-[800px] rounded-full blur-[120px] opacity-40"
        style={{
          background: "radial-gradient(circle, #6366f1 0%, transparent 70%)",
        }}
        animate={{
          x: ["0%", "20%", "0%"],
          y: ["0%", "30%", "0%"],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full blur-[100px] opacity-30"
        style={{
          background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)",
        }}
        animate={{
          x: ["0%", "-15%", "0%"],
          y: ["0%", "-20%", "0%"],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute top-1/2 left-1/2 w-[700px] h-[700px] rounded-full blur-[110px] opacity-25"
        style={{
          background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)",
          transform: "translate(-50%, -50%)",
        }}
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/10" />
    </div>
  );
}
