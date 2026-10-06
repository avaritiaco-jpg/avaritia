"use client";

import { useSyncExternalStore } from "react";
import { boxSizes, flavors } from "./site";

// Caixa montada pela pessoa: compartilhada entre a vitrine e o "Monte sua caixa".
type Box = { size: number; items: string[] };

let state: Box = { size: boxSizes[1], items: [] };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const set = (next: Box) => {
  state = next;
  emit();
};

export const box = {
  get: () => state,
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  add(id: string) {
    if (state.items.length >= state.size) return false;
    set({ ...state, items: [...state.items, id] });
    return true;
  },
  removeAt(i: number) {
    set({ ...state, items: state.items.filter((_, j) => j !== i) });
  },
  setSize(size: number) {
    set({ size, items: state.items.slice(0, size) });
  },
  clear() {
    set({ ...state, items: [] });
  },
  surprise() {
    const free = state.size - state.items.length;
    const picks = Array.from({ length: free }, () => flavors[Math.floor(Math.random() * flavors.length)].id);
    set({ ...state, items: [...state.items, ...picks] });
  },
};

const serverSnapshot: Box = state;
export const useBox = () => useSyncExternalStore(box.subscribe, box.get, () => serverSnapshot);
