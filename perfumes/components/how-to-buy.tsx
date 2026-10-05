"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { site } from "@/lib/site";
import { Eyebrow, Reveal, SplitReveal } from "./ui";

function Dot({ progress, at }: { progress: MotionValue<number>; at: number }) {
  const lit = useTransform(progress, [Math.max(0, at - 0.04), at], [0, 1]);
  const transform = useTransform(lit, (v) => `scale(${0.6 + v * 0.4})`);
  return (
    <span className="relative z-10 flex size-4 items-center justify-center rounded-full bg-noir ring-1 ring-line-strong">
      <motion.span className="size-2 rounded-full bg-amber" style={{ opacity: lit, transform }} />
    </span>
  );
}

export function HowToBuy() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.55"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const line = useTransform(progress, (v) => `scaleX(${v})`);
  const n = site.steps.length;

  return (
    <section id="como-comprar" className="relative mx-auto max-w-7xl px-4 py-28 md:px-8 md:py-40">
      <div className="max-w-2xl">
        <Eyebrow>Como comprar</Eyebrow>
        <SplitReveal
          text="Do catálogo à sua casa *em uma conversa.*"
          className="mt-6 font-display text-[clamp(2.6rem,5.4vw,5rem)] font-light leading-[0.95] text-ivory"
        />
      </div>

      <div ref={ref} className="relative mt-20">
        {/* trilho que se desenha com a rolagem (desktop) */}
        <div className="absolute left-0 right-0 top-[7px] hidden h-px bg-line md:block" aria-hidden>
          <motion.div
            className="h-full origin-left bg-gradient-to-r from-amber-deep via-amber to-amber-soft"
            style={reduce ? undefined : { transform: line }}
          />
        </div>

        <ol className="grid gap-12 md:grid-cols-4 md:gap-8">
          {site.steps.map((s, i) => (
            <li key={s.title} className="relative flex gap-6 md:flex-col md:gap-8">
              <div className="hidden md:block">
                <Dot progress={reduce ? scrollYProgress : progress} at={i / Math.max(1, n - 1)} />
              </div>
              <Reveal delay={i * 0.08} className="flex gap-6 md:flex-col md:gap-5">
                <span className="font-display text-5xl font-light italic leading-none text-gold md:text-6xl">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-display text-3xl font-light text-ivory">{s.title}</h3>
                  <p className="mt-3 max-w-[30ch] text-sm leading-relaxed text-mute">{s.text}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
