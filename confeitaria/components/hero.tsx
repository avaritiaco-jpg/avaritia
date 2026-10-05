"use client";

import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Basket } from "@phosphor-icons/react/dist/ssr";
import { money } from "@/lib/format";
import { defaultSelection, fromPrice, getProduct, productArt, type DoceProduct } from "@/lib/menu";
import { openSheet, origin } from "@/lib/store";
import { scrollToId } from "@/lib/scroll";
import { Art } from "./art";
import { EASE_OUT, Eyebrow, PillButton, ScriptTitle, gentle } from "./ui";

// Sabores que se alternam no topo: o mais vendido primeiro
const featured = ["ninho-com-morango", "prestigio", "red-velvet", "trufado-de-maracuja"];
const SLIDE_MS = 5200;

const doce = (id: string, flavor: string, base?: string) => {
  const p = getProduct(id) as DoceProduct;
  return productArt(p, { flavor, ...(base ? { base } : {}) });
};

// Docinhos que flutuam em volta da fatia, em profundidades diferentes
const floaters = [
  { art: doce("brigadeiros-especiais", "ao-leite"), className: "left-[2%] top-[14%] w-[20%]", depth: 34, delay: "0s" },
  { art: doce("brigadeiros-gourmet", "morango"), className: "right-[3%] top-[6%] w-[17%]", depth: 22, delay: "-2.4s" },
  { art: doce("trufas", "maracuja", "ao-leite"), className: "right-[0%] bottom-[24%] w-[19%]", depth: 40, delay: "-4.1s" },
];

function HeroStage({ ready }: { ready: boolean }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [auto, setAuto] = useState(true);
  const [paused, setPaused] = useState(false);
  const plateRef = useRef<HTMLDivElement>(null);

  const product = getProduct(featured[index])!;
  const art = productArt(product, defaultSelection(product));

  // alterna sozinho até a pessoa escolher um sabor (nunca com "reduzir movimento")
  useEffect(() => {
    if (!ready || !auto || paused || reduce) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % featured.length), SLIDE_MS);
    return () => clearTimeout(t);
  }, [index, auto, paused, ready, reduce]);

  // profundidade: a fatia e os docinhos seguem o ponteiro em velocidades diferentes
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 80, damping: 18, mass: 0.6 });
  const sy = useSpring(py, { stiffness: 80, damping: 18, mass: 0.6 });
  const sliceT = useTransform([sx, sy], ([x, y]: number[]) => `translate3d(${x * -10}px, ${y * -8}px, 0)`);

  const onMove = (e: React.PointerEvent) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };

  const choose = () => {
    origin.rect = plateRef.current?.getBoundingClientRect() ?? null;
    openSheet(product.id);
  };

  return (
    <div
      className="relative mx-auto w-full max-w-[620px]"
      onPointerMove={onMove}
      onPointerLeave={() => {
        px.set(0);
        py.set(0);
        setPaused(false);
      }}
      onPointerEnter={() => setPaused(true)}
    >
      <div className="relative aspect-[1/0.92]">
        {/* disco rosado atrás da fatia */}
        <motion.div
          className="absolute inset-[6%_4%_10%_4%] rounded-full bg-[radial-gradient(circle_at_50%_40%,#fdf0ef_0%,#f3d4d5_58%,#e9bfc2_100%)]"
          initial={{ opacity: 0, transform: "scale(0.9)" }}
          animate={ready ? { opacity: 1, transform: "scale(1)" } : undefined}
          transition={gentle(reduce, { duration: 1.1, ease: EASE_OUT })}
          aria-hidden
        />
        <motion.div
          className="absolute inset-[1%_-1%_5%_-1%] rounded-full border border-dashed border-rose/70"
          initial={{ opacity: 0, transform: "scale(0.94) rotate(-20deg)" }}
          animate={ready ? { opacity: 1, transform: "scale(1) rotate(0deg)" } : undefined}
          transition={gentle(reduce, { duration: 1.6, delay: 0.1, ease: EASE_OUT })}
          aria-hidden
        />

        {floaters.map((f, i) => (
          <Floater key={i} {...f} sx={sx} sy={sy} ready={ready} order={i} />
        ))}

        <motion.button
          type="button"
          onClick={choose}
          aria-label={`Escolher o bolo ${product.name}`}
          className="absolute inset-x-[6%] top-[10%] bottom-[12%] cursor-pointer outline-none"
          style={{ transform: sliceT }}
        >
          <div ref={plateRef} className="h-full w-full">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={product.id}
                className="h-full w-full"
                exit={{ opacity: 0, transform: "translateX(-24px) scale(0.97)", filter: "blur(4px)" }}
                transition={{ duration: 0.3, ease: EASE_OUT }}
              >
                <Art art={art} play={ready} className="drop-shadow-[0_30px_30px_rgba(122,63,70,0.18)]" />
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.button>

        {/* sabor em destaque */}
        <motion.div
          className="absolute bottom-[3%] left-[2%] z-10 w-[min(300px,80%)] sm:w-[min(290px,62%)] rounded-[1.4rem] bg-card/90 p-1.5 shadow-[0_20px_50px_-25px_rgba(61,39,32,0.45)] ring-1 ring-line backdrop-blur-md"
          initial={{ opacity: 0, transform: "translateY(16px)" }}
          animate={ready ? { opacity: 1, transform: "translateY(0px)" } : undefined}
          transition={gentle(reduce, { duration: 0.8, delay: 0.9, ease: EASE_OUT })}
        >
          <div className="flex items-center gap-3 py-1 pl-3 pr-1">
            <div className="min-w-0 flex-1">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, transform: "translateY(8px)" }}
                  animate={{ opacity: 1, transform: "translateY(0px)" }}
                  exit={{ opacity: 0, transform: "translateY(-8px)" }}
                  transition={{ duration: 0.22, ease: EASE_OUT }}
                >
                  <p className="truncate text-[15px] font-bold text-cocoa">{product.name}</p>
                  <p className="text-[13px] font-medium text-mute">
                    {product.badge ? <span className="text-rose-ink">{product.badge} · </span> : null}a partir de{" "}
                    {money(fromPrice(product))}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
            <button
              type="button"
              onClick={choose}
              aria-label={`Escolher o bolo ${product.name}`}
              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-rose-deep text-white transition-[background-color,transform] duration-200 ease-out hover:bg-rose-ink active:scale-[0.94]"
            >
              <Basket size={19} weight="bold" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* troca de sabor */}
      <motion.div
        role="tablist"
        aria-label="Sabores em destaque"
        className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:justify-center md:px-0"
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : undefined}
        transition={{ duration: 0.6, delay: 1.1, ease: EASE_OUT }}
      >
        {featured.map((id, i) => {
          const p = getProduct(id)!;
          const active = i === index;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                setIndex(i);
                setAuto(false);
              }}
              className={`relative shrink-0 overflow-hidden rounded-full px-4 py-2 text-[13px] font-semibold transition-colors duration-200 ease-out ${
                active ? "bg-cocoa text-blush" : "bg-card text-cocoa-2 ring-1 ring-line hover:bg-white"
              }`}
            >
              {p.name}
              {active && auto && !reduce && ready && (
                <span
                  key={`${index}-${paused}`}
                  aria-hidden
                  className="absolute inset-x-3 bottom-1 h-0.5 origin-left rounded-full bg-rose"
                  style={{
                    animation: `flavor-progress ${SLIDE_MS}ms linear both`,
                    animationPlayState: paused ? "paused" : "running",
                  }}
                />
              )}
            </button>
          );
        })}
      </motion.div>
    </div>
  );
}

