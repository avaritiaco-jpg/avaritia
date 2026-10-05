"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";
import { Check, Copy } from "@phosphor-icons/react/dist/ssr";
import { encode } from "uqr";
import { EASE_OUT } from "./ui";

/** QR Code do Pix desenhado em SVG (sem imagem externa), revelado do centro para fora */
export function PixQr({ payload, label }: { payload: string; label: string }) {
  const reduce = useReducedMotion();
  const qr = useMemo(() => encode(payload, { ecc: "M", border: 2 }), [payload]);
  const n = qr.size;

  // um único caminho com todos os módulos escuros: leve e nítido em qualquer tamanho
  const d = useMemo(() => {
    let path = "";
    qr.data.forEach((row, y) =>
      row.forEach((on, x) => {
        if (on) path += `M${x} ${y}h1v1h-1z`;
      }),
    );
    return path;
  }, [qr]);

  return (
    <motion.svg
      viewBox={`0 0 ${n} ${n}`}
      role="img"
      aria-label={label}
      shapeRendering="crispEdges"
      className="block aspect-square w-full rounded-[1.1rem] bg-white"
      initial={{ clipPath: "circle(0% at 50% 50%)", opacity: 0 }}
      animate={{ clipPath: "circle(75% at 50% 50%)", opacity: 1 }}
      transition={reduce ? { duration: 0.3 } : { duration: 0.9, ease: EASE_OUT, delay: 0.25 }}
    >
      <path d={d} fill="#3d2720" />
    </motion.svg>
  );
}

/** Botão de copiar com confirmação ("Copiado!") por um instante */
export function CopyButton({ text, label = "Copiar código" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // navegadores sem a API: seleciona o texto num campo temporário
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-cocoa px-5 text-[15px] font-bold text-blush transition-[background-color,transform] duration-200 ease-out hover:bg-cocoa-2 active:scale-[0.98]"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={copied ? "ok" : "copy"}
          className="flex items-center gap-2"
          initial={{ opacity: 0, transform: "translateY(8px)" }}
          animate={{ opacity: 1, transform: "translateY(0px)" }}
          exit={{ opacity: 0, transform: "translateY(-8px)" }}
          transition={{ duration: 0.2, ease: EASE_OUT }}
        >
          {copied ? <Check size={18} weight="bold" /> : <Copy size={18} weight="bold" />}
          {copied ? "Copiado!" : label}
        </motion.span>
      </AnimatePresence>
      <span className="sr-only" aria-live="polite">
        {copied ? "Código copiado" : ""}
      </span>
    </button>
  );
}
