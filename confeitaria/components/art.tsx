"use client";

import { motion, useReducedMotion, type TargetAndTransition, type Transition } from "motion/react";
import { useId } from "react";
import type { Art as ArtSpec, BonbonArt, BundtArt, GeladoArt, SliceArt, Topping } from "@/lib/menu";

/*
 * Ilustrações geradas a partir do cardápio: cada bolo é desenhado com a massa, os recheios,
 * a cobertura e a finalização do sabor; cada docinho com a casquinha e o confeito certos.
 * Quando um produto tem foto (campo `photo` em lib/menu.ts), a foto aparece no lugar do desenho.
 */

/* ----------------------------------------------------------- utilidades */

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

const isLight = (hex: string) => {
  const [r, g, b] = hexToRgb(hex);
  return 0.299 * r + 0.587 * g + 0.114 * b > 170;
};

/** Gerador pseudoaleatório com semente: o mesmo desenho no servidor e no navegador */
function rng(seed: string) {
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

const r2 = (n: number) => Math.round(n * 10) / 10;

/* -------------------------------------------------------------- dispatcher */

export function Art({
  art,
  className = "",
  play,
  title,
}: {
  art: ArtSpec;
  className?: string;
  /** monta a ilustração camada por camada (topo da página e configurador) */
  play?: boolean;
  title?: string;
}) {
  switch (art.kind) {
    case "slice":
      return <Slice art={art} className={className} play={play} title={title} />;
    case "bonbon":
      return <Bonbon art={art} className={className} title={title} />;
    case "gelado":
      return <Gelado art={art} className={className} title={title} />;
    case "bundt":
      return <Bundt art={art} className={className} title={title} />;
  }
}

function Svg({
  viewBox,
  className,
  title,
  children,
}: {
  viewBox: string;
  className: string;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <svg
      viewBox={viewBox}
      className={`block h-full w-full overflow-visible ${className}`}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {children}
    </svg>
  );
}

/* ---------------------------------------------------------- fatia de bolo */

// Fatia em perspectiva: a ponta (centro do bolo) à esquerda, a borda redonda à direita.
const T = { x: 26, y: 106 }; // ponta, em cima
const F = { x: 230, y: 140 }; // canto da frente, em cima
const B = { x: 222, y: 64 }; // canto de trás, em cima
const K = { x: 292, y: 90 }; // controle da curva da borda
const H = 80; // altura da fatia
const slope = (F.y - T.y) / (F.x - T.x);
/** ponto da borda mais à direita (onde a lateral vira para trás) */
const tMax = (K.x - F.x) / (K.x - F.x - (B.x - K.x));
const edgeY = (x: number) => T.y + (x - T.x) * slope;

/** Ponto na curva da borda (t = 0 na frente, 1 atrás) */
function rim(t: number) {
  const u = 1 - t;
  return {
    x: u * u * F.x + 2 * u * t * K.x + t * t * B.x,
    y: u * u * F.y + 2 * u * t * K.y + t * t * B.y,
  };
}

/** Ponto sobre o topo: `t` ao longo da borda, `inset` (0..1) em direção à ponta */
function onTop(t: number, inset: number) {
  const p = rim(t);
  return { x: p.x + (T.x - p.x) * inset, y: p.y + (T.y - p.y) * inset };
}

const band = (top: number, h: number) =>
  `M${T.x} ${r2(T.y + top)} L${F.x} ${r2(F.y + top)} L${F.x} ${r2(F.y + top + h)} L${T.x} ${r2(T.y + top + h)}Z`;

function Slice({ art, className, play, title }: { art: SliceArt; className: string; play?: boolean; title?: string }) {
  const id = useId().replace(/:/g, "");
  const reduce = useReducedMotion();
  const seed = JSON.stringify(art);
  const fr = art.frosting;
  const frost = fr.color;

  // camadas de baixo para cima: massa, recheio, massa, recheio, massa, cobertura
  const layers = [
    { top: 64, h: 16, color: art.sponge, type: "sponge" as const },
    { top: 53, h: 11, color: art.fillings[0].color, type: "fill" as const, bits: art.fillings[0].bits },
    { top: 36, h: 17, color: art.sponge, type: "sponge" as const },
    { top: 25, h: 11, color: art.fillings[1].color, type: "fill" as const, bits: art.fillings[1].bits },
    { top: 9, h: 16, color: art.sponge, type: "sponge" as const },
  ];

  const enter = (i: number): { initial?: TargetAndTransition; animate?: TargetAndTransition; transition?: Transition } =>
    play === undefined
      ? {}
      : {
          initial: { opacity: 0, transform: reduce ? "translateY(0px)" : "translateY(-26px)" },
          animate: play ? { opacity: 1, transform: "translateY(0px)" } : undefined,
          transition: reduce
            ? { duration: 0.3 }
            : { type: "spring", duration: 0.7, bounce: 0.28, delay: 0.08 + i * 0.075 },
        };

  // só a metade da borda virada para nós aparece: corta a curva no ponto mais à direita
  const q = { x: F.x + tMax * (K.x - F.x), y: F.y + tMax * (K.y - F.y) };
  const m = rim(tMax);
  const rimPath = `M${F.x} ${F.y} Q${r2(q.x)} ${r2(q.y)} ${r2(m.x)} ${r2(m.y)} L${r2(m.x)} ${r2(m.y + H)} Q${r2(q.x)} ${r2(q.y + H)} ${F.x} ${F.y + H}Z`;
  const topPath = `M${T.x} ${T.y} L${F.x} ${F.y} Q${K.x} ${K.y} ${B.x} ${B.y}Z`;

  return (
    <Svg viewBox="0 0 300 250" className={className} title={title}>
      <defs>
        <clipPath id={`front-${id}`}>
          <path d={band(0, H)} />
        </clipPath>
        <clipPath id={`top-${id}`}>
          <path d={topPath} />
        </clipPath>
        <clipPath id={`rim-${id}`}>
          <path d={rimPath} />
        </clipPath>
        <linearGradient id={`rimg-${id}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={shade(frost, -0.1)} />
          <stop offset="0.55" stopColor={shade(frost, -0.02)} />
          <stop offset="1" stopColor={shade(frost, -0.16)} />
        </linearGradient>
        <linearGradient id={`plate-${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#f3e4e1" />
        </linearGradient>
        <radialGradient id={`shadow-${id}`}>
          <stop offset="0" stopColor="#5a3326" stopOpacity="0.28" />
          <stop offset="1" stopColor="#5a3326" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* prato */}
      <motion.g {...enter(-1)}>
        <ellipse cx="150" cy="214" rx="146" ry="30" fill={`url(#plate-${id})`} />
        <ellipse cx="150" cy="212" rx="146" ry="30" fill="none" stroke="#ead3cf" strokeWidth="1.2" />
        <ellipse cx="150" cy="210" rx="112" ry="20" fill="#f7ecea" />
        <ellipse cx="150" cy="214" rx="118" ry="18" fill={`url(#shadow-${id})`} />
      </motion.g>

      {/* borda redonda (lateral coberta) */}
      <motion.g {...enter(0)}>
        <path d={rimPath} fill={`url(#rimg-${id})`} />
        <g clipPath={`url(#rim-${id})`}>
          {fr.finish === "ganache" && (
            <path
              d={`M${F.x + 22} ${F.y - 2} Q${F.x + 32} ${F.y + 36} ${F.x + 24} ${F.y + 70}`}
              stroke="#ffffff"
              strokeOpacity="0.16"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
            />
          )}
          {fr.finish === "brigadeiro" && <Sprinkles seed={`${seed}rim`} area={[F.x - 4, B.y, 66, H + 76]} n={60} />}
          {(fr.finish === "merengue" || fr.finish === "macaricado") && (
            <MeringueTexture x={F.x - 10} y={B.y} w={72} h={H + 76} color={frost} torched={fr.finish === "macaricado"} />
          )}
        </g>
      </motion.g>

      {/* face do corte: camadas */}
      <g clipPath={`url(#front-${id})`}>
        {layers.map((l, i) => (
          <motion.g key={i} {...enter(i + 1)}>
            <path d={band(l.top - 0.6, l.h + 1.2)} fill={l.color} />
            {l.type === "sponge" ? (
              <Crumb seed={`${seed}${i}`} top={l.top} h={l.h} color={l.color} />
            ) : (
              <>
                <path d={band(l.top, 1.4)} fill={shade(l.color, -0.12)} opacity="0.5" />
                <FillingBits seed={`${seed}${i}`} top={l.top} h={l.h} bits={l.bits} />
              </>
            )}
          </motion.g>
        ))}
        {/* cobertura: topo e lateral vistos no corte */}
        <motion.g {...enter(6)}>
          <path d={band(-1, 10)} fill={frost} />
          <path d={`M${F.x - 7} ${F.y - 1} L${F.x} ${F.y - 1} L${F.x} ${F.y + H} L${F.x - 7} ${F.y + H}Z`} fill={shade(frost, -0.04)} />
          {fr.finish === "macaricado" && <path d={band(-1, 3)} fill="#c98b4f" opacity="0.55" />}
        </motion.g>
        {/* luz da esquerda para a direita */}
        <path d={band(0, H)} fill={`url(#rimg-${id})`} opacity="0.12" />
      </g>

      {/* topo */}
      <motion.g {...enter(7)}>
        <path d={topPath} fill={shade(frost, 0.05)} />
        <g clipPath={`url(#top-${id})`}>
          {fr.finish === "ganache" && (
            <path
              d={`M${T.x + 40} ${T.y - 4} Q${150} ${92} ${B.x - 6} ${B.y + 12}`}
              stroke="#ffffff"
              strokeOpacity="0.09"
              strokeWidth="9"
              fill="none"
              strokeLinecap="round"
            />
          )}
          {fr.finish === "brigadeiro" && <Sprinkles seed={`${seed}top`} area={[T.x, B.y, F.x - T.x + 20, F.y - B.y]} n={70} />}
          {fr.finish === "macaricado" && <Torch seed={seed} />}
        </g>
        <path d={`M${T.x} ${T.y} L${F.x} ${F.y}`} stroke={shade(frost, 0.12)} strokeWidth="1.4" strokeLinecap="round" />
      </motion.g>

      {/* finalização: rosetas, merengue e confeitos */}
      <motion.g
        initial={play === undefined ? undefined : { opacity: 0, transform: reduce ? "translateY(0px)" : "translateY(-40px)" }}
        animate={play ? { opacity: 1, transform: "translateY(0px)" } : undefined}
        transition={reduce ? { duration: 0.3 } : { type: "spring", duration: 0.8, bounce: 0.35, delay: 0.75 }}
      >
        <Finish art={art} seed={seed} />
      </motion.g>
    </Svg>
  );
}

function Crumb({ seed, top, h, color }: { seed: string; top: number; h: number; color: string }) {
  const rand = rng(seed);
  const dark = shade(color, isLight(color) ? -0.14 : -0.22);
  const holes = Array.from({ length: 34 }, () => {
    const x = T.x + rand() * (F.x - T.x);
    return { x, y: edgeY(x) + top + 2 + rand() * (h - 4), r: 0.6 + rand() * 1.3 };
  });
  return (
    <g fill={dark} opacity="0.55">
      {holes.map((p, i) => (
        <circle key={i} cx={r2(p.x)} cy={r2(p.y)} r={r2(p.r)} />
      ))}
    </g>
  );
}

function FillingBits({ seed, top, h, bits }: { seed: string; top: number; h: number; bits?: SliceArt["fillings"][0]["bits"] }) {
  if (!bits) return null;
  const rand = rng(seed + bits);
  const mid = top + h / 2;
  const at = (n: number, jitter = 2.4) =>
    Array.from({ length: n }, (_, i) => {
      const x = T.x + 14 + ((i + 0.3 + rand() * 0.4) / n) * (F.x - T.x - 26);
      return { x, y: edgeY(x) + mid + (rand() - 0.5) * jitter * 2, k: rand() };
    });

  switch (bits) {
    case "morango":
      return (
        <g>
          {at(7).map((p, i) => (
            <g key={i} transform={`translate(${r2(p.x)} ${r2(p.y)}) rotate(${r2(p.k * 40 - 20)})`}>
              <ellipse rx="6.4" ry="4.2" fill="#d42f45" />
              <ellipse rx="4.4" ry="2.6" fill="#f6a3ad" />
              <ellipse rx="1.8" ry="1" fill="#fde3e6" />
            </g>
          ))}
        </g>
      );
    case "abacaxi":
      return (
        <g>
          {at(9).map((p, i) => (
            <rect key={i} x={r2(p.x - 3)} y={r2(p.y - 3)} width="6" height="5.6" rx="1.4" fill="#f5cf3a" transform={`rotate(${r2(p.k * 50 - 25)} ${r2(p.x)} ${r2(p.y)})`} />
          ))}
          {at(14, 3.4).map((p, i) => (
            <path key={`c${i}`} d={`M${r2(p.x - 2)} ${r2(p.y)} q2 -1.6 4 0`} stroke="#ffffff" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          ))}
        </g>
      );
    case "coco":
      return (
        <g stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.95">
          {at(22, 3.4).map((p, i) => (
            <path key={i} d={`M${r2(p.x - 2)} ${r2(p.y)} q2 ${p.k > 0.5 ? -1.6 : 1.6} 4 0`} />
          ))}
        </g>
      );
    case "choco":
      return (
        <g fill="#3b2017">
          {at(16, 3).map((p, i) => (
            <rect key={i} x={r2(p.x - 1.8)} y={r2(p.y - 1.2)} width="3.6" height="2.6" rx="0.8" transform={`rotate(${r2(p.k * 60)} ${r2(p.x)} ${r2(p.y)})`} />
          ))}
        </g>
      );
    case "nozes":
      return (
        <g>
          {at(9).map((p, i) => (
            <path
              key={i}
              d={`M${r2(p.x - 3.5)} ${r2(p.y)} q1 -3.4 3.5 -2.4 q3 -1.4 3.6 1.4 q-0.6 3.4 -3.6 2.8 q-3 1 -3.5 -1.8Z`}
              fill="#8c5631"
            />
          ))}
        </g>
      );
    case "banana":
      return (
        <g>
          {at(7, 1.4).map((p, i) => (
            <g key={i} transform={`translate(${r2(p.x)} ${r2(p.y)})`}>
              <ellipse rx="5.2" ry="3.8" fill="#f3dc8b" />
              <ellipse rx="3.8" ry="2.6" fill="#fbefc3" />
              <circle r="0.7" fill="#9b7a3c" />
            </g>
          ))}
        </g>
      );
    case "geleia":
      return (
        <path
          d={`M${T.x} ${r2(edgeY(T.x) + mid)} ${Array.from({ length: 12 }, (_, i) => {
            const x = T.x + ((i + 1) / 12) * (F.x - T.x);
            return `Q${r2(x - 9)} ${r2(edgeY(x) + mid + (i % 2 ? 2.4 : -2.4))} ${r2(x)} ${r2(edgeY(x) + mid)}`;
          }).join(" ")}`}
          stroke="#8e1c35"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
      );
  }
}

function Sprinkles({ seed, area, n }: { seed: string; area: [number, number, number, number]; n: number }) {
  const rand = rng(seed);
  const colors = ["#2e1710", "#4a2618", "#3a1e14"];
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const x = area[0] + rand() * area[2];
        const y = area[1] + rand() * area[3];
        return (
          <rect
            key={i}
            x={r2(x)}
            y={r2(y)}
            width="4.2"
            height="1.6"
            rx="0.8"
            fill={colors[i % 3]}
            transform={`rotate(${r2(rand() * 180)} ${r2(x + 2)} ${r2(y + 0.8)})`}
          />
        );
      })}
    </g>
  );
}

