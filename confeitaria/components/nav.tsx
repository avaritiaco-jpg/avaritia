"use client";

import { AnimatePresence, motion, useAnimate, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Basket, InstagramLogo, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { site, whatsappLink, withBase } from "@/lib/site";
import { cart, openDrawer, selectCount, setNavHidden, ui, useStore } from "@/lib/store";
import { lockScroll, scrollToId } from "@/lib/scroll";
import { EASE_DRAWER, EASE_OUT } from "./ui";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex flex-col items-start leading-none ${className}`}>
      <span className="font-script text-[1.95rem] leading-[0.9] text-cocoa-2">{site.name}</span>
      <span className="-mt-0.5 pl-1 text-[8.5px] font-bold uppercase tracking-[0.38em] text-rose-ink">confeitaria</span>
    </span>
  );
}

export function CartButton() {
  const count = useStore(cart, selectCount);
  const bump = useStore(ui, (s) => s.bump);
  const [scope, animate] = useAnimate();
  const first = useRef(true);

  // "Pulo" do ícone quando algo chega ao carrinho (o voo leva ~0,75s)
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => {
      if (!scope.current) return;
      animate(
        scope.current,
        { transform: ["scale(1)", "scale(1.18)", "scale(1)"] },
        { duration: 0.42, ease: EASE_OUT },
      );
    }, 680);
    return () => clearTimeout(t);
  }, [bump, animate, scope]);

  return (
    <button
      ref={scope}
      type="button"
      onClick={openDrawer}
      data-cart-target
      aria-label={`Abrir carrinho, ${count} ${count === 1 ? "item" : "itens"}`}
      className="relative flex h-11 items-center gap-2 rounded-full bg-cocoa pl-3.5 pr-4 text-sm font-semibold text-blush transition-colors duration-200 ease-out hover:bg-cocoa-2"
    >
      <Basket size={19} weight="bold" />
      <span className="hidden sm:inline">Carrinho</span>
      <AnimatePresence initial={false}>
        {count > 0 && (
          <motion.span
            className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center overflow-hidden rounded-full bg-rose-deep px-1 text-[11px] font-bold text-white ring-2 ring-blush"
            initial={{ opacity: 0, transform: "scale(0.6)" }}
            animate={{ opacity: 1, transform: "scale(1)" }}
            exit={{ opacity: 0, transform: "scale(0.6)" }}
            transition={{ duration: 0.2, ease: EASE_OUT }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={count}
                className="nums"
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

const hello = `Olá! Vim pelo site da ${site.fullName}.`;

/** Menu do topo. Na página de pagamento (`home={false}`) os links voltam para a página inicial. */
export function Nav({ home = true }: { home?: boolean }) {
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
    if (!home) return;
    e.preventDefault();
    setOpen(false);
    // espera o menu começar a fechar antes de rolar
    setTimeout(() => scrollToId(href.slice(1)), open ? 250 : 0);
  };
  const link = (href: string) => (home ? href : withBase(`/${href}`));

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-3 transition-transform duration-500 ease-drawer md:pt-4 ${
          hidden && !open ? "-translate-y-[140%]" : "translate-y-0"
        }`}
      >
        <nav
          aria-label="Principal"
          className="flex w-full max-w-6xl items-center justify-between gap-2 rounded-full bg-card/80 py-1.5 pl-5 pr-1.5 shadow-[0_12px_40px_-24px_rgba(61,39,32,0.45)] ring-1 ring-line backdrop-blur-xl"
        >
          <a href={home ? "#topo" : withBase("/")} onClick={go("#topo")} aria-label={`${site.fullName}, início`} className="shrink-0">
            <Logo />
          </a>

          {home ? (
            <ul className="hidden items-center gap-1 md:flex">
              {site.nav.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={go(item.href)}
                    className="rounded-full px-3.5 py-2 text-[14px] font-semibold text-cocoa-2 transition-colors duration-200 ease-out hover:bg-blush-2 hover:text-cocoa"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <a
              href={withBase("/#cardapio")}
              className="hidden items-center gap-2 rounded-full px-4 py-2 text-[14px] font-semibold text-cocoa-2 transition-colors hover:bg-blush-2 md:flex"
            >
              <ArrowLeft size={16} weight="bold" /> Voltar ao cardápio
            </a>
          )}

          <div className="flex items-center gap-1.5">
            <a
              href={whatsappLink(hello)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Falar no WhatsApp"
              className="hidden size-11 items-center justify-center rounded-full text-cocoa-2 ring-1 ring-line transition-colors duration-200 ease-out hover:bg-blush-2 lg:flex"
            >
              <WhatsappLogo size={19} weight="bold" />
            </a>
            <CartButton />
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="menu-mobile"
              aria-label={open ? "Fechar menu" : "Abrir menu"}
              className="relative flex size-11 items-center justify-center rounded-full bg-blush-2 md:hidden"
            >
              <span
                className={`absolute h-0.5 w-[18px] rounded-full bg-cocoa transition-transform duration-500 ease-drawer ${
                  open ? "rotate-45" : "-translate-y-[4px]"
                }`}
              />
              <span
                className={`absolute h-0.5 w-[18px] rounded-full bg-cocoa transition-transform duration-500 ease-drawer ${
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
            className="fixed inset-0 z-40 flex flex-col justify-between bg-blush/95 px-6 pb-10 pt-28 backdrop-blur-2xl md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3, ease: EASE_OUT, delay: 0.1 } }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
          >
            <ul className="flex flex-col gap-1">
              {[{ label: "Início", href: "#topo" }, ...site.nav].map((item, i) => (
                <li key={item.href} className="overflow-hidden pb-1">
                  <motion.a
                    href={link(item.href)}
                    onClick={go(item.href)}
                    className="block py-1 font-script text-5xl leading-[1.2] text-cocoa-2"
                    initial={{ transform: "translateY(110%)" }}
                    animate={{ transform: "translateY(0%)" }}
                    exit={{ transform: "translateY(110%)", transition: { duration: 0.3, ease: EASE_DRAWER } }}
                    transition={{ duration: 0.7, delay: 0.08 + i * 0.06, ease: EASE_DRAWER }}
                  >
                    {item.label}
                  </motion.a>
                </li>
              ))}
            </ul>
            <motion.div
              className="flex flex-col gap-3 text-base font-semibold text-cocoa-2"
              initial={{ opacity: 0, transform: "translateY(16px)" }}
              animate={{ opacity: 1, transform: "translateY(0px)" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: EASE_OUT }}
            >
              <a href={whatsappLink(hello)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                <WhatsappLogo size={22} weight="bold" /> {site.whatsappDisplay}
              </a>
              <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                <InstagramLogo size={22} weight="bold" /> {site.instagramHandle}
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
