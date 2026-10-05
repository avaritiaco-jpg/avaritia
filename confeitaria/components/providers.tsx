"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { MotionConfig } from "motion/react";
import { loadCart } from "@/lib/store";
import { setLenis } from "@/lib/scroll";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    loadCart();
  }, []);

  // Rolagem suave com inércia (desligada com "reduzir movimento"; no toque fica a nativa).
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ autoRaf: true, lerp: 0.11, anchors: { offset: -12 } });
    setLenis(lenis);
    return () => {
      setLenis(null);
      lenis.destroy();
    };
  }, []);

  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
