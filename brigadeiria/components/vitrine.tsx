"use client";

import { AnimatePresence, motion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Check, Plus } from "@phosphor-icons/react/dist/ssr";
import { box, useBox } from "@/lib/box";
import { flavors, type Flavor } from "@/lib/site";
import { Brigadeiro, shade } from "./brigadeiro";
import { EASE_OUT, Reveal, RiseTitle, useReducedMotion } from "./ui";

const useIsoLayout = typeof window === "undefined" ? useEffect : useLayoutEffect;
const CARD = 300; // largura do card em px (desktop)

/*
 * A vitrine: no desktop a seção fica presa na tela e a rolagem vertical empurra a prateleira
 * para o lado. Os brigadeiros rolam de verdade (giram na proporção do caminho andado).
 * No celular e com "reduzir movimento" vira uma faixa com rolagem lateral nativa.
 */
export function Vitrine() {
  const reduce = useReducedMotion();
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const [pan, setPan] = useState(false);
  const [distance, setDistance] = useState(0);

  useIsoLayout(() => {
    const mq = matchMedia("(min-width: 768px)");
    const update = () => {
      const on = mq.matches && !reduce;
      setPan(on);
      if (on && track.current) setDistance(Math.max(0, track.current.scrollWidth - window.innerWidth));
    };
    update();
    const ro = new ResizeObserver(update);
    if (track.current) ro.observe(track.current);
    mq.addEventListener("change", update);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    };
  }, [reduce]);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.4 });
  const x = useTransform(smooth, [0, 1], [0, -distance]);
  // rolar sem deslizar: ângulo = caminho / circunferência da bolinha (~170px de diâmetro)
  const roll = useTransform(x, (v) => (v / (Math.PI * 170)) * 360);
  const bar = useTransform(smooth, [0, 1], [0, 1]);

  return (
    <section
      id="sabores"
      ref={section}
      className="relative"
      style={pan ? { height: `calc(100dvh + ${distance}px)` } : undefined}
    >
      <div className={pan ? "sticky top-0 flex h-[100dvh] flex-col justify-center overflow-hidden" : "py-20"}>
        <div className="mx-auto w-full max-w-[1320px] px-4 md:px-8">
          <RiseTitle
            text="Uma vitrine de dar água na boca"
            className="max-w-[16ch] font-display text-[clamp(2.2rem,5vw,4.2rem)] leading-[1] font-extrabold tracking-[-0.035em]"
          />
          <Reveal delay={0.15}>
            <p className="mt-4 max-w-[52ch] text-lg leading-relaxed text-ink-2">
              Alguns dos sabores que saem do tacho. Na loja são mais de 40. Toque em <strong className="font-semibold text-ink">+ caixa</strong> para
              separar os seus.
            </p>
          </Reveal>
        </div>

        <motion.ul
          ref={track}
          style={pan ? { x } : undefined}
          className={`mt-10 flex w-max gap-5 px-4 md:mt-14 md:gap-7 md:px-8 lg:pr-[20vw] lg:pl-[max(2rem,calc((100vw-1320px)/2+2rem))] ${
            pan ? "" : "max-w-full snap-x snap-mandatory overflow-x-auto pb-6 [scrollbar-width:none]"
          }`}
        >
          {flavors.map((f, i) => (
            <FlavorCard key={f.id} flavor={f} index={i} roll={pan ? roll : undefined} />
          ))}
        </motion.ul>

        {pan && (
          <div className="mx-auto mt-10 w-full max-w-[1320px] px-8">
            <motion.div className="h-[3px] origin-left rounded-full bg-accent" style={{ scaleX: bar }} />
          </div>
        )}
      </div>
    </section>
  );
}

function FlavorCard({ flavor, index, roll }: { flavor: Flavor; index: number; roll?: MotionValue<number> }) {
  const { items, size } = useBox();
  const count = items.filter((id) => id === flavor.id).length;
  const full = items.length >= size;
  const [added, setAdded] = useState(0);

  // o "+" vira "✓" por um instante a cada brigadeiro separado
  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(0), 1200);
    return () => clearTimeout(t);
  }, [added]);

  const add = () => {
    if (box.add(flavor.id)) setAdded(Date.now());
  };

  return (
    <motion.li
      className="group relative flex shrink-0 snap-start"
      style={{ width: CARD }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: EASE_OUT, delay: Math.min(index, 4) * 0.06 }}
    >
      <div
        className="relative flex w-full flex-col overflow-hidden rounded-[2rem] p-6 pb-5 ring-1 ring-line transition-transform duration-500 ease-out group-hover:-translate-y-1.5"
        style={{ background: `linear-gradient(170deg, ${shade(flavor.base, 0.8)}, ${shade(flavor.base, 0.55)})` }}
      >
        {/* prateleira */}
        <div className="relative mx-auto aspect-square w-[78%]">
          <Brigadeiro
            flavor={flavor}
            bare
            roll={roll}
            className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-[1.06] group-hover:-rotate-6"
          />
        </div>
        <div className="mt-2 h-[6px] rounded-full bg-[rgba(40,15,8,0.14)]" aria-hidden />
        <div className="mt-5 flex flex-1 items-end justify-between gap-3 text-[#2b1712]">
          <div>
            <h3 className="font-display text-[1.45rem] leading-tight font-bold tracking-tight">{flavor.name}</h3>
            <p className="mt-1 text-[14px] leading-snug text-[#2b1712]/75">{flavor.note}</p>
          </div>
          <button
            type="button"
            onClick={add}
            disabled={full}
            aria-label={`Pôr ${flavor.name} na caixa`}
            className="relative inline-flex h-11 shrink-0 items-center gap-1.5 overflow-hidden rounded-full bg-[#2b1712] px-4 text-[13px] font-semibold text-[#fbeee9] transition-[transform,opacity] duration-200 active:scale-95 disabled:opacity-40"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={added}
                initial={{ y: 18, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -18, opacity: 0 }}
                transition={{ duration: 0.25, ease: EASE_OUT }}
                className="inline-flex"
              >
                {added ? <Check size={15} weight="bold" /> : <Plus size={15} weight="bold" />}
              </motion.span>
            </AnimatePresence>
            caixa
          </button>
        </div>
        <AnimatePresence>
          {count > 0 && (
            <motion.span
              className="absolute top-4 right-4 grid size-8 place-items-center rounded-full bg-accent text-[13px] font-bold text-accent-ink"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
              aria-label={`${count} na caixa`}
            >
              <motion.span key={count} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                {count}
              </motion.span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.li>
  );
}
