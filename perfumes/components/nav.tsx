"use client";

import { AnimatePresence, motion, useAnimate, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Handbag, InstagramLogo, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { site, whatsappLink } from "@/lib/site";
import { cart, openDrawer, selectCount, setNavHidden, ui, useStore } from "@/lib/store";
import { lockScroll, scrollToId } from "@/lib/scroll";
import { EASE_DRAWER, EASE_OUT } from "./ui";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-baseline gap-1.5 ${className}`}>
      <span className="font-display text-[1.6rem] font-normal leading-none tracking-[0.02em]">{site.name}</span>
      <span className="size-1 rounded-full bg-amber" aria-hidden />
    </span>
  );
}

function BagButton() {
  const count = useStore(cart, selectCount);
  const bump = useStore(ui, (s) => s.bump);
  const [scope, animate] = useAnimate();
  const first = useRef(true);

  // "Pulo" do ícone quando algo chega na sacola (o voo leva ~0,7s)
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => {
      if (!scope.current) return;
      animate(
        scope.current,
        { transform: ["scale(1)", "scale(1.22)", "scale(1)"] },
        { duration: 0.45, ease: EASE_OUT },
      );
    }, 620);
    return () => clearTimeout(t);
  }, [bump, animate, scope]);

  return (
    <button
      ref={scope}
      type="button"
      onClick={openDrawer}
      data-bag-target
      aria-label={`Abrir sacola, ${count} ${count === 1 ? "item" : "itens"}`}
      className="relative flex size-11 items-center justify-center rounded-full bg-white/[0.06] text-ivory ring-1 ring-line transition-colors duration-200 ease-out hover:bg-white/[0.1]"
    >
      <Handbag size={19} weight="light" />
      <AnimatePresence initial={false}>
        {count > 0 && (
          <motion.span
            className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center overflow-hidden rounded-full bg-amber px-1 font-mono text-[10px] font-medium text-noir"
            initial={{ opacity: 0, transform: "scale(0.6)" }}
            animate={{ opacity: 1, transform: "scale(1)" }}
            exit={{ opacity: 0, transform: "scale(0.6)" }}
            transition={{ duration: 0.2, ease: EASE_OUT }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={count}
                initial={{ transform: "translateY(100%)" }}
                animate={{ transform: "translateY(0%)" }}
                exit={{ transform: "translateY(-100%)" }}
                transition={{ duration: 0.25, ease: EASE_OUT }}
              >
                {count}
              </motion.span>
            </AnimatePresence>
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

export function Nav() {
  const hidden = useStore(ui, (s) => s.navHidden);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();

  // Some ao descer, volta ao subir: a página respira e o menu está sempre a um gesto
  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    if (y < 140) setNavHidden(false);
    else if (y > prev + 6) setNavHidden(true);
    else if (y < prev - 6) setNavHidden(false);
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

  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    // espera o menu começar a fechar antes de rolar
    setTimeout(() => scrollToId(href.slice(1)), open ? 250 : 0);
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 transition-transform duration-500 ease-drawer ${
          hidden && !open ? "-translate-y-[140%]" : "translate-y-0"
        }`}
      >
        <nav
          aria-label="Principal"
          className="flex w-full max-w-5xl items-center justify-between gap-2 rounded-full bg-noir/70 py-1.5 pl-5 pr-1.5 ring-1 ring-line backdrop-blur-xl md:w-auto md:justify-start md:gap-8"
        >
          <a href="#topo" onClick={go("#topo")} aria-label={`${site.fullName}, início`} className="shrink-0">
            <Logo />
          </a>

          <ul className="hidden items-center gap-1 md:flex">
            {site.nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={go(item.href)}
                  className="rounded-full px-3.5 py-2 text-[13px] text-mute transition-colors duration-200 ease-out hover:bg-white/[0.05] hover:text-ivory"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-1.5">
            <a
              href={whatsappLink(`Olá! Vim pelo site da ${site.fullName}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-11 items-center gap-2 rounded-full px-4 text-[13px] text-ivory ring-1 ring-line transition-colors duration-200 ease-out hover:bg-white/[0.06] lg:flex"
            >
              <WhatsappLogo size={17} weight="light" />
              WhatsApp
            </a>
            <BagButton />
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="menu-mobile"
              aria-label={open ? "Fechar menu" : "Abrir menu"}
              className="relative flex size-11 items-center justify-center rounded-full bg-white/[0.06] ring-1 ring-line md:hidden"
            >
              <span
                className={`absolute h-px w-[18px] bg-ivory transition-transform duration-500 ease-drawer ${
                  open ? "rotate-45" : "-translate-y-[4px]"
                }`}
              />
              <span
                className={`absolute h-px w-[18px] bg-ivory transition-transform duration-500 ease-drawer ${
                  open ? "-rotate-45" : "translate-y-[4px]"
                }`}
              />
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="menu-mobile"
            className="fixed inset-0 z-40 flex flex-col justify-between bg-noir/90 px-6 pb-10 pt-32 backdrop-blur-2xl md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3, ease: EASE_OUT, delay: 0.1 } }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
          >
            <ul className="flex flex-col gap-2">
              {[{ label: "Início", href: "#topo" }, ...site.nav].map((item, i) => (
                <li key={item.href} className="overflow-hidden">
                  <motion.a
                    href={item.href}
                    onClick={go(item.href)}
                    className="block py-1 font-display text-5xl font-light text-ivory"
                    initial={{ transform: "translateY(105%)" }}
                    animate={{ transform: "translateY(0%)" }}
                    exit={{ transform: "translateY(105%)", transition: { duration: 0.3, ease: EASE_DRAWER } }}
                    transition={{ duration: 0.7, delay: 0.08 + i * 0.06, ease: EASE_DRAWER }}
                  >
                    <span className="mr-4 font-mono text-xs text-amber">0{i + 1}</span>
                    {item.label}
                  </motion.a>
                </li>
              ))}
            </ul>
            <motion.div
              className="flex flex-col gap-3 text-sm text-mute"
              initial={{ opacity: 0, transform: "translateY(16px)" }}
              animate={{ opacity: 1, transform: "translateY(0px)" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: EASE_OUT }}
            >
              <a
                href={whatsappLink(`Olá! Vim pelo site da ${site.fullName}.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-ivory"
              >
                <WhatsappLogo size={20} weight="light" /> Falar no WhatsApp
              </a>
              <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                <InstagramLogo size={20} weight="light" /> {site.instagramHandle}
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
