"use client";

import { animate, AnimatePresence, motion, usePresence, useReducedMotion, type PanInfo } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Basket, Check, X } from "@phosphor-icons/react/dist/ssr";
import { money } from "@/lib/format";
import {
  cakeSizes,
  caseiro,
  defaultSelection,
  doceTotal,
  DOCE_STEP,
  gelado,
  getProduct,
  lineTotal,
  lowerFirst,
  productArt,
  shapeLabel,
  withCasca,
  type CakeProduct,
  type CaseiroProduct,
  type DoceProduct,
  type GeladoProduct,
  type Product,
  type Selection,
} from "@/lib/menu";
import { addToCart, closeSheet, launchFlight, origin, ui, useStore } from "@/lib/store";
import { withBase } from "@/lib/site";
import { useMedia } from "@/lib/use-media";
import { Art } from "./art";
import { Options, Stepper } from "./controls";
import { useDialog } from "./drawer";
import { EASE_DRAWER, EASE_OUT, Price } from "./ui";

const flip = (from: DOMRect, to: DOMRect) =>
  `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width}, ${from.height / to.height})`;

/* ------------------------------------------------------ estado da escolha */

type Draft = { sel: Selection; qty: number; units: Record<string, number>; focus: string };

function initialDraft(p: Product): Draft {
  const sel = defaultSelection(p);
  const units: Record<string, number> = {};
  // um sabor só (camafeu): já começa com o mínimo
  if (p.kind === "doce" && p.flavors.length === 1) units[p.flavors[0].id] = DOCE_STEP;
  return { sel, qty: 1, units, focus: p.kind === "doce" ? p.flavors[0].id : "" };
}

/** Linhas que vão para o carrinho a partir do rascunho */
function draftLines(p: Product, d: Draft) {
  if (p.kind !== "doce") return [{ productId: p.id, sel: d.sel, qty: d.qty }];
  return p.flavors
    .filter((f) => (d.units[f.id] ?? 0) > 0)
    .map((f) => ({
      productId: p.id,
      sel: { flavor: f.id, ...(p.base ? { base: d.sel.base } : {}) },
      qty: d.units[f.id],
    }));
}

/* ----------------------------------------------------- opções por tipo */

function CakeOptions({ p, d, set }: { p: CakeProduct; d: Draft; set: (d: Partial<Draft>) => void }) {
  const size = cakeSizes.find((s) => s.id === d.sel.size)!;
  return (
    <>
      <Options
        label="Formato"
        size="chip"
        value={size.shape}
        onChange={(shape) => set({ sel: { ...d.sel, size: shape === "circular" ? "c-p" : "r-p" } })}
        options={(["circular", "retangular"] as const).map((s) => ({ id: s, title: shapeLabel[s] }))}
      />
      <Options
        label="Tamanho"
        value={d.sel.size}
        onChange={(id) => set({ sel: { ...d.sel, size: id } })}
        className={size.shape === "circular" ? "grid-cols-2" : "grid-cols-1 min-[420px]:grid-cols-3"}
        options={cakeSizes
          .filter((s) => s.shape === size.shape)
          .map((s) => ({ id: s.id, title: s.label, aside: money(s.price[p.tier]), hint: s.serves }))}
      />
      {p.variant ? (
        <Options
          label={p.variant.label}
          size="chip"
          value={d.sel.variant}
          onChange={(id) => set({ sel: { ...d.sel, variant: id } })}
          options={p.variant.options.map((o) => ({ id: o.id, title: o.label }))}
        />
      ) : null}
    </>
  );
}

