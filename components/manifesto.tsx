"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { container } from "@/components/ui";
import { manifesto } from "@/lib/site";

// As palavras acendem conforme a leitura avança: o texto é a história da seção.
export function Manifesto() {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.5"] });

  const base = manifesto.text.split(" ");
  const gold = manifesto.highlight.split(" ");
  const words = [...base, ...gold];

  return (
    <section className="pb-8 pt-24 md:pb-12 md:pt-40">
      <div className={container}>
        <p
          ref={ref}
          className="max-w-[34ch] text-[clamp(1.85rem,3.9vw,3.5rem)] font-medium leading-[1.14] tracking-[-0.035em]"
        >
          {words.map((word, i) => (
            <Word
              key={i}
              progress={scrollYProgress}
              range={[i / words.length, (i + 1) / words.length]}
              gold={i >= base.length}
            >
              {word}
            </Word>
          ))}
        </p>
      </div>
    </section>
  );
}

function Word({
  children,
  progress,
  range,
  gold,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
  gold: boolean;
}) {
  const opacity = useTransform(progress, range, [0.16, 1]);
  return (
    <motion.span style={{ opacity }} className={gold ? "text-gold" : "text-paper"}>
      {children}{" "}
    </motion.span>
  );
}
