"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { List, X } from "@phosphor-icons/react";
import { Logo } from "@/components/logo";
import { container } from "@/components/ui";
import { nav, site } from "@/lib/site";

export function Nav() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 24));

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ease-out-expo ${
        scrolled && !open
          ? "border-b border-line/80 bg-ink/75 backdrop-blur-xl"
          : "border-b border-transparent"
      }`}
    >
      <nav className={`${container} flex h-[72px] items-center justify-between`} aria-label="Principal">
        <a href="#top" aria-label="Avaritia, voltar ao início" className="relative z-10">
          <Logo />
        </a>

        <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
          {nav.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="rounded-full px-4 py-2 text-[15px] text-mute transition-colors duration-300 hover:text-paper"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="relative z-10 flex items-center gap-2">
          <a
            href="#contato"
            className="hidden h-11 items-center whitespace-nowrap rounded-full bg-gold px-5 text-sm font-semibold text-ink transition-[background-color,transform] duration-300 hover:bg-gold-soft active:scale-[0.98] sm:inline-flex"
          >
            {site.cta}
          </a>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            className="grid size-11 place-items-center rounded-full border border-line-strong text-paper md:hidden"
          >
            {open ? <X size={20} /> : <List size={20} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="menu-mobile"
            className="fixed inset-0 top-[72px] flex flex-col bg-ink px-5 pb-10 pt-6 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <ul className="flex flex-col">
              {nav.map((item, i) => (
                <motion.li
                  key={item.href}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="border-b border-line"
                >
                  <a
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block py-5 text-4xl font-semibold tracking-[-0.04em] text-paper"
                  >
                    {item.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <a
              href="#contato"
              onClick={() => setOpen(false)}
              className="mt-auto inline-flex h-14 items-center justify-center rounded-full bg-gold text-[15px] font-semibold text-ink"
            >
              {site.cta}
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
