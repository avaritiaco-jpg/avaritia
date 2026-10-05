"use client";

import { motion, useReducedMotion } from "motion/react";
import { useId, useState } from "react";
import { money } from "@/lib/format";
import { cakeSizes, type CakeSize } from "@/lib/menu";
import { scrollToId } from "@/lib/scroll";
import { EASE_OUT, PillButton, Reveal, ScriptTitle } from "./ui";

const MIN = 6;
const MAX = 60;

const pick = (shape: CakeSize["shape"], n: number) =>
  cakeSizes.filter((s) => s.shape === shape).find((s) => s.slices >= n) ?? null;

// Área do desenho proporcional ao rendimento máximo de cada tamanho
const UNIT = 15;
// coordenadas arredondadas: o HTML do servidor e o do navegador precisam bater
const q = (n: number) => Math.round(n * 100) / 100;

function CakeTop({ size, n, active }: { size: CakeSize; n: number; active: boolean }) {
  const reduce = useReducedMotion();
  const clip = useId().replace(/:/g, "");
  const area = size.slices * UNIT * UNIT;
  const round = size.shape === "circular";
  const r = q(Math.sqrt(area / Math.PI));
  const w = q(round ? r * 2 : Math.sqrt(area * 1.5));
  const h = q(round ? r * 2 : w / 1.5);
  const pad = 8;
  const cx = q(w / 2 + pad);
  const cy = q(h / 2 + pad);
  const cuts = active ? Math.min(n, size.slices) : 0;

  // linhas de corte: raios no redondo, grade no retangular
  let lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
  if (cuts > 1 && round) {
    lines = Array.from({ length: cuts }, (_, i) => {
      const a = (i / cuts) * Math.PI * 2 - Math.PI / 2;
      return { x1: cx, y1: cy, x2: q(cx + Math.cos(a) * r), y2: q(cy + Math.sin(a) * r) };
    });
  } else if (cuts > 1) {
    const cols = Math.ceil(Math.sqrt(cuts * 1.5));
    const rows = Math.ceil(cuts / cols);
    lines = [
      ...Array.from({ length: cols - 1 }, (_, i) => {
        const x = q(pad + ((i + 1) / cols) * w);
        return { x1: x, y1: pad, x2: x, y2: pad + h };
      }),
      ...Array.from({ length: rows - 1 }, (_, i) => {
        const y = q(pad + ((i + 1) / rows) * h);
        return { x1: pad, y1: y, x2: pad + w, y2: y };
      }),
    ];
  }

  // bolinhas de chantininho na borda
  const count = Math.round(r / 2.6);
  const dots = round
    ? Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2;
        return { x: q(cx + Math.cos(a) * (r - 4)), y: q(cy + Math.sin(a) * (r - 4)) };
      })
    : [];

  return (
    <motion.svg
      width={w + pad * 2}
      height={h + pad * 2}
      viewBox={`0 0 ${w + pad * 2} ${h + pad * 2}`}
      className="max-w-full overflow-visible"
      animate={{ transform: active && !reduce ? "scale(1.06)" : "scale(1)" }}
      transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
      aria-hidden
    >
      <defs>
        <clipPath id={clip}>
          {round ? <circle cx={cx} cy={cy} r={r} /> : <rect x={pad} y={pad} width={w} height={h} rx="10" />}
        </clipPath>
      </defs>
      <motion.g
        initial={false}
        animate={{ opacity: active ? 1 : 0.55 }}
        transition={{ duration: 0.3, ease: EASE_OUT }}
      >
        {round ? (
          <circle cx={cx} cy={cy + 4} r={r} fill="#e3bcbf" opacity={active ? 0.7 : 0} />
        ) : (
          <rect x={pad} y={pad + 4} width={w} height={h} rx="10" fill="#e3bcbf" opacity={active ? 0.7 : 0} />
        )}
        {round ? (
          <circle cx={cx} cy={cy} r={r} fill={active ? "#fffaf6" : "#fbf1ef"} stroke={active ? "#d9a3a7" : "#c9a7a4"} strokeWidth="2" strokeDasharray={active ? undefined : "5 5"} />
        ) : (
          <rect x={pad} y={pad} width={w} height={h} rx="10" fill={active ? "#fffaf6" : "#fbf1ef"} stroke={active ? "#d9a3a7" : "#c9a7a4"} strokeWidth="2" strokeDasharray={active ? undefined : "5 5"} />
        )}
        <g clipPath={`url(#${clip})`}>
          {lines.map((l, i) => (
            <line key={`${cuts}-${i}`} {...l} stroke="#d9a3a7" strokeWidth="1.4" opacity="0.9" />
          ))}
        </g>
        {active && dots.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r="3.2" fill="#ffffff" stroke="#ecc8ca" strokeWidth="1" />)}
      </motion.g>
    </motion.svg>
  );
}

