"use client";

import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useEffect, useLayoutEffect, useState } from "react";
import { Handbag, Minus, Plus, Trash, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { finalPrice, formatPrice, getProduct, productTitle, type Product } from "@/lib/catalog";
import { site, whatsappLink } from "@/lib/site";
import {
  cart,
  clearCart,
  closeDrawer,
  flights,
  landFlight,
  openDrawer,
  removeFromCart,
  selectCount,
  setQty,
  ui,
  useStore,
  type Flight,
  type Line,
} from "@/lib/store";
import { scrollToId } from "@/lib/scroll";
import { Drawer } from "./drawer";
import { EASE_DRAWER, EASE_OUT, PillButton, ProductImage } from "./ui";

type Row = Line & { product: Product };

const rowsOf = (lines: Line[]) =>
  lines.map((l) => ({ ...l, product: getProduct(l.code) })).filter((r): r is Row => Boolean(r.product));

const totalOf = (rows: Row[]) => rows.reduce((sum, r) => sum + finalPrice(r.product) * r.qty, 0);

function orderMessage(rows: Row[]) {
  const lines = rows.map(
    (r) => `• ${r.qty}× ${productTitle(r.product)} · cód. ${r.code} · ${formatPrice(finalPrice(r.product) * r.qty)}`,
  );
  return [
    `Olá! Quero fazer este pedido pelo site da ${site.fullName}:`,
    "",
    ...lines,
    "",
    `Total: ${formatPrice(totalOf(rows))} (${site.priceNote.replace(/\.$/, "").toLowerCase()})`,
  ].join("\n");
}

/* ------------------------------------------------------------- sacola */

export function CartDrawer() {
  const open = useStore(ui, (s) => s.drawer);
  const lines = useStore(cart, (s) => s);
  const rows = rowsOf(lines);
  const count = selectCount(lines);
  const total = totalOf(rows);

  return (
    <Drawer
      open={open}
      onClose={closeDrawer}
      title="Sua sacola"
      subtitle={count ? `${count} ${count === 1 ? "item" : "itens"}` : "Vazia por enquanto"}
      footer={
        rows.length ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-end justify-between">
              <span className="text-sm text-mute">Total</span>
              <span className="font-display text-4xl font-light text-ivory">{formatPrice(total)}</span>
            </div>
            <p className="-mt-2 text-right text-[11px] text-faint">{site.priceNote}</p>
            <PillButton
              href={whatsappLink(orderMessage(rows))}
              target="_blank"
              rel="noopener noreferrer"
              icon={<WhatsappLogo size={18} weight="regular" />}
              className="w-full justify-between"
            >
              Finalizar pelo WhatsApp
            </PillButton>
            <button
              type="button"
              onClick={clearCart}
              className="self-center text-xs text-faint transition-colors hover:text-ivory"
            >
              Esvaziar sacola
            </button>
          </div>
        ) : null
      }
    >
      {rows.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-5 py-16 text-center">
          <span className="flex size-20 items-center justify-center rounded-full bg-white/[0.04] text-amber ring-1 ring-line">
            <Handbag size={30} weight="thin" />
          </span>
          <p className="font-display text-3xl font-light text-ivory">Nada aqui ainda.</p>
          <p className="max-w-[28ch] text-sm text-mute">
            Toque no + de qualquer fragrância para adicionar. Quando terminar, é só enviar pelo WhatsApp.
          </p>
          <PillButton
            variant="ghost"
            onClick={() => {
              closeDrawer();
              setTimeout(() => scrollToId("catalogo"), 300);
            }}
          >
            Explorar o catálogo
          </PillButton>
        </div>
      ) : (
        <ul className="flex flex-col">
          <AnimatePresence initial={false}>
            {rows.map((r) => (
              <motion.li
                key={r.code}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: EASE_OUT }}
                className="overflow-hidden"
              >
                <div className="flex gap-4 border-b border-line py-4">
                  <div className="plate aspect-[4/5] w-20 shrink-0 overflow-hidden rounded-xl">
                    <ProductImage product={r.product} />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-amber-soft/90">{r.product.brand}</p>
                      <p className="mt-1 line-clamp-2 text-sm leading-snug text-ivory">{r.product.name}</p>
                      <p className="mt-0.5 text-[11px] text-faint">
                        {[r.product.size, `cód. ${r.code}`].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center rounded-full bg-white/[0.04] ring-1 ring-line">
                        <button
                          type="button"
                          onClick={() => setQty(r.code, r.qty - 1)}
                          aria-label={`Diminuir ${r.product.name}`}
                          className="flex size-8 items-center justify-center text-mute hover:text-ivory"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-6 text-center font-mono text-xs tabular-nums text-ivory">{r.qty}</span>
                        <button
                          type="button"
                          onClick={() => setQty(r.code, r.qty + 1)}
                          aria-label={`Aumentar ${r.product.name}`}
                          className="flex size-8 items-center justify-center text-mute hover:text-ivory"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-sm text-ivory">
                          {formatPrice(finalPrice(r.product) * r.qty)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFromCart(r.code)}
                          aria-label={`Remover ${r.product.name}`}
                          className="flex size-8 items-center justify-center rounded-full text-faint transition-colors hover:text-ivory"
                        >
                          <Trash size={14} weight="light" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </Drawer>
  );
}

/* --------------------------------------------- voo da foto até a sacola */

function FlyingThumb({ flight }: { flight: Flight }) {
  const reduce = useReducedMotion();
  const t = useMotionValue(0);
  const [path, setPath] = useState<{ sx: number; sy: number; cx: number; cy: number; ex: number; ey: number } | null>(
    null,
  );

  useLayoutEffect(() => {
    const bag = document.querySelector("[data-bag-target]");
    const target = bag?.getBoundingClientRect();
    if (!bag || !target || reduce) {
      landFlight(flight.id);
      return;
    }
    // o menu pode estar voltando para a tela: mira na posição final dele, não na atual
    const header = bag.closest("header");
    // (Tailwind 4 usa a propriedade `translate`, não `transform`)
    const shift = header ? parseFloat(getComputedStyle(header).translate.split(" ")[1] ?? "0") || 0 : 0;
    const sx = flight.from.left + flight.from.width / 2;
    const sy = flight.from.top + flight.from.height / 2;
    const ex = target.left + target.width / 2;
    const ey = target.top - shift + target.height / 2;
    // ponto de controle acima da linha reta: a foto faz um arco
    setPath({ sx, sy, cx: (sx + ex) / 2 + (ex - sx) * 0.1, cy: Math.min(sy, ey) - 160, ex, ey });
  }, [flight, reduce]);

  useEffect(() => {
    if (!path) return;
    const controls = animate(t, 1, {
      duration: 0.75,
      ease: [0.65, 0, 0.35, 1],
      onComplete: () => landFlight(flight.id),
    });
    return () => controls.stop();
  }, [path, t, flight.id]);

  const transform = useTransform(t, (v) => {
    if (!path) return "none";
    const u = 1 - v;
    const x = u * u * path.sx + 2 * u * v * path.cx + v * v * path.ex;
    const y = u * u * path.sy + 2 * u * v * path.cy + v * v * path.ey;
    const s = 1.15 - 0.8 * v;
    return `translate3d(${x - 40}px, ${y - 40}px, 0) scale(${s}) rotate(${v * 18}deg)`;
  });
  const opacity = useTransform(t, [0, 0.08, 0.85, 1], [0, 1, 1, 0]);

  if (!path) return null;
  return (
    <motion.div
      className="plate pointer-events-none fixed left-0 top-0 z-[95] size-20 overflow-hidden rounded-full shadow-[0_20px_40px_-10px_rgba(0,0,0,0.6)] ring-2 ring-amber/70"
      style={{ transform, opacity }}
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={flight.image} alt="" className="plate-img-cutout h-full w-full object-cover" />
    </motion.div>
  );
}

export function FlyLayer() {
  const list = useStore(flights, (s) => s);
  return (
    <>
      {list.map((f) => (
        <FlyingThumb key={f.id} flight={f} />
      ))}
    </>
  );
}

/* ------------------------------------------- barra da sacola no celular */

export function MobileBagBar() {
  const lines = useStore(cart, (s) => s);
  const drawer = useStore(ui, (s) => s.drawer);
  const quickView = useStore(ui, (s) => s.quickView);
  const count = selectCount(lines);
  const total = totalOf(rowsOf(lines));
  const show = count > 0 && !drawer && !quickView;

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          onClick={openDrawer}
          className="fixed inset-x-4 bottom-4 z-40 flex items-center justify-between rounded-full bg-ivory py-1.5 pl-5 pr-1.5 text-sm text-noir shadow-[0_20px_50px_-12px_rgba(0,0,0,0.7)] md:hidden"
          initial={{ transform: "translateY(140%)" }}
          animate={{ transform: "translateY(0%)" }}
          exit={{ transform: "translateY(140%)" }}
          transition={{ duration: 0.5, ease: EASE_DRAWER }}
        >
          <span className="font-medium">
            Sacola · {count} {count === 1 ? "item" : "itens"}
          </span>
          <span className="flex items-center gap-3">
            <span className="font-mono text-sm">{formatPrice(total)}</span>
            <span className="flex size-10 items-center justify-center rounded-full bg-noir text-ivory">
              <Handbag size={17} />
            </span>
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
