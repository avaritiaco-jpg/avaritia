"use client";

import { motion, useInView, useReducedMotion, type Transition } from "motion/react";
import { Fragment, useRef } from "react";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import type { Product } from "@/lib/catalog";

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
    duration: 0.35,
    delay: Math.min(Number(t.delay ?? 0), 0.15),
    transform: { duration: 0 },
    clipPath: { duration: 0 },
  };
}

/* ------------------------------------------------------------- eyebrow */

export function Eyebrow({ children, tone = "dark" }: { children: React.ReactNode; tone?: "dark" | "light" }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[0.24em] ${
        tone === "dark"
          ? "bg-white/[0.04] text-amber-soft ring-1 ring-line"
          : "bg-ink/[0.05] text-ink-mute ring-1 ring-ink/10"
      }`}
    >
      <span className={`size-1 rounded-full ${tone === "dark" ? "bg-amber" : "bg-amber-deep"}`} />
      {children}
    </span>
  );
}

/* ------------------------------------------------- botão com ícone aninhado */

type PillProps = {
  children: React.ReactNode;
  variant?: "primary" | "ghost" | "light";
  icon?: React.ReactNode;
  className?: string;
} & (
  | ({ href: string } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children">)
  | ({ href?: undefined } & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">)
);

const pillStyles = {
  primary: "bg-amber text-noir hover:bg-amber-soft",
  ghost: "bg-white/[0.04] text-ivory ring-1 ring-line-strong hover:bg-white/[0.08]",
  light: "bg-ink text-ivory hover:bg-ink/90",
};
const pillIconStyles = {
  primary: "bg-noir/10",
  ghost: "bg-white/10",
  light: "bg-white/10",
};

export function PillButton({ children, variant = "primary", icon, className = "", ...rest }: PillProps) {
  const inner = (
    <>
      <span className="pl-2">{children}</span>
      <span
        className={`flex size-9 shrink-0 items-center justify-center rounded-full transition-transform duration-500 ease-out pointer-fine:group-hover:-translate-y-px pointer-fine:group-hover:translate-x-0.5 pointer-fine:group-hover:scale-105 ${pillIconStyles[variant]}`}
      >
        {icon ?? <ArrowUpRight size={16} weight="regular" />}
      </span>
    </>
  );
  const cls = `group inline-flex items-center gap-3 rounded-full py-1.5 pl-5 pr-1.5 text-sm font-medium transition-[background-color,transform] duration-200 ease-out active:scale-[0.97] ${pillStyles[variant]} ${className}`;

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
 * Trechos entre *asteriscos* viram itálico dourado.
 */
export function SplitReveal({
  text,
  className = "",
  accentClassName = "italic text-gold pr-[0.08em]",
  delay = 0,
  stagger = 0.06,
  play,
  as: Tag = "h2",
}: {
  text: string;
  className?: string;
  accentClassName?: string;
  delay?: number;
  stagger?: number;
  /** controla o disparo manualmente (ex.: após a abertura). Sem ele, dispara ao entrar na tela. */
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
          <span aria-hidden className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom">
            <motion.span
              className={`inline-block ${accent ? accentClassName : ""}`}
              initial={{ opacity: 0, transform: "translateY(110%) rotate(4deg)" }}
              animate={shown ? { opacity: 1, transform: "translateY(0%) rotate(0deg)" } : undefined}
              transition={gentle(reduce, {
                duration: 1.1,
                delay: delay + i * stagger,
                ease: EASE_OUT,
                opacity: { duration: 0.5, delay: delay + i * stagger },
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
  y = 28,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, transform: `translateY(${y}px)`, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, transform: "translateY(0px)", filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.25 }}
      transition={gentle(reduce, { duration: 0.9, delay, ease: EASE_OUT })}
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------- foto do produto */

export function ProductImage({
  product,
  className = "",
  sizes = "small",
  priority = false,
}: {
  product: Pick<Product, "image" | "cutout" | "name" | "brand">;
  className?: string;
  sizes?: "small" | "large" | "tight";
  priority?: boolean;
}) {
  if (!product.image) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={product.image}
      alt={`${product.brand} ${product.name}`}
      width={720}
      height={720}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
      className={`h-full w-full select-none ${
        product.cutout
          ? `plate-img-cutout object-contain ${sizes === "large" ? "p-8 sm:p-10" : sizes === "tight" ? "p-3" : "p-5"}`
          : "object-cover"
      } ${className}`}
    />
  );
}