function MeringueTexture({ x, y, w, h, color, torched }: { x: number; y: number; w: number; h: number; color: string; torched: boolean }) {
  const rows = Math.ceil(h / 14);
  return (
    <g>
      {Array.from({ length: rows }, (_, i) => (
        <path
          key={i}
          d={`M${x} ${y + i * 14 + 8} q${w / 4} -8 ${w / 2} 0 q${w / 4} 8 ${w / 2} 0`}
          stroke={torched && i % 2 ? "#d39a5e" : shade(color, -0.12)}
          strokeWidth="2"
          fill="none"
          opacity="0.6"
        />
      ))}
    </g>
  );
}

function Torch({ seed }: { seed: string }) {
  const rand = rng(seed + "torch");
  return (
    <g>
      {Array.from({ length: 9 }, (_, i) => {
        const p = onTop(rand(), 0.15 + rand() * 0.6);
        return <ellipse key={i} cx={r2(p.x)} cy={r2(p.y)} rx={r2(6 + rand() * 8)} ry={r2(2.4 + rand() * 2)} fill="#d8a066" opacity="0.4" />;
      })}
    </g>
  );
}

/* ---------------------------------------------- finalização sobre o topo */

function Rosette({ x, y, s, color }: { x: number; y: number; s: number; color: string }) {
  const line = shade(color, -0.14);
  return (
    <g transform={`translate(${r2(x)} ${r2(y)}) scale(${r2(s)})`}>
      <ellipse cx="0" cy="3" rx="9" ry="3.4" fill="#3b2017" opacity="0.08" />
      <path d="M-9 0 a9 7.6 0 0 1 18 0 a9 6 0 0 1 -18 0Z" fill={color} />
      <path d="M-6 -1 q6 -6 12 0 M-5 2 q5 -4 10 0 M-3 -4 q3 -2 6 0" stroke={line} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M0 -10.5 q4 3 1.2 6 q-4 -1 -1.2 -6Z" fill={color} stroke={line} strokeWidth="0.9" />
    </g>
  );
}

