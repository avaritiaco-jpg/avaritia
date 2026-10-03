"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Quotes } from "@phosphor-icons/react";
import { container, h2 } from "@/components/ui";
import { testimonials } from "@/lib/site";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
}

export function Testimonials() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (paused || reduce) return;
    const id = window.setTimeout(() => setActive((a) => (a + 1) % testimonials.length), 7000);
    return () => window.clearTimeout(id);
  }, [active, paused, reduce]);

  if (testimonials.length === 0) return null;
  const t = testimonials[active];

  return (
    <section
      aria-labelledby="depoimentos"
      className="border-t border-line py-24 md:py-36"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className={`${container} flex flex-col items-center text-center`}>
        <h2 id="depoimentos" className={h2}>
          Quem contrata, recomenda.
        </h2>

        <div className="relative mt-14 min-h-[300px] w-full max-w-4xl md:mt-20 md:min-h-[260px]">
          <Quotes size={44} weight="fill" className="mx-auto text-gold" aria-hidden />
          <AnimatePresence mode="wait">
            <motion.figure
              key={active}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8"
              aria-live="polite"
            >
              <blockquote className="text-balance text-[clamp(1.45rem,2.6vw,2.2rem)] font-medium leading-[1.25] tracking-[-0.025em] text-paper">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-8 text-mute">
                <span className="font-semibold text-paper">{t.name}</span>
                <span className="mx-2 text-faint" aria-hidden>
                  /
                </span>
                {t.role}
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>

        <div className="mt-10 flex gap-3" role="tablist" aria-label="Escolher depoimento">
          {testimonials.map((item, i) => (
            <button
              key={item.name}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Depoimento de ${item.name}`}
              onClick={() => setActive(i)}
              className={`grid size-12 place-items-center rounded-full border text-sm font-semibold transition-all duration-300 ${
                i === active
                  ? "border-gold bg-gold text-ink"
                  : "border-line-strong bg-ink-2 text-mute hover:border-paper/30 hover:text-paper"
              }`}
            >
              {initials(item.name)}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
