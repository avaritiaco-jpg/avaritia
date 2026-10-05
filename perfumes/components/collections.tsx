"use client";

import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { motion, useReducedMotion } from "motion/react";
import { getProduct, products, type Filters, type Product } from "@/lib/catalog";
import { setFilters, resetFilters } from "@/lib/store";
import { scrollToId } from "@/lib/scroll";
import { EASE_OUT, Eyebrow, gentle, ProductImage, SplitReveal } from "./ui";

type Tile = {
  title: string;
  kicker: string;
  codes: string[];
  filter: Partial<Filters>;
  className: string;
  glow: string;
};

const count = (fn: (p: Product) => boolean) => products.filter(fn).length;

const tiles: Tile[] = [
  {
    title: "Perfumes",
    kicker: `${count((p) => p.category === "perfume")} fragrâncias`,
    codes: ["7962-4", "7239-7", "9885-4"],
    filter: { category: "perfume" },
    className: "md:col-span-7 md:row-span-2",
    glow: "rgba(214,163,92,0.28)",
  },
  {
    title: "Nicho italiano",
    kicker: `Xerjoff · ${count((p) => p.brand === "Xerjoff")} fragrâncias`,
    codes: ["9669-0", "9683-6", "9664-5"],
    filter: { brand: "Xerjoff" },
    className: "md:col-span-5",
    glow: "rgba(120,170,160,0.22)",
  },
  {
    title: "Body splash & mists",
    kicker: `${count((p) => p.category === "body")} opções para o corpo e o cabelo`,
    codes: ["9214-2", "9220-3", "9221-0"],
    filter: { category: "body" },
    className: "md:col-span-5",
    glow: "rgba(230,120,160,0.22)",
  },
  {
    title: "Kits & presentes",
    kicker: `${count((p) => p.category === "kit")} kits para presentear`,
    codes: ["9625-6", "9346-0", "8719-3"],
    filter: { category: "kit" },
    className: "md:col-span-4",
    glow: "rgba(150,120,220,0.2)",
  },
  {
    title: "Corpo & cabelo",
    kicker: `${count((p) => p.category === "cuidados")} cremes e tratamentos`,
    codes: ["9314-9", "9099-5", "9316-3"],
    filter: { category: "cuidados" },
    className: "md:col-span-4",
    glow: "rgba(200,170,120,0.22)",
  },
  {
    title: "Linha Promo",
    kicker: `${count((p) => p.brand === "Linha Promo")} fragrâncias`,
    codes: ["7909-9", "7893-1", "7916-7"],
    filter: { brand: "Linha Promo" },
    className: "md:col-span-4",
    glow: "rgba(214,120,80,0.22)",
  },
];

// Leque de frascos: abre ao passar o mouse
const fan = [
  "-rotate-[9deg] -translate-x-[58%] group-hover:-rotate-[15deg] group-hover:-translate-x-[78%] group-hover:-translate-y-2",
  "z-10 translate-y-[-6%] group-hover:-translate-y-[12%] group-hover:scale-[1.04]",
  "rotate-[9deg] translate-x-[58%] group-hover:rotate-[15deg] group-hover:translate-x-[78%] group-hover:-translate-y-2",
];

function TileCard({ tile, index }: { tile: Tile; index: number }) {
  const reduce = useReducedMotion();
  const big = index === 0;
  const items = tile.codes.map((c) => getProduct(c)).filter(Boolean) as Product[];

  return (
    <motion.div
      className={tile.className}
      initial={{ opacity: 0, transform: "translateY(40px)", filter: "blur(8px)" }}
      whileInView={{ opacity: 1, transform: "translateY(0px)", filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.2 }}
      transition={gentle(reduce, { duration: 1, delay: (index % 3) * 0.08, ease: EASE_OUT })}
    >
      <button
        type="button"
        onClick={() => {
          resetFilters();
          setFilters(tile.filter);
          scrollToId("catalogo");
        }}
        className="group block h-full w-full rounded-[2.2rem] bg-white/[0.03] p-1.5 text-left ring-1 ring-line transition-[box-shadow] duration-500 ease-out hover:ring-line-strong"
      >
        <div
          className={`relative flex h-full flex-col justify-between overflow-hidden rounded-[calc(2.2rem-0.375rem)] bg-noir-2 p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] md:p-8 ${
            big ? "min-h-[420px] md:min-h-[560px]" : "min-h-[300px]"
          }`}
        >
          <div
            aria-hidden
            className="absolute inset-0 opacity-70 transition-opacity duration-700 ease-out group-hover:opacity-100"
            style={{ background: `radial-gradient(70% 60% at 50% 62%, ${tile.glow}, transparent 70%)` }}
          />

          <div className="relative flex items-start justify-between gap-4">
            <div>
              <h3
                className={`font-display font-light leading-none text-ivory ${
                  big ? "text-5xl md:text-7xl" : "text-4xl"
                }`}
              >
                {tile.title}
              </h3>
              <p className="mt-3 text-sm text-mute">{tile.kicker}</p>
            </div>
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-ivory ring-1 ring-line transition-transform duration-500 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:bg-amber group-hover:text-noir">
              <ArrowUpRight size={18} weight="light" />
            </span>
          </div>

          <div className={`relative mx-auto mt-8 flex w-full items-end justify-center ${big ? "h-64 md:h-80" : "h-40"}`}>
            {items.map((p, i) => (
              <div
                key={p.code}
                className={`plate absolute bottom-0 aspect-[3/4] overflow-hidden rounded-2xl shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)] ring-1 ring-black/5 transition-transform duration-700 ease-out ${
                  big ? "w-[34%] md:w-[30%]" : "w-[30%]"
                } ${fan[i]}`}
              >
                <ProductImage product={p} />
              </div>
            ))}
          </div>
        </div>
      </button>
    </motion.div>
  );
}

export function Collections() {
  return (
    <section id="colecoes" className="relative mx-auto max-w-7xl px-4 py-28 md:px-8 md:py-40">
      <div className="mb-14 flex flex-col gap-6 md:mb-20 md:flex-row md:items-end md:justify-between">
        <div>
          <Eyebrow>Coleções</Eyebrow>
          <SplitReveal
            text="Comece pelo *que combina* com você."
            className="mt-6 max-w-[14ch] font-display text-[clamp(2.6rem,5.4vw,5rem)] font-light leading-[0.95] text-ivory"
          />
        </div>
        <p className="max-w-[36ch] text-base leading-relaxed text-mute">
          Atalhos para o catálogo: escolha uma coleção e a lista já abre filtrada.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-5">
        {tiles.map((t, i) => (
          <TileCard key={t.title} tile={t} index={i} />
        ))}
      </div>
    </section>
  );
}
