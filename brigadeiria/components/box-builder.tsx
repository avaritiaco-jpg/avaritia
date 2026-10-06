"use client";

import { AnimatePresence, LayoutGroup, motion, useInView } from "motion/react";
import { useRef, useState } from "react";
import { ArrowCounterClockwise, Shuffle, X } from "@phosphor-icons/react/dist/ssr";
import { box, useBox } from "@/lib/box";
import { boxSizes, flavorById, flavors, type Flavor } from "@/lib/site";
import { Brigadeiro } from "./brigadeiro";
import { EASE_OUT, RiseTitle, WhatsButton, useReducedMotion } from "./ui";

const cols = (n: number) => (n === 4 ? 2 : n === 9 ? 3 : n === 6 ? 3 : 4);

type Flight = { key: number; flavor: Flavor; from: DOMRect; to: DOMRect };

/** Mensagem do WhatsApp com a contagem de cada sabor */
function boxMessage(items: string[], size: number) {
  const counts = new Map<string, number>();
  items.forEach((id) => counts.set(id, (counts.get(id) ?? 0) + 1));
  const lines = [...counts].map(([id, n]) => `• ${n}x ${flavorById[id].name}`);
  return `Olá! Montei uma caixa com ${size} brigadeiros no site:\n${lines.join("\n")}\n\nPode confirmar o valor e quando posso buscar?`;
}

