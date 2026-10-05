"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import { Cake, CalendarCheck, QrCode, Storefront } from "@phosphor-icons/react/dist/ssr";
import { site } from "@/lib/site";
import { EASE_OUT, ScriptTitle, gentle } from "./ui";

const icons = [Cake, CalendarCheck, QrCode, Storefront];

export function HowToOrder() {
  const ref = useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion();
  // a linha que liga os passos se desenha conforme a seção passa pela tela
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 55%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const lineX = useTransform(progress, (v) => `scaleX(${reduce ? 1 : v})`);
  const lineY = useTransform(progress, (v) => `scaleY(${reduce ? 1 : v})`);

  return (
    <section id="como-encomendar" className="relative mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
      <ScriptTitle text="Como encomendar" className="text-[clamp(3rem,6.4vw,5rem)]" />

      <ol ref={ref} className="relative mt-12 grid gap-10 md:mt-16 md:grid-cols-4 md:gap-6">
        {/* trilho: horizontal no computador, vertical no celular */}
        <span aria-hidden className="absolute left-[27px] top-2 bottom-2 w-0.5 rounded-full bg-blush-3 md:hidden" />
        <motion.span
          aria-hidden
          className="absolute left-[27px] top-2 bottom-2 w-0.5 origin-top rounded-full bg-rose md:hidden"
          style={{ transform: lineY }}
        />
        <span aria-hidden className="absolute left-7 right-[12%] top-7 hidden h-0.5 rounded-full bg-blush-3 md:block" />
        <motion.span
          aria-hidden
          className="absolute left-7 right-[12%] top-7 hidden h-0.5 origin-left rounded-full bg-rose md:block"
          style={{ transform: lineX }}
        />

        {site.steps.map((step, i) => {
          const Icon = icons[i];
          return (
            <motion.li
              key={step.title}
              className="relative flex gap-5 md:flex-col md:gap-6"
              initial={{ opacity: 0, transform: "translateY(20px)" }}
              whileInView={{ opacity: 1, transform: "translateY(0px)" }}
              viewport={{ once: true, amount: 0.5 }}
              transition={gentle(reduce, { duration: 0.7, delay: i * 0.12, ease: EASE_OUT })}
            >
              <span className="relative z-10 flex size-14 shrink-0 items-center justify-center rounded-full bg-card text-rose-deep shadow-[0_10px_30px_-18px_rgba(122,63,70,0.6)] ring-1 ring-line">
                <Icon size={26} weight="duotone" />
              </span>
              <div className="pt-1 md:pt-0">
                <h3 className="text-xl font-bold text-cocoa">{step.title}</h3>
                <p className="mt-2 max-w-[30ch] text-[15px] font-medium leading-relaxed text-mute">{step.text}</p>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </section>
  );
}
