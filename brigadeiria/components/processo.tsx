"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { useRef, useState } from "react";
import { flavorById, steps } from "@/lib/site";
import { Brigadeiro, rng } from "./brigadeiro";
import { EASE_OUT, useReducedMotion } from "./ui";

/*
 * Do tacho à forminha: a seção fica presa enquanto a rolagem conta as quatro etapas.
 * É o único bloco "chocolate" da página (troca de cor proposital, uma vez só).
 */

const belga = flavorById["belga"];
// massa recém-enrolada, ainda sem granulado: mais clara para aparecer no fundo de chocolate
const massa = { ...belga, id: "massa", base: "#7a3d27", topping: "po" as const, bits: ["#8a4a30", "#6a3220"] };

function Barra() {
  // barra de chocolate 3x4 que se parte: os quadradinhos se soltam um a um
  const rand = rng("barra");
  return (
    <svg viewBox="0 0 240 240" className="h-full w-full" aria-hidden>
      <g transform="rotate(-14 120 120)">
        {/* corpo da barra */}
        <rect x={50} y={30} width={140} height={184} rx={8} fill="#3b1a10" />
        {Array.from({ length: 12 }, (_, i) => {
          const c = i % 3;
          const r = Math.floor(i / 3);
          const loose = i === 2 || i === 5;
          return (
            <motion.g
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={loose ? { opacity: 1, x: 10 + rand() * 12, y: -4 - rand() * 8, rotate: 8 + rand() * 14 } : { opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.05 * i + (loose ? 0.5 : 0) }}
            >
              <rect x={56 + c * 44} y={36 + r * 44} width={40} height={40} rx={4} fill="#4a2418" />
              <rect x={62 + c * 44} y={42 + r * 44} width={28} height={28} rx={3} fill="#5c2e1e" />
              <path d={`M62 ${42 + r * 44} h28 l-4 4 h-20 v20 l-4 4z`} transform={`translate(${c * 44} 0)`} fill="#7a4029" opacity={0.7} />
            </motion.g>
          );
        })}
      </g>
      <text x="120" y="226" textAnchor="middle" className="fill-[#e9c9b8] font-display text-[13px] font-semibold tracking-[0.2em] uppercase">
        Belga
      </text>
    </svg>
  );
}

function Tacho() {
  const reduce = useReducedMotion();
  return (
    <svg viewBox="0 0 240 240" className="h-full w-full" aria-hidden>
      {/* panela */}
      <path d="M30 104 h180 v58 c0 26 -36 44 -90 44 s-90 -18 -90 -44z" fill="#2f2f33" />
      <path d="M30 104 h180 v14 c-30 14 -150 14 -180 0z" fill="#3c3c41" />
      <path d="M210 112 h22 a6 6 0 0 1 0 12 h-22z" fill="#2f2f33" />
      <ellipse cx={120} cy={104} rx={90} ry={24} fill="#4a4a50" />
      <ellipse cx={120} cy={106} rx={82} ry={19} fill="#3b1a10" />
      {/* redemoinho do chocolate */}
      <motion.g
        style={{ transformOrigin: "120px 106px", transformBox: "view-box" }}
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: 6, ease: "linear", repeat: Infinity }}
      >
        <g transform="translate(120 106) scale(1 0.23)">
          <path d="M0 0 C 20 -20 50 -10 52 18 C 54 50 10 70 -24 58 C -64 44 -74 -6 -48 -40 C -20 -76 40 -78 70 -46" stroke="#6b3420" strokeWidth={10} fill="none" strokeLinecap="round" />
        </g>
      </motion.g>
      {/* colher de pau mexendo */}
      <motion.g
        style={{ transformOrigin: "120px 100px", transformBox: "view-box" }}
        animate={reduce ? undefined : { rotate: [-14, 14] }}
        transition={{ duration: 1.4, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }}
      >
        <path d="M150 10 L124 96" stroke="#c99a62" strokeWidth={9} strokeLinecap="round" />
        <ellipse cx={121} cy={104} rx={9} ry={5} fill="#b9874f" />
      </motion.g>
      {/* vapor */}
      <g stroke="#e9c9b8" strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.5}>
        <path className="steam" d="M70 74 q-6 -10 0 -20 q6 -10 0 -20" />
        <path className="steam" style={{ animationDelay: "-1.4s" }} d="M176 74 q-6 -10 0 -20 q6 -10 0 -20" />
      </g>
    </svg>
  );
}

function Enrolar() {
  const reduce = useReducedMotion();
  return (
    <div className="relative h-full w-full" aria-hidden>
      {/* bolinhas prontas esperando */}
      <div className="absolute bottom-[22%] left-[6%] flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 14, delay: 0.15 * i }}
          >
            <Brigadeiro flavor={massa} bare className="size-14 md:size-16" />
          </motion.div>
        ))}
      </div>
      {/* a bolinha sendo enrolada: vai e volta girando, com um leve achatamento */}
      <motion.div
        className="absolute right-[10%] bottom-[18%] w-[42%]"
        animate={reduce ? undefined : { x: [-30, 30], rotate: [-140, 140], scaleY: [0.94, 1, 0.94], scaleX: [1.05, 1, 1.05] }}
        transition={{ duration: 1.2, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }}
      >
        <Brigadeiro flavor={massa} bare className="w-full" />
      </motion.div>
      <div className="absolute inset-x-[4%] bottom-[17%] h-[3px] rounded-full bg-[#e9c9b8]/25" />
    </div>
  );
}

