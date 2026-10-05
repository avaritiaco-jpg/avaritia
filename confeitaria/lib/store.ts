"use client";

import { useSyncExternalStore } from "react";
import { lineKey, lineTotal, validLine, type Art, type Line, type Selection } from "./menu";

// Store mínimo com assinatura por seletor: cada componente só re-renderiza
// quando o pedaço de estado que ele lê muda.
function createStore<T>(initial: T) {
  let state = initial;
  const listeners = new Set<() => void>();
  return {
    initial,
    get: () => state,
    set(next: T | ((s: T) => T)) {
      state = typeof next === "function" ? (next as (s: T) => T)(state) : next;
      listeners.forEach((l) => l());
    },
    subscribe(l: () => void) {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
  };
}

type Store<T> = ReturnType<typeof createStore<T>>;

export function useStore<T, S>(store: Store<T>, selector: (s: T) => S): S {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.get()),
    () => selector(store.initial),
  );
}

/* --------------------------------------------------------------- carrinho */

export type CartLine = Line & { key: string };

type Cart = { lines: CartLine[]; ready: boolean };

export const cart = createStore<Cart>({ lines: [], ready: false });
const CART_KEY = "cianinha:carrinho";

let cartLoaded = false;

export function loadCart() {
  if (cartLoaded) return;
  cartLoaded = true;
  let lines: CartLine[] = [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (raw) {
      lines = (JSON.parse(raw) as Line[])
        .filter(validLine)
        .map((l) => ({ productId: l.productId, sel: l.sel, qty: l.qty, key: lineKey(l.productId, l.sel) }));
    }
  } catch {
    // armazenamento indisponível (aba anônima, bloqueio): segue com o carrinho só em memória
  }
  cart.set({ lines, ready: true });
  // a gravação precisa ser registrada mesmo quando ainda não havia carrinho salvo
  cart.subscribe(() => {
    try {
      localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart.get().lines.map(({ productId, sel, qty }) => ({ productId, sel, qty }))),
      );
    } catch {}
  });
}

const setLines = (fn: (lines: CartLine[]) => CartLine[]) => cart.set((c) => ({ ...c, lines: fn(c.lines) }));

/** Soma ao carrinho (uma linha por produto + escolhas). */
export function addToCart(productId: string, sel: Selection, qty: number) {
  const key = lineKey(productId, sel);
  setLines((lines) => {
    const found = lines.find((l) => l.key === key);
    if (found) return lines.map((l) => (l.key === key ? { ...l, qty: Math.min(9999, l.qty + qty) } : l));
    return [...lines, { key, productId, sel, qty }];
  });
  ui.set((s) => ({ ...s, bump: s.bump + 1, navHidden: false }));
}

export function setQty(key: string, qty: number) {
  if (qty <= 0) return removeFromCart(key);
  setLines((lines) => lines.map((l) => (l.key === key ? { ...l, qty: Math.min(9999, qty) } : l)));
}

export function removeFromCart(key: string) {
  setLines((lines) => lines.filter((l) => l.key !== key));
}

export const clearCart = () => setLines(() => []);

/** Itens no ícone do carrinho: docinhos contam como um item por sabor */
export const selectCount = (c: Cart) => c.lines.length;
export const selectTotal = (c: Cart) => c.lines.reduce((sum, l) => sum + lineTotal(l), 0);

/* --------------------------------------------------------------------- UI */

type UI = {
  drawer: boolean;
  /** produto aberto no configurador */
  sheet: string | null;
  navHidden: boolean;
  /** incrementa a cada item adicionado (anima o ícone do carrinho) */
  bump: number;
};

export const ui = createStore<UI>({ drawer: false, sheet: null, navHidden: false, bump: 0 });

export const openDrawer = () => ui.set((s) => ({ ...s, drawer: true, sheet: null }));
export const closeDrawer = () => ui.set((s) => ({ ...s, drawer: false }));
export const openSheet = (id: string) => ui.set((s) => ({ ...s, sheet: id }));
export const closeSheet = () => ui.set((s) => ({ ...s, sheet: null }));
export const setNavHidden = (navHidden: boolean) =>
  ui.get().navHidden !== navHidden && ui.set((s) => ({ ...s, navHidden }));

/** Retângulo do card de origem, para a ilustração "sair" do card e crescer até o configurador */
export const origin: { rect: DOMRect | null } = { rect: null };

/* ------------------------------------------- voo até o carrinho (efeito) */

export type Flight = { id: number; art: Art; from: DOMRect };

export const flights = createStore<Flight[]>([]);
let flightId = 0;

export function launchFlight(art: Art | null, from: Element | DOMRect | null) {
  if (!art || !from) return;
  const rect = from instanceof DOMRect ? from : from.getBoundingClientRect();
  flights.set((list) => [...list, { id: ++flightId, art, from: rect }]);
}

export function landFlight(id: number) {
  flights.set((list) => list.filter((f) => f.id !== id));
}
