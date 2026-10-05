"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Plus } from "@phosphor-icons/react/dist/ssr";
import type { Product } from "@/lib/catalog";
import { addToCart, launchFlight } from "@/lib/store";
import { EASE_OUT } from "./ui";

/** Adiciona à sacola e dispara o voo da foto a partir de `source` (ou do próprio botão). */
export function add(product: Product, source: Element | null, qty = 1) {
  launchFlight(product.image, source);
  addToCart(product.code, qty);
}

// Botão redondo de "adicionar": o + vira ✓ por um instante para confirmar.
export function AddButton({
  product,
  sourceRef,
  className = "",
  label,
}: {
  product: Product;
  sourceRef?: React.RefObject<HTMLElement | null>;
  className?: string;
  label?: string;
}) {
  const [done, setDone] = useState(false);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        add(product, sourceRef?.current ?? e.currentTarget);
        setDone(true);
        setTimeout(() => setDone(false), 1400);
      }}
      aria-label={label ?? `Adicionar ${product.brand} ${product.name} à sacola`}
      className={`${className.includes("absolute") ? "" : "relative"} flex size-11 items-center justify-center overflow-hidden rounded-full bg-amber text-noir transition-[opacity,translate,scale,background-color] duration-200 ease-out hover:bg-amber-soft active:scale-[0.92] ${className}`}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={done ? "ok" : "add"}
          initial={{ opacity: 0, transform: "translateY(60%) scale(0.8)" }}
          animate={{ opacity: 1, transform: "translateY(0%) scale(1)" }}
          exit={{ opacity: 0, transform: "translateY(-60%) scale(0.8)" }}
          transition={{ duration: 0.22, ease: EASE_OUT }}
          className="flex"
        >
          {done ? <Check size={18} weight="bold" /> : <Plus size={18} weight="regular" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
