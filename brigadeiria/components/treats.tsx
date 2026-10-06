"use client";

import { useId } from "react";
import type { Treat } from "@/lib/site";
import { rng, shade } from "./brigadeiro";

/* Ilustrações dos "algo mais": desenhadas em SVG, no mesmo traço dos brigadeiros. */

const useSvgId = () => useId().replace(/[^a-zA-Z0-9_-]/g, "");
const r1 = (n: number) => Math.round(n * 10) / 10;

const CHOC = "#3b1a10";
const CHOC_2 = "#5a2c1b";

function Shadow({ cx = 100, cy = 150, rx = 70 }: { cx?: number; cy?: number; rx?: number }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={rx * 0.12} fill="var(--shadow-ink)" opacity={0.16} />;
}

function Crumbs({ seed, x, y, w, h, color, n = 40, r = 1.2 }: { seed: string; x: number; y: number; w: number; h: number; color: string; n?: number; r?: number }) {
  const rand = rng(seed);
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <circle key={i} cx={r1(x + rand() * w)} cy={r1(y + rand() * h)} r={r1(r * (0.5 + rand()))} fill={color} opacity={0.55 + rand() * 0.4} />
      ))}
    </g>
  );
}

function Sprinkles({ seed, cx, cy, rx, ry, n = 60, colors }: { seed: string; cx: number; cy: number; rx: number; ry: number; n?: number; colors: string[] }) {
  const rand = rng(seed);
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const a = rand() * Math.PI * 2;
        const d = Math.sqrt(rand());
        return (
          <rect
            key={i}
            x={-3}
            y={-1}
            width={6}
            height={2}
            rx={1}
            fill={colors[i % colors.length]}
            transform={`translate(${r1(cx + Math.cos(a) * rx * d)} ${r1(cy + Math.sin(a) * ry * d)}) rotate(${Math.round(rand() * 180)})`}
          />
        );
      })}
    </g>
  );
}

