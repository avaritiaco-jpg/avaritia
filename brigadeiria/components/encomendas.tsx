"use client";

import { motion, useScroll, useSpring } from "motion/react";
import { useRef } from "react";
import { foto } from "@/lib/fotos";
import { passos } from "@/lib/site";
import { Photo } from "./photo";
import { EASE_OUT, Reveal, RiseTitle, WhatsButton, useReducedMotion } from "./ui";

export function Encomendas() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLOListElement>(null);
  // a linha que liga os passos se desenha conforme a seção passa pela tela
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 55%"] });
  const linha = useSpring(scrollYProgress, { stiffness: 120, damping: 26 });

  return (
    <section id="encomendas" className="relative scroll-mt-28 bg-bg-2 py-20 md:py-28">
      <div className="mx-auto grid max-w-[1240px] gap-14 px-4 md:px-8 lg:grid-cols-[1fr_0.9fr] lg:gap-16">
        <div>
          <RiseTitle
            text="Encomendas para festas e presentes"
            className="max-w-[16ch] font-display text-[clamp(2.4rem,5vw,4rem)] leading-[1.02] font-semibold"
          />
          <p className="mt-4 max-w-[52ch] text-lg leading-relaxed text-ink-2">
            Torres de macarons, bolos, tortas, mesas de doces e entremets. Tudo é combinado pelo WhatsApp.
          </p>

          <ol ref={ref} className="relative mt-10 space-y-8 pl-14">
            <span aria-hidden className="absolute top-2 bottom-2 left-[19px] w-[2px] rounded-full bg-line" />
            {!reduce && (
              <motion.span aria-hidden className="absolute top-2 bottom-2 left-[19px] w-[2px] origin-top rounded-full bg-wine" style={{ scaleY: linha }} />
            )}
            {passos.map((p, i) => (
              <motion.li
                key={p.titulo}
                className="relative"
                initial={reduce ? { opacity: 0 } : { opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.6, ease: EASE_OUT, delay: i * 0.1 }}
              >
                <span className="absolute top-0 -left-14 grid size-10 place-items-center rounded-full bg-wine font-display text-xl font-semibold text-wine-ink">
                  {i + 1}
                </span>
                <h3 className="font-display text-[1.6rem] leading-tight font-semibold">{p.titulo}</h3>
                <p className="mt-1 max-w-[46ch] text-[16px] leading-relaxed text-ink-2">{p.texto}</p>
              </motion.li>
            ))}
          </ol>

          <Reveal className="mt-10" delay={0.1}>
            <WhatsButton label="Fazer uma encomenda" text="Olá! Gostaria de fazer uma encomenda. Data: / Quantidade: / O que desejo:" />
          </Reveal>
        </div>

        {/* duas fotos de festa, levemente desencontradas */}
        <div className="relative grid grid-cols-2 items-start gap-4">
          <Reveal className="mt-16">
            <div className="overflow-hidden rounded-[1.5rem] bg-surface p-2 ring-1 ring-line">
              <Photo foto={foto("torre-macarons-rosa")} className="rounded-[1.1rem]" />
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="overflow-hidden rounded-[1.5rem] bg-surface p-2 ring-1 ring-line">
              <Photo foto={foto("mesa-bolos-tortas")} className="rounded-[1.1rem]" />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
