"use client";

import { motion, useMotionValue, useReducedMotion as useReducedMotionRaw, useSpring } from "motion/react";
import { useEffect, useState } from "react";
import { WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { waLink } from "@/lib/site";

/**
 * "Reduzir movimento" do sistema, mas só depois de montar: no HTML estático a página sai
 * sempre igual, e o navegador ajusta em seguida (evita erro de hidratação).
 */
export function useReducedMotion() {
  const reduce = useReducedMotionRaw();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted && Boolean(reduce);
}

export const EASE_OUT = [0.23, 1, 0.32, 1] as const;
export const spring = { type: "spring", stiffness: 260, damping: 22 } as const;

/** Botão que puxa levemente na direção do mouse (só com mouse e sem "reduzir movimento") */
export function Magnetic({ children, strength = 0.28 }: { children: React.ReactNode; strength?: number }) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 16, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 16, mass: 0.4 });
  return (
    <motion.span
      className="inline-flex"
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * strength);
        y.set((e.clientY - r.top - r.height / 2) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.span>
  );
}

const pill =
  "group relative inline-flex h-13 items-center justify-center gap-2.5 overflow-hidden rounded-full px-7 text-[15px] font-semibold whitespace-nowrap transition-[transform,background-color,color,box-shadow] duration-200 ease-out active:scale-[0.97]";

export function WhatsButton({ text, label = "Pedir no WhatsApp", className = "" }: { text?: string; label?: string; className?: string }) {
  return (
    <Magnetic>
      <a
        href={waLink(text)}
        target="_blank"
        rel="noopener noreferrer"
        className={`${pill} bg-accent text-accent-ink shadow-[0_14px_34px_-14px_var(--accent)] hover:shadow-[0_18px_40px_-12px_var(--accent)] ${className}`}
      >
        {/* brilho que atravessa o botão no hover */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/25 opacity-0 transition-[transform,opacity] duration-700 ease-out group-hover:translate-x-[420%] group-hover:opacity-100"
        />
        <WhatsappLogo size={20} weight="fill" />
        {label}
      </a>
    </Magnetic>
  );
}

export function GhostButton({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: (e: React.MouseEvent) => void }) {
  const external = href.startsWith("http");
  return (
    <Magnetic strength={0.2}>
      <a
        href={href}
        onClick={onClick}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className={`${pill} border border-line bg-surface/60 text-ink backdrop-blur hover:bg-surface`}
      >
        {children}
      </a>
    </Magnetic>
  );
}

/** Título que sobe palavra por palavra quando entra na tela (o gatilho fica no título inteiro) */
export function RiseTitle({
  text,
  as = "h2",
  className = "",
  delay = 0,
  id,
}: {
  text: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
  delay?: number;
  id?: string;
}) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  const words = text.split(" ");
  return (
    <Tag
      id={id}
      className={className}
      aria-label={text}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.4 }}
      transition={{ staggerChildren: 0.06, delayChildren: delay }}
    >
      {words.map((w, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.12em] align-top">
          <motion.span
            className="inline-block"
            variants={
              reduce
                ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.3 } } }
                : {
                    hidden: { y: "110%", rotate: 4 },
                    show: { y: "0%", rotate: 0, transition: { duration: 0.9, ease: EASE_OUT } },
                  }
            }
          >
            {w}
          </motion.span>
          {i < words.length - 1 ? "\u00a0" : null}
        </span>
      ))}
    </Tag>
  );
}

/** Aparece subindo de leve ao entrar na tela */
export function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 28, filter: "blur(6px)" }}
      whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: EASE_OUT, delay }}
    >
      {children}
    </motion.div>
  );
}