function Forminha() {
  const reduce = useReducedMotion();
  const rand = rng("chuva");
  return (
    <div className="relative h-full w-full" aria-hidden>
      <motion.div
        className="absolute inset-[8%]"
        initial={reduce ? { opacity: 0 } : { y: -160, opacity: 0 }}
        animate={reduce ? { opacity: 1 } : { y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 180, damping: 14 }}
      >
        <Brigadeiro flavor={belga} className="h-full w-full drop-shadow-[0_30px_40px_rgba(0,0,0,0.4)]" />
      </motion.div>
      {/* chuva de granulado */}
      {!reduce &&
        Array.from({ length: 26 }, (_, i) => (
          <motion.span
            key={i}
            className="absolute top-0 block h-[4px] w-[11px] rounded-full bg-[#1e0c07]"
            style={{ left: `${30 + rand() * 40}%`, rotate: rand() * 180 }}
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: [-40, 160 + rand() * 60], opacity: [0, 1, 0] }}
            transition={{ duration: 1.1, ease: "easeIn", delay: 0.3 + rand() * 1.2, repeat: Infinity, repeatDelay: 1 + rand() }}
          />
        ))}
    </div>
  );
}

const visuals = [Barra, Tacho, Enrolar, Forminha];

export function Processo() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const line = useSpring(scrollYProgress, { stiffness: 140, damping: 28 });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const i = Math.min(steps.length - 1, Math.floor(v * steps.length * 0.999));
    setActive((a) => (a === i ? a : i));
  });

  const Visual = visuals[active];

  return (
    <section
      ref={ref}
      aria-labelledby="processo-titulo"
      className="relative bg-cocoa text-cream"
      style={{ height: reduce ? undefined : `${steps.length * 85 + 40}dvh` }}
    >
      {/* borda de chocolate derretido no topo */}
      <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="absolute -top-[59px] left-0 h-[60px] w-full text-cocoa" aria-hidden>
        <path
          fill="currentColor"
          d="M0 60 V40 C 60 40 80 10 120 12 C 170 14 160 52 220 50 C 280 48 290 6 360 8 C 420 10 420 46 480 46 C 560 46 560 0 640 4 C 700 8 690 50 760 52 C 830 54 840 14 900 12 C 960 10 970 44 1030 46 C 1100 48 1110 4 1180 6 C 1250 8 1250 48 1320 46 C 1380 44 1400 24 1440 26 V60Z"
        />
      </svg>

      {/* gotas escorrendo na borda de baixo */}
      <svg viewBox="0 0 1440 70" preserveAspectRatio="none" className="absolute -bottom-[69px] left-0 z-10 h-[70px] w-full text-cocoa" aria-hidden>
        <path
          fill="currentColor"
          d="M0 0 H1440 V14 C 1400 14 1390 22 1380 34 C 1372 46 1356 46 1352 32 C 1346 18 1300 16 1240 16 C 1180 16 1170 20 1164 40 C 1158 62 1134 62 1130 40 C 1126 20 1100 14 1020 14 C 940 14 900 18 892 28 C 884 40 868 40 864 26 C 860 16 820 14 700 14 C 600 14 580 18 574 44 C 568 66 542 66 540 44 C 538 22 520 16 440 16 C 360 16 330 18 324 30 C 318 42 302 42 298 30 C 294 18 260 14 180 14 C 120 14 104 20 100 36 C 96 52 76 52 74 36 C 72 20 40 14 0 14Z"
        />
      </svg>

      <div className={reduce ? "py-24" : "sticky top-0 flex h-[100dvh] items-center overflow-hidden"}>
        <div className="mx-auto grid w-full max-w-[1320px] items-center gap-6 px-4 md:grid-cols-2 md:gap-12 md:px-8">
          <div className="order-2 md:order-1">
            <h2 id="processo-titulo" className="font-display text-[clamp(2rem,4.6vw,3.8rem)] leading-[1] font-extrabold tracking-[-0.035em]">
              Do tacho à forminha
            </h2>
            <ol className="relative mt-8 space-y-1 pl-7 md:mt-10">
              {/* trilho que enche com a rolagem */}
              <span className="absolute top-2 bottom-2 left-0 w-[3px] rounded-full bg-cream/12" aria-hidden />
              {!reduce && (
                <motion.span
                  className="absolute top-2 bottom-2 left-0 w-[3px] origin-top rounded-full bg-accent"
                  style={{ scaleY: line }}
                  aria-hidden
                />
              )}
              {steps.map((s, i) => {
                const on = reduce || i === active;
                return (
                  <li key={s.title} className="py-2.5" aria-current={i === active ? "step" : undefined}>
                    <motion.h3
                      className="font-display text-[clamp(1.3rem,2.2vw,1.8rem)] font-bold tracking-tight"
                      animate={{ opacity: on ? 1 : 0.32, x: on && !reduce ? 6 : 0 }}
                      transition={{ duration: 0.4, ease: EASE_OUT }}
                    >
                      {s.title}
                    </motion.h3>
                    <motion.div
                      initial={false}
                      animate={{ height: on ? "auto" : 0, opacity: on ? 1 : 0 }}
                      transition={{ duration: 0.45, ease: EASE_OUT }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-[40ch] pt-1.5 text-[16px] leading-relaxed text-cream/75 md:text-[17px]">{s.text}</p>
                    </motion.div>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="relative order-1 mx-auto aspect-square w-full max-w-[min(500px,44dvh)] md:order-2 md:max-w-[520px]">
            <div className="absolute inset-[6%] rounded-full bg-[radial-gradient(circle_at_50%_45%,#5c2e1e,#2a140e_72%)]" aria-hidden />
            <AnimatePresence mode="wait">
              <motion.div
                key={reduce ? "static" : active}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 0.9, rotate: -6 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.92, rotate: 6 }}
                transition={{ duration: 0.45, ease: EASE_OUT }}
              >
                {reduce ? <Forminha /> : <Visual />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