function Floater({
  art,
  className,
  depth,
  delay,
  sx,
  sy,
  ready,
  order,
}: (typeof floaters)[number] & {
  sx: ReturnType<typeof useSpring>;
  sy: ReturnType<typeof useSpring>;
  ready: boolean;
  order: number;
}) {
  const reduce = useReducedMotion();
  const transform = useTransform([sx, sy], ([x, y]: number[]) => `translate3d(${x * depth}px, ${y * depth}px, 0)`);
  return (
    <motion.div className={`absolute ${className}`} style={{ transform }} aria-hidden>
      <motion.div
        initial={{ opacity: 0, transform: "translateY(-30px) scale(0.9)" }}
        animate={ready ? { opacity: 1, transform: "translateY(0px) scale(1)" } : undefined}
        transition={gentle(reduce, { type: "spring", duration: 0.9, bounce: 0.35, delay: 1 + order * 0.12 })}
      >
        <div className="animate-float" style={{ animationDelay: delay }}>
          <Art art={art} className="drop-shadow-[0_14px_14px_rgba(122,63,70,0.16)]" />
        </div>
      </motion.div>
    </motion.div>
  );
}

export function Hero() {
  // a montagem começa depois da hidratação, para a animação não ser perdida
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  return (
    <section id="topo" className="relative overflow-hidden">
      <div className="mx-auto grid min-h-[100dvh] max-w-7xl items-center gap-10 px-4 pb-14 pt-28 md:grid-cols-12 md:gap-6 md:px-8 md:pb-16 md:pt-28 lg:pt-24">
        <div className="md:col-span-6">
          <motion.div
            initial={{ opacity: 0, transform: "translateY(10px)" }}
            animate={ready ? { opacity: 1, transform: "translateY(0px)" } : undefined}
            transition={{ duration: 0.6, ease: EASE_OUT }}
          >
            <Eyebrow>Cardápio 2026</Eyebrow>
          </motion.div>
          <ScriptTitle
            as="h1"
            play={ready}
            delay={0.1}
            text="Bolos e docinhos *por encomenda*"
            className="mt-5 text-[clamp(3.2rem,5.6vw,5.4rem)]"
          />
          <motion.p
            className="mt-5 max-w-[34ch] text-lg font-medium leading-relaxed text-cocoa-2 md:text-xl"
            initial={{ opacity: 0, transform: "translateY(14px)" }}
            animate={ready ? { opacity: 1, transform: "translateY(0px)" } : undefined}
            transition={{ duration: 0.8, delay: 0.55, ease: EASE_OUT }}
          >
            Escolha o sabor, o tamanho e a data. Você paga 50% de sinal e retira tudo fresquinho.
          </motion.p>
          <motion.div
            className="mt-8 flex flex-wrap items-center gap-3"
            initial={{ opacity: 0, transform: "translateY(14px)" }}
            animate={ready ? { opacity: 1, transform: "translateY(0px)" } : undefined}
            transition={{ duration: 0.8, delay: 0.7, ease: EASE_OUT }}
          >
            <PillButton href="#cardapio" onClick={(e) => (e.preventDefault(), scrollToId("cardapio"))}>
              Ver o cardápio
            </PillButton>
            <a
              href="#como-encomendar"
              onClick={(e) => (e.preventDefault(), scrollToId("como-encomendar"))}
              className="rounded-full px-2 py-3.5 text-[15px] font-semibold text-cocoa-2 underline sm:px-5 decoration-rose decoration-2 underline-offset-[6px] transition-colors hover:text-cocoa"
            >
              Como encomendar
            </a>
          </motion.div>
        </div>

        <div className="md:col-span-6">
          <HeroStage ready={ready} />
        </div>
      </div>
    </section>
  );
}
