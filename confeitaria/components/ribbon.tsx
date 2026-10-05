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
import { getProduct, productArt, products, type DoceProduct } from "@/lib/menu";
import { Art } from "./art";

const wrap = (min: number, max: number, v: number) => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

const names = products.filter((p) => p.kind === "cake").map((p) => p.name);
const gourmet = getProduct("brigadeiros-gourmet") as DoceProduct;
const dots = gourmet.flavors.map((f) => productArt(gourmet, { flavor: f.id }));

// Faixa de sabores que corre sozinha e acelera (ou inverte) com a velocidade da rolagem.
export function Ribbon() {
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
    let move = direction.current * -1.6 * (delta / 1000);
    const f = factor.get();
    if (f < 0) direction.current = -1;
    else if (f > 0) direction.current = 1;
    move += move * Math.abs(f);
    base.set(base.get() + move);
  });

  const row = [...names, ...names];
  return (
    <section aria-label="Sabores de bolo" className="relative py-6 md:py-10">
      <div ref={ref} className="-rotate-[1.6deg] bg-rose py-4 shadow-[0_20px_50px_-30px_rgba(122,63,70,0.6)] md:py-5">
        <div className="overflow-hidden">
          <motion.ul className="flex w-max items-center" style={{ transform }}>
            {row.map((name, i) => (
              <li key={i} className="flex items-center" aria-hidden={i >= names.length}>
                <span className="whitespace-nowrap px-5 font-script text-[clamp(2rem,4.4vw,3.4rem)] leading-[1.25] text-cocoa md:px-8">
                  {name}
                </span>
                <span className="size-11 shrink-0 md:size-14" aria-hidden>
                  <Art art={dots[i % dots.length]} />
                </span>
              </li>
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}
