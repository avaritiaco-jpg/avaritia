"use client";

import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect, useState } from "react";
import { ArrowDown } from "@phosphor-icons/react/dist/ssr";
import { flavorById, site } from "@/lib/site";
import { scrollToId } from "@/lib/scroll";
import { Brigadeiro } from "./brigadeiro";
import { EASE_OUT, GhostButton, RiseTitle, WhatsButton, useReducedMotion } from "./ui";

// Sabores que se revezam no centro do topo
const featured = ["belga", "pistache", "creme-brulee", "morango", "dourado", "coco"].map((id) => flavorById[id]);
const SWAP_MS = 3600;

// Brigadeiros menores em volta, em profundidades diferentes (depth = quanto seguem o mouse)
const orbit = [
  { flavor: flavorById["ninho"], className: "left-[0%] top-[8%] w-[24%]", depth: 30, float: 0 },
  { flavor: flavorById["cafe"], className: "right-[2%] top-[0%] w-[20%]", depth: 18, float: 1.4 },
  { flavor: flavorById["maracuja"], className: "right-[-2%] bottom-[16%] w-[23%]", depth: 40, float: 2.6 },
  { flavor: flavorById["pacoca"], className: "left-[6%] bottom-[6%] w-[17%]", depth: 24, float: 3.3 },
];

const RING = "chocolate belga · enrolado à mão · mais de 40 sabores · desde 2015 · ";

