"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { treats, type Treat } from "@/lib/site";
import { TreatArt } from "./treats";
import { EASE_OUT, RiseTitle, useReducedMotion } from "./ui";

// Mosaico com exatamente 7 peças: cada uma com tamanho e fundo próprios
const layout: Record<Treat["id"], { cell: string; tone: string; big?: boolean }> = {
  "bolo-cenoura": { cell: "md:col-span-2 md:row-span-2", tone: "bg-accent-soft", big: true },
  cafe: { cell: "md:col-span-2", tone: "bg-[#f2dccb] dark:bg-[#3a2219]" },
  brownie: { cell: "", tone: "bg-surface" },
  alfajor: { cell: "", tone: "bg-bg-2" },
  "pao-de-mel": { cell: "", tone: "bg-bg-2" },
  torta: { cell: "", tone: "bg-surface" },
  presente: { cell: "md:col-span-2", tone: "bg-[linear-gradient(135deg,var(--accent-soft),var(--bg-2))]" },
};

function Tile({ treat, index }: { treat: Treat; index: number }) {
  const reduce = useReducedMotion();
  const { cell, tone, big } = layout[treat.id];
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rx = useSpring(useTransform(py, [-0.5, 0.5], [6, -6]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(px, [-0.5, 0.5], [-8, 8]), { stiffness: 200, damping: 20 });
  const artX = useSpring(useTransform(px, [-0.5, 0.5], [-14, 14]), { stiffness: 160, damping: 18 });
  const artY = useSpring(useTransform(py, [-0.5, 0.5], [-10, 10]), { stiffness: 160, damping: 18 });
  // luz que segue o mouse
  const glow = useTransform([px, py], ([x, y]: number[]) => `radial-gradient(420px circle at ${(x + 0.5) * 100}% ${(y + 0.5) * 100}%, rgba(255,255,255,0.28), transparent 60%)`);

  return (
    <motion.article
      className={`${cell} [perspective:1000px]`}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 50, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.85, ease: EASE_OUT, delay: (index % 4) * 0.08 }}
    >
      <motion.div
        className={`group relative flex h-full min-h-[260px] flex-col overflow-hidden rounded-[2rem] p-6 ring-1 ring-line md:p-7 ${tone} ${
          big ? "md:min-h-[540px]" : ""
        }`}
        style={reduce ? undefined : { rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
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
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: glow }}
        />
        <motion.div
          className={`relative mx-auto w-full flex-1 ${big ? "max-w-[460px]" : "max-w-[240px]"}`}
          style={reduce ? undefined : { x: artX, y: artY, translateZ: 40 }}
        >
          <div className="transition-transform duration-500 ease-out group-hover:scale-[1.06] group-hover:-rotate-2">
            <TreatArt id={treat.id} />
          </div>
        </motion.div>
        <div className="relative mt-3">
          <h3 className={`font-display font-bold tracking-tight ${big ? "text-[clamp(1.6rem,2.6vw,2.2rem)]" : "text-[1.35rem]"}`}>{treat.name}</h3>
          <p className={`mt-1.5 max-w-[38ch] leading-relaxed opacity-75 ${big ? "text-[17px]" : "text-[15px]"}`}>{treat.text}</p>
        </div>
      </motion.div>
    </motion.article>
  );
}

export function AlgoMais() {
  return (
    <section id="algo-mais" className="relative pt-36 pb-24 md:pt-44 md:pb-32">
      <div className="mx-auto max-w-[1320px] px-4 md:px-8">
        <RiseTitle
          text="E o “algo mais”?"
          className="font-display text-[clamp(2.4rem,5.4vw,4.6rem)] leading-[1] font-extrabold tracking-[-0.035em]"
        />
        <p className="mt-4 max-w-[50ch] text-lg leading-relaxed text-ink-2">
          Brigadeiro é o nome da casa, mas a vitrine vai bem além. Para levar ou comer ali mesmo, com um café.
        </p>
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 md:auto-rows-[minmax(260px,auto)] md:grid-cols-4 md:gap-5">
          {treats.map((t, i) => (
            <Tile key={t.id} treat={t} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
