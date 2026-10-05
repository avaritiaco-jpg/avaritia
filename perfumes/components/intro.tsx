"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { finishIntro } from "@/lib/store";
import { lockScroll } from "@/lib/scroll";
import { brands, products } from "@/lib/catalog";
import { site } from "@/lib/site";
import { EASE_IN_OUT, EASE_OUT } from "./ui";

// Abertura (primeira visita da sessão): o nome se forma, um fio de ouro se desenha
// e a cortina sobe revelando a página. ~1,9s, uma vez só.
export function Intro() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (document.documentElement.dataset.intro === "skip") {
      setShow(false);
      finishIntro();
      return;
    }
    try {
      sessionStorage.setItem("lorve:intro", "1");
    } catch {}

    let unlock: (() => void) | undefined;
    const lockTimer = setTimeout(() => (unlock = lockScroll()), 0);
    const revealTimer = setTimeout(() => {
      finishIntro();
      setShow(false);
      unlock?.();
    }, 1900);
    return () => {
      clearTimeout(lockTimer);
      clearTimeout(revealTimer);
      unlock?.();
    };
  }, []);

  const letters = Array.from(site.name);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="intro"
          className="intro fixed inset-0 z-[90] flex items-center justify-center bg-noir [animation:intro-failsafe_0s_5s_forwards]"
          initial={{ clipPath: "inset(0% 0% 0% 0%)" }}
          exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
          transition={{ duration: 0.95, ease: EASE_IN_OUT }}
          aria-hidden
        >
          <motion.div
            className="flex flex-col items-center"
            exit={{ opacity: 0, transform: "translateY(-48px)" }}
            transition={{ duration: 0.7, ease: EASE_IN_OUT }}
          >
            <div className="flex font-display text-7xl font-light tracking-[0.06em] text-ivory sm:text-8xl">
              {letters.map((l, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, filter: "blur(14px)", transform: "translateY(30%)" }}
                  animate={{ opacity: 1, filter: "blur(0px)", transform: "translateY(0%)" }}
                  transition={{ duration: 1, delay: 0.15 + i * 0.08, ease: EASE_OUT }}
                >
                  {l}
                </motion.span>
              ))}
            </div>
            <motion.span
              className="mt-5 block h-px w-40 origin-left bg-gradient-to-r from-transparent via-amber to-transparent"
              initial={{ transform: "scaleX(0)" }}
              animate={{ transform: "scaleX(1)" }}
              transition={{ duration: 1.1, delay: 0.55, ease: EASE_OUT }}
            />
            <motion.p
              className="mt-5 text-[10px] uppercase tracking-[0.34em] text-mute"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.9, ease: EASE_OUT }}
            >
              {products.length} fragrâncias · {brands.length} casas
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
