"use client";

import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Drop } from "@phosphor-icons/react/dist/ssr";
import { brands, getProduct, products } from "@/lib/catalog";
import { site } from "@/lib/site";
import { openQuickView, ui, useStore } from "@/lib/store";
import { scrollToId } from "@/lib/scroll";
import { EASE_IN_OUT, EASE_OUT, Eyebrow, gentle, PillButton, ProductImage, SplitReveal } from "./ui";
import { ScentParticles } from "./scent-particles";

const SLIDE_MS = 4200;

/** Profundidade de parallax: segue o mouse e sobe com a rolagem */
function useDepth(mx: MotionValue<number>, my: MotionValue<number>, scroll: MotionValue<number>, depth: number) {
  return useTransform(() => {
    const x = mx.get() * depth * 18;
    const y = my.get() * depth * 14 - scroll.get() * depth * 160;
    return `translate3d(${x}px, ${y}px, 0)`;
  });
}

function SpinningBadge() {
  const text = "Perfumaria árabe · Nicho · Importados · ";
  return (
    <div className="relative size-28">
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full animate-spin-slow" aria-hidden>
        <defs>
          <path id="badge-circle" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
        </defs>
        <text className="fill-amber-soft text-[7.6px] uppercase">
          <textPath href="#badge-circle" textLength="236" lengthAdjust="spacing">
            {text}
          </textPath>
        </text>
      </svg>
      <span className="absolute inset-[30%] flex items-center justify-center rounded-full bg-amber text-noir">
        <Drop size={18} weight="fill" />
      </span>
    </div>
  );
}

