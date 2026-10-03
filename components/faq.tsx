"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus } from "@phosphor-icons/react";
import { h2 } from "@/components/ui";
import { faq, whatsappLink } from "@/lib/site";

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const baseId = useId();

  return (
    <section id="duvidas" className="scroll-mt-20 border-t border-line py-24 md:py-36">
      <div className="mx-auto w-full max-w-[900px] px-5 md:px-8">
        <div className="text-center">
          <h2 className={h2}>Perguntas frequentes</h2>
          <p className="mt-6 text-lg text-mute">
            Não encontrou sua dúvida?{" "}
            <a
              href={whatsappLink("Olá, Avaritia! Tenho uma dúvida sobre a criação de sites.")}
              target="_blank"
              rel="noopener noreferrer"
              className="text-paper underline decoration-gold decoration-2 underline-offset-4 transition-colors hover:text-gold"
            >
              Pergunte no WhatsApp
            </a>
            .
          </p>
        </div>

        <ul className="mt-14 md:mt-20">
          {faq.map((item, i) => {
            const isOpen = open === i;
            const panelId = `${baseId}-panel-${i}`;
            const buttonId = `${baseId}-button-${i}`;
            return (
              <li key={item.q} className="border-b border-line">
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-6 py-7 text-left text-lg font-medium tracking-[-0.02em] text-paper transition-colors hover:text-gold md:text-[1.35rem]"
                  >
                    {item.q}
                    <span
                      className={`grid size-10 shrink-0 place-items-center rounded-full border transition-[transform,background-color,border-color,color] duration-500 ease-out-expo ${
                        isOpen ? "rotate-45 border-gold bg-gold text-ink" : "border-line-strong text-paper"
                      }`}
                      aria-hidden
                    >
                      <Plus size={16} weight="bold" />
                    </span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-[62ch] pb-8 pr-14 text-[17px] leading-relaxed text-mute">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
