"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { BrowserFrame, ButtonLink, PhoneFrame, container } from "@/components/ui";
import { site } from "@/lib/site";

const ease = [0.16, 1, 0.3, 1] as const;
const headline = ["Sites", "feitos", "para", "quem", "quer", "mais."];
const goldFrom = 4;

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  // Paralaxe do cursor: profundidade entre as telas (desktop, mouse).
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 70, damping: 18 });
  const sy = useSpring(my, { stiffness: 70, damping: 18 });
  const backX = useTransform(sx, (v) => v * -14);
  const backY = useTransform(sy, (v) => v * -10);
  const midX = useTransform(sx, (v) => v * 10);
  const midY = useTransform(sy, (v) => v * 8);
  const frontX = useTransform(sx, (v) => v * 26);
  const frontY = useTransform(sy, (v) => v * 20);

  // Ao rolar, o mockup desce mais devagar que o texto.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const visualY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 140]);

  function onPointerMove(e: React.PointerEvent) {
    if (reduce || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  }

  return (
    <section
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={() => {
        mx.set(0);
        my.set(0);
      }}
      className="relative isolate overflow-hidden pt-[72px]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(55%_60%_at_78%_38%,rgb(233_180_76/0.14),transparent_70%),radial-gradient(40%_40%_at_10%_100%,rgb(233_180_76/0.05),transparent_70%)]"
      />

      <div
        className={`${container} grid min-h-[calc(100dvh-72px)] items-center gap-12 pb-16 pt-10 lg:grid-cols-12 lg:gap-6 lg:pb-20 lg:pt-6`}
      >
        <div className="lg:col-span-7">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease }}
            className="mb-7 inline-flex items-center gap-3 text-[13px] font-medium uppercase tracking-[0.18em] text-mute"
          >
            <span className="hidden h-px w-8 bg-gold sm:block" aria-hidden />
            Agência de criação de sites
          </motion.p>

          <h1 className="text-[clamp(2.9rem,5.6vw,5.4rem)] font-semibold leading-[0.98] tracking-[-0.05em] text-paper">
            {headline.map((word, i) => (
              <span key={word} className="-mb-[0.1em] inline-block overflow-hidden pb-[0.1em] align-bottom">
                <motion.span
                  className={`inline-block ${i >= goldFrom ? "text-gold" : ""}`}
                  initial={{ y: "110%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 1, delay: 0.08 + i * 0.07, ease }}
                >
                  {word}
                </motion.span>
                {i < headline.length - 1 && " "}
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.55, ease }}
            className="mt-7 max-w-[34rem] text-lg leading-relaxed text-mute md:text-xl"
          >
            Criamos sites rápidos, bonitos e pensados para vender. Do briefing ao ar em poucas semanas, com
            suporte pelo WhatsApp.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.68, ease }}
            className="mt-10 flex flex-col gap-3 sm:flex-row"
          >
            <ButtonLink href="#contato">{site.cta}</ButtonLink>
            <ButtonLink href="#projetos" variant="ghost">
              Ver projetos
            </ButtonLink>
          </motion.div>
        </div>

        <motion.div style={{ y: visualY }} className="relative lg:col-span-5">
          <div className="relative mx-auto aspect-[5/4] w-full max-w-[560px] lg:aspect-[4/5] lg:max-w-none">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 0.5, y: 0 }}
              transition={{ duration: 1.2, delay: 0.3, ease }}
              className="absolute right-[-30%] top-[2%] w-[105%] lg:right-[-55%] lg:top-[6%] lg:w-[125%]"
            >
              <motion.div style={{ x: backX, y: backY }}>
                <BrowserFrame
                  src="/projects/moreira-desktop.webp"
                  alt="Site conceito de escritório de advocacia criado pela Avaritia"
                  domain="moreiracastro.adv.br"
                />
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.42, ease }}
              className="absolute left-[4%] top-[24%] w-[112%] lg:left-[0%] lg:top-[28%] lg:w-[140%]"
            >
              <motion.div style={{ x: midX, y: midY }}>
                <BrowserFrame
                  src="/projects/lumiere-desktop.webp"
                  alt="Site conceito de clínica odontológica criado pela Avaritia"
                  domain="lumiereodonto.com.br"
                  priority
                />
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.58, ease }}
              className="absolute bottom-[-2%] left-[-2%] w-[30%] lg:bottom-[4%] lg:left-[-8%] lg:w-[34%]"
            >
              <motion.div style={{ x: frontX, y: frontY }}>
                <PhoneFrame
                  src="/projects/brasa-mobile.webp"
                  alt="Versão para celular de um site conceito de restaurante"
                  priority
                />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
