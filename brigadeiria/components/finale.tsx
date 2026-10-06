"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { flavors, site } from "@/lib/site";
import { Brigadeiro, rng } from "./brigadeiro";
import { Logo } from "./nav";
import { WhatsButton, useReducedMotion } from "./ui";

// Brigadeiros que caem e se amontoam quando a seção aparece (posições fixas por semente)
const rand = rng("pilha");
const pile = Array.from({ length: 14 }, (_, i) => ({
  flavor: flavors[(i * 5) % flavors.length],
  left: 2 + ((i * 7.1 + rand() * 4) % 92),
  bottom: (i % 3) * 3.2 + rand() * 2,
  size: 70 + rand() * 46,
  rotate: rand() * 40 - 20,
  delay: 0.1 + i * 0.07 + rand() * 0.1,
}));

export function Finale() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });

  return (
    <section ref={ref} aria-labelledby="final-titulo" className="relative overflow-hidden pt-16 pb-0">
      <div className="mx-auto max-w-[1320px] px-4 text-center md:px-8">
        <motion.h2
          id="final-titulo"
          className="font-display text-[clamp(3rem,11vw,10rem)] leading-[0.9] font-extrabold tracking-[-0.04em]"
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 40 }}
          animate={inView ? { opacity: 1, scale: 1, y: 0 } : undefined}
          transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
        >
          Bateu vontade?
        </motion.h2>
        <motion.p
          className="mx-auto mt-6 max-w-[40ch] text-lg leading-relaxed text-ink-2"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.8, delay: 0.25 }}
        >
          Encomende pelo WhatsApp ou passe na loja. O tacho está sempre no fogo.
        </motion.p>
        <motion.div
          className="mt-9 flex justify-center"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <WhatsButton />
        </motion.div>
      </div>

      {/* a pilha */}
      <div className="relative mx-auto mt-10 h-[150px] max-w-[1320px] md:h-[190px]" aria-hidden>
        {pile.map((p, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ left: `${p.left}%`, bottom: `${p.bottom}%`, width: p.size }}
            initial={reduce ? { opacity: 0 } : { y: -520, rotate: p.rotate - 90, opacity: 0 }}
            animate={inView ? { y: 0, rotate: p.rotate, opacity: 1 } : undefined}
            transition={reduce ? { duration: 0.4 } : { type: "spring", stiffness: 190, damping: 13, mass: 0.9, delay: p.delay }}
          >
            <Brigadeiro flavor={p.flavor} className="w-full drop-shadow-[0_14px_16px_rgba(50,15,5,0.25)]" />
          </motion.div>
        ))}
      </div>

      <footer className="relative bg-cocoa pt-14 pb-10 text-cream">
        <div className="mx-auto grid max-w-[1320px] gap-10 px-4 md:grid-cols-[1.4fr_1fr_1fr] md:px-8">
          <div>
            <Logo className="[&_span.text-mute]:text-cream/60" />
            <p className="mt-4 max-w-[36ch] text-[15px] leading-relaxed text-cream/70">
              Brigadeiros de chocolate belga, doces e café no centro de {site.address.city} desde {site.since}.
            </p>
          </div>
          <div className="text-[15px] leading-relaxed text-cream/80">
            <p className="mb-2 font-display font-bold text-cream">Loja</p>
            <p>{site.address.street}</p>
            <p>
              {site.address.district}, {site.address.city} ({site.address.state})
            </p>
            <p className="mt-2">{site.hours.label}</p>
          </div>
          <div className="text-[15px] leading-relaxed text-cream/80">
            <p className="mb-2 font-display font-bold text-cream">Contato</p>
            <p>
              <a className="hover:text-cream" href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noopener noreferrer">
                WhatsApp {site.whatsappDisplay}
              </a>
            </p>
            <p>
              <a className="hover:text-cream" href={`tel:+${site.phone}`}>
                Telefone {site.phoneDisplay}
              </a>
            </p>
            <p>
              <a className="hover:text-cream" href={site.instagram} target="_blank" rel="noopener noreferrer">
                Instagram {site.instagramHandle}
              </a>
            </p>
          </div>
        </div>
        <p className="mx-auto mt-12 max-w-[1320px] px-4 text-[13px] text-cream/50 md:px-8">
          © {new Date().getFullYear()} {site.name}. Ilustrações feitas para este site.
        </p>
      </footer>
    </section>
  );
}
