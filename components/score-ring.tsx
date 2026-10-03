"use client";

import { motion } from "motion/react";

// Anel de nota do Google PageSpeed: preenche quando entra na tela.
export function ScoreRing({ score = 100 }: { score?: number }) {
  return (
    <div className="relative size-36" role="img" aria-label={`Nota ${score} de 100 em performance`}>
      <svg viewBox="0 0 120 120" className="size-full -rotate-90">
        <circle cx="60" cy="60" r="52" fill="none" stroke="var(--color-line)" strokeWidth="8" />
        <motion.circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke="var(--color-gold)"
          strokeWidth="8"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: score / 100 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-4xl font-semibold tracking-[-0.04em] text-paper">
        {score}
      </span>
    </div>
  );
}
