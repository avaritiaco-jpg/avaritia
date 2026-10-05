"use client";

import { motion, useReducedMotion } from "motion/react";
import { useId } from "react";
import { Minus, Plus } from "@phosphor-icons/react/dist/ssr";

export type Choice<T extends string> = {
  id: T;
  title: React.ReactNode;
  hint?: React.ReactNode;
  aside?: React.ReactNode;
  disabled?: boolean;
};

/**
 * Grupo de opções com rádios nativos (setas do teclado funcionam) e um destaque
 * que desliza até a opção escolhida.
 */
export function Options<T extends string>({
  label,
  value,
  onChange,
  options,
  className = "grid-cols-2",
  size = "card",
}: {
  label: string;
  value: T | undefined;
  onChange: (v: T) => void;
  options: Choice<T>[];
  className?: string;
  size?: "card" | "chip";
}) {
  const name = useId();
  const reduce = useReducedMotion();
  return (
    <fieldset>
      <legend className="mb-2.5 text-[13px] font-bold uppercase tracking-[0.14em] text-cocoa-2">{label}</legend>
      <div className={size === "chip" ? "flex flex-wrap gap-2" : `grid gap-2 ${className}`}>
        {options.map((o) => {
          const checked = o.id === value;
          return (
            <label
              key={o.id}
              className={`relative cursor-pointer select-none ${o.disabled ? "pointer-events-none opacity-40" : ""}`}
            >
              <input
                type="radio"
                name={name}
                value={o.id}
                checked={checked}
                disabled={o.disabled}
                onChange={() => onChange(o.id)}
                className="peer sr-only"
              />
              <span
                className={`relative flex h-full rounded-[1.1rem] ring-1 transition-[background-color,box-shadow] duration-200 ease-out peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-rose-deep ${
                  size === "chip" ? "items-center rounded-full px-4 py-2.5" : "flex-col px-4 py-3"
                } ${checked ? "bg-white ring-transparent" : "bg-card/60 ring-line hover:bg-white"}`}
              >
                {checked && (
                  <motion.span
                    layoutId={`${name}-ring`}
                    className={`absolute inset-0 ring-2 ring-rose-deep ${size === "chip" ? "rounded-full" : "rounded-[1.1rem]"}`}
                    transition={reduce ? { duration: 0 } : { type: "spring", duration: 0.4, bounce: 0.15 }}
                  />
                )}
                <span className="relative flex w-full items-baseline justify-between gap-2">
                  <span className={`font-bold text-cocoa ${size === "chip" ? "text-[14px]" : "text-[15px]"}`}>{o.title}</span>
                  {o.aside ? <span className="nums text-[14px] font-bold text-rose-ink">{o.aside}</span> : null}
                </span>
                {o.hint ? <span className="relative mt-0.5 text-[13px] font-medium text-mute">{o.hint}</span> : null}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/** − 1 + com passo configurável (docinhos andam de 25 em 25) */
export function Stepper({
  value,
  onChange,
  min = 1,
  max = 99,
  step = 1,
  label,
  size = "md",
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label: string;
  size?: "sm" | "md";
}) {
  const btn = size === "sm" ? "size-8" : "size-10";
  return (
    <div className="flex items-center rounded-full bg-card p-1 ring-1 ring-line" role="group" aria-label={label}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - step))}
        disabled={value <= min}
        aria-label={`Diminuir ${label.toLowerCase()}`}
        className={`flex ${btn} items-center justify-center rounded-full text-cocoa transition-[background-color,transform] duration-150 ease-out hover:bg-blush-2 active:scale-[0.9] disabled:opacity-35 disabled:hover:bg-transparent`}
      >
        <Minus size={size === "sm" ? 13 : 15} weight="bold" />
      </button>
      <span
        className={`nums text-center font-bold text-cocoa ${size === "sm" ? "min-w-8 text-[13px]" : "min-w-10 text-[15px]"}`}
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + step))}
        disabled={value >= max}
        aria-label={`Aumentar ${label.toLowerCase()}`}
        className={`flex ${btn} items-center justify-center rounded-full text-cocoa transition-[background-color,transform] duration-150 ease-out hover:bg-blush-2 active:scale-[0.9] disabled:opacity-35`}
      >
        <Plus size={size === "sm" ? 13 : 15} weight="bold" />
      </button>
    </div>
  );
}