function GeladoOptions({ d, set }: { p: GeladoProduct; d: Draft; set: (d: Partial<Draft>) => void }) {
  return (
    <>
      <Options
        label="Como você quer"
        value={d.sel.formato}
        onChange={(formato) =>
          set({ sel: formato === "forma" ? { formato, corte: d.sel.corte ?? "tradicional" } : { formato } })
        }
        options={[
          { id: "pedaco", title: "Pedaço", aside: money(gelado.slice), hint: "Um pedaço embalado" },
          { id: "forma", title: "Forma inteira", aside: money(gelado.pan), hint: "Rende 20 pedaços" },
        ]}
      />
      <AnimatePresence initial={false}>
        {d.sel.formato === "forma" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            className="overflow-hidden"
          >
            <div className="pt-1">
              <Options
                label="Corte"
                size="chip"
                value={d.sel.corte}
                onChange={(corte) => set({ sel: { ...d.sel, corte } })}
                options={gelado.cuts.map((c) => ({ id: c.id, title: `${c.label} (${c.hint.toLowerCase()})` }))}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function CaseiroOptions({ p, d, set }: { p: CaseiroProduct; d: Draft; set: (d: Partial<Draft>) => void }) {
  if (p.cremoso)
    return (
      <div className="rounded-[1.1rem] bg-card/70 px-4 py-3 ring-1 ring-line">
        <p className="text-[15px] font-bold text-cocoa">Tamanho M</p>
        <p className="text-[13px] font-medium text-mute">20 fatias, sem cobertura</p>
      </div>
    );
  const table = d.sel.cobertura === "sem" ? caseiro.price.sem : caseiro.price.com;
  return (
    <>
      <Options
        label="Cobertura"
        size="chip"
        value={d.sel.cobertura}
        onChange={(cobertura) => set({ sel: { ...d.sel, cobertura } })}
        options={caseiro.coatings.map((c) => ({ id: c.id, title: c.label }))}
      />
      <Options
        label="Tamanho"
        value={d.sel.size}
        onChange={(size) => set({ sel: { ...d.sel, size } })}
        options={caseiro.sizes.map((s) => ({
          id: s.id,
          title: s.label,
          hint: s.serves,
          aside: money(s.id === "m" ? table.m : table.p),
        }))}
      />
    </>
  );
}

function DoceOptions({ p, d, set }: { p: DoceProduct; d: Draft; set: (d: Partial<Draft>) => void }) {
  const tiers = [25, 50, 100] as const;
  return (
    <>
      <div>
        <p className="mb-2.5 text-[13px] font-bold uppercase tracking-[0.14em] text-cocoa-2">Valores por sabor</p>
        <ul className="grid grid-cols-3 gap-2">
          {tiers.map((n, i) => (
            <li key={n} className="rounded-[1.1rem] bg-card/70 px-3 py-2.5 ring-1 ring-line">
              <p className="text-[13px] font-semibold text-mute">{n} un.</p>
              <p className="nums text-[15px] font-bold text-cocoa">{money(p.tiers[i])}</p>
              <p className="nums text-[12px] font-medium text-mute">{money(p.tiers[i] / n)} cada</p>
            </li>
          ))}
        </ul>
      </div>

      {p.base ? (
        <Options
          label={p.base.label}
          size="chip"
          value={d.sel.base}
          onChange={(base) => set({ sel: { ...d.sel, base } })}
          options={p.base.options.map((o) => ({ id: o.id, title: o.label }))}
        />
      ) : null}

      <fieldset>
        <legend className="mb-1 text-[13px] font-bold uppercase tracking-[0.14em] text-cocoa-2">
          {p.flavors.length > 1 ? "Sabores e quantidades" : "Quantidade"}
        </legend>
        <p className="mb-3 text-[13px] font-medium text-mute">Mínimo de 25 unidades por sabor.</p>
        <ul className="flex flex-col gap-2">
          {p.flavors.map((f) => {
            const n = d.units[f.id] ?? 0;
            return (
              <li
                key={f.id}
                className={`flex items-center gap-3 rounded-[1.1rem] py-1.5 pl-1.5 pr-2 ring-1 transition-colors duration-200 ${
                  n > 0 ? "bg-white ring-rose/60" : "bg-card/60 ring-line"
                }`}
              >
                <span className="plate size-12 shrink-0 rounded-[0.8rem] p-1">
                  <Art art={withCasca(p, f.art, d.sel.base)} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-bold leading-tight text-cocoa">{f.label}</span>
                  <AnimatePresence initial={false}>
                    {n > 0 && (
                      <motion.span
                        className="nums block text-[12px] font-semibold text-rose-ink"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease: EASE_OUT }}
                      >
                        {money(doceTotal(p.tiers, n))}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>
                <Stepper
                  size="sm"
                  label={`Quantidade de ${f.label}`}
                  value={n}
                  min={0}
                  max={1000}
                  step={DOCE_STEP}
                  onChange={(v) => set({ units: { ...d.units, [f.id]: v }, focus: f.id })}
                />
              </li>
            );
          })}
        </ul>
      </fieldset>
    </>
  );
}

/* --------------------------------------------------------- conteúdo */

function Configurator({
  product,
  d,
  set,
  plateRef,
}: {
  product: Product;
  d: Draft;
  set: (patch: Partial<Draft>) => void;
  plateRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [added, setAdded] = useState(false);

  const lines = draftLines(product, d);
  const total = lines.reduce((sum, l) => sum + lineTotal(l), 0);
  const empty = lines.length === 0;

  const add = () => {
    if (empty || added) return;
    const from = plateRef.current?.getBoundingClientRect() ?? null;
    lines.forEach((l, i) => {
      // até 3 doces voando, antes de o painel fechar
      if (i < 3) setTimeout(() => launchFlight(productArt(product, l.sel), from), i * 90);
      addToCart(l.productId, l.sel, l.qty);
    });
    setAdded(true);
    setTimeout(closeSheet, 520);
  };

  return (
    <div className="flex flex-col gap-6">
      {product.kind === "cake" && <CakeOptions p={product} d={d} set={set} />}
      {product.kind === "gelado" && <GeladoOptions p={product} d={d} set={set} />}
      {product.kind === "caseiro" && <CaseiroOptions p={product} d={d} set={set} />}
      {product.kind === "doce" && <DoceOptions p={product} d={d} set={set} />}

      {product.kind !== "doce" && (
        <div className="flex items-center justify-between gap-4">
          <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-cocoa-2">Quantidade</p>
          <Stepper label="Quantidade" value={d.qty} onChange={(qty) => set({ qty })} />
        </div>
      )}

      {/* rodapé fixo com o valor e o botão */}
      <div className="sticky bottom-0 z-10 -mx-1 -mt-2 bg-gradient-to-t from-blush from-70% to-blush/0 px-1 pb-5 pt-4 md:pb-8">
        <button
          type="button"
          onClick={add}
          disabled={empty}
          className="group flex h-16 w-full items-center justify-between gap-3 rounded-full bg-cocoa py-1.5 pl-6 pr-1.5 text-blush transition-[background-color,transform] duration-200 ease-out hover:bg-cocoa-2 active:scale-[0.98] disabled:bg-cocoa/40"
        >
          <span className="flex flex-col items-start leading-tight">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={added ? "ok" : empty ? "empty" : "add"}
                className="text-[15px] font-bold"
                initial={{ opacity: 0, transform: "translateY(8px)" }}
                animate={{ opacity: 1, transform: "translateY(0px)" }}
                exit={{ opacity: 0, transform: "translateY(-8px)" }}
                transition={{ duration: 0.2, ease: EASE_OUT }}
              >
                {added ? "Adicionado ao carrinho" : empty ? "Escolha os sabores" : "Adicionar ao carrinho"}
              </motion.span>
            </AnimatePresence>
            {!empty && <Price value={total} className="text-[13px] font-semibold text-blush/75" />}
          </span>
          <span className="flex size-[3.25rem] items-center justify-center rounded-full bg-white/12 transition-transform duration-500 ease-out group-hover:scale-105">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={added ? "ok" : "add"}
                className="flex"
                initial={{ opacity: 0, transform: "scale(0.6)" }}
                animate={{ opacity: 1, transform: "scale(1)" }}
                exit={{ opacity: 0, transform: "scale(0.6)" }}
                transition={{ duration: 0.2, ease: EASE_OUT }}
              >
                {added ? <Check size={20} weight="bold" /> : <Basket size={20} weight="bold" />}
              </motion.span>
            </AnimatePresence>
          </span>
        </button>
      </div>
    </div>
  );
}

/** A ilustração acompanha a escolha (recheio, cobertura, sabor do docinho em foco) */
function SheetArt({ product: p, d }: { product: Product; d: Draft }) {
  const sel = p.kind === "doce" ? { flavor: d.focus, base: d.sel.base } : d.sel;
  const art = productArt(p, sel);
  const key = JSON.stringify(art);
  const size = p.kind === "cake" ? cakeSizes.find((s) => s.id === d.sel.size) : null;

  if (p.photo)
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={withBase(p.photo)} alt={p.name} className="absolute inset-0 h-full w-full object-cover" />
    );

  return (
    <div className="relative h-full w-full">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.div
          key={key}
          className={`absolute ${p.kind === "cake" ? "inset-[8%_5%_10%_5%]" : "inset-[14%_16%_14%_16%]"}`}
          initial={{ opacity: 0, transform: "scale(0.96)", filter: "blur(6px)" }}
          animate={{ opacity: 1, transform: "scale(1)", filter: "blur(0px)" }}
          exit={{ opacity: 0, transform: "scale(1.02)", filter: "blur(6px)" }}
          transition={{ duration: 0.35, ease: EASE_OUT }}
        >
          <Art art={art} title={p.name} />
        </motion.div>
      </AnimatePresence>
      {size ? (
        <p className="nums absolute inset-x-0 bottom-[4%] text-center text-[13px] font-bold text-cocoa-2">
          {shapeLabel[size.shape]} {size.label}, {size.serves}
        </p>
      ) : null}
    </div>
  );
}

function Header({ product }: { product: Product }) {
  return (
    <div>
      {product.badge ? (
        <p className="mb-1.5 text-[12px] font-bold uppercase tracking-[0.16em] text-rose-ink">{product.badge}</p>
      ) : null}
      <h2 id="sheet-title" className="text-[1.7rem] font-bold leading-tight text-cocoa text-balance md:text-[2rem]">
        {product.kind === "gelado" ? `Bolo gelado de ${lowerFirst(product.name)}` : product.name}
      </h2>
      <p className="mt-2 text-[15px] font-medium leading-relaxed text-mute">{product.description}</p>
    </div>
  );
}

/* ------------------------------------------------------------ diálogo */

function Dialog({ id }: { id: string }) {
  const product = getProduct(id);
  const [isPresent, safeToRemove] = usePresence();
  const desktop = useMedia("(min-width: 768px)");
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState<Draft | null>(() => (product ? initialDraft(product) : null));
  const set = (patch: Partial<Draft>) => setDraft((prev) => (prev ? { ...prev, ...patch } : prev));

  useDialog(true, ref, closeSheet);

  // entrada: a ilustração "sai" do card e cresce até o lugar dela no painel (FLIP)
  useLayoutEffect(() => {
    const el = plateRef.current;
    const from = origin.rect;
    origin.rect = null;
    if (!el || !desktop) return;
    if (!from || reduce) {
      animate(el, { opacity: [0, 1], transform: ["scale(0.96)", "scale(1)"] }, { duration: 0.4, ease: EASE_OUT });
      return;
    }
    const to = el.getBoundingClientRect();
    animate(el, { transform: [flip(from, to), "translate(0px, 0px) scale(1, 1)"] }, { duration: 0.65, ease: EASE_DRAWER });
    // só na abertura
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // saída: no computador, a ilustração volta para o card se ele estiver visível
  useEffect(() => {
    if (isPresent) return;
    const el = plateRef.current;
    const card = document.querySelector(`[data-plate="${id}"]`);
    let cancelled = false;
    (async () => {
      if (el && desktop && !reduce) {
        const target = card?.getBoundingClientRect();
        if (target && target.bottom > 0 && target.top < window.innerHeight) {
          const current = el.getBoundingClientRect();
          await animate(el, { transform: flip(target, current) }, { duration: 0.5, ease: EASE_DRAWER });
        } else {
          await animate(el, { opacity: 0, transform: "scale(0.96)" }, { duration: 0.22, ease: EASE_OUT });
        }
      } else if (!desktop) {
        await new Promise((r) => setTimeout(r, 420));
      }
      if (!cancelled) safeToRemove?.();
    })();
    return () => {
      cancelled = true;
    };
  }, [isPresent, id, desktop, reduce, safeToRemove]);

  if (!product || !draft) return null;

  if (!desktop) {
    const onDragEnd = (_: unknown, info: PanInfo) => {
      if (info.offset.y > 140 || info.velocity.y > 700) closeSheet();
    };
    return (
      <div className="fixed inset-0 z-[70]">
        <motion.div
          className="absolute inset-0 bg-cocoa/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: isPresent ? 1 : 0 }}
          transition={{ duration: 0.35, ease: EASE_OUT }}
          onClick={closeSheet}
        />
        <motion.div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-labelledby="sheet-title"
          tabIndex={-1}
          className="absolute inset-x-0 bottom-0 flex max-h-[94dvh] flex-col rounded-t-[1.75rem] bg-blush shadow-[0_-30px_60px_-30px_rgba(61,39,32,0.4)] outline-none"
          initial={reduce ? { opacity: 0 } : { transform: "translateY(100%)" }}
          animate={reduce ? { opacity: isPresent ? 1 : 0 } : { transform: isPresent ? "translateY(0%)" : "translateY(100%)" }}
          transition={{ duration: 0.45, ease: EASE_DRAWER }}
          drag={reduce ? false : "y"}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.7 }}
          dragSnapToOrigin
          onDragEnd={onDragEnd}
        >
          <div className="flex justify-center pb-1 pt-3" aria-hidden>
            <span className="h-1 w-10 rounded-full bg-cocoa/20" />
          </div>
          <button
            type="button"
            onClick={closeSheet}
            data-autofocus
            aria-label="Fechar"
            className="absolute right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full bg-card text-cocoa ring-1 ring-line"
          >
            <X size={16} weight="bold" />
          </button>
          <div
            data-lenis-prevent
            className="overflow-y-auto overscroll-contain px-4"
            onPointerDownCapture={(e) => e.stopPropagation()}
          >
            <div ref={plateRef} className="plate relative mx-auto mt-2 aspect-[16/11] max-h-[34dvh] w-full overflow-hidden rounded-[1.4rem]">
              <SheetArt product={product} d={draft} />
            </div>
            <div className="mt-5 flex flex-col gap-6">
              <Header product={product} />
              <Configurator product={product} d={draft} set={set} plateRef={plateRef} />
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 lg:p-10">
      <motion.div
        className="absolute inset-0 bg-cocoa/40 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: isPresent ? 1 : 0 }}
        transition={{ duration: 0.4, ease: EASE_OUT }}
        onClick={closeSheet}
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        tabIndex={-1}
        className="relative grid h-[min(88vh,760px)] w-full max-w-5xl grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] outline-none"
      >
        {/* fundo do painel: aparece em volta da ilustração que chega voando */}
        <motion.div
          className="absolute inset-0 rounded-[2rem] bg-blush shadow-[0_60px_120px_-40px_rgba(61,39,32,0.5)] ring-1 ring-line"
          initial={{ opacity: 0, transform: "scale(0.97)" }}
          animate={isPresent ? { opacity: 1, transform: "scale(1)" } : { opacity: 0, transform: "scale(0.98)" }}
          transition={{ duration: isPresent ? 0.45 : 0.3, delay: isPresent ? 0.06 : 0, ease: EASE_OUT }}
        />

        <div className="relative p-3">
          <div
            ref={plateRef}
            className="plate relative h-full w-full overflow-hidden rounded-[1.6rem] will-change-transform"
            style={{ transformOrigin: "0 0" }}
          >
            <SheetArt product={product} d={draft} />
          </div>
        </div>

        <motion.div
          data-lenis-prevent
          className="relative overflow-y-auto overscroll-contain pl-5 pr-9 pt-9"
          initial={{ opacity: 0, transform: "translateX(20px)" }}
          animate={isPresent ? { opacity: 1, transform: "translateX(0px)" } : { opacity: 0 }}
          transition={{ duration: isPresent ? 0.5 : 0.15, delay: isPresent ? 0.15 : 0, ease: EASE_OUT }}
        >
          <div className="flex flex-col gap-6">
            <Header product={product} />
            <Configurator product={product} d={draft} set={set} plateRef={plateRef} />
          </div>
        </motion.div>

        <button
          type="button"
          onClick={closeSheet}
          data-autofocus
          aria-label="Fechar"
          className="absolute right-4 top-4 z-10 flex size-11 items-center justify-center rounded-full bg-card text-cocoa ring-1 ring-line transition-colors duration-200 ease-out hover:bg-white"
        >
          <X size={18} weight="bold" />
        </button>
      </div>
    </div>
  );
}

export function ProductSheet() {
  const id = useStore(ui, (s) => s.sheet);
  return <AnimatePresence>{id ? <Dialog key={id} id={id} /> : null}</AnimatePresence>;
}