function Peak({ x, y, s, color, torched }: { x: number; y: number; s: number; color: string; torched: boolean }) {
  return (
    <g transform={`translate(${r2(x)} ${r2(y)}) scale(${r2(s)})`}>
      <ellipse cx="0" cy="3" rx="8" ry="3" fill="#3b2017" opacity="0.08" />
      <path d="M-9 2 C-9 -6 -2 -8 0 -17 C2 -8 9 -6 9 2 C5 5 -5 5 -9 2Z" fill={color} />
      <path d="M-4 0 C-3 -5 -1 -8 0 -12" stroke={shade(color, -0.1)} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {torched && <path d="M-3.6 -9 C-2 -12 -0.6 -14 0 -17 C0.8 -13 2.4 -11 3.8 -9 C1.6 -7.6 -1.6 -7.6 -3.6 -9Z" fill="#b8733a" opacity="0.85" />}
    </g>
  );
}

function Finish({ art, seed }: { art: SliceArt; seed: string }) {
  const rand = rng(seed + "finish");
  const fr = art.frosting;
  const items: React.ReactNode[] = [];

  // rosetas de chantininho ou picos de merengue ao longo da borda
  const piping = fr.finish === "chantininho" || fr.finish === "merengue" || fr.finish === "macaricado";
  if (piping) {
    [0.06, 0.3, 0.54, 0.78, 0.97].forEach((t, i) => {
      const p = onTop(t, 0.07);
      const s = 1.35 - t * 0.4;
      items.push(
        fr.finish === "chantininho" ? (
          <Rosette key={`r${i}`} x={p.x} y={p.y} s={s} color={fr.color} />
        ) : (
          <Peak key={`p${i}`} x={p.x} y={p.y} s={s} color={fr.color} torched={fr.finish === "macaricado"} />
        ),
      );
    });
  }

  const spots = piping ? [0.18, 0.42, 0.66, 0.88] : [0.12, 0.36, 0.6, 0.84];
  const toppings = art.toppings;

  toppings.forEach((top) => {
    spots.forEach((t, i) => {
      const p = onTop(t, piping ? 0.2 : 0.12);
      const s = 1.5 - t * 0.5;
      items.push(<ToppingPiece key={`${top}${i}`} kind={top} x={p.x} y={p.y} s={s} k={rand()} />);
    });
  });

  // confeitos espalhados pelo topo
  const scatter = (n: number, draw: (x: number, y: number, k: number, i: number) => React.ReactNode) => {
    for (let i = 0; i < n; i++) {
      const p = onTop(rand(), 0.25 + rand() * 0.6);
      items.unshift(draw(p.x, p.y, rand(), i));
    }
  };
  if (toppings.includes("coco"))
    scatter(26, (x, y, k, i) => (
      <path key={`cf${i}`} d={`M${r2(x - 2.4)} ${r2(y)} q2.4 ${k > 0.5 ? -2 : 2} 4.8 0`} stroke="#ffffff" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    ));
  if (toppings.includes("ninho"))
    scatter(40, (x, y, k, i) => <circle key={`n${i}`} cx={r2(x)} cy={r2(y)} r={r2(0.7 + k)} fill="#fffdf6" opacity="0.95" />);
  if (toppings.includes("farofa"))
    scatter(22, (x, y, k, i) => (
      <rect key={`f${i}`} x={r2(x)} y={r2(y)} width={r2(2 + k * 2)} height={r2(2 + k * 1.6)} rx="0.6" fill="#9c2638" transform={`rotate(${r2(k * 90)} ${r2(x)} ${r2(y)})`} />
    ));
  if (toppings.includes("banana"))
    scatter(30, (x, y, k, i) => <circle key={`cn${i}`} cx={r2(x)} cy={r2(y)} r={r2(0.5 + k * 0.6)} fill="#9a5a2a" opacity="0.7" />);
  if (toppings.includes("limao"))
    scatter(16, (x, y, k, i) => (
      <path key={`z${i}`} d={`M${r2(x)} ${r2(y)} l${r2(3 + k * 2)} ${r2(-1 + k)}`} stroke="#8fb631" strokeWidth="1.4" strokeLinecap="round" />
    ));

  return <g>{items}</g>;
}

