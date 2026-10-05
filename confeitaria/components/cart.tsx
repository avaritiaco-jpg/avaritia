"use client";

import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useEffect, useLayoutEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Basket, Trash } from "@phosphor-icons/react/dist/ssr";
import { money, plural } from "@/lib/format";
import { DOCE_STEP, isUnits, lineArt, lineDetail, lineTitle, lineTotal } from "@/lib/menu";
import { site, withBase } from "@/lib/site";
import {
  cart,
  clearCart,
  closeDrawer,
  flights,
  landFlight,
  openDrawer,
  removeFromCart,
  selectCount,
  selectTotal,
  setQty,
  ui,
  useStore,
  type CartLine,
  type Flight,
} from "@/lib/store";
import { scrollToId } from "@/lib/scroll";
import { Art } from "./art";
import { Stepper } from "./controls";
import { Drawer } from "./drawer";
import { EASE_DRAWER, EASE_OUT, PillButton, Price } from "./ui";

/* ------------------------------------------------------- linha do pedido */

export function CartRow({ line, compact = false }: { line: CartLine; compact?: boolean }) {
  const art = lineArt(line);
  const units = isUnits(line);
  return (
    <div className="flex gap-3.5 py-4">
      <div className="plate relative aspect-square w-[4.5rem] shrink-0 overflow-hidden rounded-[1rem]">
        {art ? (
          <div className={`absolute ${art.kind === "slice" ? "inset-[4%]" : "inset-[10%]"}`}>
            <Art art={art} />
          </div>
        ) : null}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
        <div>
          <p className="text-[15px] font-bold leading-snug text-cocoa">{lineTitle(line)}</p>
          <p className="mt-0.5 text-[13px] font-medium leading-snug text-mute">{lineDetail(line)}</p>
        </div>
        {compact ? (
          <p className="nums text-[13px] font-semibold text-cocoa-2">
            {units ? `${line.qty} un.` : `${line.qty}×`} <span className="text-mute">·</span> {money(lineTotal(line))}
          </p>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <Stepper
              size="sm"
              label={units ? "Unidades" : "Quantidade"}
              value={line.qty}
              min={units ? DOCE_STEP : 1}
              max={units ? 1000 : 99}
              step={units ? DOCE_STEP : 1}
              onChange={(v) => setQty(line.key, v)}
            />
            <div className="flex items-center gap-1">
              <Price value={lineTotal(line)} className="text-[14px] font-bold text-cocoa" />
              <button
                type="button"
                onClick={() => removeFromCart(line.key)}
                aria-label={`Remover ${lineTitle(line)}`}
                className="flex size-9 items-center justify-center rounded-full text-mute transition-colors duration-200 hover:bg-blush-2 hover:text-cocoa"
              >
                <Trash size={16} weight="bold" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- gaveta */

export function CartDrawer() {
  const open = useStore(ui, (s) => s.drawer);
  const lines = useStore(cart, (s) => s.lines);
  const total = useStore(cart, selectTotal);
  const count = lines.length;
  const onCheckout = usePathname()?.startsWith("/pagamento");

  return (
    <Drawer
      open={open}
      onClose={closeDrawer}
      title="Seu carrinho"
      subtitle={count ? plural(count, "item", "itens") : "Vazio por enquanto"}
      footer={
        count ? (
          <div className="flex flex-col gap-4">
            <dl className="flex flex-col gap-1.5 text-[14px] font-semibold">
              <div className="flex items-baseline justify-between">
                <dt className="text-cocoa-2">Total</dt>
                <dd>
                  <Price value={total} className="text-xl font-bold text-cocoa" />
                </dd>
              </div>
              <div className="flex items-baseline justify-between text-mute">
                <dt>Sinal de {site.deposit * 100}% na encomenda</dt>
                <dd>
                  <Price value={total * site.deposit} />
                </dd>
              </div>
            </dl>
            {onCheckout ? (
              <PillButton onClick={closeDrawer} className="w-full" variant="rose">
                Continuar para o pagamento
              </PillButton>
            ) : (
              <PillButton href={withBase("/pagamento/")} className="w-full" variant="rose">
                Finalizar pedido
              </PillButton>
            )}
            <div className="flex items-center justify-center gap-4 text-[13px] font-semibold text-mute">
              {onCheckout ? (
                <a href={withBase("/#cardapio")} className="transition-colors hover:text-cocoa">
                  Adicionar mais itens
                </a>
              ) : (
                <button type="button" onClick={closeDrawer} className="transition-colors hover:text-cocoa">
                  Continuar escolhendo
                </button>
              )}
              <span aria-hidden>·</span>
              <button type="button" onClick={clearCart} className="transition-colors hover:text-cocoa">
                Esvaziar
              </button>
            </div>
          </div>
        ) : null
      }
    >
      {count === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-4 py-14 text-center">
          <span className="flex size-20 items-center justify-center rounded-full bg-card text-rose-deep ring-1 ring-line">
            <Basket size={32} weight="duotone" />
          </span>
          <p className="font-script text-4xl leading-[1.2] text-cocoa-2">Nada por aqui ainda</p>
          <p className="max-w-[30ch] text-[15px] font-medium text-mute">
            Escolha um bolo ou uns docinhos no cardápio. Eles aparecem aqui, prontos para o pedido.
          </p>
          {onCheckout ? (
            <PillButton variant="ghost" href={withBase("/#cardapio")}>
              Ver o cardápio
            </PillButton>
          ) : (
            <PillButton
              variant="ghost"
              onClick={() => {
                closeDrawer();
                setTimeout(() => scrollToId("cardapio"), 300);
              }}
            >
              Ver o cardápio
            </PillButton>
          )}
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-line">
          <AnimatePresence initial={false}>
            {lines.map((l) => (
              <motion.li
                key={l.key}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: EASE_OUT }}
                className="overflow-hidden"
              >
                <CartRow line={l} />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </Drawer>
  );
}

/* -------------------------------------------- voo do doce até o carrinho */

function FlyingThumb({ flight }: { flight: Flight }) {
  const reduce = useReducedMotion();
  const t = useMotionValue(0);
  const [path, setPath] = useState<{ sx: number; sy: number; cx: number; cy: number; ex: number; ey: number } | null>(
    null,
  );

  useLayoutEffect(() => {
    // no celular a barra do carrinho também serve de destino
    const targets = Array.from(document.querySelectorAll("[data-cart-target]"));
    const bag = targets.find((el) => (el as HTMLElement).offsetParent !== null);
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
    // ponto de controle acima da linha reta: o doce faz um arco
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
    const s = 1.2 - 0.85 * v;
    return `translate3d(${x - 44}px, ${y - 44}px, 0) scale(${s}) rotate(${v * 24}deg)`;
  });
  const opacity = useTransform(t, [0, 0.08, 0.86, 1], [0, 1, 1, 0]);

  if (!path) return null;
  return (
    <motion.div
      className="plate pointer-events-none fixed left-0 top-0 z-[95] size-[5.5rem] overflow-hidden rounded-full p-2 shadow-[0_20px_40px_-12px_rgba(61,39,32,0.45)] ring-2 ring-rose"
      style={{ transform, opacity }}
      aria-hidden
    >
      <Art art={flight.art} />
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

/* ------------------------------------------- barra do carrinho no celular */

export function MobileCartBar() {
  const count = useStore(cart, selectCount);
  const total = useStore(cart, selectTotal);
  const drawer = useStore(ui, (s) => s.drawer);
  const sheet = useStore(ui, (s) => s.sheet);
  const show = count > 0 && !drawer && !sheet;

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          onClick={openDrawer}
          className="fixed inset-x-4 bottom-4 z-40 flex items-center justify-between rounded-full bg-cocoa py-1.5 pl-5 pr-1.5 text-[15px] text-blush shadow-[0_20px_50px_-12px_rgba(61,39,32,0.6)] md:hidden"
          initial={{ transform: "translateY(140%)" }}
          animate={{ transform: "translateY(0%)" }}
          exit={{ transform: "translateY(140%)" }}
          transition={{ duration: 0.5, ease: EASE_DRAWER }}
        >
          <span className="font-bold">
            Ver carrinho <span className="font-semibold text-blush/70">· {plural(count, "item", "itens")}</span>
          </span>
          <span className="flex items-center gap-3">
            <Price value={total} className="font-bold" />
            <span className="flex size-11 items-center justify-center rounded-full bg-white/12">
              <Basket size={19} weight="bold" />
            </span>
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
