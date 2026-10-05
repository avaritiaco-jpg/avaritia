"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";
import {
  firstPickup,
  fromKey,
  isPickupAllowed,
  monthGrid,
  monthLabel,
  sameDay,
  startOfDay,
  toKey,
  weekdayNames,
  weekdays,
} from "@/lib/dates";
import { EASE_OUT } from "./ui";

const MONTHS_AHEAD = 3;

/** Calendário de retirada: só deixa escolher terça a sábado, a partir de 2 dias. */
export function PickupCalendar({
  value,
  onChange,
  invalid,
  describedBy,
}: {
  value: string;
  onChange: (key: string) => void;
  invalid?: boolean;
  describedBy?: string;
}) {
  const reduce = useReducedMotion();
  const today = useMemo(() => startOfDay(new Date()), []);
  const first = useMemo(() => firstPickup(today), [today]);
  const selected = value ? fromKey(value) : null;
  const startMonth = new Date(first.getFullYear(), first.getMonth(), 1);
  const [month, setMonth] = useState(() =>
    selected && selected >= startMonth ? new Date(selected.getFullYear(), selected.getMonth(), 1) : startMonth,
  );
  const [dir, setDir] = useState(1);

  const offset =
    (month.getFullYear() - startMonth.getFullYear()) * 12 + (month.getMonth() - startMonth.getMonth());
  const go = (delta: number) => {
    setDir(delta);
    setMonth((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1));
  };

  const cells = monthGrid(month);
  const label = monthLabel(month);

  return (
    <div
      className={`rounded-[1.4rem] bg-white p-4 ring-1 transition-shadow sm:p-5 ${invalid ? "ring-danger/60" : "ring-line"}`}
      aria-describedby={describedBy}
    >
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={offset <= 0}
          aria-label="Mês anterior"
          className="flex size-10 items-center justify-center rounded-full text-cocoa transition-colors hover:bg-blush-2 disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <CaretLeft size={16} weight="bold" />
        </button>
        <div className="relative h-7 flex-1 overflow-hidden text-center">
          <AnimatePresence initial={false} custom={dir} mode="popLayout">
            <motion.p
              key={label}
              className="text-[15px] font-bold text-cocoa first-letter:uppercase"
              custom={dir}
              initial={{ opacity: 0, transform: `translateX(${reduce ? 0 : dir * 24}px)` }}
              animate={{ opacity: 1, transform: "translateX(0px)" }}
              exit={{ opacity: 0, transform: `translateX(${reduce ? 0 : dir * -24}px)` }}
              transition={{ duration: 0.25, ease: EASE_OUT }}
              aria-live="polite"
            >
              {label}
            </motion.p>
          </AnimatePresence>
        </div>
        <button
          type="button"
          onClick={() => go(1)}
          disabled={offset >= MONTHS_AHEAD}
          aria-label="Próximo mês"
          className="flex size-10 items-center justify-center rounded-full text-cocoa transition-colors hover:bg-blush-2 disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <CaretRight size={16} weight="bold" />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 text-center text-[12px] font-bold text-mute" aria-hidden>
        {weekdays.map((d, i) => (
          <span key={i} className="py-1">
            {d}
          </span>
        ))}
      </div>

      <div className="relative overflow-hidden">
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.div
            key={label}
            role="grid"
            aria-label={`Dias de ${label}`}
            className="grid grid-cols-7 gap-y-1"
            initial={{ opacity: 0, transform: `translateX(${reduce ? 0 : dir * 40}px)` }}
            animate={{ opacity: 1, transform: "translateX(0px)" }}
            exit={{ opacity: 0, transform: `translateX(${reduce ? 0 : dir * -40}px)` }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
          >
            {cells.map((d, i) => {
              if (!d) return <span key={i} />;
              const allowed = isPickupAllowed(d, today);
              const isSel = selected ? sameDay(d, selected) : false;
              const isToday = sameDay(d, today);
              return (
                <div key={i} className="flex justify-center">
                  <button
                    type="button"
                    disabled={!allowed}
                    onClick={() => onChange(toKey(d))}
                    aria-pressed={isSel}
                    aria-label={`${weekdayNames[d.getDay()]}, ${d.getDate()} de ${label.split(" ")[0]}${allowed ? "" : ", indisponível"}`}
                    className={`relative flex size-10 items-center justify-center rounded-full text-[14px] font-bold transition-colors duration-150 sm:size-11 ${
                      isSel
                        ? "text-white"
                        : allowed
                          ? "text-cocoa hover:bg-blush-2"
                          : "cursor-not-allowed text-cocoa/25"
                    }`}
                  >
                    {isSel && (
                      <motion.span
                        layoutId="pickup-day"
                        className="absolute inset-0 rounded-full bg-rose-deep"
                        transition={reduce ? { duration: 0 } : { type: "spring", duration: 0.4, bounce: 0.2 }}
                      />
                    )}
                    <span className="nums relative">{d.getDate()}</span>
                    {isToday && !isSel ? (
                      <span className="absolute bottom-1 size-1 rounded-full bg-rose" aria-hidden />
                    ) : null}
                  </button>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