function ToppingPiece({ kind, x, y, s, k }: { kind: Topping; x: number; y: number; s: number; k: number }) {
  const t = `translate(${r2(x)} ${r2(y)}) scale(${r2(s)})`;
  switch (kind) {
    case "morangos":
      return (
        <g transform={`${t} rotate(${r2(k * 30 - 15)})`}>
          <ellipse cx="0" cy="5" rx="9" ry="3" fill="#3b2017" opacity="0.1" />
          <path d="M0 6 C-9 4 -11 -6 -6 -10 C-3 -12 3 -12 6 -10 C11 -6 9 4 0 6Z" fill="#db2f45" />
          <path d="M-4 -8 C-2 -9.4 2 -9.4 4 -8" stroke="#ff8a96" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.7" />
          {[[-4, -3], [0, -5], [4, -3], [-2, 1], [3, 1], [-5, -7], [5, -7]].map(([a, b], i) => (
            <ellipse key={i} cx={a} cy={b} rx="0.6" ry="0.9" fill="#ffd36b" />
          ))}
          <path d="M-6 -11 L-2 -9 L0 -13 L2 -9 L6 -11 L3 -7.6 L-3 -7.6Z" fill="#4f9a3a" />
        </g>
      );
    case "frutasVermelhas":
      return (
        <g transform={t}>
          <ellipse cx="0" cy="5" rx="10" ry="3" fill="#3b2017" opacity="0.1" />
          <circle cx="5" cy="0" r="4.4" fill="#3d3a72" />
          <circle cx="6.4" cy="-1.4" r="1.1" fill="#8a87c4" opacity="0.6" />
          <g transform="translate(-3 -2)">
            <circle r="5.4" fill="#b0203f" />
            {[[-2.4, -2], [1.2, -2.6], [2.8, 0.6], [-0.4, 1.2], [-2.8, 1.8], [0.6, 3.6]].map(([a, b], i) => (
              <circle key={i} cx={a} cy={b} r="1.7" fill="#cf2f52" />
            ))}
          </g>
        </g>
      );
    case "raspas":
    case "raspasBrancas": {
      const c = kind === "raspas" ? "#3b2017" : "#fbf3e2";
      const l = kind === "raspas" ? "#6b3d28" : "#e2cfae";
      return (
        <g transform={`${t} rotate(${r2(k * 60 - 30)})`}>
          <path d="M-8 0 C-6 -5 6 -5 8 0 C6 -2 -6 -2 -8 0Z" fill={c} />
          <path d="M-6 -2.4 C-3 -4 3 -4 6 -2.4" stroke={l} strokeWidth="0.9" fill="none" />
          <path d="M-4 4 C-2 1 4 1 6 4 C4 3 -2 3 -4 4Z" fill={c} />
        </g>
      );
    }
    case "banana":
      return (
        <g transform={t}>
          <ellipse cx="0" cy="4" rx="8" ry="2.6" fill="#3b2017" opacity="0.1" />
          <ellipse cx="0" cy="0" rx="8" ry="5" fill="#ecd27a" />
          <ellipse cx="0" cy="-0.6" rx="6.4" ry="3.8" fill="#fbf0c6" />
          <circle cx="0" cy="-0.6" r="0.9" fill="#a8843f" />
        </g>
      );
    case "nozes":
      return (
        <g transform={`${t} rotate(${r2(k * 30 - 15)})`}>
          <ellipse cx="0" cy="4" rx="8" ry="2.6" fill="#3b2017" opacity="0.12" />
          <path d="M0 4 C-9 4 -10 -4 -6 -6 C-4 -9 -1 -7 0 -5 C1 -7 4 -9 6 -6 C10 -4 9 4 0 4Z" fill="#94592f" />
          <path d="M0 -4 L0 3 M-5 -3 q2 2 0 5 M5 -3 q-2 2 0 5" stroke="#5e3218" strokeWidth="1" fill="none" strokeLinecap="round" />
        </g>
      );
    case "limao":
      return (
        <g transform={`${t} rotate(${r2(k * 20 - 10)})`}>
          <ellipse cx="0" cy="4" rx="9" ry="2.6" fill="#3b2017" opacity="0.1" />
          <path d="M-9 2 A9 9 0 0 1 9 2Z" fill="#7fa82b" />
          <path d="M-7.6 2 A7.6 7.6 0 0 1 7.6 2Z" fill="#e6f0a6" />
          <path d="M0 2 L0 -5.4 M0 2 L-5 -3 M0 2 L5 -3" stroke="#a9c94c" strokeWidth="1" />
        </g>
      );
    case "maracuja":
      return (
        <g transform={t}>
          <ellipse cx="0" cy="0" rx="8" ry="4.6" fill="#f2b632" />
          <ellipse cx="-1" cy="-1" rx="5" ry="2.4" fill="#f8d36a" />
          {[[-4, 0], [0, -1.4], [3.6, 0.4], [-1, 1.8], [2, 2]].map(([a, b], i) => (
            <ellipse key={i} cx={a} cy={b} rx="1.1" ry="0.8" fill="#1d1410" />
          ))}
        </g>
      );
    default:
      return null;
  }
}

