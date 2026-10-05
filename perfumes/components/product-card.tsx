"use client";

import { motion, useReducedMotion } from "motion/react";
import { memo, useRef } from "react";
import { finalPrice, formatPrice, genderLabel, shortConcentration, type Product } from "@/lib/catalog";
import { openQuickView } from "@/lib/store";
import { AddButton } from "./add-button";
import { EASE_OUT, gentle, ProductImage } from "./ui";

/** Guarda de onde o modal deve "nascer" (efeito de expansão a partir do card) */
export const origin: { rect: DOMRect | null } = { rect: null };

export const ProductCard = memo(function ProductCard({ product, order }: { product: Product; order: number }) {
  const plateRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const open = () => {
    origin.rect = plateRef.current?.getBoundingClientRect() ?? null;
    openQuickView(product.code);
  };

  return (
    <motion.article
      layout={reduce ? false : "position"}
      initial={{ opacity: 0, transform: "translateY(28px) scale(0.97)" }}
      animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
      exit={{ opacity: 0, transform: "scale(0.95)", transition: gentle(reduce, { duration: 0.2, ease: EASE_OUT }) }}
      transition={gentle(reduce, {
        duration: 0.7,
        delay: Math.min(order, 11) * 0.04,
        ease: EASE_OUT,
        layout: { duration: 0.5, ease: EASE_OUT },
      })}
      className="group relative"
    >
      <div className="rounded-[1.8rem] bg-white/[0.03] p-1.5 ring-1 ring-line transition-[box-shadow] duration-300 ease-out hover:ring-line-strong">
        <div className="relative">
          <button
            type="button"
            onClick={open}
            aria-label={`Ver detalhes de ${product.brand} ${product.name}`}
            className="block w-full text-left"
          >
            <div
              ref={plateRef}
              data-plate={product.code}
              className="plate relative aspect-[4/5] overflow-hidden rounded-[calc(1.8rem-0.375rem)]"
            >
              <div
                className="tone-glow absolute inset-0 opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
                style={{ "--tone": `${product.tone}66` } as React.CSSProperties}
                aria-hidden
              />
              <ProductImage
                product={product}
                className="relative transition-transform duration-700 ease-out group-hover:scale-[1.05]"
              />
              {product.gender ? (
                <span className="absolute left-3 top-3 rounded-full bg-white/70 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-ink-mute ring-1 ring-black/5 backdrop-blur-sm">
                  {genderLabel[product.gender]}
                </span>
              ) : null}
            </div>
          </button>
          <AddButton
            product={product}
            sourceRef={plateRef}
            className="absolute bottom-3 right-3 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)] pointer-fine:translate-y-2 pointer-fine:opacity-0 pointer-fine:group-hover:translate-y-0 pointer-fine:group-hover:opacity-100 pointer-fine:group-focus-within:translate-y-0 pointer-fine:group-focus-within:opacity-100"
          />
        </div>

        <button type="button" onClick={open} className="block w-full px-3 pb-3 pt-4 text-left" tabIndex={-1}>
          <p className="truncate text-[10px] uppercase tracking-[0.22em] text-amber-soft/90">{product.brand}</p>
          <h3 className="mt-1.5 line-clamp-2 min-h-[2.2em] font-display text-[1.35rem] leading-[1.1] text-ivory">
            {product.name}
          </h3>
          <div className="mt-2 flex items-end justify-between gap-2">
            <p className="truncate text-[11px] text-faint">
              {[shortConcentration(product.concentration), product.size].filter(Boolean).join(" · ")}
            </p>
            <p className="shrink-0 font-mono text-sm text-ivory">{formatPrice(finalPrice(product))}</p>
          </div>
        </button>
      </div>
    </motion.article>
  );
});
