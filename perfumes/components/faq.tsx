"use client";

import { AnimatePresence, motion } from "motion/react";
import { useId, useState } from "react";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import { site } from "@/lib/site";
import { EASE_OUT, Eyebrow, Reveal, SplitReveal } from "./ui";

function Item({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  const id = useId();
  return (
    <div className="border-b border-line">
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={id}
          className="group flex w-full items-center justify-between gap-6 py-6 text-left"
        >
          <span className="font-display text-2xl font-light text-ivory transition-colors duration-200 ease-out group-hover:text-amber-soft md:text-3xl">
            {q}
          </span>
          <span
            className={`flex size-10 shrink-0 items-center justify-center rounded-full ring-1 transition-[rotate,background-color,color] duration-300 ease-out ${
              open ? "rotate-45 bg-amber text-noir ring-amber" : "text-ivory ring-line"
            }`}
          >
            <Plus size={16} weight="light" />
          </span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            role="region"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
            className="overflow-hidden"
          >
            <p className="max-w-[60ch] pb-7 text-base leading-relaxed text-mute">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="duvidas" className="relative mx-auto grid max-w-7xl gap-12 px-4 py-28 md:grid-cols-12 md:px-8 md:py-36">
      <div className="md:col-span-4">
        <Eyebrow>Dúvidas</Eyebrow>
        <SplitReveal
          text="Perguntas *frequentes.*"
          className="mt-6 font-display text-[clamp(2.6rem,4.6vw,4.4rem)] font-light leading-[0.95] text-ivory"
        />
      </div>
      <Reveal className="md:col-span-8">
        <div className="border-t border-line">
          {site.faq.map((item, i) => (
            <Item key={item.q} q={item.q} a={item.a} open={open === i} onToggle={() => setOpen(open === i ? null : i)} />
          ))}
        </div>
      </Reveal>
    </section>
  );
}
