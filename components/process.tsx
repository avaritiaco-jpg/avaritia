"use client";

import { useRef } from "react";
import { motion, useScroll } from "motion/react";
import { ChatsCircle, Code, PencilRuler, Rocket } from "@phosphor-icons/react";
import { ButtonLink, container, h2 } from "@/components/ui";
import { site, steps } from "@/lib/site";

const icons = [ChatsCircle, PencilRuler, Code, Rocket];

export function Process() {
  const listRef = useRef<HTMLOListElement>(null);
  // A linha dourada avança junto com a leitura das etapas.
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 0.7", "end 0.55"] });

  return (
    <section id="processo" className="scroll-mt-20 border-t border-line py-24 md:py-36">
      <div className={`${container} grid gap-16 lg:grid-cols-12 lg:gap-10`}>
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <h2 className={h2}>Do primeiro contato ao site no ar.</h2>
            <p className="mt-6 max-w-[42ch] text-lg leading-relaxed text-mute">
              Um processo claro, com prazos combinados e você acompanhando cada etapa de perto.
            </p>
            <ButtonLink href="#contato" className="mt-10">
              {site.cta}
            </ButtonLink>
          </div>
        </div>

        <ol ref={listRef} className="relative lg:col-span-6 lg:col-start-7">
          <div aria-hidden className="absolute bottom-6 left-[23px] top-6 w-px bg-line">
            <motion.div style={{ scaleY: scrollYProgress }} className="h-full w-px origin-top bg-gold" />
          </div>
          {steps.map((step, i) => {
            const Icon = icons[i];
            return (
              <motion.li
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="relative grid grid-cols-[48px_1fr] gap-6 pb-16 last:pb-0 md:gap-8 md:pb-24"
              >
                <span className="relative z-10 grid size-12 place-items-center rounded-full border border-line-strong bg-ink text-gold">
                  <Icon size={22} />
                </span>
                <div className="pt-1">
                  <p className="font-mono text-sm text-gold">{step.time}</p>
                  <h3 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-paper md:text-[2.5rem]">
                    {step.title}
                  </h3>
                  <p className="mt-4 max-w-[46ch] text-lg leading-relaxed text-mute">{step.text}</p>
                </div>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