/** Granulado que espirra quando a pessoa clica no brigadeiro */
function Burst({ seed, colors }: { seed: number; colors: string[] }) {
  return (
    <div className="pointer-events-none absolute top-[44%] left-1/2" aria-hidden>
      {Array.from({ length: 18 }, (_, i) => {
        const a = (i / 18) * Math.PI * 2 + seed;
        const d = 140 + ((i * 37) % 70);
        return (
          <motion.span
            key={`${seed}-${i}`}
            className="absolute block h-[5px] w-[14px] rounded-full"
            style={{ background: colors[i % colors.length], rotate: (a * 180) / Math.PI }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0.6 }}
            animate={{ x: Math.cos(a) * d, y: Math.sin(a) * d + 60, opacity: 0, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          />
        );
      })}
    </div>
  );
}

function Stage() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [hover, setHover] = useState(false);
  const [burst, setBurst] = useState<number | null>(null);
  const flavor = featured[index];

  useEffect(() => {
    if (reduce || hover) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % featured.length), SWAP_MS);
    return () => clearTimeout(t);
  }, [index, hover, reduce]);

  // ponteiro: -0.5..0.5 nos dois eixos, com mola
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 90, damping: 16, mass: 0.5 });
  const sy = useSpring(py, { stiffness: 90, damping: 16, mass: 0.5 });
  const spinX = useTransform(sx, (v) => v * 2);
  const spinY = useTransform(sy, (v) => v * 2);
  const tiltX = useTransform(sy, (v) => v * -10);
  const tiltY = useTransform(sx, (v) => v * 12);

  const onMove = (e: React.PointerEvent) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };

  const next = () => {
    setBurst(Math.random() * 6);
    setIndex((i) => (i + 1) % featured.length);
  };

  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-[600px] [perspective:1200px]"
      onPointerMove={onMove}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => {
        px.set(0);
        py.set(0);
        setHover(false);
      }}
    >
      {/* disco framboesa + anel de texto girando */}
      <motion.div
        className="absolute inset-[9%] rounded-full bg-accent"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.1, ease: EASE_OUT }}
      />
      <motion.div
        className="absolute inset-[9%] rounded-full bg-[radial-gradient(circle_at_50%_38%,rgba(255,255,255,0.28),transparent_60%)]"
        aria-hidden
      />
      <motion.svg
        viewBox="0 0 200 200"
        className="absolute inset-[2%] text-ink"
        aria-hidden
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: 40, ease: "linear", repeat: Infinity }}
      >
        <defs>
          <path id="ring" d="M100 100 m-92 0 a92 92 0 1 1 184 0 a92 92 0 1 1 -184 0" />
        </defs>
        <text className="fill-current font-display text-[8.4px] font-semibold tracking-[0.18em] uppercase">
          <textPath href="#ring" textLength="574" lengthAdjust="spacing">
            {RING}
          </textPath>
        </text>
      </motion.svg>

      {/* o brigadeiro principal: troca de sabor caindo com "squash & stretch" */}
      <motion.button
        type="button"
        onClick={next}
        aria-label={`Brigadeiro de ${flavor.name}. Toque para ver outro sabor`}
        className="absolute inset-[16%] cursor-pointer rounded-full outline-offset-8"
        style={{ rotateX: tiltX, rotateY: tiltY, transformStyle: "preserve-3d" }}
        whileTap={{ scale: 0.94 }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={flavor.id}
            className="absolute inset-0 origin-bottom"
            initial={reduce ? { opacity: 0 } : { y: "-80%", scaleY: 1.18, scaleX: 0.88, opacity: 0 }}
            animate={
              reduce
                ? { opacity: 1 }
                : {
                    y: ["-80%", "0%", "0%", "0%"],
                    scaleY: [1.18, 0.82, 1.06, 1],
                    scaleX: [0.88, 1.14, 0.97, 1],
                    opacity: [0, 1, 1, 1],
                  }
            }
            exit={reduce ? { opacity: 0 } : { x: "70%", rotate: 50, opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.9, times: [0, 0.45, 0.72, 1], ease: "easeOut" }}
          >
            <Brigadeiro flavor={flavor} spinX={spinX} spinY={spinY} className="h-full w-full drop-shadow-[0_30px_40px_rgba(50,15,5,0.35)]" />
          </motion.div>
        </AnimatePresence>
      </motion.button>
      {burst !== null && <Burst key={burst} seed={burst} colors={flavor.bits.concat(flavor.base)} />}

      {orbit.map((o, i) => (
        <Orbiter key={o.flavor.id} {...o} sx={sx} sy={sy} delay={0.5 + i * 0.12} />
      ))}

      {/* nome do sabor da vez */}
      <div className="absolute inset-x-0 bottom-[-4%] flex justify-center" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={flavor.id}
            className="rounded-full bg-surface/85 px-5 py-2.5 text-center shadow-[0_12px_30px_-18px_rgba(60,20,10,0.5)] ring-1 ring-line backdrop-blur"
            initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
          >
            <span className="font-display text-[15px] font-bold">{flavor.name}</span>
            <span className="hidden text-[14px] text-mute sm:inline"> · {flavor.note}</span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function Orbiter({
  flavor,
  className,
  depth,
  float,
  sx,
  sy,
  delay,
}: (typeof orbit)[number] & { sx: ReturnType<typeof useSpring>; sy: ReturnType<typeof useSpring>; delay: number }) {
  const reduce = useReducedMotion();
  const x = useTransform(sx, (v) => v * depth * -1.6);
  const y = useTransform(sy, (v) => v * depth * -1.2);
  return (
    <motion.div className={`absolute ${className}`} style={{ x, y }}>
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.3, y: -40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 13, delay }}
      >
        <motion.div
          animate={reduce ? undefined : { y: [-7, 7], rotate: [-4, 4] }}
          transition={{ duration: 3.6, repeat: Infinity, repeatType: "mirror", ease: "easeInOut", delay: -float }}
        >
          <Brigadeiro flavor={flavor} className="w-full drop-shadow-[0_18px_22px_rgba(50,15,5,0.25)]" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export function Hero() {
  return (
    <section id="topo" className="relative isolate overflow-clip">
      {/* manchas suaves de fundo */}
      <div aria-hidden className="absolute -top-40 -left-40 -z-10 size-[620px] rounded-full bg-accent-soft opacity-60 blur-3xl" />
      <div aria-hidden className="absolute -right-32 bottom-0 -z-10 size-[420px] rounded-full bg-bg-2 blur-3xl" />

      <div className="mx-auto grid min-h-[100dvh] max-w-[1320px] items-center gap-10 px-4 pt-28 pb-16 md:px-8 lg:grid-cols-[1.15fr_1fr] lg:gap-6 lg:pt-24">
        <div className="max-w-[700px]">
          <motion.p
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-surface/70 px-4 py-2 text-[13px] font-semibold text-ink-2 ring-1 ring-line backdrop-blur"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE_OUT }}
          >
            Desde {site.since} no centro de {site.address.city}
          </motion.p>
          <RiseTitle
            as="h1"
            text="Mais de 40 sabores de brigadeiro. E algo mais."
            className="font-display text-[clamp(2.6rem,5.4vw,4.6rem)] leading-[0.98] font-extrabold tracking-[-0.035em] [font-stretch:92%]"
          />
          <motion.p
            className="mt-6 max-w-[46ch] text-[clamp(1.05rem,1.4vw,1.2rem)] leading-relaxed text-ink-2"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.55 }}
          >
            Brigadeiros enrolados à mão com chocolate belga, café orgânico e uma vitrine cheia de algo mais.
          </motion.p>
          <motion.div
            className="mt-9 flex flex-wrap items-center gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.7 }}
          >
            <WhatsButton />
            <GhostButton
              href="#sabores"
              onClick={(e) => {
                e.preventDefault();
                scrollToId("sabores");
              }}
            >
              Ver sabores
              <ArrowDown size={18} weight="bold" className="transition-transform duration-300 group-hover:translate-y-0.5" />
            </GhostButton>
          </motion.div>
        </div>

        <div className="relative w-full px-2 md:px-10 lg:px-0">
          <Stage />
        </div>
      </div>
    </section>
  );
}

