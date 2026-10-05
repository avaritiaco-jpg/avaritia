"use client";

import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { formatPrice, finalPrice, getProduct, type Product } from "@/lib/catalog";
import { site } from "@/lib/site";
import { openQuickView } from "@/lib/store";
import { useMedia } from "@/lib/use-media";
import { AddButton } from "./add-button";
import { Eyebrow, ProductImage, Reveal, SplitReveal } from "./ui";

const items = site.featured.flatMap((f) => {
  const product = getProduct(f.code);
  return product ? [{ product, note: f.note as string }] : [];
});

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

function IconCard({
  product,
  note,
  index,
  drift,
}: {
  product: Product;
  note: string;
  index: number;
  drift?: MotionValue<string>;
}) {
  const imgRef = useRef<HTMLDivElement>(null);
  return (
    <article className="group w-[78vw] shrink-0 snap-center sm:w-[56vw] md:w-[min(31vw,420px)]">
      <div className="rounded-[2.2rem] bg-white/[0.03] p-1.5 ring-1 ring-line">
        <div className="overflow-hidden rounded-[calc(2.2rem-0.375rem)] bg-noir-2 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
          <button
            type="button"
            onClick={() => openQuickView(product.code)}
            aria-label={`Ver detalhes de ${product.brand} ${product.name}`}
            className="plate relative block aspect-[4/4.2] w-full overflow-hidden"
          >
            <motion.div
              ref={imgRef}
              className="plate absolute inset-y-0 -inset-x-8"
              style={drift ? { transform: drift } : undefined}
            >
              <div
                className="tone-glow absolute inset-0 opacity-50 transition-opacity duration-700 ease-out group-hover:opacity-90"
                style={{ "--tone": `${product.tone}55` } as React.CSSProperties}
              />
              <div className="relative h-full w-full px-8">
                <ProductImage
                  product={product}
                  sizes="large"
                  className="transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                />
              </div>
            </motion.div>
            <span className="absolute left-5 top-5 font-mono text-[11px] tracking-widest text-ink-mute">
              {String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
            </span>
          </button>
          <div className="flex flex-col gap-4 p-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-amber-soft">{product.brand}</p>
              <h3 className="mt-2 font-display text-3xl font-light leading-tight text-ivory">{product.name}</h3>
              <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-mute">{note}</p>
            </div>
            <div className="flex items-end justify-between gap-4 border-t border-line pt-4">
              <div>
                <p className="text-[11px] text-faint">
                  {[product.concentration, product.size].filter(Boolean).join(" · ")}
                </p>
                <p className="mt-1 font-display text-2xl text-ivory">{formatPrice(finalPrice(product))}</p>
              </div>
              <AddButton product={product} sourceRef={imgRef} />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function Intro() {
  return (
    <div className="flex w-full shrink-0 flex-col justify-center gap-6 md:w-[min(34vw,460px)]">
      <Eyebrow>Ícones da casa</Eyebrow>
      <SplitReveal
        text="Os frascos que *todo mundo* pergunta o nome."
        className="font-display text-[clamp(2.6rem,5vw,4.6rem)] font-light leading-[0.95] text-ivory"
      />
      <Reveal delay={0.2}>
        <p className="max-w-[40ch] text-base leading-relaxed text-mute">
          Uma seleção dos mais desejados da lista: clássicos árabes, lançamentos e nicho italiano. Toque em qualquer
          um para ver os detalhes.
        </p>
      </Reveal>
    </div>
  );
}

export function Showcase() {
  const desktop = useMedia("(min-width: 768px)");
  const reduce = useReducedMotion();
  const pinned = desktop && !reduce;

  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const [current, setCurrent] = useState(1);

  useIsoLayoutEffect(() => {
    if (!pinned || !trackRef.current) return;
    const el = trackRef.current;
    const measure = () => setDistance(Math.max(0, el.scrollWidth - window.innerWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [pinned]);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });
  const trackTransform = useTransform(smooth, (v) => `translate3d(${-v * distance}px, 0, 0)`);
  const ghostTransform = useTransform(smooth, (v) => `translate3d(${-v * distance * 0.35}px, 0, 0)`);
  const drift = useTransform(smooth, (v) => `translate3d(${(0.5 - v) * 50}px, 0, 0)`);
  const bar = useTransform(smooth, (v) => `scaleX(${v})`);

  useMotionValueEvent(smooth, "change", (v) => {
    setCurrent(Math.min(items.length, Math.max(1, Math.round(v * (items.length - 1)) + 1)));
  });

  if (!pinned) {
    return (
      <section id="icones" ref={sectionRef} className="relative py-24">
        <div className="px-4">
          <Intro />
        </div>
        <div className="no-scrollbar mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4">
          {items.map((it, i) => (
            <IconCard key={it.product.code} product={it.product} note={it.note} index={i} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      id="icones"
      ref={sectionRef}
      className="relative"
      style={{ height: `calc(100vh + ${distance}px)` }}
    >
      <div className="sticky top-0 flex h-[100dvh] flex-col justify-center overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2">
          <motion.p
            className="whitespace-nowrap font-display text-[24vw] font-light italic leading-none text-white/[0.025]"
            style={{ transform: ghostTransform }}
          >
            Ícones da casa · Ícones da casa
          </motion.p>
        </div>

        <motion.div ref={trackRef} className="relative flex w-max items-center gap-6 pl-[6vw] pr-[6vw]" style={{ transform: trackTransform }}>
          <Intro />
          <div className="w-[4vw] shrink-0" />
          {items.map((it, i) => (
            <IconCard key={it.product.code} product={it.product} note={it.note} index={i} drift={drift} />
          ))}
        </motion.div>

        <div className="absolute inset-x-[6vw] bottom-8 flex items-center gap-6">
          <span className="font-mono text-xs tabular-nums text-mute">
            {String(current).padStart(2, "0")}
            <span className="text-faint"> / {String(items.length).padStart(2, "0")}</span>
          </span>
          <span className="relative h-px flex-1 overflow-hidden bg-line">
            <motion.span className="absolute inset-0 origin-left bg-amber" style={{ transform: bar }} />
          </span>
        </div>
      </div>
    </section>
  );
}
