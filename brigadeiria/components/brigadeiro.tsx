"use client";

import { motion, useMotionValue, useTransform, type MotionValue } from "motion/react";
import { memo, useId, useMemo } from "react";
import type { Flavor } from "@/lib/site";

/*
 * Brigadeiro desenhado a partir do sabor: massa, finalização (granulado, crocante, pó, coco,
 * casquinha brûlée ou banhado) e a forminha plissada. Sem fotos de terceiros: quando a loja
 * tiver fotos próprias, elas podem entrar no lugar deste desenho.
 */

/* ----------------------------------------------------------------- utilidades */

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Clareia (amt > 0) ou escurece (amt < 0) uma cor */
export function shade(hex: string, amt: number) {
  const [r, g, b] = hexToRgb(hex);
  const t = amt < 0 ? 0 : 255;
  const p = Math.abs(amt);
  const mix = (c: number) => Math.round((t - c) * p + c);
  return `#${[mix(r), mix(g), mix(b)].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

/** Gerador pseudoaleatório com semente: o mesmo desenho no servidor e no navegador */
export function rng(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

const r1 = (n: number) => Math.round(n * 10) / 10;
const useSvgId = () => useId().replace(/[^a-zA-Z0-9_-]/g, "");

// Geometria fixa (viewBox 200x200)
const CX = 100;
const CY = 92;
const R = 62;

/* -------------------------------------------------------------- finalizações */

type Bit = { x: number; y: number; rot: number; s: number; c: string; k: number };

/** Espalha pontos sobre o disco, mais densos no centro e achatados na borda (efeito de esfera) */
function scatter(seed: string, count: number, colors: string[], spread = 1.12): Bit[] {
  const rand = rng(seed);
  const out: Bit[] = [];
  for (let i = 0; i < count; i++) {
    const a = rand() * Math.PI * 2;
    const d = Math.sqrt(rand()) * R * spread;
    out.push({
      x: r1(CX + Math.cos(a) * d),
      y: r1(CY + Math.sin(a) * d),
      rot: Math.round(rand() * 180),
      s: 0.7 + rand() * 0.6,
      c: colors[Math.floor(rand() * colors.length)],
      k: rand(),
    });
  }
  return out;
}

/** Fator de achatamento perto da borda da esfera */
const squash = (b: Bit) => {
  const d = Math.hypot(b.x - CX, b.y - CY) / R;
  return Math.max(0.25, Math.sqrt(Math.max(0, 1 - Math.min(d, 1) ** 2)));
};
const radial = (b: Bit) => Math.round((Math.atan2(b.y - CY, b.x - CX) * 180) / Math.PI);

function Toppings({ flavor }: { flavor: Flavor }) {
  const { topping, bits, id } = flavor;
  return useMemo(() => {
    switch (topping) {
      case "granulado":
        return scatter(id, 320, bits).map((b, i) => (
          <rect
            key={i}
            x={-4 * b.s}
            y={-1.4}
            width={8 * b.s}
            height={2.8}
            rx={1.4}
            fill={b.c}
            transform={`translate(${b.x} ${b.y}) rotate(${radial(b)}) scale(${r1(squash(b))} 1) rotate(${b.rot - radial(b)})`}
          />
        ));
      case "crocante":
        return scatter(id, 110, bits).map((b, i) => {
          const rand = rng(`${id}${i}`);
          const n = 5 + Math.floor(rand() * 2);
          const pts = Array.from({ length: n }, (_, j) => {
            const a = (j / n) * Math.PI * 2;
            const rr = (2.2 + rand() * 2.4) * b.s;
            return `${r1(Math.cos(a) * rr)},${r1(Math.sin(a) * rr)}`;
          }).join(" ");
          return (
            <polygon
              key={i}
              points={pts}
              fill={b.c}
              stroke={shade(b.c, -0.25)}
              strokeWidth={0.5}
              transform={`translate(${b.x} ${b.y}) rotate(${radial(b)}) scale(${r1(squash(b))} 1) rotate(${b.rot})`}
            />
          );
        });
      case "po":
        return (
          <>
            <circle cx={CX} cy={CY} r={R} fill={bits[0]} opacity={0.45} />
            {scatter(id, 260, bits, 1.02).map((b, i) => (
              <circle key={i} cx={b.x} cy={b.y} r={r1(0.5 + b.k * 0.9)} fill={b.c} opacity={0.9} />
            ))}
          </>
        );
      case "coco":
        return scatter(id, 120, bits).map((b, i) => (
          <path
            key={i}
            d={`M${-4 * b.s} 0 q${4 * b.s} ${-3 * b.k} ${8 * b.s} 0`}
            stroke={b.c}
            strokeWidth={1.6}
            strokeLinecap="round"
            fill="none"
            transform={`translate(${b.x} ${b.y}) rotate(${radial(b)}) scale(${r1(squash(b))} 1) rotate(${b.rot})`}
          />
        ));
      case "brulee": {
        const rand = rng(id);
        const cracks = Array.from({ length: 6 }, () => {
          const x = CX - 40 + rand() * 80;
          const y = CY - 54 + rand() * 36;
          return `M${r1(x)} ${r1(y)} l${r1(rand() * 14 - 7)} ${r1(rand() * 10 + 2)} l${r1(rand() * 12 - 6)} ${r1(rand() * 8)}`;
        }).join(" ");
        return (
          <>
            <path
              d={`M39.2 80 A62 62 0 0 1 160.8 80 C148 90 136 84 124 89 C110 95 98 86 86 91 C72 96 54 88 39.2 80Z`}
              fill={bits[0]}
              opacity={0.94}
            />
            <path d={cracks} stroke={bits[1]} strokeWidth={0.9} fill="none" strokeLinecap="round" opacity={0.8} />
            <ellipse cx={CX - 20} cy={CY - 44} rx={18} ry={5} fill="#fff" opacity={0.35} transform={`rotate(-14 ${CX - 18} ${CY - 42})`} />
          </>
        );
      }
      case "liso":
        return null;
    }
  }, [topping, bits, id]);
}

function Detail({ flavor }: { flavor: Flavor }) {
  const c = flavor.bits[0];
  switch (flavor.detail) {
    case "folha":
      return (
        <path
          d="M90 36 l9 -6 l7 4 l8 -3 l-2 8 l5 6 l-9 1 l-5 7 l-5 -6 l-9 -1 z"
          fill={c}
          stroke={shade(c, 0.35)}
          strokeWidth={0.8}
          transform="translate(0 14) rotate(-8 100 40)"
        />
      );
    case "coracao":
      return (
        <path
          d="M100 60 c -10 -7 -15 -13 -9 -18 c 4 -3 8 -1 9 2 c 1 -3 5 -5 9 -2 c 6 5 1 11 -9 18 z"
          fill={c}
          stroke={shade(c, -0.25)}
          strokeWidth={0.8}
        />
      );
    case "fio":
      return (
        <path
          d="M40 70 C 60 50, 70 92, 92 62 S 124 78, 140 48 S 158 70, 166 60 M44 96 C 64 76, 78 116, 100 86 S 132 98, 158 74 M60 46 C 76 34, 84 64, 104 40 S 130 50, 142 32"
          stroke={c}
          strokeWidth={2.2}
          fill="none"
          strokeLinecap="round"
          opacity={0.85}
        />
      );
    default:
      return null;
  }
}

/* ----------------------------------------------------------------- forminha */

const PLEATS = 18;
const cupTop = (t: number) => {
  const x = 34 + t * 132;
  return [x, 120 + Math.sin(t * Math.PI) * 24] as const;
};
const cupBottom = (t: number) => {
  const x = 52 + t * 96;
  return [x, 170 + Math.sin(t * Math.PI) * 9] as const;
};

function CupFront({ color, id }: { color: string; id: string }) {
  const pleats = Array.from({ length: PLEATS }, (_, i) => {
    const a = i / PLEATS;
    const b = (i + 1) / PLEATS;
    const [x1, y1] = cupTop(a);
    const [x2, y2] = cupTop(b);
    const [x3, y3] = cupBottom(b);
    const [x4, y4] = cupBottom(a);
    return (
      <path
        key={i}
        d={`M${r1(x1)} ${r1(y1)} L${r1(x2)} ${r1(y2)} L${r1(x3)} ${r1(y3)} L${r1(x4)} ${r1(y4)}Z`}
        fill={i % 2 ? shade(color, -0.12) : shade(color, 0.06)}
      />
    );
  });
  const rim = Array.from({ length: PLEATS + 1 }, (_, i) => cupTop(i / PLEATS))
    .map(([x, y], i) => `${i ? "L" : "M"}${r1(x)} ${r1(y)}`)
    .join(" ");
  return (
    <g>
      {pleats}
      <path
        d={`M34 120 Q100 168 166 120 L148 170 Q100 188 52 170Z`}
        fill={`url(#${id}-cupshade)`}
      />
      <path d={rim} stroke={shade(color, 0.3)} strokeWidth={1.6} fill="none" strokeLinecap="round" />
    </g>
  );
}