/* --------------------------------------------------------------- docinhos */

function Cup({ color, id }: { color: string; id: string }) {
  const pleats = Array.from({ length: 11 }, (_, i) => 26 + i * 6.8);
  return (
    <g>
      <defs>
        <linearGradient id={`cup-${id}`} x1="0" x2="1">
          <stop offset="0" stopColor={shade(color, -0.12)} />
          <stop offset="0.45" stopColor={shade(color, 0.08)} />
          <stop offset="1" stopColor={shade(color, -0.18)} />
        </linearGradient>
      </defs>
      <path d="M20 74 L100 74 L91 104 Q60 109 29 104Z" fill={`url(#cup-${id})`} />
      {pleats.map((x, i) => (
        <path key={i} d={`M${r2(x)} 76 L${r2(x + (60 - x) * 0.12)} 104`} stroke={shade(color, -0.25)} strokeWidth="0.9" opacity="0.55" />
      ))}
      <path
        d={`M18 74 ${Array.from({ length: 12 }, (_, i) => `q${3.5} ${i % 2 ? 3 : -3} ${7} 0`).join(" ")}`}
        stroke={shade(color, -0.2)}
        strokeWidth="2.2"
        fill="none"
        strokeLinejoin="round"
      />
    </g>
  );
}

function Bonbon({ art, className, title }: { art: BonbonArt; className: string; title?: string }) {
  const id = useId().replace(/:/g, "");
  const seed = JSON.stringify(art);
  const rand = rng(seed);
  const body = art.body;
  const cup = art.cup ?? "#c99a5b";

  // forma do doce
  let shape: React.ReactNode;
  let clip: React.ReactNode;
  switch (art.shape) {
    case "trufa":
      clip = <path d="M28 76 C26 46 40 34 60 34 C80 34 94 46 92 76 C80 80 40 80 28 76Z" />;
      break;
    case "caju":
      clip = <path d="M60 30 C70 30 76 38 76 48 C76 56 92 62 88 74 C84 82 36 82 32 74 C28 62 44 56 44 48 C44 38 50 30 60 30Z" />;
      break;
    case "morango":
      clip = <path d="M60 80 C38 78 28 60 32 46 C35 36 46 33 60 34 C74 33 85 36 88 46 C92 60 82 78 60 80Z" />;
      break;
    case "olho":
      clip = <ellipse cx="60" cy="56" rx="30" ry="22" />;
      break;
    case "camafeu":
      clip = <ellipse cx="60" cy="58" rx="32" ry="22" />;
      break;
    default:
      clip = <circle cx="60" cy="54" r="28" />;
  }
  shape = clip;

  const coat = art.coat ?? "liso";
  const coatColor = art.coatColor ?? (isLight(body) ? "#ffffff" : shade(body, -0.35));

  return (
    <Svg viewBox="0 0 120 120" className={className} title={title}>
      <defs>
        <radialGradient id={`ball-${id}`} cx="0.36" cy="0.3" r="0.8">
          <stop offset="0" stopColor={shade(body, 0.28)} />
          <stop offset="0.55" stopColor={body} />
          <stop offset="1" stopColor={shade(body, -0.28)} />
        </radialGradient>
        <clipPath id={`clip-${id}`}>{clip}</clipPath>
      </defs>

      <ellipse cx="60" cy="106" rx="40" ry="7" fill="#5a3326" opacity="0.13" />
      <Cup color={cup} id={id} />

      <g>
        <g fill={`url(#ball-${id})`}>{shape}</g>
        <g clipPath={`url(#clip-${id})`}>
          {coat === "granulado" &&
            Array.from({ length: 90 }, (_, i) => {
              const x = 26 + rand() * 68;
              const y = 22 + rand() * 62;
              return (
                <rect
                  key={i}
                  x={r2(x)}
                  y={r2(y)}
                  width="4"
                  height="1.6"
                  rx="0.8"
                  fill={i % 3 ? coatColor : shade(coatColor, -0.2)}
                  transform={`rotate(${r2(rand() * 180)} ${r2(x + 2)} ${r2(y + 0.8)})`}
                />
              );
            })}
          {coat === "po" &&
            Array.from({ length: 70 }, (_, i) => (
              <circle key={i} cx={r2(28 + rand() * 64)} cy={r2(24 + rand() * 60)} r={r2(0.5 + rand() * 1.1)} fill="#ffffff" opacity="0.9" />
            ))}
          {coat === "coco" &&
            Array.from({ length: 46 }, (_, i) => {
              const x = 28 + rand() * 64;
              const y = 24 + rand() * 58;
              return (
                <path key={i} d={`M${r2(x)} ${r2(y)} q2.2 ${rand() > 0.5 ? -1.8 : 1.8} 4.4 0`} stroke="#ffffff" strokeWidth="1.4" fill="none" strokeLinecap="round" />
              );
            })}
          {coat === "farofa" &&
            Array.from({ length: 60 }, (_, i) => {
              const x = 26 + rand() * 68;
              const y = 22 + rand() * 62;
              return (
                <rect key={i} x={r2(x)} y={r2(y)} width={r2(2 + rand() * 2.4)} height={r2(1.6 + rand() * 2)} rx="0.6" fill={i % 2 ? coatColor : shade(coatColor, -0.18)} transform={`rotate(${r2(rand() * 90)} ${r2(x)} ${r2(y)})`} />
              );
            })}
          {coat === "acucar" &&
            Array.from({ length: 56 }, (_, i) => (
              <rect
                key={i}
                x={r2(26 + rand() * 68)}
                y={r2(22 + rand() * 62)}
                width="1.6"
                height="1.6"
                fill={art.coatColor ?? "#ffffff"}
                opacity={r2(0.55 + rand() * 0.45)}
                transform={`rotate(45)`}
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
              />
            ))}
          {art.topper === "meio" && <rect x="60" y="20" width="40" height="70" fill={art.topperColor} />}
          {art.shape === "olho" && (
            <>
              <path d="M38 56 C46 46 74 46 82 56 C74 64 46 64 38 56Z" fill={art.topperColor ?? "#f7e3a3"} />
              <path d="M42 56 C50 50 70 50 78 56" stroke="#e8c96d" strokeWidth="1.4" fill="none" />
            </>
          )}
          {art.shape === "morango" && (
            Array.from({ length: 16 }, (_, i) => (
              <ellipse key={`s${i}`} cx={r2(36 + rand() * 48)} cy={r2(44 + rand() * 32)} rx="0.9" ry="1.3" fill="#fff4c9" opacity="0.85" />
            ))
          )}
          {/* brilho */}
          <ellipse cx="48" cy="40" rx="11" ry="6.5" fill="#ffffff" opacity={coat === "liso" ? 0.28 : 0.16} transform="rotate(-25 48 40)" />
        </g>
      </g>

      <BonbonTopper art={art} />
    </Svg>
  );
}

