"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import { InstagramLogo, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { getProduct, products, type Product } from "@/lib/catalog";
import { site, whatsappLink } from "@/lib/site";
import { scrollToId } from "@/lib/scroll";
import { Logo } from "./nav";
import { EASE_OUT, gentle, PillButton, ProductImage, SplitReveal } from "./ui";

/* --------------------------------------------------- botão magnético */

function Magnetic({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const x = useSpring(0, { stiffness: 200, damping: 15, mass: 0.4 });
  const y = useSpring(0, { stiffness: 200, damping: 15, mass: 0.4 });
  const transform = useTransform(() => `translate3d(${x.get()}px, ${y.get()}px, 0)`);

  return (
    <motion.div
      className="inline-block"
      style={reduce ? undefined : { transform }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * 0.25);
        y.set((e.clientY - (r.top + r.height / 2)) * 0.35);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------- chamada final */

const floaters = [
  { code: "9683-6", className: "left-[4%] top-[14%] w-40 -rotate-6", speed: -120 },
  { code: "9885-4", className: "right-[6%] top-[8%] w-36 rotate-6", speed: -200 },
  { code: "7962-4", className: "left-[10%] bottom-[8%] w-32 rotate-3", speed: 90 },
  { code: "9709-3", className: "right-[12%] bottom-[12%] w-40 -rotate-3", speed: 160 },
];

function Floater({ product, className, speed, progress }: { product: Product; className: string; speed: number; progress: ReturnType<typeof useScroll>["scrollYProgress"] }) {
  const transform = useTransform(progress, (v) => `translate3d(0, ${(v - 0.5) * speed}px, 0)`);
  return (
    <motion.div className={`absolute hidden lg:block ${className}`} style={{ transform }}>
      <div className="plate aspect-[4/5] overflow-hidden rounded-[1.4rem] opacity-80 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)] ring-1 ring-white/10">
        <ProductImage product={product} />
      </div>
    </motion.div>
  );
}

export function FinalCta() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const items = floaters
    .map((f) => ({ ...f, product: getProduct(f.code) }))
    .filter((f): f is typeof f & { product: Product } => Boolean(f.product));

  return (
    <section ref={ref} className="relative isolate overflow-hidden py-36 md:py-52">
      <div aria-hidden className="absolute left-1/2 top-1/2 -z-10 size-[min(90vw,900px)] -translate-x-1/2 -translate-y-1/2">
        <div className="h-full w-full animate-spin-slow rounded-full bg-[conic-gradient(from_0deg,rgba(214,163,92,0.35),rgba(120,50,30,0.15),rgba(214,163,92,0.05),rgba(236,201,143,0.3),rgba(214,163,92,0.35))] opacity-60 blur-[90px]" />
      </div>
      {items.map((f) => (
        <Floater key={f.code} product={f.product} className={f.className} speed={f.speed} progress={scrollYProgress} />
      ))}

      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-4 text-center">
        <SplitReveal
          text="Encontre a sua *assinatura.*"
          className="font-display text-[clamp(3.2rem,9vw,8.4rem)] font-light leading-[0.9] text-ivory"
        />
        <motion.p
          className="mt-8 max-w-[44ch] text-base leading-relaxed text-mute md:text-lg"
          initial={{ opacity: 0, transform: "translateY(16px)" }}
          whileInView={{ opacity: 1, transform: "translateY(0px)" }}
          viewport={{ once: true }}
          transition={gentle(reduce, { duration: 0.9, delay: 0.3, ease: EASE_OUT })}
        >
          {products.length} fragrâncias esperando por você. Ficou em dúvida entre duas? Chama no WhatsApp que a gente
          ajuda a escolher.
        </motion.p>
        <motion.div
          className="mt-12 flex flex-wrap items-center justify-center gap-4"
          initial={{ opacity: 0, transform: "translateY(16px)" }}
          whileInView={{ opacity: 1, transform: "translateY(0px)" }}
          viewport={{ once: true }}
          transition={gentle(reduce, { duration: 0.9, delay: 0.45, ease: EASE_OUT })}
        >
          <Magnetic>
            <PillButton onClick={() => scrollToId("catalogo")}>Montar meu pedido</PillButton>
          </Magnetic>
          <Magnetic>
            <PillButton
              variant="ghost"
              href={whatsappLink(`Olá! Vim pelo site da ${site.fullName} e queria uma indicação de perfume.`)}
              target="_blank"
              rel="noopener noreferrer"
              icon={<WhatsappLogo size={17} weight="regular" />}
            >
              Pedir uma indicação
            </PillButton>
          </Magnetic>
        </motion.div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- rodapé */

export function Footer() {
  const reduce = useReducedMotion();
  const letters = Array.from(site.name);
  return (
    <footer className="relative overflow-hidden border-t border-line pt-20">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 md:grid-cols-12 md:px-8">
        <div className="md:col-span-5">
          <Logo />
          <p className="mt-5 max-w-[34ch] text-sm leading-relaxed text-mute">{site.description}</p>
        </div>
        <nav aria-label="Rodapé" className="md:col-span-3">
          <p className="text-[10px] uppercase tracking-[0.24em] text-faint">Navegue</p>
          <ul className="mt-5 flex flex-col gap-3 text-sm text-mute">
            {[...site.nav, { label: "Dúvidas", href: "#duvidas" }].map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToId(item.href.slice(1));
                  }}
                  className="transition-colors duration-200 ease-out hover:text-ivory"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="md:col-span-4">
          <p className="text-[10px] uppercase tracking-[0.24em] text-faint">Contato</p>
          <ul className="mt-5 flex flex-col gap-3 text-sm text-mute">
            <li>
              <a
                href={whatsappLink(`Olá! Vim pelo site da ${site.fullName}.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 transition-colors duration-200 ease-out hover:text-ivory"
              >
                <WhatsappLogo size={17} weight="light" /> WhatsApp
              </a>
            </li>
            <li>
              <a
                href={site.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 transition-colors duration-200 ease-out hover:text-ivory"
              >
                <InstagramLogo size={17} weight="light" /> {site.instagramHandle}
              </a>
            </li>
            <li className="text-xs text-faint">
              Lista de preços de {site.listDate}. {site.priceNote}
            </li>
          </ul>
        </div>
      </div>

      <div
        aria-hidden
        className="mt-12 flex select-none justify-center overflow-hidden px-2 pt-[0.4em] font-display text-[clamp(7rem,30vw,26rem)] font-light italic leading-[0.8]"
      >
        {letters.map((l, i) => (
          <motion.span
            key={i}
            // o gradiente do texto só pinta dentro da caixa da letra: o respiro (compensado pela margem negativa)
            // deixa o acento do "è" e o rabo do itálico dentro dela
            className="text-gold -mx-[0.08em] -mt-[0.35em] px-[0.08em] pt-[0.35em] tracking-[-0.02em]"
            initial={{ transform: "translateY(60%)", opacity: 0 }}
            whileInView={{ transform: "translateY(0%)", opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={gentle(reduce, { duration: 1.2, delay: i * 0.07, ease: EASE_OUT })}
          >
            {l}
          </motion.span>
        ))}
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-2 border-t border-line px-4 py-6 text-xs text-faint sm:flex-row sm:items-center sm:justify-between md:px-8">
        <p>
          © {new Date().getFullYear()} {site.fullName}. Imagens e marcas pertencem aos respectivos fabricantes.
        </p>
        <p>
          Site por{" "}
          <a href="https://avaritia.com.br" target="_blank" rel="noopener" className="text-mute hover:text-ivory">
            Avaritia
          </a>
        </p>
      </div>
    </footer>
  );
}
