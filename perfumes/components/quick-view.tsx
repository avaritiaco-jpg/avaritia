"use client";

import {
  animate,
  AnimatePresence,
  motion,
  usePresence,
  useReducedMotion,
  type PanInfo,
} from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Handbag, Minus, Plus, WhatsappLogo, X } from "@phosphor-icons/react/dist/ssr";
import {
  categoryLabel,
  finalPrice,
  formatPrice,
  genderLabel,
  getProduct,
  productTitle,
  related,
  type Product,
} from "@/lib/catalog";
import { site, whatsappLink } from "@/lib/site";
import { closeQuickView, openDrawer, openQuickView, ui, useStore } from "@/lib/store";
import { useMedia } from "@/lib/use-media";
import { add } from "./add-button";
import { useDialog } from "./drawer";
import { origin } from "./product-card";
import { EASE_DRAWER, EASE_OUT, ProductImage } from "./ui";

const flip = (from: DOMRect, to: DOMRect) =>
  `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width}, ${from.height / to.height})`;

function Details({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const suggestions = related(product);

  useEffect(() => {
    setQty(1);
    setAdded(false);
  }, [product.code]);

  const chips = [
    product.concentration,
    product.size,
    product.gender ? genderLabel[product.gender] : null,
    categoryLabel[product.category],
  ].filter(Boolean) as string[];

  return (
    <div className="flex flex-col gap-7">
      <div>
        <p className="text-[11px] uppercase tracking-[0.26em] text-amber-soft">{product.brand}</p>
        <h2 id="qv-title" className="mt-3 font-display text-4xl font-light leading-[1] text-ivory md:text-5xl">
          {product.name}
        </h2>
        <div className="mt-5 flex flex-wrap gap-2">
          {chips.map((c) => (
            <span key={c} className="rounded-full bg-white/[0.04] px-3 py-1.5 text-xs text-mute ring-1 ring-line">
              {c}
            </span>
          ))}
          <span className="rounded-full px-3 py-1.5 font-mono text-xs text-faint ring-1 ring-line">
            cód. {product.code}
          </span>
        </div>
      </div>

      <div className="flex items-end justify-between gap-4 border-y border-line py-5">
        <div>
          <p className="font-display text-5xl font-light text-ivory">{formatPrice(finalPrice(product))}</p>
          <p className="mt-1 text-xs text-faint">{site.priceNote}</p>
        </div>
        <div className="flex items-center rounded-full bg-white/[0.04] p-1 ring-1 ring-line" aria-label="Quantidade">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Diminuir quantidade"
            className="flex size-9 items-center justify-center rounded-full text-mute transition-colors hover:text-ivory disabled:opacity-40"
            disabled={qty <= 1}
          >
            <Minus size={14} />
          </button>
          <span className="w-8 text-center font-mono text-sm tabular-nums text-ivory" aria-live="polite">
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(99, q + 1))}
            aria-label="Aumentar quantidade"
            className="flex size-9 items-center justify-center rounded-full text-mute transition-colors hover:text-ivory"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={(e) => {
            const plate = document.querySelector("[data-qv-plate]");
            add(product, plate ?? e.currentTarget, qty);
            setAdded(true);
          }}
          className="group flex h-14 flex-1 items-center justify-between gap-3 rounded-full bg-amber py-1.5 pl-6 pr-1.5 text-sm font-medium text-noir transition-[background-color,scale] duration-200 ease-out hover:bg-amber-soft active:scale-[0.98]"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={added ? "ok" : "add"}
              initial={{ opacity: 0, transform: "translateY(8px)" }}
              animate={{ opacity: 1, transform: "translateY(0px)" }}
              exit={{ opacity: 0, transform: "translateY(-8px)" }}
              transition={{ duration: 0.2, ease: EASE_OUT }}
            >
              {added ? "Adicionado! Adicionar mais" : "Adicionar à sacola"}
            </motion.span>
          </AnimatePresence>
          <span className="flex size-11 items-center justify-center rounded-full bg-noir/10 transition-transform duration-500 ease-out group-hover:scale-105">
            <Handbag size={18} />
          </span>
        </button>
        <AnimatePresence>
          {added && (
            <motion.button
              type="button"
              onClick={openDrawer}
              className="h-14 rounded-full px-6 text-sm text-ivory ring-1 ring-line-strong transition-colors hover:bg-white/[0.06]"
              initial={{ opacity: 0, transform: "scale(0.95)" }}
              animate={{ opacity: 1, transform: "scale(1)" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: EASE_OUT }}
            >
              Ver sacola
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <a
        href={whatsappLink(
          `Olá! Tenho interesse em ${qty}× ${productTitle(product)} (cód. ${product.code}), ${formatPrice(finalPrice(product))}. Está disponível?`,
        )}
        target="_blank"
        rel="noopener noreferrer"
        className="-mt-2 inline-flex items-center gap-2 self-start text-sm text-mute transition-colors hover:text-ivory"
      >
        <WhatsappLogo size={18} weight="light" />
        Perguntar sobre este no WhatsApp
      </a>

      {suggestions.length > 0 && (
        <div className="border-t border-line pt-6">
          <p className="text-[10px] uppercase tracking-[0.24em] text-faint">Do mesmo universo</p>
          <div className="mt-4 grid grid-cols-4 gap-2.5">
            {suggestions.map((s) => (
              <button
                key={s.code}
                type="button"
                onClick={() => openQuickView(s.code)}
                className="group text-left"
                aria-label={`Ver ${s.brand} ${s.name}`}
              >
                <div className="plate aspect-[4/5] overflow-hidden rounded-xl">
                  <ProductImage
                    product={s}
                    className="transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                  />
                </div>
                <p className="mt-2 line-clamp-2 text-[11px] leading-tight text-mute group-hover:text-ivory">{s.name}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Dialog({ code }: { code: string }) {
  const product = getProduct(code);
  const [isPresent, safeToRemove] = usePresence();
  const desktop = useMedia("(min-width: 768px)");
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const firstCode = useRef(code);

  useDialog(true, ref, closeQuickView);

  // entrada: a foto "sai" do card e assume o lugar no modal (FLIP)
  useLayoutEffect(() => {
    const el = plateRef.current;
    const from = origin.rect;
    origin.rect = null;
    if (!el || !desktop) return;
    if (!from || reduce) {
      animate(el, { opacity: [0, 1], transform: ["scale(0.96)", "scale(1)"] }, { duration: 0.45, ease: EASE_OUT });
      return;
    }
    const to = el.getBoundingClientRect();
    animate(el, { transform: [flip(from, to), "translate(0px, 0px) scale(1, 1)"] }, { duration: 0.7, ease: EASE_DRAWER });
    // só na abertura
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // saída: volta para o card se ele estiver visível
  useEffect(() => {
    if (isPresent) return;
    const el = plateRef.current;
    const card = document.querySelector(`[data-plate="${code}"]`);
    let cancelled = false;
    (async () => {
      if (el && desktop && !reduce) {
        const target = card?.getBoundingClientRect();
        if (target && target.bottom > 0 && target.top < window.innerHeight) {
          const current = el.getBoundingClientRect();
          // a transformação parte de "nenhuma", então medimos sem ela
          await animate(el, { transform: flip(target, current) }, { duration: 0.55, ease: EASE_DRAWER });
        } else {
          await animate(el, { opacity: 0, transform: "scale(0.96)" }, { duration: 0.25, ease: EASE_OUT });
        }
      }
      if (!cancelled) safeToRemove?.();
    })();
    return () => {
      cancelled = true;
    };
  }, [isPresent, code, desktop, reduce, safeToRemove]);

  if (!product) return null;

  if (!desktop) {
    const onDragEnd = (_: unknown, info: PanInfo) => {
      if (info.offset.y > 140 || info.velocity.y > 700) closeQuickView();
    };
    return (
      <div className="fixed inset-0 z-[70]">
        <motion.div
          className="absolute inset-0 bg-black/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: EASE_OUT }}
          onClick={closeQuickView}
        />
        <motion.div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-labelledby="qv-title"
          tabIndex={-1}
          className="absolute inset-x-0 bottom-0 flex max-h-[94dvh] flex-col rounded-t-[2rem] bg-noir-2 ring-1 ring-line outline-none"
          initial={reduce ? { opacity: 0 } : { y: "100%" }}
          animate={reduce ? { opacity: 1 } : { y: 0 }}
          exit={reduce ? { opacity: 0 } : { y: "100%" }}
          transition={{ duration: 0.5, ease: EASE_DRAWER }}
          drag={reduce ? false : "y"}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.7 }}
          dragSnapToOrigin
          onDragEnd={onDragEnd}
        >
          <div className="flex justify-center pb-1 pt-3" aria-hidden>
            <span className="h-1 w-10 rounded-full bg-white/20" />
          </div>
          <button
            type="button"
            onClick={closeQuickView}
            data-autofocus
            aria-label="Fechar"
            className="absolute right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full bg-noir/70 text-ivory ring-1 ring-line backdrop-blur"
          >
            <X size={16} />
          </button>
          <div
            data-lenis-prevent
            className="overflow-y-auto overscroll-contain px-4 pb-8"
            onPointerDownCapture={(e) => e.stopPropagation()}
          >
            <div data-qv-plate className="plate mx-auto mt-2 aspect-[4/5] max-h-[46dvh] overflow-hidden rounded-[1.6rem]">
              <ProductImage key={product.code} product={product} sizes="large" priority />
            </div>
            <div className="mt-6">
              <Details product={product} />
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const switched = firstCode.current !== code;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 lg:p-10">
      <motion.div
        className="absolute inset-0 bg-black/75"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.45, ease: EASE_OUT } }}
        transition={{ duration: 0.45, ease: EASE_OUT }}
        onClick={closeQuickView}
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="qv-title"
        tabIndex={-1}
        className="relative grid max-h-[min(88vh,760px)] w-full max-w-5xl grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] outline-none"
      >
        {/* fundo do painel: aparece em volta da foto que chega voando */}
        <motion.div
          className="absolute inset-0 rounded-[2.4rem] bg-noir-2 shadow-[0_60px_120px_-40px_rgba(0,0,0,0.8)] ring-1 ring-line"
          initial={{ opacity: 0, transform: "scale(0.97)" }}
          animate={{ opacity: 1, transform: "scale(1)" }}
          exit={{ opacity: 0, transform: "scale(0.98)", transition: { duration: 0.35, ease: EASE_OUT } }}
          transition={{ duration: 0.5, delay: 0.08, ease: EASE_OUT }}
        />

        <div className="relative flex items-center p-3">
          <div
            ref={plateRef}
            data-qv-plate
            className="plate relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] will-change-transform"
            style={{ transformOrigin: "0 0" }}
          >
            <AnimatePresence initial={false} mode="popLayout">
              <motion.div
                key={product.code}
                className="plate relative h-full w-full"
                initial={{ opacity: 0, filter: "blur(10px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(10px)" }}
                transition={{ duration: 0.45, ease: EASE_OUT }}
              >
                <div
                  className="tone-glow absolute inset-0 opacity-70"
                  style={{ "--tone": `${product.tone}55` } as React.CSSProperties}
                  aria-hidden
                />
                <ProductImage product={product} sizes="large" priority className="relative" />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <motion.div
          data-lenis-prevent
          className="relative overflow-y-auto overscroll-contain py-10 pl-6 pr-10"
          initial={{ opacity: 0, transform: "translateX(24px)" }}
          animate={{ opacity: 1, transform: "translateX(0px)" }}
          exit={{ opacity: 0, transition: { duration: 0.2, ease: EASE_OUT } }}
          transition={{ duration: 0.6, delay: 0.18, ease: EASE_OUT }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={product.code}
              initial={switched ? { opacity: 0, transform: "translateY(12px)" } : false}
              animate={{ opacity: 1, transform: "translateY(0px)" }}
              exit={{ opacity: 0, transform: "translateY(-8px)" }}
              transition={{ duration: 0.3, ease: EASE_OUT }}
            >
              <Details product={product} />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <button
          type="button"
          onClick={closeQuickView}
          data-autofocus
          aria-label="Fechar"
          className="absolute right-4 top-4 z-10 flex size-11 items-center justify-center rounded-full bg-white/[0.06] text-ivory ring-1 ring-line transition-colors duration-200 ease-out hover:bg-white/[0.12]"
        >
          <X size={18} weight="light" />
        </button>
      </div>
    </div>
  );
}

export function QuickView() {
  const code = useStore(ui, (s) => s.quickView);
  const introDone = useStore(ui, (s) => s.introDone);

  // link direto: ?p=CODIGO abre o produto (bom para mandar no WhatsApp)
  const deepLink = useRef<string | null | undefined>(undefined);
  if (deepLink.current === undefined && typeof window !== "undefined") {
    deepLink.current = new URLSearchParams(window.location.search).get("p");
  }
  useEffect(() => {
    const p = deepLink.current;
    if (!introDone || !p) return;
    deepLink.current = null;
    if (getProduct(p)) openQuickView(p);
  }, [introDone]);

  const synced = useRef(false);
  useEffect(() => {
    if (!synced.current) {
      synced.current = true;
      if (!code) return;
    }
    try {
      const url = new URL(window.location.href);
      if (code) url.searchParams.set("p", code);
      else url.searchParams.delete("p");
      window.history.replaceState(window.history.state, "", url);
    } catch {
      // alguns navegadores embutidos e iframes isolados não deixam mexer na URL: o modal segue funcionando
    }
  }, [code]);

  return <AnimatePresence>{code ? <Dialog key="quick-view" code={code} /> : null}</AnimatePresence>;
}