// Arco central que alterna os frascos + dois círculos flutuantes em profundidades diferentes
function Stage({
  play,
  mx,
  my,
  scroll,
}: {
  play: boolean;
  mx: MotionValue<number>;
  my: MotionValue<number>;
  scroll: MotionValue<number>;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const slides = site.heroSlides.flatMap((c) => getProduct(c) ?? []);
  const orbs = site.heroOrbs.flatMap((c) => getProduct(c) ?? []);
  const [index, setIndex] = useState(0);
  const current = slides[index % slides.length];
  const running = play && inView && !reduce;

  // troca automática (pausa fora da tela e com "reduzir movimento")
  useEffect(() => {
    if (!running || slides.length < 2) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % slides.length), SLIDE_MS);
    return () => clearTimeout(t);
  }, [running, index, slides.length]);

  const archDepth = useDepth(mx, my, scroll, 0.45);
  const orbDepthA = useDepth(mx, my, scroll, 1.3);
  const orbDepthB = useDepth(mx, my, scroll, 0.95);

  if (!current) return null;

  return (
    <div
      ref={ref}
      className="relative mx-auto aspect-[4/5] w-full max-w-[520px] md:aspect-auto md:h-[min(76vh,680px)]"
    >
      {/* arco central */}
      <motion.div
        className="absolute left-[14%] top-0 z-10 h-[92%] w-[72%]"
        style={reduce ? undefined : { transform: archDepth }}
      >
        <div className="h-full w-full animate-float">
          <motion.div
            className="relative h-full w-full rounded-t-full rounded-b-[2.4rem] bg-white/[0.03] p-1.5 ring-1 ring-line"
            initial={{ opacity: 0, transform: "translateY(60px)" }}
            animate={play ? { opacity: 1, transform: "translateY(0px)" } : undefined}
            transition={gentle(reduce, { duration: 1.3, delay: 0.1, ease: EASE_OUT })}
          >
            <motion.button
              type="button"
              onClick={() => openQuickView(current.code)}
              aria-label={`Ver ${current.brand} ${current.name}`}
              className="plate group relative block h-full w-full overflow-hidden rounded-t-full rounded-b-[calc(2.4rem-0.375rem)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]"
              initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
              animate={play ? { clipPath: "inset(0% 0% 0% 0%)" } : undefined}
              transition={gentle(reduce, { duration: 1.4, delay: 0.2, ease: EASE_IN_OUT })}
            >
              <AnimatePresence initial={false}>
                <motion.div
                  key={current.code}
                  className="plate absolute inset-0"
                  initial={reduce ? { opacity: 0 } : { clipPath: "inset(100% 0% 0% 0%)" }}
                  animate={reduce ? { opacity: 1 } : { clipPath: "inset(0% 0% 0% 0%)" }}
                  exit={{ opacity: 0, transition: { duration: 0.6, delay: 0.5, ease: EASE_OUT } }}
                  transition={gentle(reduce, { duration: 1.1, ease: EASE_IN_OUT })}
                >
                  {/* o fundo, o brilho e a foto ficam no mesmo grupo para o "multiply" sumir com o branco */}
                  <motion.div
                    className="plate relative h-full w-full px-[7%] pb-[15%] pt-[24%]"
                    initial={{ transform: "scale(1.18)" }}
                    animate={play ? { transform: "scale(1)" } : undefined}
                    transition={gentle(reduce, { duration: 1.8, ease: EASE_OUT })}
                  >
                    <div
                      className="tone-glow absolute inset-0 opacity-60"
                      style={{ "--tone": `${current.tone}66` } as React.CSSProperties}
                      aria-hidden
                    />
                    <span
                      aria-hidden
                      className="absolute bottom-[13%] left-[20%] h-6 w-[60%] rounded-[100%] bg-[radial-gradient(closest-side,rgba(60,40,20,0.25),transparent)]"
                    />
                    <ProductImage
                      product={current}
                      priority
                      sizes="tight"
                      className="relative object-bottom transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </motion.button>

            {/* legenda + indicadores */}
            <motion.div
              className="absolute inset-x-0 -bottom-5 z-10 flex justify-center"
              initial={{ opacity: 0, transform: "translateY(10px)" }}
              animate={play ? { opacity: 1, transform: "translateY(0px)" } : undefined}
              transition={gentle(reduce, { duration: 0.8, delay: 1.1, ease: EASE_OUT })}
            >
              <div className="flex items-center gap-3 rounded-full bg-noir/85 py-2 pl-4 pr-3 ring-1 ring-line backdrop-blur-md">
                <span className="relative block h-4 w-40 overflow-hidden text-[10px] uppercase tracking-[0.18em] text-ivory sm:w-48">
                  <AnimatePresence initial={false} mode="popLayout">
                    <motion.span
                      key={current.code}
                      className="absolute inset-0 truncate"
                      initial={{ transform: "translateY(100%)", opacity: 0 }}
                      animate={{ transform: "translateY(0%)", opacity: 1 }}
                      exit={{ transform: "translateY(-100%)", opacity: 0 }}
                      transition={gentle(reduce, { duration: 0.5, ease: EASE_OUT })}
                    >
                      {current.brand} · {current.name}
                    </motion.span>
                  </AnimatePresence>
                </span>
                <span className="flex gap-1">
                  {slides.map((p, i) => (
                    <button
                      key={p.code}
                      type="button"
                      onClick={() => setIndex(i)}
                      aria-label={`Mostrar ${p.brand} ${p.name}`}
                      className="relative h-1 w-5 overflow-hidden rounded-full bg-white/15 before:absolute before:-inset-3 before:content-['']"
                    >
                      {i === index % slides.length && (
                        <span
                          key={`${index}-${running}`}
                          className="absolute inset-0 origin-left rounded-full bg-amber"
                          style={{ animation: running ? `slide-progress ${SLIDE_MS}ms linear forwards` : undefined }}
                        />
                      )}
                    </button>
                  ))}
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* círculos flutuantes */}
      {orbs.map((p, i) => (
        <motion.div
          key={p.code}
          className={`absolute z-20 aspect-square ${
            i === 0 ? "bottom-[12%] left-0 w-[34%]" : "right-0 top-[26%] w-[30%]"
          }`}
          style={reduce ? undefined : { transform: i === 0 ? orbDepthA : orbDepthB }}
        >
          <div className="h-full w-full animate-float" style={{ animationDelay: i === 0 ? "-2.4s" : "-4.6s" }}>
            <motion.button
              type="button"
              onClick={() => openQuickView(p.code)}
              aria-label={`Ver ${p.brand} ${p.name}`}
              className="group block h-full w-full rounded-full bg-white/[0.04] p-1.5 ring-1 ring-line backdrop-blur-sm"
              initial={{ opacity: 0, transform: "scale(0.85)" }}
              animate={play ? { opacity: 1, transform: "scale(1)" } : undefined}
              transition={gentle(reduce, { duration: 1.2, delay: 0.55 + i * 0.15, ease: EASE_OUT })}
            >
              <span className="plate block h-full w-full overflow-hidden rounded-full shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)]">
                <ProductImage
                  product={p}
                  sizes="tight"
                  priority
                  className="transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                />
              </span>
            </motion.button>
          </div>
        </motion.div>
      ))}

      <motion.div
        className="absolute -left-2 top-[4%] z-30 hidden sm:block md:-left-10"
        initial={{ opacity: 0, transform: "scale(0.9) rotate(-30deg)" }}
        animate={play ? { opacity: 1, transform: "scale(1) rotate(0deg)" } : undefined}
        transition={gentle(reduce, { duration: 1.2, delay: 0.9, ease: EASE_OUT })}
      >
        <SpinningBadge />
      </motion.div>
    </div>
  );
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const play = useStore(ui, (s) => s.introDone);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const contentTransform = useTransform(scrollYProgress, (v) => `translate3d(0, ${v * -90}px, 0)`);

  const mx = useSpring(useMotionValue(0), { stiffness: 60, damping: 20, mass: 0.6 });
  const my = useSpring(useMotionValue(0), { stiffness: 60, damping: 20, mass: 0.6 });

  const onPointerMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width - 0.5) * 2);
    my.set(((e.clientY - r.top) / r.height - 0.5) * 2);
  };

  return (
    <section
      ref={ref}
      id="topo"
      onPointerMove={onPointerMove}
      className="relative isolate min-h-[100dvh] overflow-hidden"
    >
      {/* atmosfera */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute -right-[10%] -top-[20%] h-[80vh] w-[70vw] rounded-full bg-[radial-gradient(closest-side,rgba(214,163,92,0.22),transparent)]" />
        <div className="absolute -left-[20%] bottom-[-30%] h-[70vh] w-[60vw] rounded-full bg-[radial-gradient(closest-side,rgba(140,70,40,0.18),transparent)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-noir" />
      </div>
      <ScentParticles className="absolute inset-0 -z-10 h-full w-full" />

      <div className="mx-auto grid min-h-[100dvh] max-w-7xl grid-cols-1 items-center gap-14 px-4 pb-20 pt-32 md:grid-cols-12 md:gap-10 md:px-8 md:pt-28">
        <motion.div
          className="md:col-span-7"
          style={reduce ? undefined : { opacity: contentOpacity, transform: contentTransform }}
        >
          <motion.div
            initial={{ opacity: 0, transform: "translateY(12px)" }}
            animate={play ? { opacity: 1, transform: "translateY(0px)" } : undefined}
            transition={gentle(reduce, { duration: 0.8, ease: EASE_OUT })}
          >
            <Eyebrow>
              {products.length} fragrâncias · {brands.length} casas
            </Eyebrow>
          </motion.div>

          <SplitReveal
            as="h1"
            play={play}
            delay={0.1}
            stagger={0.07}
            text="O perfume que *chega antes* de você."
            className="mt-7 max-w-[11ch] font-display text-[clamp(3.4rem,8.4vw,7.6rem)] font-light leading-[0.9] tracking-[-0.015em] text-ivory"
          />

          <motion.p
            className="mt-8 max-w-[46ch] text-base leading-relaxed text-mute md:text-lg"
            initial={{ opacity: 0, filter: "blur(8px)", transform: "translateY(16px)" }}
            animate={play ? { opacity: 1, filter: "blur(0px)", transform: "translateY(0px)" } : undefined}
            transition={gentle(reduce, { duration: 1, delay: 0.75, ease: EASE_OUT })}
          >
            Perfumaria árabe, nicho e importados: Lattafa, Armaf, Maison Alhambra, Afnan, Xerjoff e mais. Escolha
            com calma, monte sua sacola e consulte os valores pelo WhatsApp.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-wrap items-center gap-3"
            initial={{ opacity: 0, transform: "translateY(16px)" }}
            animate={play ? { opacity: 1, transform: "translateY(0px)" } : undefined}
            transition={gentle(reduce, { duration: 1, delay: 0.9, ease: EASE_OUT })}
          >
            <PillButton onClick={() => scrollToId("catalogo")}>Explorar o catálogo</PillButton>
            <PillButton variant="ghost" onClick={() => scrollToId("icones")}>
              Ver os ícones
            </PillButton>
          </motion.div>

          <motion.dl
            className="mt-14 grid max-w-xs grid-cols-2 divide-x divide-line border-y border-line"
            initial={{ opacity: 0 }}
            animate={play ? { opacity: 1 } : undefined}
            transition={gentle(reduce, { duration: 1.2, delay: 1.1, ease: EASE_OUT })}
          >
            {[
              { v: String(products.length), l: "fragrâncias" },
              { v: String(brands.length), l: "casas" },
            ].map((s) => (
              <div key={s.l} className="flex flex-col-reverse gap-1 px-4 py-4 first:pl-0">
                <dt className="text-[10px] uppercase tracking-[0.22em] text-faint">{s.l}</dt>
                <dd className="font-display text-2xl text-ivory md:text-3xl">{s.v}</dd>
              </div>
            ))}
          </motion.dl>
        </motion.div>

        <div className="relative pb-6 md:col-span-5">
          <Stage play={play} mx={mx} my={my} scroll={scrollYProgress} />
        </div>
      </div>

      <motion.button
        type="button"
        onClick={() => scrollToId("icones")}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-faint md:flex"
        initial={{ opacity: 0 }}
        animate={play ? { opacity: 1 } : undefined}
        transition={gentle(reduce, { duration: 1, delay: 1.4 })}
      >
        Role
        <span className="relative h-10 w-px overflow-hidden bg-line">
          <span className="absolute inset-x-0 top-0 h-1/2 animate-cue bg-gradient-to-b from-transparent to-amber" />
        </span>
      </motion.button>
    </section>
  );
}
