"use client";

import { useSyncExternalStore } from "react";
import { defaultFilters, getProduct, type Filters } from "./catalog";

// Store mínimo com assinatura por seletor: cada componente só re-renderiza
// quando o pedaço de estado que ele lê muda (cards não re-renderizam no scroll, por exemplo).
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

/* ----------------------------------------------------------------- sacola */

export type Line = { code: string; qty: number };

export const cart = createStore<Line[]>([]);
const CART_KEY = "lorve:sacola";

let cartLoaded = false;

export function loadCart() {
  if (cartLoaded) return;
  cartLoaded = true;
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (raw) {
      const lines = (JSON.parse(raw) as Line[]).filter(
        (l) => getProduct(l.code) && Number.isInteger(l.qty) && l.qty > 0,
      );
      cart.set(lines);
    }
  } catch {
    // armazenamento indisponível (aba anônima, bloqueio): segue com a sacola só em memória
  }
  // a gravação precisa ser registrada mesmo quando ainda não havia sacola salva
  cart.subscribe(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart.get()));
    } catch {}
  });
}

export function addToCart(code: string, qty = 1) {
  cart.set((lines) => {
    const found = lines.find((l) => l.code === code);
    if (found) return lines.map((l) => (l.code === code ? { ...l, qty: Math.min(99, l.qty + qty) } : l));
    return [...lines, { code, qty }];
  });
  ui.set((s) => ({ ...s, bump: s.bump + 1, navHidden: false }));
}

export function setQty(code: string, qty: number) {
  if (qty <= 0) return removeFromCart(code);
  cart.set((lines) => lines.map((l) => (l.code === code ? { ...l, qty: Math.min(99, qty) } : l)));
}

export function removeFromCart(code: string) {
  cart.set((lines) => lines.filter((l) => l.code !== code));
}

export const clearCart = () => cart.set([]);

export const selectCount = (lines: Line[]) => lines.reduce((n, l) => n + l.qty, 0);

/* --------------------------------------------------------------------- UI */

type UI = {
  drawer: boolean;
  quickView: string | null;
  navHidden: boolean;
  /** incrementa a cada item adicionado (anima o ícone da sacola) */
  bump: number;
  introDone: boolean;
};

export const ui = createStore<UI>({
  drawer: false,
  quickView: null,
  navHidden: false,
  bump: 0,
  introDone: false,
});

export const openDrawer = () => ui.set((s) => ({ ...s, drawer: true, quickView: null }));
export const closeDrawer = () => ui.set((s) => ({ ...s, drawer: false }));
export const openQuickView = (code: string) => ui.set((s) => ({ ...s, quickView: code }));
export const closeQuickView = () => ui.set((s) => ({ ...s, quickView: null }));
export const setNavHidden = (navHidden: boolean) =>
  ui.get().navHidden !== navHidden && ui.set((s) => ({ ...s, navHidden }));
export const finishIntro = () => ui.set((s) => ({ ...s, introDone: true }));

/* ---------------------------------------------------------------- filtros */

export const filters = createStore<Filters>(defaultFilters);

export function setFilters(patch: Partial<Filters>) {
  filters.set((f) => ({ ...f, ...patch }));
}

export const resetFilters = () => filters.set(defaultFilters);

/* ------------------------------------------------- voo até a sacola (fx) */

export type Flight = { id: number; image: string; from: DOMRect };

export const flights = createStore<Flight[]>([]);
let flightId = 0;

export function launchFlight(image: string | null, from: Element | null) {
  if (!image || !from) return;
  const rect = from.getBoundingClientRect();
  flights.set((list) => [...list, { id: ++flightId, image, from: rect }]);
}

export function landFlight(id: number) {
  flights.set((list) => list.filter((f) => f.id !== id));
}
