"use client";

import { motion, useReducedMotion } from "motion/react";
import { InstagramLogo, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { getProduct, productArt, type DoceProduct } from "@/lib/menu";
import { site, whatsappLink } from "@/lib/site";
import { scrollToId } from "@/lib/scroll";
import { Art } from "./art";
import { Logo } from "./nav";
import { PillButton, ScriptTitle } from "./ui";

const tray = [
  ["brigadeiros-especiais", "ao-leite"],
  ["doces-classicos", "moranguinho"],
  ["brigadeiros-gourmet", "coco"],
  ["trufas", "morango"],
  ["camafeu", "camafeu"],
  ["brigadeiros-gourmet", "maracuja"],
].map(([id, flavor]) => productArt(getProduct(id) as DoceProduct, { flavor, base: "ao-leite" }));

export function FinalCta() {
  const reduce = useReducedMotion();
  return (
    <section className="px-4 pb-6 md:px-8">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-rose px-6 py-14 md:grid md:grid-cols-12 md:items-center md:gap-8 md:px-14 md:py-20">
        <div className="relative md:col-span-6">
          <ScriptTitle text="Monte o seu pedido" className="text-[clamp(3rem,6.6vw,5.4rem)] text-cocoa" />
          <p className="mt-4 max-w-[38ch] text-lg font-semibold leading-relaxed text-cocoa/80">
            Escolha no cardápio, marque a data e pague o sinal. A confirmação chega pelo WhatsApp.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <PillButton href="#cardapio" onClick={(e) => (e.preventDefault(), scrollToId("cardapio"))}>
              Ver o cardápio
            </PillButton>
            <PillButton
              variant="ghost"
              href={whatsappLink(`Olá! Vim pelo site da ${site.fullName}.`)}
              target="_blank"
              rel="noopener noreferrer"
              icon={<WhatsappLogo size={18} weight="bold" />}
            >
              Falar no WhatsApp
            </PillButton>
          </div>
        </div>

        {/* bandeja de docinhos que caem no lugar */}
        <ul className="relative mt-12 grid grid-cols-3 gap-x-2 gap-y-4 md:col-span-6 md:mt-0" aria-hidden>
          {tray.map((art, i) => (
            <motion.li
              key={i}
              className={i % 2 ? "md:translate-y-8" : ""}
              initial={{ opacity: 0, transform: reduce ? "translateY(0px)" : "translateY(-60px) rotate(-8deg)" }}
              whileInView={{ opacity: 1, transform: "translateY(0px) rotate(0deg)" }}
              viewport={{ once: true, amount: 0.4 }}
              transition={reduce ? { duration: 0.3 } : { type: "spring", duration: 0.8, bounce: 0.4, delay: 0.1 + i * 0.08 }}
            >
              <div className="mx-auto w-[86%] drop-shadow-[0_18px_18px_rgba(90,40,45,0.18)]">
                <Art art={art} />
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="mx-auto max-w-7xl px-4 pb-28 pt-12 md:px-8 md:pb-12">
      <div className="grid gap-10 border-t border-line pt-10 md:grid-cols-12">
        <div className="md:col-span-5">
          <Logo className="[&>span:first-child]:text-[2.6rem]" />
          <p className="mt-4 max-w-[34ch] text-[15px] font-medium text-mute">
            Bolos, docinhos e caseirinhos por encomenda. Atendimento de terça a sábado.
          </p>
        </div>
        <div className="md:col-span-4">
          <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-cocoa-2">Contato</p>
          <ul className="mt-3 flex flex-col gap-2 text-[15px] font-semibold text-cocoa">
            <li>
              <a
                href={whatsappLink(`Olá! Vim pelo site da ${site.fullName}.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:text-rose-ink"
              >
                <WhatsappLogo size={18} weight="bold" /> {site.whatsappDisplay}
              </a>
            </li>
            <li>
              <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-rose-ink">
                <InstagramLogo size={18} weight="bold" /> {site.instagramHandle}
              </a>
            </li>
          </ul>
        </div>
        <div className="md:col-span-3">
          <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-cocoa-2">Pagamento</p>
          <p className="mt-3 text-[15px] font-semibold text-cocoa">Pix, PicPay ou dinheiro</p>
          <p className="mt-1 text-[14px] font-medium text-mute">Sinal de 50% na encomenda</p>
        </div>
      </div>
      <p className="mt-10 text-[13px] font-medium text-mute" suppressHydrationWarning>
        © {new Date().getFullYear()} {site.fullName}. As ilustrações mostram os sabores; a decoração segue o padrão de cada bolo.
      </p>
    </footer>
  );
}
