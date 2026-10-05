"use client";

import type Lenis from "lenis";

// Instância única do Lenis (rolagem suave). Fica nula com "reduzir movimento".
let lenis: Lenis | null = null;
let locks = 0;

export function setLenis(instance: Lenis | null) {
  lenis = instance;
}

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) {
    lenis.scrollTo(el, { offset: -12, duration: 1.4 });
    return;
  }
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}

/** Trava a rolagem da página enquanto um modal ou a sacola estão abertos */
export function lockScroll() {
  locks += 1;
  if (locks === 1) {
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
  }
  return () => {
    locks = Math.max(0, locks - 1);
    if (locks === 0) {
      lenis?.start();
      document.documentElement.style.overflow = "";
    }
  };
}
