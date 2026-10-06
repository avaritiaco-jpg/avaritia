"use client";

import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "motion/react";
import { ArrowDown } from "@phosphor-icons/react/dist/ssr";
import { foto } from "@/lib/fotos";
import { site } from "@/lib/site";
import { scrollToId } from "@/lib/scroll";
import { Photo } from "./photo";
import { EASE_OUT, GhostButton, RiseTitle, WhatsButton, useReducedMotion } from "./ui";

// Três fotos reais em camadas: cada uma segue o mouse numa profundidade diferente
const pilha = [
  { f: foto("torre-macarons-natal"), className: "left-0 top-[6%] w-[44%] -rotate-[7deg]", depth: 18, delay: 0.25 },
  { f: foto("torta-pistache-morango"), className: "right-0 bottom-[2%] w-[46%] rotate-[6deg]", depth: 30, delay: 0.4 },
  { f: foto("entremet-tangerina"), className: "left-[26%] top-[14%] w-[50%] rotate-[1.5deg] z-10", depth: 42, delay: 0.1 },
];

function Card({ f, className, depth, delay, sx, sy }: (typeof pilha)[number] & { sx: MotionValue<number>; sy: MotionValue<number> }) {
  const reduce = useReducedMotion();
  const x = useTransform(sx, (v) => v * -depth);
  const y = useTransform(sy, (v) => v * -depth * 0.7);
  return (
    <motion.figure className={`absolute ${className}`} style={{ x, y }}>
      <motion.div
        className="overflow-hidden rounded-[1.5rem] bg-surface p-2 shadow-[0_30px_60px_-28px_rgba(90,31,26,0.55)] ring-1 ring-line"
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 60, scale: 0.9, rotate: -4 }}
        animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 18, delay }}
        whileHover={reduce ? undefined : { scale: 1.03, rotate: -1 }}
      >
        <Photo foto={f} eager className="rounded-[1.1rem]" />
      </motion.div>
    </motion.figure>
  );
}

export function Hero() {
  const reduce = useReducedMotion();
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 70, damping: 18 });
  const sy = useSpring(py, { stiffness: 70, damping: 18 });

  return (
    <section id="topo" className="relative isolate overflow-clip">
      <div aria-hidden className="absolute -top-32 -right-40 -z-10 size-[640px] rounded-full bg-wine-soft opacity-60 blur-3xl" />

      <div className="mx-auto grid max-w-[1240px] items-center gap-12 px-4 pt-44 pb-20 md:px-8 lg:min-h-[92dvh] lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:pt-36">
        <div>
          <motion.p
            className="font-script text-[clamp(1.9rem,3vw,2.4rem)] leading-none text-gold"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE_OUT }}
          >
            desde {site.since}
          </motion.p>
          <RiseTitle
            as="h1"
            text="Confeitaria fina no coração da Pelinca"
            className="mt-3 font-display text-[clamp(2.8rem,6vw,5rem)] leading-[1.02] font-semibold tracking-[-0.01em] text-ink"
          />
          <motion.p
            className="mt-6 max-w-[48ch] text-[clamp(1.05rem,1.4vw,1.2rem)] leading-relaxed text-ink-2"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.5 }}
          >
            Entremets em forma de fruta, torres de macarons, bolos, tortas e docinhos finos, feitos à mão em Campos dos Goytacazes.
          </motion.p>
          <motion.div
            className="mt-9 flex flex-wrap items-center gap-3"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.65 }}
          >
            <WhatsButton />
            <GhostButton
              href="#doces"
              onClick={(e) => {
                e.preventDefault();
                scrollToId("doces");
              }}
            >
              Ver os doces
              <ArrowDown size={18} weight="bold" />
            </GhostButton>
          </motion.div>
        </div>

        <div
          className="relative mx-auto aspect-[1/0.95] w-full max-w-[560px]"
          onPointerMove={(e) => {
            if (reduce || e.pointerType !== "mouse") return;
            const r = e.currentTarget.getBoundingClientRect();
            px.set((e.clientX - r.left) / r.width - 0.5);
            py.set((e.clientY - r.top) / r.height - 0.5);
          }}
          onPointerLeave={() => {
            px.set(0);
            py.set(0);
          }}
        >
          {pilha.map((c) => (
            <Card key={c.f.src} {...c} sx={sx} sy={sy} />
          ))}
        </div>
      </div>
    </section>
  );
}