function Brownie() {
  const id = useSvgId();
  const block = (dx: number, dy: number, seed: string) => (
    <g transform={`translate(${dx} ${dy})`}>
      {/* frente, lateral e topo em perspectiva */}
      <path d="M40 78 L120 92 L120 132 L40 118Z" fill={CHOC} />
      <path d="M120 92 L160 74 L160 112 L120 132Z" fill={shade(CHOC, -0.25)} />
      <path d="M40 78 L82 62 L160 74 L120 92Z" fill={`url(#${id}-top)`} />
      <Crumbs seed={seed} x={44} y={86} w={72} h={36} color={CHOC_2} n={46} r={1.4} />
      <Crumbs seed={`${seed}n`} x={124} y={84} w={32} h={38} color={shade(CHOC_2, -0.1)} n={18} />
      {/* casquinha craquelada */}
      <path d="M58 76 l14 4 l10 -6 l16 6 l12 -4 l20 4 M70 70 l12 4 l18 -3 l14 5" stroke={shade(CHOC, 0.32)} strokeWidth={1.2} fill="none" strokeLinecap="round" opacity={0.8} />
      <path d="M40 78 L120 92 L160 74" stroke={shade(CHOC, 0.4)} strokeWidth={1} fill="none" opacity={0.5} />
    </g>
  );
  return (
    <svg viewBox="0 0 200 160" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id={`${id}-top`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={shade(CHOC, 0.28)} />
          <stop offset="100%" stopColor={shade(CHOC, 0.08)} />
        </linearGradient>
      </defs>
      <Shadow cy={148} rx={74} />
      {block(0, 14, "b1")}
      {block(6, -32, "b2")}
      {/* nozes */}
      <path d="M92 40 q6 -6 12 0 q-6 6 -12 0z M118 46 q5 -5 10 0 q-5 5 -10 0z" fill="#c79560" stroke="#8a5a2f" strokeWidth={0.8} />
    </svg>
  );
}

function Alfajor() {
  const id = useSvgId();
  return (
    <svg viewBox="0 0 200 160" className="h-full w-full" aria-hidden>
      <defs>
        <radialGradient id={`${id}-top`} cx="40%" cy="30%" r="80%">
          <stop offset="0%" stopColor={shade(CHOC, 0.32)} />
          <stop offset="100%" stopColor={CHOC} />
        </radialGradient>
      </defs>
      <Shadow cy={142} rx={70} />
      {/* biscoito de baixo */}
      <path d="M36 112 v12 a64 18 0 0 0 128 0 v-12z" fill={shade(CHOC, -0.2)} />
      <ellipse cx={100} cy={112} rx={64} ry={18} fill={CHOC} />
      {/* doce de leite escorrendo */}
      <path d="M40 104 q10 10 22 6 q8 8 18 3 q10 9 22 4 q10 8 22 2 q10 7 18 -1 q8 6 14 -2 l-2 -8 h-112z" fill="#c98a3a" />
      <path d="M40 104 h120" stroke="#e2a95a" strokeWidth={2} />
      {/* biscoito de cima, banhado */}
      <path d="M38 80 v16 a62 18 0 0 0 124 0 v-16z" fill={shade(CHOC, -0.1)} />
      <ellipse cx={100} cy={80} rx={62} ry={18} fill={`url(#${id}-top)`} />
      <path d="M60 76 q12 -10 24 0 t24 0 t24 0" stroke="#f6eadf" strokeWidth={2.4} fill="none" strokeLinecap="round" />
      <path d="M68 86 q10 -8 20 0 t20 0 t20 0" stroke="#f6eadf" strokeWidth={2.4} fill="none" strokeLinecap="round" opacity={0.85} />
      <ellipse cx={82} cy={72} rx={18} ry={4} fill="#fff" opacity={0.22} />
    </svg>
  );
}

function PaoDeMel() {
  const id = useSvgId();
  return (
    <svg viewBox="0 0 200 160" className="h-full w-full" aria-hidden>
      <defs>
        <radialGradient id={`${id}-g`} cx="38%" cy="25%" r="85%">
          <stop offset="0%" stopColor={shade(CHOC, 0.35)} />
          <stop offset="55%" stopColor={CHOC} />
          <stop offset="100%" stopColor={shade(CHOC, -0.45)} />
        </radialGradient>
      </defs>
      <Shadow cy={140} rx={66} />
      <path d="M42 126 C 40 76, 60 46, 100 46 C 140 46, 160 76, 158 126 C 130 138, 70 138, 42 126Z" fill={`url(#${id}-g)`} />
      {/* escorrido do banho */}
      <path d="M42 126 C 70 138, 130 138, 158 126 l0 4 C 150 134 148 142 144 136 C 138 140 120 142 112 136 C 108 146 98 146 96 138 C 80 142 70 140 62 136 C 56 142 48 138 42 130Z" fill={shade(CHOC, -0.3)} />
      <ellipse cx={80} cy={64} rx={20} ry={8} fill="#fff" opacity={0.2} transform="rotate(-20 80 64)" />
      <circle cx={112} cy={56} r={4} fill="#d8b04c" />
      <circle cx={122} cy={62} r={2.4} fill="#d8b04c" opacity={0.85} />
    </svg>
  );
}

function BoloCenoura() {
  const id = useSvgId();
  const cake = "#e99a3c";
  return (
    <svg viewBox="0 0 200 160" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id={`${id}-c`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={shade(cake, 0.1)} />
          <stop offset="100%" stopColor={shade(cake, -0.12)} />
        </linearGradient>
      </defs>
      {/* prato */}
      <ellipse cx={100} cy={136} rx={84} ry={16} fill="var(--surface)" stroke="var(--line)" />
      <ellipse cx={100} cy={134} rx={64} ry={10} fill="var(--bg-2)" />
      {/* fatia em cunha: frente, lateral e cobertura */}
      <path d="M36 92 L132 112 L132 140 L36 120Z" fill={`url(#${id}-c)`} />
      <path d="M132 112 L172 80 L172 106 L132 140Z" fill={shade(cake, -0.22)} />
      <Crumbs seed="cen" x={40} y={98} w={88} h={34} color="#b8611b" n={60} r={1.1} />
      {/* brigadeiro por cima, grosso e brilhante */}
      <path d="M32 82 L84 60 L176 70 L132 104 Z" fill={CHOC} />
      <path d="M32 82 L132 104 L132 116 C 120 120 110 112 100 116 C 90 120 80 110 70 112 C 60 114 50 106 36 104 L32 96Z" fill={shade(CHOC, -0.1)} />
      <path d="M132 104 L176 70 L176 82 C 168 88 160 86 152 94 L132 116Z" fill={shade(CHOC, -0.3)} />
      <Sprinkles seed="cen-s" cx={104} cy={80} rx={46} ry={13} n={70} colors={["#1e0c07", "#5a2c1b", "#2d140c"]} />
      <path d="M60 74 L100 64" stroke="#fff" strokeOpacity={0.2} strokeWidth={4} strokeLinecap="round" />
    </svg>
  );
}

function Cafe() {
  return (
    <svg viewBox="0 0 200 160" className="h-full w-full" aria-hidden>
      {/* fumacinha */}
      <g stroke="var(--mute)" strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.6}>
        <path className="steam" d="M84 40 q-8 -10 0 -20 q8 -10 0 -20" />
        <path className="steam" style={{ animationDelay: "-1.1s" }} d="M100 44 q-8 -10 0 -20 q8 -10 0 -20" />
        <path className="steam" style={{ animationDelay: "-2.2s" }} d="M116 40 q-8 -10 0 -20 q8 -10 0 -20" />
      </g>
      {/* pires */}
      <ellipse cx={100} cy={136} rx={80} ry={16} fill="var(--surface)" stroke="var(--line)" />
      <ellipse cx={100} cy={132} rx={50} ry={8} fill="var(--bg-2)" />
      {/* xícara */}
      <path d="M150 74 c 22 0 22 30 -4 32" stroke="var(--ink-2)" strokeWidth={7} fill="none" strokeLinecap="round" />
      <path d="M44 62 h112 c 0 40 -18 70 -56 70 c -38 0 -56 -30 -56 -70z" fill="var(--ink-2)" />
      <path d="M52 66 c 2 30 14 56 40 62" stroke="#fff" strokeOpacity={0.15} strokeWidth={5} fill="none" strokeLinecap="round" />
      <ellipse cx={100} cy={62} rx={56} ry={13} fill="#6b3a22" />
      <ellipse cx={100} cy={63} rx={50} ry={10} fill="#a8683d" />
      {/* arte no leite */}
      <path d="M100 70 c -14 -6 -16 -12 -8 -15 c 4 -1 7 1 8 3 c 1 -2 4 -4 8 -3 c 8 3 6 9 -8 15z" fill="#f6e3cc" />
    </svg>
  );
}

function Torta() {
  const id = useSvgId();
  const rand = rng("torta");
  const berries = Array.from({ length: 11 }, (_, i) => {
    const a = (i / 11) * Math.PI * 2 + rand() * 0.3;
    const d = i % 2 ? 40 : 22;
    return { x: r1(100 + Math.cos(a) * d * 1.3), y: r1(76 + Math.sin(a) * d * 0.36), r: 7 + rand() * 3 };
  });
  return (
    <svg viewBox="0 0 200 160" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id={`${id}-crust`} x1="0" x2="1">
          <stop offset="0%" stopColor="#b9773a" />
          <stop offset="50%" stopColor="#e2aa63" />
          <stop offset="100%" stopColor="#a8682e" />
        </linearGradient>
      </defs>
      <Shadow cy={136} rx={80} />
      <path d="M26 80 v34 a74 22 0 0 0 148 0 v-34z" fill={`url(#${id}-crust)`} />
      {Array.from({ length: 20 }, (_, i) => {
        const x = 30 + i * 7.2;
        return <path key={i} d={`M${x} 92 v28`} stroke="#8f5525" strokeOpacity={0.35} strokeWidth={1.2} />;
      })}
      <ellipse cx={100} cy={80} rx={74} ry={22} fill="#e8b46d" />
      <ellipse cx={100} cy={80} rx={66} ry={18} fill={CHOC} />
      <ellipse cx={90} cy={74} rx={30} ry={5} fill="#fff" opacity={0.12} />
      {berries
        .sort((a, b) => a.y - b.y)
        .map((b, i) => (
          <g key={i} transform={`translate(${b.x} ${b.y})`}>
            <path d={`M0 ${-b.r} c ${b.r} 0 ${b.r} ${b.r * 1.3} 0 ${b.r * 1.7} c ${-b.r} ${-b.r * 0.4} ${-b.r} ${-b.r * 1.7} 0 ${-b.r * 1.7}z`} fill="#d8344f" />
            <path d={`M-3 ${-b.r} l3 -3 l3 3 l-3 1z`} fill="#4f8a3a" />
            <circle cx={-2} cy={-b.r * 0.2} r={0.8} fill="#ffd9a0" />
            <circle cx={2} cy={b.r * 0.3} r={0.8} fill="#ffd9a0" />
          </g>
        ))}
    </svg>
  );
}

function Presente() {
  return (
    <svg viewBox="0 0 200 160" className="h-full w-full" aria-hidden>
      <Shadow cy={146} rx={78} />
      {/* caixa em perspectiva */}
      <path d="M36 70 L112 84 L112 144 L36 128Z" fill="var(--ink-2)" />
      <path d="M112 84 L166 66 L166 124 L112 144Z" fill="var(--ink)" />
      {/* tampa */}
      <path d="M30 62 L88 46 L172 58 L114 78Z" fill="var(--ink-2)" />
      <path d="M30 62 L114 78 L114 88 L30 72Z" fill="var(--ink)" />
      <path d="M114 78 L172 58 L172 68 L114 88Z" fill="var(--ink)" opacity={0.85} />
      {/* fita */}
      <path d="M58 54 L143 69 M72 70 L130 52" stroke="var(--accent)" strokeWidth={9} />
      <path d="M143 69 L143 132 M72 70 L72 135" stroke="var(--accent)" strokeWidth={9} />
      <path d="M100 61 c -26 -26 -40 -4 -6 2 M100 61 c 26 -26 40 -4 6 2" stroke="var(--accent)" strokeWidth={6} fill="none" strokeLinecap="round" />
      <circle cx={100} cy={62} r={6} fill="var(--accent)" />
    </svg>
  );
}

export function TreatArt({ id }: { id: Treat["id"] }) {
  switch (id) {
    case "brownie":
      return <Brownie />;
    case "alfajor":
      return <Alfajor />;
    case "pao-de-mel":
      return <PaoDeMel />;
    case "bolo-cenoura":
      return <BoloCenoura />;
    case "cafe":
      return <Cafe />;
    case "torta":
      return <Torta />;
    case "presente":
      return <Presente />;
  }
}
