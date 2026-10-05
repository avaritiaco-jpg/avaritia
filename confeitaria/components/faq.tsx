"use client";

import { AnimatePresence, motion } from "motion/react";
import { useId, useState } from "react";
import { InstagramLogo, Plus, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { site, whatsappLink } from "@/lib/site";
import { EASE_OUT, Reveal, ScriptTitle } from "./ui";

function Item({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  const id = useId();
  return (
    <div className="border-b border-line">
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={id}
          className="group flex w-full items-center justify-between gap-6 py-5 text-left"
        >
          <span className="text-[17px] font-bold text-cocoa transition-colors duration-200 ease-out group-hover:text-rose-ink md:text-lg">
            {q}
          </span>
          <span
            className={`flex size-10 shrink-0 items-center justify-center rounded-full transition-[rotate,background-color,color] duration-300 ease-out ${
              open ? "rotate-45 bg-rose-deep text-white" : "bg-card text-cocoa ring-1 ring-line"
            }`}
          >
            <Plus size={16} weight="bold" />
          </span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            role="region"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            className="overflow-hidden"
          >
            <p className="max-w-[62ch] pb-6 text-base font-medium leading-relaxed text-mute">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="duvidas" className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 md:grid-cols-12 md:px-8 md:py-28">
      <div className="md:col-span-4">
        <ScriptTitle text="Bom saber" className="text-[clamp(3rem,6vw,4.6rem)]" />
        <Reveal delay={0.1} className="mt-6 flex flex-col gap-2">
          <p className="mb-2 max-w-[30ch] text-[15px] font-medium text-mute">Ficou alguma dúvida? Chama a gente:</p>
          <a
            href={whatsappLink(`Olá! Vim pelo site da ${site.fullName} e tenho uma dúvida.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 self-start rounded-full bg-card py-2 pl-2 pr-5 text-[15px] font-bold text-cocoa ring-1 ring-line transition-colors hover:bg-white"
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-blush-2 text-rose-deep">
              <WhatsappLogo size={18} weight="bold" />
            </span>
            {site.whatsappDisplay}
          </a>
          <a
            href={site.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 self-start rounded-full bg-card py-2 pl-2 pr-5 text-[15px] font-bold text-cocoa ring-1 ring-line transition-colors hover:bg-white"
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-blush-2 text-rose-deep">
              <InstagramLogo size={18} weight="bold" />
            </span>
            {site.instagramHandle}
          </a>
        </Reveal>
      </div>
      <Reveal className="md:col-span-8">
        <div className="border-t border-line">
          {site.faq.map((item, i) => (
            <Item key={item.q} q={item.q} a={item.a} open={open === i} onToggle={() => setOpen(open === i ? null : i)} />
          ))}
        </div>
      </Reveal>
    </section>
  );
}