function BonbonTopper({ art }: { art: BonbonArt }) {
  const c = art.topperColor ?? "#ffffff";
  const topY = art.shape === "trufa" ? 36 : art.shape === "camafeu" ? 40 : art.shape === "caju" ? 31 : 28;
  switch (art.topper) {
    case "morango":
      return (
        <g transform={`translate(60 ${topY})`}>
          <path d="M0 6 C-7 4 -8 -4 -4 -7 C-2 -8 2 -8 4 -7 C8 -4 7 4 0 6Z" fill="#db2f45" />
          <path d="M-4 -7.6 L0 -10 L4 -7.6 L1.6 -5.6 L-1.6 -5.6Z" fill="#4f9a3a" />
        </g>
      );
    case "castanha":
      return (
        <path transform={`translate(60 ${topY}) rotate(-12)`} d="M-8 1 C-9 -5 -2 -7 2 -5 C6 -3 9 -6 9 -2 C9 4 -6 7 -8 1Z" fill="#ead2a2" stroke="#c49a5c" strokeWidth="1" />
      );
    case "nozes":
      return (
        <g transform={`translate(60 ${topY})`}>
          <path d="M0 5 C-12 5 -13 -5 -8 -7 C-5 -11 -1 -9 0 -6 C1 -9 5 -11 8 -7 C13 -5 12 5 0 5Z" fill="#94592f" />
          <path d="M0 -5 L0 4 M-6 -4 q3 3 0 7 M6 -4 q-3 3 0 7" stroke="#5e3218" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        </g>
      );
    case "cravo":
      return (
        <g transform={`translate(60 ${topY + 2})`}>
          <path d="M0 -1 L0 -9" stroke="#4a2a1a" strokeWidth="2" strokeLinecap="round" />
          <circle cx="0" cy="-10" r="2.6" fill="#3a2016" />
        </g>
      );
    case "amendoim":
      return <ellipse cx="60" cy={topY} rx="5" ry="3.4" fill="#e9c58c" stroke="#b98a4c" strokeWidth="1" />;
    case "raspas":
      return (
        <g stroke={c} strokeWidth="1.8" strokeLinecap="round" fill="none">
          <path d={`M52 ${topY + 2} q4 -3 8 -1`} />
          <path d={`M60 ${topY - 1} q4 -2 7 1`} />
          <path d={`M56 ${topY + 6} q3 -2 7 0`} />
        </g>
      );
    case "sementes":
      return (
        <g>
          <ellipse cx="60" cy={topY + 3} rx="9" ry="4.6" fill="#f2b632" />
          {[[-4, 0], [0, -1.4], [3.6, 0.6], [-0.6, 2]].map(([a, b], i) => (
            <ellipse key={i} cx={60 + a} cy={topY + 3 + b} rx="1.1" ry="0.8" fill="#1d1410" />
          ))}
        </g>
      );
    case "fio": {
      const y = art.shape === "trufa" ? 48 : 40;
      return (
        <path
          d={`M38 ${y + 6} L46 ${y - 4} L52 ${y + 8} L60 ${y - 6} L67 ${y + 8} L74 ${y - 4} L82 ${y + 6}`}
          stroke={c}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      );
    }
    default:
      if (art.shape === "morango")
        return (
          <path d={`M48 37 L54 33 L56 26 L60 32 L64 26 L66 33 L72 37 L64 38 L60 42 L56 38Z`} fill="#4f9a3a" />
        );
      return null;
  }
}

