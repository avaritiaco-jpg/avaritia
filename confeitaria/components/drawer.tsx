"use client";

import { AnimatePresence, motion, useReducedMotion, type PanInfo } from "motion/react";
import { useEffect, useRef } from "react";
import { X } from "@phosphor-icons/react/dist/ssr";
import { lockScroll } from "@/lib/scroll";
import { EASE_DRAWER, EASE_OUT } from "./ui";

/**
 * Comportamento de diálogo: trava a rolagem, fecha no Esc, prende o foco
 * dentro do painel e devolve o foco para quem abriu.
 */
export function useDialog(open: boolean, ref: React.RefObject<HTMLElement | null>, onClose: () => void) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const unlock = lockScroll();
    const focusFirst = requestAnimationFrame(() => {
      const el = ref.current?.querySelector<HTMLElement>("[data-autofocus]") ?? ref.current;
      el?.focus({ preventScroll: true });
    });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !ref.current) return;
      const focusables = Array.from(
        ref.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.offsetParent !== null);
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(focusFirst);
      document.removeEventListener("keydown", onKey);
      unlock();
      previous?.focus?.({ preventScroll: true });
    };
  }, [open, ref]);
}

// Painel lateral do carrinho. No celular ocupa a tela toda e fecha arrastando para a direita.
export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  useDialog(open, ref, onClose);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > 120 || info.velocity.x > 600) onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60]">
          <motion.div
            className="absolute inset-0 bg-cocoa/35 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
            onClick={onClose}
          />
          <motion.aside
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            className="absolute inset-y-0 right-0 flex w-full flex-col bg-blush shadow-[-40px_0_80px_-20px_rgba(61,39,32,0.35)] ring-1 ring-line outline-none sm:inset-y-2 sm:right-2 sm:w-[min(460px,calc(100vw-1rem))] sm:rounded-[1.75rem]"
            initial={reduce ? { opacity: 0 } : { x: "105%" }}
            animate={reduce ? { opacity: 1 } : { x: 0 }}
            exit={reduce ? { opacity: 0 } : { x: "105%" }}
            transition={{ duration: 0.5, ease: EASE_DRAWER }}
            drag={reduce ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: 0, right: 0.7 }}
            dragListener
            dragSnapToOrigin
            onDragEnd={onDragEnd}
          >
            <header className="flex items-center justify-between gap-4 border-b border-line px-6 py-5">
              <div>
                <h2 className="font-script text-4xl leading-[1.1] text-cocoa-2">{title}</h2>
                {subtitle ? <div className="mt-0.5 text-sm font-medium text-mute">{subtitle}</div> : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                data-autofocus
                aria-label="Fechar"
                className="flex size-11 items-center justify-center rounded-full bg-card text-cocoa ring-1 ring-line transition-colors duration-200 ease-out hover:bg-white"
              >
                <X size={18} weight="bold" />
              </button>
            </header>
            <div
              data-lenis-prevent
              className="flex-1 overflow-y-auto overscroll-contain px-6 py-5"
              onPointerDownCapture={(e) => e.stopPropagation()}
            >
              {children}
            </div>
            {footer ? <footer className="border-t border-line bg-card/60 px-6 pb-6 pt-5 sm:rounded-b-[1.75rem]">{footer}</footer> : null}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
