"use client";

import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { CaretLeft, CaretRight, X } from "@phosphor-icons/react/dist/ssr";
import { fotos, type Categoria, type Foto } from "@/lib/fotos";
import { categorias } from "@/lib/site";
import { lockScroll } from "@/lib/scroll";
import { Photo } from "./photo";
import { EASE_OUT, RiseTitle, WhatsButton, useReducedMotion } from "./ui";

/** Foto ampliada: cresce a partir da miniatura (mesmo layoutId) e navega com setas e teclado */
function Lightbox({ lista, index, onClose, onMove }: { lista: Foto[]; index: number; onClose: () => void; onMove: (d: number) => void }) {
  const f = lista[index];
  // os handlers mudam a cada render; o ref evita destravar e travar a rolagem toda hora
  const handlers = useRef({ onClose, onMove });
  handlers.current = { onClose, onMove };
  useEffect(() => {
    const unlock = lockScroll();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handlers.current.onClose();
      if (e.key === "ArrowRight") handlers.current.onMove(1);
      if (e.key === "ArrowLeft") handlers.current.onMove(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      unlock();
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center bg-[rgba(27,10,9,0.82)] p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={f.alt}
    >
      <motion.figure
        layoutId={f.src}
        className="relative w-full max-w-[min(560px,88vw)] overflow-hidden rounded-[1.5rem] bg-surface p-2"
        onClick={(e) => e.stopPropagation()}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
      >
        <Photo foto={f} eager className="max-h-[70dvh] rounded-[1.1rem] object-contain" />
        <figcaption className="px-3 pt-3 pb-2 text-[15px] text-ink-2">{f.alt}</figcaption>
      </motion.figure>
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar"
        className="absolute top-5 right-5 grid size-12 place-items-center rounded-full bg-surface text-ink"
      >
        <X size={22} weight="bold" />
      </button>
      {lista.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMove(-1);
            }}
            aria-label="Foto anterior"
            className="absolute left-3 grid size-12 place-items-center rounded-full bg-surface text-ink md:left-8"
          >
            <CaretLeft size={22} weight="bold" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMove(1);
            }}
            aria-label="Próxima foto"
            className="absolute right-3 grid size-12 place-items-center rounded-full bg-surface text-ink md:right-8"
          >
            <CaretRight size={22} weight="bold" />
          </button>
        </>
      )}
    </motion.div>
  );
}

export function Doces() {
  const reduce = useReducedMotion();
  const [cat, setCat] = useState<Categoria>("entremets");
  const [aberta, setAberta] = useState<number | null>(null);
  const atual = categorias.find((c) => c.id === cat)!;
  const lista = fotos.filter((f) => f.cat === cat);

  return (
    <section id="doces" className="relative scroll-mt-28 py-20 md:py-28">
      <div className="mx-auto max-w-[1240px] px-4 md:px-8">
        <RiseTitle
          text="O que sai da nossa cozinha"
          className="max-w-[16ch] font-display text-[clamp(2.4rem,5vw,4rem)] leading-[1.02] font-semibold"
        />
        <p className="mt-4 max-w-[56ch] text-lg leading-relaxed text-ink-2">
          Fotos do nosso Instagram. Com o cardápio em renovação, confirme pelo WhatsApp o que está disponível.
        </p>

        {/* abas */}
        <LayoutGroup id="cats">
          <div role="tablist" aria-label="Categorias" className="-mx-4 mt-10 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0">
            {categorias.map((c) => {
              const on = c.id === cat;
              return (
                <button
                  key={c.id}
                  role="tab"
                  aria-selected={on}
                  onClick={() => setCat(c.id)}
                  className={`relative shrink-0 rounded-full px-5 py-2.5 text-[15px] font-semibold transition-colors ${on ? "text-wine-ink" : "text-ink-2 ring-1 ring-line hover:bg-bg-2"}`}
                >
                  {on && (
                    <motion.span layoutId="cat-pill" className="absolute inset-0 rounded-full bg-wine" transition={{ type: "spring", stiffness: 420, damping: 34 }} />
                  )}
                  <span className="relative">{c.nome}</span>
                </button>
              );
            })}
          </div>
        </LayoutGroup>

        <div className="mt-8 grid gap-8 lg:grid-cols-[300px_1fr] lg:gap-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={cat}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: EASE_OUT }}
              className="lg:sticky lg:top-36 lg:self-start"
            >
              <h3 className="font-display text-[2rem] leading-tight font-semibold">{atual.nome}</h3>
              <p className="mt-2 text-[16px] leading-relaxed text-ink-2">{atual.texto}</p>
              <div className="mt-6">
                <WhatsButton label={`Perguntar sobre ${atual.nome.toLowerCase()}`} text={`Olá! Gostaria de saber sobre ${atual.nome.toLowerCase()}: o que está disponível e os valores.`} />
              </div>
            </motion.div>
          </AnimatePresence>

          <motion.ul layout className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4">
            <AnimatePresence mode="popLayout">
              {lista.map((f, i) => (
                <motion.li
                  key={f.src}
                  layout
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.45, ease: EASE_OUT, delay: i * 0.04 }}
                >
                  <motion.button
                    type="button"
                    layoutId={f.src}
                    onClick={() => setAberta(i)}
                    className="group block aspect-square w-full overflow-hidden rounded-[1.25rem] bg-bg-2"
                    aria-label={`Ampliar: ${f.alt}`}
                  >
                    <Photo foto={f} fill className="transition-transform duration-700 ease-out group-hover:scale-[1.06]" />
                  </motion.button>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        </div>
      </div>

      <AnimatePresence>
        {aberta !== null && (
          <Lightbox
            lista={lista}
            index={aberta}
            onClose={() => setAberta(null)}
            onMove={(d) => setAberta((a) => (a === null ? a : (a + d + lista.length) % lista.length))}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

