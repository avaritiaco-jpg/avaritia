"use client";

import { motion, useAnimationFrame, useInView, useMotionValue, useTransform } from "motion/react";
import { useRef } from "react";
import { InstagramLogo } from "@phosphor-icons/react/dist/ssr";
import { fotos } from "@/lib/fotos";
import { site } from "@/lib/site";
import { Photo } from "./photo";
import { GhostButton, useReducedMotion } from "./ui";

const wrap = (min: number, max: number, v: number) => ((((v - min) % (max - min)) + (max - min)) % (max - min)) + min;

// Faixa de fotos que corre devagar e pausa com o mouse em cima (a única faixa animada da página)
export function Galeria() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref);
  const paused = useRef(false);
  const base = useMotionValue(0);
  const x = useTransform(base, (v) => `${wrap(-50, 0, v)}%`);

  useAnimationFrame((_, delta) => {
    if (reduce || !visible || paused.current) return;
    base.set(base.get() - 0.9 * (delta / 1000));
  });

  const row = [...fotos, ...fotos];
  return (
    <section aria-labelledby="galeria-titulo" className="relative py-20 md:py-24">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-end justify-between gap-6 px-4 md:px-8">
        <h2 id="galeria-titulo" className="font-display text-[clamp(2.2rem,4.4vw,3.4rem)] leading-[1.05] font-semibold">
          Novidades saem primeiro no Instagram
        </h2>
        <GhostButton href={site.instagram}>
          <InstagramLogo size={20} weight="bold" /> {site.instagramHandle}
        </GhostButton>
      </div>
      <div
        ref={ref}
        className="mt-10 overflow-hidden"
        onPointerEnter={() => (paused.current = true)}
        onPointerLeave={() => (paused.current = false)}
      >
        <motion.ul className="flex w-max gap-3 md:gap-4" style={{ x }}>
          {row.map((f, i) => (
            <li key={i} aria-hidden={i >= fotos.length} className="size-40 shrink-0 overflow-hidden rounded-[1.25rem] bg-bg-2 md:size-52">
              <Photo foto={f} fill />
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
