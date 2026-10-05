"use client";

import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform, type Transition } from "motion/react";
import { Fragment, useEffect, useRef } from "react";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { money } from "@/lib/format";

export const EASE_OUT = [0.23, 1, 0.32, 1] as const;
export const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;
export const EASE_DRAWER = [0.32, 0.72, 0, 1] as const;

/**
 * Com "reduzir movimento": nada se desloca (transform e recorte instantâneos), só um fade curto.
 * O estado inicial continua o mesmo do HTML estático, então não há descompasso na hidratação.
 */
export function gentle(reduce: boolean | null, t: Transition): Transition {
  if (!reduce) return t;
  return {
    ...t,
    duration: 0.3,
    delay: Math.min(Number(t.delay ?? 0), 0.15),
    transform: { duration: 0 },
    clipPath: { duration: 0 },
  };
}

/* ------------------------------------------------------------- eyebrow */

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-card px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-rose-ink ring-1 ring-line">
      {children}
    </span>
  );
}

/* ------------------------------------------------- botão com ícone aninhado */

type PillProps = {
  children: React.ReactNode;
  variant?: "primary" | "rose" | "ghost";
  icon?: React.ReactNode;
  className?: string;
} & (
  | ({ href: string } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children">)
  | ({ href?: undefined } & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">)
);

const pillStyles = {
  primary: "bg-cocoa text-blush hover:bg-cocoa-2",
  rose: "bg-rose-deep text-white hover:bg-rose-ink",
  ghost: "bg-card text-cocoa ring-1 ring-line-strong hover:bg-white",
};
const pillIconStyles = {
  primary: "bg-white/12",
  rose: "bg-white/15",
  ghost: "bg-blush-2",
};

export function PillButton({ children, variant = "primary", icon, className = "", ...rest }: PillProps) {
  const inner = (
    <>
      <span className="whitespace-nowrap pl-2">{children}</span>
      <span
        className={`flex size-10 shrink-0 items-center justify-center rounded-full transition-transform duration-500 ease-out pointer-fine:group-hover:translate-x-0.5 pointer-fine:group-hover:scale-105 ${pillIconStyles[variant]}`}
      >
        {icon ?? <ArrowRight size={17} weight="bold" />}
      </span>
    </>
  );
  const cls = `group inline-flex items-center justify-between gap-3 rounded-full py-1.5 pl-5 pr-1.5 text-[15px] font-semibold transition-[background-color,transform] duration-200 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 ${pillStyles[variant]} ${className}`;

  if (rest.href !== undefined) {
    const { href, ...anchor } = rest as React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };
    return (
      <a href={href} className={cls} {...anchor}>
        {inner}
      </a>
    );
  }
  return (
    <button type="button" className={cls} {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
      {inner}
    </button>
  );
}

/* ------------------------------------------------- texto revelado por palavra */

/**
 * Revela o texto palavra por palavra, cada uma subindo de dentro de uma máscara.
 * Trechos entre *asteriscos* ganham a cor de destaque.
 */
export function SplitReveal({
  text,
  className = "",
  accentClassName = "text-rose-deep",
  delay = 0,
  stagger = 0.07,
  play,
  as: Tag = "h2",
}: {
  text: string;
  className?: string;
  accentClassName?: string;
  delay?: number;
  stagger?: number;
  /** controla o disparo manualmente. Sem ele, dispara ao entrar na tela. */
  play?: boolean;
  as?: "h1" | "h2" | "h3" | "p";
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduce = useReducedMotion();
  const shown = play ?? inView;

  const words: { word: string; accent: boolean }[] = [];
  text.split("*").forEach((chunk, i) => {
    chunk
      .split(/\s+/)
      .filter(Boolean)
      .forEach((word) => words.push({ word, accent: i % 2 === 1 }));
  });

  const MotionTag = motion[Tag];
  return (
    <MotionTag ref={ref as never} className={className} aria-label={text.replaceAll("*", "")}>
      {words.map(({ word, accent }, i) => (
        <Fragment key={i}>
          {/* folga embaixo para as hastes da letra cursiva (g, p, ç) não serem cortadas */}
          <span aria-hidden className="-mb-[0.22em] inline-block overflow-hidden pb-[0.22em] pr-[0.08em] align-bottom">
            <motion.span
              className={`inline-block ${accent ? accentClassName : ""}`}
              initial={{ opacity: 0, transform: "translateY(105%) rotate(5deg)" }}
              animate={shown ? { opacity: 1, transform: "translateY(0%) rotate(0deg)" } : undefined}
              transition={gentle(reduce, {
                duration: 1,
                delay: delay + i * stagger,
                ease: EASE_OUT,
                opacity: { duration: 0.45, delay: delay + i * stagger },
              })}
            >
              {word}
            </motion.span>
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </MotionTag>
  );
}

/* ------------------------------------------------------ entrada ao rolar */

export function Reveal({
  children,
  delay = 0,
  className,
  y = 24,
  as = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  y?: number;
  as?: "div" | "li" | "section";
}) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, transform: `translateY(${y}px)` }}
      whileInView={{ opacity: 1, transform: "translateY(0px)" }}
      viewport={{ once: true, amount: 0.2 }}
      transition={gentle(reduce, { duration: 0.8, delay, ease: EASE_OUT })}
    >
      {children}
    </Tag>
  );
}

/* --------------------------------------------- valor que conta até o novo */

/** Valor em reais que "corre" até o novo número quando a escolha muda */
export function Price({ value, className = "" }: { value: number; className?: string }) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(value);
  const text = useTransform(mv, (v) => money(Math.round(v * 100) / 100));
  const first = useRef(true);

  useEffect(() => {
    if (first.current || reduce) {
      first.current = false;
      mv.set(value);
      return;
    }
    const controls = animate(mv, value, { duration: 0.45, ease: EASE_OUT });
    return () => controls.stop();
  }, [value, mv, reduce]);

  return (
    <span className={`nums ${className}`}>
      <span className="sr-only">{money(value)}</span>
      <motion.span aria-hidden>{text}</motion.span>
    </span>
  );
}

/* ------------------------------------------------------ título cursivo */

export function ScriptTitle({
  text,
  className = "",
  as = "h2",
  play,
  delay,
}: {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3";
  play?: boolean;
  delay?: number;
}) {
  return (
    <SplitReveal
      as={as}
      text={text}
      play={play}
      delay={delay}
      className={`font-script font-normal leading-[1.12] text-cocoa-2 text-balance ${className}`}
    />
  );
}
