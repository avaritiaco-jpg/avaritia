"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useState } from "react";
import { ArrowRight, List, Megaphone, X } from "@phosphor-icons/react/dist/ssr";
import { site } from "@/lib/site";
import { lockScroll, scrollToId } from "@/lib/scroll";
import { Logo } from "./logo";
import { EASE_OUT, WhatsButton, useReducedMotion } from "./ui";

export function Nav() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => setSolid(y > 24));

  useEffect(() => {
    if (!open) return;
    const unlock = lockScroll();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      unlock();
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const go = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    setOpen(false);
    scrollToId(href.slice(1));
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40">
        {/* faixa de aviso: a informação mais importante do momento, sempre visível */}
        <a
          href="#avisos"
          onClick={(e) => go(e, "#avisos")}
          className="group flex items-center justify-center gap-2.5 bg-wine px-4 py-2.5 text-center text-[14px] font-medium text-wine-ink"
        >
          <Megaphone size={18} weight="fill" className="shrink-0" />
          <span>
            <strong className="font-semibold">Estamos em mudança.</strong>{" "}
            <span className="hidden sm:inline">Cardápio, loja e endereço estão mudando. </span>
            <span className="underline decoration-wine-ink/50 underline-offset-4 group-hover:decoration-wine-ink">Veja os avisos</span>
          </span>
          <ArrowRight size={15} weight="bold" className="shrink-0 transition-transform duration-300 group-hover:translate-x-0.5" />
        </a>

        <div className={`px-3 pt-2 transition-[padding] duration-500 md:px-5 ${solid ? "md:pt-2" : "md:pt-3"}`}>
          <nav
            aria-label="Principal"
            className={`mx-auto flex h-[68px] max-w-[1240px] items-center justify-between rounded-full pr-2 pl-2.5 transition-[background-color,box-shadow,backdrop-filter] duration-500 md:pl-3 ${
              solid ? "bg-surface/85 shadow-[0_12px_40px_-22px_rgba(90,31,26,0.45)] ring-1 ring-line backdrop-blur-xl" : ""
            }`}
          >
            <a href="#topo" onClick={(e) => go(e, "#topo")} aria-label={`${site.name}, voltar ao topo`}>
              <Logo />
            </a>
            <ul className="hidden items-center gap-1 lg:flex">
              {site.nav.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={(e) => go(e, l.href)}
                    className="relative rounded-full px-4 py-2 text-[15px] font-medium text-ink-2 transition-colors hover:text-wine"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="hidden lg:block">
              <WhatsButton className="h-12! px-5! text-[14px]!" />
            </div>
            <button
              type="button"
              className="grid size-12 place-items-center rounded-full bg-wine text-wine-ink transition-transform active:scale-95 lg:hidden"
              aria-label={open ? "Fechar menu" : "Abrir menu"}
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <X size={22} weight="bold" /> : <List size={22} weight="bold" />}
            </button>
          </nav>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-30 flex flex-col justify-between bg-bg px-6 pt-40 pb-10 lg:hidden"
            initial={reduce ? { opacity: 0 } : { clipPath: "circle(0% at calc(100% - 44px) 84px)" }}
            animate={reduce ? { opacity: 1 } : { clipPath: "circle(150% at calc(100% - 44px) 84px)" }}
            exit={reduce ? { opacity: 0 } : { clipPath: "circle(0% at calc(100% - 44px) 84px)" }}
            transition={{ duration: 0.6, ease: [0.77, 0, 0.175, 1] }}
          >
            <ul className="flex flex-col gap-1">
              {site.nav.map((l, i) => (
                <li key={l.href} className="overflow-hidden">
                  <motion.a
                    href={l.href}
                    onClick={(e) => go(e, l.href)}
                    className="block font-display text-5xl font-semibold"
                    initial={{ y: "100%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.2 + i * 0.06 }}
                  >
                    {l.label}
                  </motion.a>
                </li>
              ))}
            </ul>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
              <WhatsButton />
              <p className="mt-5 text-sm text-mute">WhatsApp {site.whatsappDisplay}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
