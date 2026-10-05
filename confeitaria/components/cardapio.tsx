"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";
import { money } from "@/lib/format";
import { cakeSizes, categories, productsIn, shapeLabel, type CategoryId, type Tier } from "@/lib/menu";
import { ui, useStore } from "@/lib/store";
import { scrollToId } from "@/lib/scroll";
import { ProductCard } from "./product-card";
import { EASE_OUT, Reveal, ScriptTitle, gentle } from "./ui";

function SizePrices({ tier }: { tier: Tier }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {(["circular", "retangular"] as const).map((shape) => (
        <div key={shape} className="min-w-0 rounded-[1.4rem] bg-card/70 py-4 ring-1 ring-line">
          <p className="px-4 text-[13px] font-bold text-cocoa-2">{shapeLabel[shape]}</p>
          {/* no celular os tamanhos correm na horizontal, sem empurrar a lista para baixo */}
          <ul className="no-scrollbar mt-2.5 flex gap-2 overflow-x-auto px-4 sm:flex-wrap">
            {cakeSizes
              .filter((s) => s.shape === shape)
              .map((s) => (
                <li key={s.id} className="shrink-0 rounded-full bg-blush px-3 py-1.5 text-[13px] font-semibold text-cocoa ring-1 ring-line">
                  {s.label} <span className="font-medium text-mute">{s.serves}</span>{" "}
                  <span className="nums text-rose-ink">{money(s.price[tier])}</span>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function Cardapio() {
  const [active, setActive] = useState<CategoryId>("classicos");
  const navHidden = useStore(ui, (s) => s.navHidden);
  const reduce = useReducedMotion();
  const top = useRef<HTMLDivElement>(null);
  const items = productsIn(active);
  const category = categories.find((c) => c.id === active)!;

  const pick = (id: CategoryId) => {
    if (id === active) return;
    setActive(id);
    // se as abas já estão grudadas no topo, volta para o começo da lista
    const rect = top.current?.getBoundingClientRect();
    if (rect && rect.top < 0) scrollToId("cardapio-lista");
  };

  return (
    <section id="cardapio" className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 md:px-8 md:pb-28 md:pt-24">
      <div className="max-w-2xl">
        <ScriptTitle text="Cardápio" className="text-[clamp(3.6rem,8vw,6rem)]" />
        <Reveal delay={0.1}>
          <p className="mt-3 max-w-[48ch] text-lg font-medium leading-relaxed text-cocoa-2">
            Toque em um item para escolher tamanho, sabor e quantidade. Os valores são os do cardápio 2026.
          </p>
        </Reveal>
      </div>

      <div ref={top} id="cardapio-lista" className="scroll-mt-4" />

      {/* abas grudadas no topo enquanto a lista passa */}
      <div
        className={`sticky z-30 -mx-4 mt-10 px-4 transition-[top] duration-500 ease-drawer md:mx-0 md:px-0 ${
          navHidden ? "top-3" : "top-[5.25rem] md:top-[5.75rem]"
        }`}
      >
        <div
          role="tablist"
          aria-label="Categorias do cardápio"
          className="no-scrollbar flex w-max max-w-full gap-1 overflow-x-auto rounded-full bg-card/85 p-1.5 shadow-[0_14px_40px_-26px_rgba(61,39,32,0.5)] ring-1 ring-line backdrop-blur-xl"
        >
          {categories.map((c) => {
            const selected = c.id === active;
            return (
              <button
                key={c.id}
                type="button"
                role="tab"
                id={`tab-${c.id}`}
                aria-selected={selected}
                aria-controls="cardapio-painel"
                onClick={() => pick(c.id)}
                className={`relative shrink-0 rounded-full px-4 py-2.5 text-[14px] font-bold transition-colors duration-200 ease-out md:px-5 ${
                  selected ? "text-blush" : "text-cocoa-2 hover:text-cocoa"
                }`}
              >
                {selected && (
                  <motion.span
                    layoutId="tab-pill"
                    className="absolute inset-0 rounded-full bg-cocoa"
                    transition={reduce ? { duration: 0 } : { type: "spring", duration: 0.45, bounce: 0.18 }}
                  />
                )}
                <span className="relative">{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div id="cardapio-painel" role="tabpanel" aria-labelledby={`tab-${active}`} className="mt-8">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15, ease: EASE_OUT } }}
            transition={{ duration: 0.2 }}
          >
            <p className="max-w-[60ch] text-[15px] font-medium text-mute">{category.note}</p>
            {(active === "classicos" || active === "especiais") && (
              <div className="mt-5">
                <SizePrices tier={active === "classicos" ? "classico" : "especial"} />
              </div>
            )}

            <ul className="mt-6 grid grid-cols-1 gap-3 min-[480px]:mt-8 min-[480px]:grid-cols-2 min-[480px]:gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((p, i) => (
                <motion.li
                  key={p.id}
                  className="h-full"
                  initial={{ opacity: 0, transform: "translateY(18px)" }}
                  whileInView={{ opacity: 1, transform: "translateY(0px)" }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={gentle(reduce, { duration: 0.6, delay: Math.min(i, 8) * 0.045, ease: EASE_OUT })}
                >
                  <ProductCard product={p} />
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
