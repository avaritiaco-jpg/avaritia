"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useState } from "react";
import { List, X } from "@phosphor-icons/react/dist/ssr";
import { site } from "@/lib/site";
import { lockScroll, scrollToId } from "@/lib/scroll";
import { EASE_OUT, WhatsButton, useReducedMotion } from "./ui";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* monograma: um brigadeiro visto de cima */}
      <span aria-hidden className="relative grid size-9 place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#7a3d27,#3b1a10_60%,#1f0c07)] shadow-[inset_0_-3px_6px_rgba(0,0,0,0.35)]">
        <span className="font-display text-[15px] font-bold tracking-tight text-[#fbe7df]">B&amp;</span>
      </span>
      <span className="font-display text-[17px] leading-none font-bold tracking-tight">
        Brigadeiria <span className="font-medium text-mute">&amp; Algo Mais</span>
      </span>
    </span>
  );
}

export function Nav() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  // fica sólido depois do topo; some rolando para baixo e volta rolando para cima
  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setSolid(y > 40);
    setHidden(y > 500 && y > prev + 4 && !open);
    if (y < prev - 4) setHidden(false);
  });

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
      <motion.header
        className="fixed inset-x-0 top-0 z-40 px-3 pt-3 md:px-5"
        animate={{ y: hidden && !reduce ? -96 : 0 }}
        transition={{ duration: 0.45, ease: EASE_OUT }}
      >
        <nav
          aria-label="Principal"
          className={`mx-auto flex h-16 max-w-[1320px] items-center justify-between rounded-full pr-2 pl-3 transition-[background-color,box-shadow,backdrop-filter] duration-500 md:pl-4 ${
            solid ? "bg-surface/75 shadow-[0_10px_40px_-20px_rgba(60,20,10,0.35)] ring-1 ring-line backdrop-blur-xl" : ""
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
                  className="relative rounded-full px-4 py-2 text-[15px] font-medium text-ink-2 transition-colors hover:text-ink"
                >
                  <span className="relative after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-full after:origin-right after:scale-x-0 after:rounded-full after:bg-accent after:transition-transform after:duration-300 after:ease-out hover:after:origin-left hover:after:scale-x-100">
                    {l.label}
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <div className="hidden lg:block">
            <WhatsButton className="h-12! px-5! text-[14px]!" />
          </div>
          <button
            type="button"
            className="grid size-12 place-items-center rounded-full bg-ink text-bg transition-transform active:scale-95 lg:hidden"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={22} weight="bold" /> : <List size={22} weight="bold" />}
          </button>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-30 flex flex-col justify-between bg-bg px-6 pt-28 pb-10 lg:hidden"
            initial={reduce ? { opacity: 0 } : { clipPath: "circle(0% at calc(100% - 44px) 44px)" }}
            animate={reduce ? { opacity: 1 } : { clipPath: "circle(150% at calc(100% - 44px) 44px)" }}
            exit={reduce ? { opacity: 0 } : { clipPath: "circle(0% at calc(100% - 44px) 44px)" }}
            transition={{ duration: 0.6, ease: [0.77, 0, 0.175, 1] }}
          >
            <ul className="flex flex-col gap-2">
              {site.nav.map((l, i) => (
                <li key={l.href} className="overflow-hidden">
                  <motion.a
                    href={l.href}
                    onClick={(e) => go(e, l.href)}
                    className="block font-display text-5xl font-bold tracking-tight"
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
              <WhatsButton className="w-full" />
              <p className="mt-5 text-sm text-mute">
                {site.address.street}, {site.address.district}, {site.address.city}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