/* ---------------------------------------------------------------- brigadeiro */

type Props = {
  flavor: Flavor;
  className?: string;
  /** Deslocamento -1..1 para fingir que a bolinha gira (segue o mouse) */
  spinX?: MotionValue<number>;
  spinY?: MotionValue<number>;
  /** Ângulo em graus para a bolinha rolar (o brilho fica parado) */
  roll?: MotionValue<number>;
  /** Sem forminha: só a bolinha */
  bare?: boolean;
  title?: string;
};

function BrigadeiroBase({ flavor, className = "", spinX, spinY, roll, bare, title }: Props) {
  const id = useSvgId();
  const base = flavor.base;
  const zero = useMotionValue(0);
  const sx = spinX ?? zero;
  const sy = spinY ?? zero;
  const tx = useTransform(sx, (v) => v * 9);
  const ty = useTransform(sy, (v) => v * 7);
  const gx = useTransform(sx, (v) => v * -6);
  const gy = useTransform(sy, (v) => v * -5);
  const rot = roll ?? zero;
  const dyn = Boolean(spinX || spinY || roll);

  return (
    <svg viewBox="0 0 200 200" className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true}>
      {title ? <title>{title}</title> : null}
      <defs>
        <radialGradient id={`${id}-ball`} cx="38%" cy="30%" r="75%">
          <stop offset="0%" stopColor={shade(base, 0.28)} />
          <stop offset="45%" stopColor={base} />
          <stop offset="100%" stopColor={shade(base, -0.5)} />
        </radialGradient>
        <radialGradient id={`${id}-rim`} cx="50%" cy="45%" r="50%">
          <stop offset="70%" stopColor="#000" stopOpacity={0} />
          <stop offset="100%" stopColor="#000" stopOpacity={0.38} />
        </radialGradient>
        <radialGradient id={`${id}-gloss`} cx="34%" cy="26%" r="34%">
          <stop offset="0%" stopColor="#fff" stopOpacity={flavor.topping === "liso" ? 0.7 : 0.38} />
          <stop offset="100%" stopColor="#fff" stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`${id}-cupshade`} x1="0" x2="1">
          <stop offset="0%" stopColor="#000" stopOpacity={0.32} />
          <stop offset="35%" stopColor="#000" stopOpacity={0} />
          <stop offset="60%" stopColor="#fff" stopOpacity={0.12} />
          <stop offset="100%" stopColor="#000" stopOpacity={0.36} />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <circle cx={CX} cy={CY} r={R} />
        </clipPath>
      </defs>

      {/* sombra no balcão */}
      <ellipse cx={100} cy={bare ? 160 : 178} rx={bare ? 50 : 62} ry={bare ? 8 : 9} fill="var(--shadow-ink, #2b1712)" opacity={0.16} />

      {!bare && <path d="M34 120 Q100 92 166 120 Q100 112 34 120Z" fill={shade(flavor.cup, -0.35)} />}

      <circle cx={CX} cy={CY} r={R} fill={`url(#${id}-ball)`} />
      <g clipPath={`url(#${id}-clip)`}>
        {dyn ? (
          <motion.g style={{ x: tx, y: ty, rotate: rot, transformBox: "view-box", transformOrigin: `${CX}px ${CY}px` }}>
            <Toppings flavor={flavor} />
            <Detail flavor={flavor} />
          </motion.g>
        ) : (
          <g>
            <Toppings flavor={flavor} />
            <Detail flavor={flavor} />
          </g>
        )}
        <circle cx={CX} cy={CY} r={R} fill={`url(#${id}-rim)`} />
        {dyn ? (
          <motion.circle cx={CX} cy={CY} r={R} fill={`url(#${id}-gloss)`} style={{ x: gx, y: gy }} />
        ) : (
          <circle cx={CX} cy={CY} r={R} fill={`url(#${id}-gloss)`} />
        )}
      </g>

      {!bare && <CupFront color={flavor.cup} id={id} />}
    </svg>
  );
}

export const Brigadeiro = memo(BrigadeiroBase);
