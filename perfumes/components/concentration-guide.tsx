"use client";

import { motion, useInView, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { products, type Filters } from "@/lib/catalog";
import { resetFilters, setFilters } from "@/lib/store";
import { scrollToId } from "@/lib/scroll";
import { EASE_OUT, Eyebrow, gentle, SplitReveal } from "./ui";

const levels: {
  name: string;
  short: string;
  pct: string;
  lasts: string;
  fill: number;
  count: number;
  filter: Partial<Filters>;
}[] = [
  {
    name: "Extrait & Parfum",
    short: "Extrait",
    pct: "20–40%",
    lasts: "8 h ou mais",
    fill: 0.92,
    count: products.filter((p) => p.concentration === "Extrait de Parfum" || p.concentration === "Parfum").length,
    filter: { concentration: "extrait" },
  },
  {
    name: "Eau de Parfum",
    short: "EDP",
    pct: "15–20%",
    lasts: "6 a 8 h",
    fill: 0.68,
    count: products.filter((p) => p.concentration === "Eau de Parfum").length,
    filter: { concentration: "edp" },
  },
  {
    name: "Eau de Toilette",
    short: "EDT",
    pct: "5–15%",
    lasts: "3 a 5 h",
    fill: 0.42,
    count: products.filter((p) => p.concentration === "Eau de Toilette").length,
    filter: { concentration: "edt" },
  },
  {
    name: "Body splash & mist",
    short: "Mist",
    pct: "1–5%",
    lasts: "1 a 3 h",
    fill: 0.18,
    count: products.filter((p) => p.category === "body").length,
    filter: { category: "body" },
  },
];

function Vial({ level, index, filled }: { level: (typeof levels)[number]; index: number; filled: boolean }) {
  const reduce = useReducedMotion();
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative h-56 w-16 overflow-hidden rounded-full bg-white/50 shadow-[inset_0_2px_10px_rgba(29,23,18,0.08),0_20px_40px_-24px_rgba(29,23,18,0.5)] ring-1 ring-ink/10 md:h-72 md:w-20">
        <motion.div
          className="absolute inset-x-0 bottom-0 origin-bottom"
          style={{ height: `${level.fill * 100}%` }}
          initial={{ transform: "scaleY(0)" }}
          animate={filled ? { transform: "scaleY(1)" } : undefined}
          transition={gentle(reduce, { duration: 1.8, delay: 0.2 + index * 0.15, ease: EASE_OUT })}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#e8b770] via-[#c98a3e] to-[#8f5a22]" />
          {/* superfície do líquido: uma onda que corre devagar */}
          <svg
            className="absolute -top-2 left-0 h-3 w-[200%] animate-[wave_3.2s_linear_infinite] fill-[#e8b770] motion-reduce:animate-none"
            viewBox="0 0 160 12"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path d="M0 6 Q 20 0 40 6 T 80 6 T 120 6 T 160 6 V 12 H 0 Z" />
          </svg>
          <div className="absolute inset-y-0 left-[18%] w-[14%] rounded-full bg-white/25 blur-[1px]" />
        </motion.div>
        <div className="absolute inset-y-3 left-[22%] w-[10%] rounded-full bg-white/40" aria-hidden />
      </div>
      <div className="text-center">
        <p className="font-display text-2xl leading-none text-ink">{level.short}</p>
        <p className="mt-2 font-mono text-[11px] text-ink-mute">{level.pct}</p>
      </div>
    </div>
  );
}

export function ConcentrationGuide() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 0.25"] });
  const transform = useTransform(scrollYProgress, (v) => `scale(${0.92 + v * 0.08})`);
  const vialsRef = useRef<HTMLDivElement>(null);
  const filled = useInView(vialsRef, { once: true, amount: 0.5 });

  return (
    <section ref={ref} className="px-2 md:px-4">
      <motion.div
        className="relative overflow-hidden rounded-[2.5rem] bg-plate text-ink"
        style={reduce ? undefined : { transform }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-[20%] -top-[30%] h-[80%] w-[60%] rounded-full bg-[radial-gradient(closest-side,rgba(214,163,92,0.25),transparent)]"
        />
        <div className="relative mx-auto grid max-w-7xl gap-16 px-6 py-24 md:grid-cols-12 md:px-12 md:py-36">
          <div className="md:col-span-6 lg:col-span-5">
            <Eyebrow tone="light">Guia rápido</Eyebrow>
            <SplitReveal
              text="Concentração é *presença.*"
              accentClassName="italic text-amber-deep pr-[0.08em]"
              className="mt-6 font-display text-[clamp(2.6rem,4.8vw,4.6rem)] font-light leading-[0.95] text-ink"
            />
            <p className="mt-6 max-w-[42ch] text-base leading-relaxed text-ink-mute">
              Quanto mais essência, mais o perfume dura e mais longe ele chega. Escolha pelo efeito que você quer: um
              rastro marcante para a noite ou um frescor leve para reaplicar ao longo do dia.
            </p>
            <ul className="mt-10 divide-y divide-ink/10 border-y border-ink/10">
              {levels.map((l) => (
                <li key={l.name}>
                  <button
                    type="button"
                    onClick={() => {
                      resetFilters();
                      setFilters(l.filter);
                      scrollToId("catalogo");
                    }}
                    className="group flex w-full items-center justify-between gap-4 py-4 text-left"
                  >
                    <span>
                      <span className="block text-sm font-medium text-ink">{l.name}</span>
                      <span className="text-xs text-ink-mute">Dura em média {l.lasts}</span>
                    </span>
                    <span className="flex items-center gap-2 text-xs text-ink-mute transition-colors duration-200 ease-out group-hover:text-amber-deep">
                      {l.count} no catálogo
                      <span className="transition-transform duration-300 ease-out group-hover:translate-x-1">→</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[11px] text-ink-mute/80">
              Médias de referência: a duração muda com a pele, o clima e a própria fragrância.
            </p>
          </div>

          <div ref={vialsRef} className="flex items-end justify-center gap-5 sm:gap-8 md:col-span-6 md:gap-10 lg:col-span-7 lg:gap-12">
            {levels.map((l, i) => (
              <Vial key={l.name} level={l} index={i} filled={filled} />
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
