"use client";

import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { useRef } from "react";
import { brands } from "@/lib/catalog";
import { setFilters } from "@/lib/store";
import { scrollToId } from "@/lib/scroll";

const wrap = (min: number, max: number, v: number) => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

// Faixa infinita que acelera e inverte com a velocidade da rolagem.
function VelocityRow({ items, baseSpeed, onPick }: { items: string[]; baseSpeed: number; onPick: (b: string) => void }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref);
  const base = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const factor = useTransform(velocity, [-1500, 0, 1500], [-4, 0, 4], { clamp: false });
  const direction = useRef(1);

  const transform = useTransform(base, (v) => `translate3d(${wrap(-50, 0, v)}%, 0, 0)`);

  useAnimationFrame((_, delta) => {
    if (reduce || !visible) return;
    let move = direction.current * baseSpeed * (delta / 1000);
    const f = factor.get();
    if (f < 0) direction.current = -1;
    else if (f > 0) direction.current = 1;
    move += move * Math.abs(f);
    base.set(base.get() + move);
  });

  const row = [...items, ...items];
  return (
    <div ref={ref} className="mask-fade-x overflow-hidden">
      <motion.ul className="flex w-max items-center" style={{ transform }}>
        {row.map((name, i) => (
          <li key={i} className="flex items-center" aria-hidden={i >= items.length}>
            <button
              type="button"
              tabIndex={i >= items.length ? -1 : 0}
              onClick={() => onPick(name)}
              className="px-6 font-display text-[clamp(2.4rem,6vw,5.2rem)] font-light italic leading-none text-ivory/80 transition-colors duration-300 ease-out hover:text-amber-soft md:px-10"
            >
              {name}
            </button>
            <span className="text-xl text-amber" aria-hidden>
              ✦
            </span>
          </li>
        ))}
      </motion.ul>
    </div>
  );
}

export function BrandMarquee() {
  const names = brands.filter((b) => b.name !== "Linha Promo").map((b) => b.name);
  const half = Math.ceil(names.length / 2);

  const pick = (brand: string) => {
    setFilters({ brand, category: "todos", query: "" });
    scrollToId("catalogo");
  };

  return (
    <section aria-label="Marcas" className="relative border-y border-line py-10 md:py-14">
      <div className="flex flex-col gap-4 md:gap-6">
        <VelocityRow items={names.slice(0, half)} baseSpeed={-2.2} onPick={pick} />
        <VelocityRow items={names.slice(half)} baseSpeed={2.2} onPick={pick} />
      </div>
    </section>
  );
}