export function BoxBuilder() {
  const reduce = useReducedMotion();
  const { size, items } = useBox();
  const full = items.length >= size;
  const slots = useRef<(HTMLDivElement | null)[]>([]);
  const section = useRef<HTMLElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const inSection = useInView(section, { amount: 0.15 });
  const boxVisible = useInView(boxRef, { amount: 0.4 });
  const [flights, setFlights] = useState<Flight[]>([]);
  const [landed, setLanded] = useState<Set<number>>(new Set());

  // o brigadeiro sai do botão do sabor e voa em arco até a próxima casinha livre
  const pick = (f: Flavor, e: React.MouseEvent<HTMLButtonElement>) => {
    const index = items.length;
    if (!box.add(f.id)) return;
    const target = slots.current[index];
    if (reduce || !target) return;
    const from = e.currentTarget.querySelector("svg")!.getBoundingClientRect();
    const to = target.getBoundingClientRect();
    // caixa fora da tela (celular): sem voo, o resumo fixo embaixo mostra que entrou
    if (to.bottom < 0 || to.top > window.innerHeight) return;
    const key = performance.now();
    setLanded((s) => new Set(s).add(index));
    setFlights((fl) => [...fl, { key, flavor: f, from, to }]);
    setTimeout(() => {
      setFlights((fl) => fl.filter((x) => x.key !== key));
      setLanded((s) => {
        const n = new Set(s);
        n.delete(index);
        return n;
      });
    }, 620);
  };

  return (
    <section id="caixa" ref={section} className="relative py-24 md:py-36">
      <div className="mx-auto grid max-w-[1320px] gap-10 px-4 md:px-8 lg:grid-cols-[1fr_1.05fr] lg:grid-rows-[auto_1fr] lg:gap-x-16 lg:gap-y-8">
        <div className="lg:col-start-1 lg:row-start-1">
          <RiseTitle
            text="Monte sua caixa"
            className="font-display text-[clamp(2.4rem,5.4vw,4.6rem)] leading-[1] font-extrabold tracking-[-0.035em]"
          />
          <p className="mt-4 max-w-[46ch] text-lg leading-relaxed text-ink-2">
            Escolha o tamanho, toque nos sabores e mande a caixa pronta pelo WhatsApp. A equipe confirma o valor e o horário de retirada.
          </p>

          {/* tamanhos */}
          <fieldset className="mt-8">
            <legend className="mb-3 text-[14px] font-semibold text-mute">Tamanho da caixa</legend>
            <LayoutGroup id="sizes">
              <div className="inline-flex rounded-full bg-bg-2 p-1.5 ring-1 ring-line">
                {boxSizes.map((n) => (
                  <label key={n} className="relative cursor-pointer">
                    <input
                      type="radio"
                      name="box-size"
                      value={n}
                      checked={size === n}
                      onChange={() => box.setSize(n)}
                      className="peer sr-only"
                    />
                    {size === n && (
                      <motion.span
                        layoutId="size-pill"
                        className="absolute inset-0 rounded-full bg-ink"
                        transition={{ type: "spring", stiffness: 420, damping: 32 }}
                      />
                    )}
                    <span
                      className={`relative block rounded-full px-5 py-2.5 text-[15px] font-semibold transition-colors duration-200 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent ${
                        size === n ? "text-bg" : "text-ink-2"
                      }`}
                    >
                      {n} un.
                    </span>
                  </label>
                ))}
              </div>
            </LayoutGroup>
          </fieldset>
        </div>

        {/* sabores */}
        <div className="order-3 lg:order-none lg:col-start-1 lg:row-start-2">
          <div>
            <p className="mb-3 text-[14px] font-semibold text-mute">Sabores</p>
            <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
              {flavors.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={(e) => pick(f, e)}
                  disabled={full}
                  className="group flex flex-col items-center gap-1 rounded-[1.25rem] bg-surface px-2 pt-2 pb-3 ring-1 ring-line transition-[transform,box-shadow,opacity] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-18px_rgba(60,20,10,0.45)] active:scale-[0.96] disabled:pointer-events-none disabled:opacity-45"
                >
                  <Brigadeiro flavor={f} className="size-16 transition-transform duration-300 ease-out group-hover:-rotate-6 group-hover:scale-110" />
                  <span className="text-center text-[13px] leading-tight font-semibold">{f.name}</span>
                </button>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => box.surprise()}
                disabled={full}
                className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-[14px] font-semibold ring-1 ring-line transition-[background-color,opacity] hover:bg-bg-2 disabled:opacity-40"
              >
                <Shuffle size={17} weight="bold" /> Completar com surpresa
              </button>
              <button
                type="button"
                onClick={() => box.clear()}
                disabled={!items.length}
                className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-[14px] font-semibold text-mute ring-1 ring-line transition-[background-color,opacity] hover:bg-bg-2 disabled:opacity-40"
              >
                <ArrowCounterClockwise size={17} weight="bold" /> Esvaziar
              </button>
            </div>
          </div>
        </div>

        {/* a caixa */}
        <div className="order-2 lg:order-none lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
          <div ref={boxRef} className="relative mx-auto max-w-[560px] scroll-mt-24 [perspective:1400px]">
            <div className="relative rounded-[2rem] bg-[linear-gradient(160deg,#4a2418,#2a140e)] p-4 shadow-[0_40px_80px_-40px_rgba(40,12,5,0.7)] md:p-6">
              <div
                className="grid gap-2.5 rounded-[1.4rem] bg-[#f3e6dc] p-3 shadow-[inset_0_4px_14px_rgba(60,25,10,0.25)] md:gap-3 md:p-4"
                style={{ gridTemplateColumns: `repeat(${cols(size)}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: size }, (_, i) => {
                  const id = items[i];
                  const f = id ? flavorById[id] : null;
                  return (
                    <div
                      key={i}
                      ref={(el) => {
                        slots.current[i] = el;
                      }}
                      className="relative aspect-square rounded-2xl bg-[radial-gradient(circle_at_50%_60%,#e2cfc0,#efe1d6_70%)] shadow-[inset_0_2px_6px_rgba(80,40,20,0.2)]"
                    >
                      <AnimatePresence>
                        {f && !landed.has(i) && (
                          <motion.button
                            key={`${i}-${id}`}
                            type="button"
                            onClick={() => box.removeAt(i)}
                            aria-label={`Tirar ${f.name} da caixa`}
                            className="group absolute inset-0 grid place-items-center"
                            initial={reduce ? { opacity: 0 } : { scale: 0.6, y: -14 }}
                            animate={reduce ? { opacity: 1 } : { scale: [0.6, 1.12, 0.96, 1], y: 0 }}
                            exit={reduce ? { opacity: 0 } : { scale: 0, rotate: 30, opacity: 0 }}
                            transition={{ duration: 0.45, ease: EASE_OUT }}
                          >
                            <Brigadeiro flavor={f} className="h-[92%] w-[92%]" />
                            <span className="absolute top-1 right-1 grid size-6 place-items-center rounded-full bg-[#2b1712] text-[#fbeee9] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                              <X size={12} weight="bold" />
                            </span>
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {/* tampa: fecha sozinha quando a caixa enche */}
              <AnimatePresence>
                {full && (
                  <motion.div
                    className="absolute inset-0 origin-top rounded-[2rem] bg-[linear-gradient(160deg,#5a2c1b,#2a140e)] [backface-visibility:hidden]"
                    initial={reduce ? { opacity: 0 } : { rotateX: 100, opacity: 0.4 }}
                    animate={reduce ? { opacity: 1 } : { rotateX: 0, opacity: 1 }}
                    exit={reduce ? { opacity: 0 } : { rotateX: 100, opacity: 0 }}
                    transition={{ duration: 0.8, ease: [0.34, 1.3, 0.64, 1], delay: reduce ? 0 : 0.45 }}
                  >
                    {/* fita */}
                    <motion.div
                      className="absolute inset-y-0 left-1/2 w-10 -translate-x-1/2 bg-accent"
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 0.5, ease: EASE_OUT, delay: 1.1 }}
                    />
                    <motion.div
                      className="absolute inset-x-0 top-1/2 h-10 -translate-y-1/2 bg-accent"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.5, ease: EASE_OUT, delay: 1.25 }}
                    />
                    <motion.svg
                      viewBox="0 0 120 70"
                      className="absolute top-1/2 left-1/2 w-36 -translate-x-1/2 -translate-y-[62%] text-accent drop-shadow-[0_6px_10px_rgba(0,0,0,0.3)]"
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 12, delay: 1.5 }}
                      aria-hidden
                    >
                      <path d="M60 36 C 30 0, 2 14, 18 40 C 28 52, 46 44, 60 36Z M60 36 C 90 0, 118 14, 102 40 C 92 52, 74 44, 60 36Z" fill="currentColor" />
                      <path d="M56 38 L40 68 M64 38 L80 68" stroke="currentColor" strokeWidth={9} strokeLinecap="round" />
                      <circle cx="60" cy="36" r="9" fill="currentColor" stroke="rgba(0,0,0,0.18)" strokeWidth={2} />
                    </motion.svg>
                    <motion.p
                      className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-[#2a140e] px-5 py-2 font-display text-xl font-bold whitespace-nowrap text-[#fbeee9]"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.7 }}
                    >
                      Caixa fechada!
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <p className="text-[15px] text-ink-2" aria-live="polite">
                <strong className="font-display text-2xl font-bold text-ink tabular-nums">
                  {items.length}/{size}
                </strong>{" "}
                {full ? "caixa completa" : `faltam ${size - items.length}`}
              </p>
              {full ? (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => box.removeAt(items.length - 1)}
                    className="h-12 rounded-full px-4 text-[14px] font-semibold text-mute ring-1 ring-line hover:bg-bg-2"
                  >
                    Abrir e trocar
                  </button>
                  <WhatsButton label="Enviar minha caixa" text={boxMessage(items, size)} />
                </div>
              ) : (
                <p className="text-[14px] text-mute">Toque num brigadeiro da caixa para tirar.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* celular: a caixa fica fora da tela enquanto a pessoa escolhe, então um resumo acompanha */}
      <AnimatePresence>
        {inSection && !boxVisible && items.length > 0 && (
          <motion.button
            type="button"
            onClick={() => boxRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" })}
            className="fixed inset-x-4 bottom-4 z-40 flex items-center justify-between gap-3 rounded-full bg-ink py-2 pr-5 pl-2 text-bg ring-1 ring-white/15 shadow-[0_20px_40px_-16px_rgba(40,12,5,0.6)] lg:hidden"
            initial={{ y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 90, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          >
            <span className="flex -space-x-3">
              {items.slice(-4).map((id, i) => (
                <Brigadeiro key={`${i}-${id}`} flavor={flavorById[id]} className="size-10" />
              ))}
            </span>
            <span className="text-[15px] font-semibold">
              {items.length}/{size} na caixa · {full ? "Enviar" : "Ver caixa"}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* voos em andamento */}
      <div className="pointer-events-none fixed inset-0 z-50" aria-hidden>
        {flights.map((fl) => {
          const dx = fl.to.left + fl.to.width / 2 - (fl.from.left + fl.from.width / 2);
          const dy = fl.to.top + fl.to.height / 2 - (fl.from.top + fl.from.height / 2);
          const s = (fl.to.width * 0.92) / fl.from.width;
          return (
            <motion.div
              key={fl.key}
              className="absolute"
              style={{ left: fl.from.left, top: fl.from.top, width: fl.from.width, height: fl.from.height }}
              initial={{ x: 0, y: 0, scale: 1, rotate: 0 }}
              animate={{
                x: [0, dx * 0.5, dx],
                y: [0, Math.min(dy, 0) - 120, dy],
                scale: [1, s * 1.25, s],
                rotate: [0, -25, 0],
              }}
              transition={{ duration: 0.6, ease: [0.45, 0, 0.2, 1], times: [0, 0.45, 1] }}
            >
              <Brigadeiro flavor={fl.flavor} className="h-full w-full drop-shadow-[0_16px_18px_rgba(40,12,5,0.35)]" />
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