function Row({ shape, n }: { shape: CakeSize["shape"]; n: number }) {
  const chosen = pick(shape, n);
  const sizes = cakeSizes.filter((s) => s.shape === shape);
  return (
    <div>
      <div className="flex items-end justify-between gap-3 overflow-x-auto pb-1 sm:justify-start sm:gap-6">
        {sizes.map((s) => {
          const active = chosen?.id === s.id;
          return (
            <div key={s.id} className="flex shrink-0 flex-col items-center gap-2">
              <CakeTop size={s} n={n} active={active} />
              <p className={`text-center text-[13px] font-bold transition-colors ${active ? "text-rose-ink" : "text-mute"}`}>
                {s.label}
                <span className="block font-medium">{s.serves}</span>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function SizeGuide() {
  const [n, setN] = useState(18);
  const circ = pick("circular", n);
  const rect = pick("retangular", n);
  const pct = ((n - MIN) / (MAX - MIN)) * 100;

  return (
    <section id="tamanhos" className="relative bg-blush-2/70 py-20 md:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 md:grid-cols-12 md:gap-8 md:px-8">
        <div className="md:col-span-5">
          <ScriptTitle text="Qual tamanho escolher?" className="text-[clamp(3rem,6vw,4.8rem)]" />
          <Reveal delay={0.1}>
            <p className="mt-4 max-w-[40ch] text-lg font-medium leading-relaxed text-cocoa-2">
              Arraste para o número de convidados e veja o tamanho que rende fatias para todo mundo.
            </p>
          </Reveal>

          <Reveal delay={0.15} className="mt-8 rounded-[1.75rem] bg-card p-6 ring-1 ring-line">
            <label htmlFor="convidados" className="flex items-baseline justify-between gap-3">
              <span className="text-[13px] font-bold uppercase tracking-[0.14em] text-cocoa-2">Convidados</span>
              <span className="nums text-4xl font-bold text-cocoa">
                {n}
                {n === MAX ? "+" : ""}
              </span>
            </label>
            <input
              id="convidados"
              type="range"
              min={MIN}
              max={MAX}
              value={n}
              onChange={(e) => setN(Number(e.target.value))}
              aria-valuetext={`${n} convidados`}
              className="range mt-4 w-full"
              style={{ "--pct": `${pct}%` } as React.CSSProperties}
            />
            <dl className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-[1.2rem] bg-blush px-4 py-3">
                <dt className="text-[13px] font-semibold text-mute">Circular</dt>
                <dd className="mt-0.5 text-[15px] font-bold text-cocoa">
                  {circ ? (
                    <>
                      {circ.label} <span className="nums font-semibold text-rose-ink">{money(circ.price.classico)}</span>
                    </>
                  ) : (
                    <span className="font-semibold text-mute">Até 30 fatias</span>
                  )}
                </dd>
              </div>
              <div className="rounded-[1.2rem] bg-blush px-4 py-3">
                <dt className="text-[13px] font-semibold text-mute">Retangular</dt>
                <dd className="mt-0.5 text-[15px] font-bold text-cocoa">
                  {rect ? (
                    <>
                      {rect.label} <span className="nums font-semibold text-rose-ink">{money(rect.price.classico)}</span>
                    </>
                  ) : null}
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-[13px] font-medium text-mute">
              {n === MAX
                ? "Para mais de 60 convidados, combine dois bolos ou fale com a gente no WhatsApp."
                : "Valores dos bolos clássicos. Os especiais custam um pouco mais."}
            </p>
          </Reveal>
        </div>

        <div className="flex flex-col justify-center gap-10 md:col-span-7 md:pl-6">
          <div>
            <p className="mb-4 text-[13px] font-bold uppercase tracking-[0.14em] text-cocoa-2">Circulares</p>
            <Row shape="circular" n={n} />
          </div>
          <div>
            <p className="mb-4 text-[13px] font-bold uppercase tracking-[0.14em] text-cocoa-2">Retangulares</p>
            <Row shape="retangular" n={n} />
          </div>
          <div>
            <PillButton variant="ghost" onClick={() => scrollToId("cardapio")}>
              Escolher o sabor
            </PillButton>
          </div>
        </div>
      </div>
    </section>
  );
}
