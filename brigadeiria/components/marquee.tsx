"use client";

import { useReducedMotion } from "./ui";
import { motion, useAnimationFrame, useInView, useMotionValue, useScroll, useSpring, useTransform, useVelocity } from "motion/react";
import { useRef } from "react";
import { flavors } from "@/lib/site";
import { Brigadeiro } from "./brigadeiro";

const wrap = (min: number, max: number, v: number) => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

// Faixa de sabores: corre sozinha e acelera (ou inverte) com a velocidade da rolagem.
export function Marquee() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref);
  const base = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const factor = useTransform(velocity, [-1500, 0, 1500], [-4, 0, 4], { clamp: false });
  const direction = useRef(1);
  const x = useTransform(base, (v) => `${wrap(-50, 0, v)}%`);

  useAnimationFrame((_, delta) => {
    if (reduce || !visible) return;
    let move = direction.current * -1.4 * (delta / 1000);
    const f = factor.get();
    if (f < 0) direction.current = -1;
    else if (f > 0) direction.current = 1;
    move += move * Math.abs(f);
    base.set(base.get() + move);
  });

  const row = [...flavors, ...flavors];
  return (
    <section aria-label="Alguns sabores" className="relative py-6 md:py-10">
      <div ref={ref} className="-rotate-[1.8deg] bg-ink py-3 text-bg md:py-4">
        <div className="overflow-hidden">
          <motion.ul className="flex w-max items-center" style={{ x }}>
            {row.map((f, i) => (
              <li key={i} className="flex items-center" aria-hidden={i >= flavors.length}>
                <span className="px-5 font-display text-[clamp(2rem,4.6vw,3.8rem)] leading-[1.15] font-bold tracking-[-0.03em] whitespace-nowrap md:px-7">
                  {f.name}
                </span>
                <Brigadeiro flavor={f} bare className="size-14 shrink-0 md:size-20" />
              </li>
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}