/* ------------------------------------------------------------ bolo gelado */

function Gelado({ art, className, title }: { art: GeladoArt; className: string; title?: string }) {
  const id = useId().replace(/:/g, "");
  const rand = rng(JSON.stringify(art));
  // caixa em perspectiva: frente, lateral direita e topo
  const front = "M30 62 L108 62 L108 112 L30 112Z";
  const side = "M108 62 L132 48 L132 98 L108 112Z";
  const top = "M30 62 L54 48 L132 48 L108 62Z";
  const foilTop = (x0: number, x1: number, y: number) =>
    `M${x0} ${y} ${Array.from({ length: 8 }, (_, i) => {
      const x = x0 + ((i + 1) / 8) * (x1 - x0);
      return `L${r2(x - (x1 - x0) / 16)} ${r2(y + (i % 2 ? -3 : 3))} L${r2(x)} ${y}`;
    }).join(" ")}`;

  return (
    <Svg viewBox="0 0 160 140" className={className} title={title}>
      <defs>
        <linearGradient id={`foil-${id}`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#f4f2f0" />
          <stop offset="0.35" stopColor="#c9c6c4" />
          <stop offset="0.6" stopColor="#eeeceb" />
          <stop offset="1" stopColor="#a9a5a3" />
        </linearGradient>
        <clipPath id={`front-${id}`}>
          <path d={front} />
        </clipPath>
      </defs>
      <ellipse cx="82" cy="120" rx="62" ry="9" fill="#5a3326" opacity="0.13" />

      {/* corte: massa molhada e creme */}
      <g clipPath={`url(#front-${id})`}>
        <rect x="30" y="62" width="78" height="50" fill={art.sponge} />
        <rect x="30" y="62" width="78" height="12" fill={art.cream} />
        <rect x="30" y="86" width="78" height="7" fill={art.cream} opacity="0.92" />
        {Array.from({ length: 22 }, (_, i) => (
          <circle key={i} cx={r2(32 + rand() * 74)} cy={r2(76 + rand() * 34)} r={r2(0.6 + rand())} fill={shade(art.sponge, -0.2)} opacity="0.5" />
        ))}
      </g>
      <path d={side} fill={shade(art.sponge, -0.1)} />
      <path d="M108 62 L132 48 L132 58 L108 72Z" fill={shade(art.cream, -0.08)} />
      <path d={top} fill={shade(art.cream, 0.04)} />
      <GeladoTop art={art} />

      {/* papel-alumínio */}
      <path d={`${foilTop(30, 108, 84)} L108 112 L30 112Z`} fill={`url(#foil-${id})`} />
      <path d={`M108 84 L132 70 L132 98 L108 112Z`} fill={`url(#foil-${id})`} opacity="0.85" />
      <path d="M42 90 Q46 100 43 110 M64 88 Q60 99 63 111 M88 89 Q92 100 89 110 M119 82 Q115 92 118 104" stroke="#8f8b89" strokeWidth="0.9" fill="none" opacity="0.55" />
      <path d="M34 100 Q46 96 56 99 M70 104 Q84 99 98 102 M112 96 Q120 90 128 88" stroke="#ffffff" strokeWidth="1.6" fill="none" opacity="0.75" strokeLinecap="round" />
    </Svg>
  );
}

function GeladoTop({ art }: { art: GeladoArt }) {
  const rand = rng(JSON.stringify(art) + "top");
  const pts = (n: number) =>
    Array.from({ length: n }, () => {
      const u = rand();
      const v = rand();
      return { x: 34 + u * 74 + v * 22, y: 60 - v * 12 + (rand() - 0.5) * 1.5 };
    });
  switch (art.top) {
    case "coco":
      return (
        <g stroke="#ffffff" strokeWidth="1.3" strokeLinecap="round" fill="none">
          {pts(40).map((p, i) => (
            <path key={i} d={`M${r2(p.x)} ${r2(p.y)} q2 ${i % 2 ? -1.6 : 1.6} 4 0`} />
          ))}
        </g>
      );
    case "granulado":
      return (
        <g>
          {pts(54).map((p, i) => (
            <rect key={i} x={r2(p.x)} y={r2(p.y)} width="3.6" height="1.4" rx="0.7" fill={i % 2 ? "#2e1710" : "#4a2618"} transform={`rotate(${r2(rand() * 180)} ${r2(p.x)} ${r2(p.y)})`} />
          ))}
        </g>
      );
    case "ninho":
      return (
        <g fill="#ffffff">
          {pts(60).map((p, i) => (
            <circle key={i} cx={r2(p.x)} cy={r2(p.y)} r={r2(0.5 + rand())} />
          ))}
        </g>
      );
    case "frutasVermelhas":
      return (
        <g>
          {pts(7).map((p, i) => (
            <circle key={i} cx={r2(p.x)} cy={r2(p.y)} r={i % 3 ? 3.4 : 3} fill={i % 3 ? "#b0203f" : "#3d3a72"} />
          ))}
          <path d="M44 58 Q64 50 84 56 T120 50" stroke="#8e1c35" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.8" />
        </g>
      );
    case "nutella":
      return <path d="M42 58 Q56 50 70 56 T100 52 T124 50" stroke="#5a2f1d" strokeWidth="3.4" fill="none" strokeLinecap="round" />;
    case "nozes":
      return (
        <g>
          {pts(6).map((p, i) => (
            <path key={i} transform={`translate(${r2(p.x)} ${r2(p.y)}) scale(0.7)`} d="M0 4 C-9 4 -10 -4 -6 -6 C-4 -9 -1 -7 0 -5 C1 -7 4 -9 6 -6 C10 -4 9 4 0 4Z" fill="#94592f" />
          ))}
        </g>
      );
    default:
      return null;
  }
}

/* -------------------------------------------------------- bolo caseirinho */

function Bundt({ art, className, title }: { art: BundtArt; className: string; title?: string }) {
  const id = useId().replace(/:/g, "");
  const rand = rng(JSON.stringify(art));
  const s = art.sponge;

  if (art.cremoso) {
    // pedaço quadrado com a camada cremosa por cima
    return (
      <Svg viewBox="0 0 160 140" className={className} title={title}>
        <ellipse cx="82" cy="118" rx="62" ry="9" fill="#5a3326" opacity="0.13" />
        <path d="M30 64 L108 64 L108 110 L30 110Z" fill={s} />
        <path d="M30 64 L108 64 L108 82 L30 82Z" fill={shade(s, 0.32)} />
        <path d="M30 82 Q69 86 108 82" stroke={shade(s, 0.15)} strokeWidth="3" fill="none" />
        <path d="M108 64 L132 50 L132 96 L108 110Z" fill={shade(s, -0.12)} />
        <path d="M108 64 L132 50 L132 68 L108 82Z" fill={shade(s, 0.18)} />
        <path d="M30 64 L54 50 L132 50 L108 64Z" fill={shade(s, -0.04)} />
        {Array.from({ length: 26 }, (_, i) => (
          <circle key={i} cx={r2(36 + rand() * 90)} cy={r2(51 + rand() * 12)} r={r2(0.8 + rand() * 1.2)} fill={shade(s, -0.3)} opacity="0.5" />
        ))}
        {Array.from({ length: 16 }, (_, i) => (
          <circle key={`b${i}`} cx={r2(32 + rand() * 74)} cy={r2(86 + rand() * 22)} r={r2(0.6 + rand())} fill={shade(s, -0.25)} opacity="0.5" />
        ))}
      </Svg>
    );
  }

  const glaze = art.glaze === "brigadeiro" ? "#6e3f28" : art.glaze === "ganache" ? "#3a1f16" : null;
  const flutes = [-48, -34, -18, 0, 18, 34, 48];
  // corpo: topo elíptico, laterais levemente abertas, base elíptica
  const body = "M24 56 C24 46 136 46 136 56 L142 104 C142 118 18 118 18 104Z";

  return (
    <Svg viewBox="0 0 160 140" className={className} title={title}>
      <defs>
        <linearGradient id={`bundt-${id}`} x1="0" x2="1">
          <stop offset="0" stopColor={shade(s, -0.2)} />
          <stop offset="0.4" stopColor={shade(s, 0.08)} />
          <stop offset="1" stopColor={shade(s, -0.26)} />
        </linearGradient>
        <clipPath id={`body-${id}`}>
          <path d={body} />
        </clipPath>
      </defs>
      <ellipse cx="80" cy="120" rx="68" ry="9" fill="#5a3326" opacity="0.13" />
      <path d={body} fill={`url(#bundt-${id})`} />
      <g clipPath={`url(#body-${id})`}>
        {flutes.map((dx, i) => (
          <path key={i} d={`M${80 + dx * 1.05} 54 Q${80 + dx * 1.25} 84 ${80 + dx * 1.18} 118`} stroke={shade(s, -0.22)} strokeWidth="2" fill="none" opacity="0.45" />
        ))}
        {art.pattern === "mesclado" && (
          <g stroke="#5b3526" strokeWidth="5" fill="none" opacity="0.85" strokeLinecap="round">
            <path d="M24 78 C44 66 56 92 78 80 S112 70 138 84" />
            <path d="M22 100 C40 92 60 112 84 100 S120 94 142 104" />
          </g>
        )}
        {art.pattern === "formigueiro" &&
          Array.from({ length: 70 }, (_, i) => (
            <rect key={i} x={r2(20 + rand() * 120)} y={r2(52 + rand() * 62)} width="2.4" height="1.4" rx="0.7" fill="#3a1f16" transform={`rotate(${r2(rand() * 180)})`} style={{ transformBox: "fill-box", transformOrigin: "center" }} />
          ))}
      </g>
      {/* topo com o furo */}
      <ellipse cx="80" cy="54" rx="56" ry="10" fill={shade(s, 0.1)} />
      <ellipse cx="80" cy="54" rx="13" ry="3.4" fill={shade(s, -0.4)} />

      {glaze && (
        <g>
          <path
            d="M26 54 C26 44 134 44 134 54 C134 58 130 60 128 60 L128 74 Q125 79 122 74 L120 62 C110 64 104 64 100 64 L100 82 Q96 88 92 82 L91 65 C84 66 76 66 70 65 L69 78 Q65 84 61 78 L60 64 C52 63 46 63 42 62 L41 86 Q37 92 33 86 L32 60 C28 59 26 57 26 54Z"
            fill={glaze}
          />
          <ellipse cx="80" cy="53" rx="13" ry="3.2" fill={shade(glaze, -0.3)} />
          <path d="M44 50 Q70 45 100 48" stroke="#ffffff" strokeOpacity="0.2" strokeWidth="3" fill="none" strokeLinecap="round" />
          {art.glaze === "brigadeiro" &&
            Array.from({ length: 40 }, (_, i) => {
              const a = rand() * Math.PI * 2;
              const rr = 18 + rand() * 34;
              const x = 80 + Math.cos(a) * rr;
              const y = 54 + Math.sin(a) * rr * 0.17;
              return (
                <rect key={i} x={r2(x)} y={r2(y)} width="3.4" height="1.3" rx="0.6" fill="#2a140c" transform={`rotate(${r2(rand() * 180)} ${r2(x)} ${r2(y)})`} />
              );
            })}
        </g>
      )}
    </Svg>
  );
}
