"use client";

import { motion } from "motion/react";
import {
  ArrowSquareOut,
  ChatCircleDots,
  CheckCircle,
  ForkKnife,
  MapPin,
  Storefront,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import { avisos, avisosAtualizadosEm, site, waLink, type Aviso } from "@/lib/site";
import { EASE_OUT, RiseTitle, useReducedMotion } from "./ui";

const icones: Record<string, Icon> = {
  endereco: MapPin,
  cardapio: ForkKnife,
  estrutura: Storefront,
  entremets: WarningCircle,
  contato: CheckCircle,
};

// Cor da etiqueta segue o significado: mudando (âmbar), atenção (vinho), sem mudança (verde)
const tons: Record<Aviso["tom"], { chip: string; dot: string }> = {
  mudanca: { chip: "bg-alert-soft text-alert", dot: "bg-alert" },
  atencao: { chip: "bg-wine-soft text-wine", dot: "bg-wine" },
  ok: { chip: "bg-ok-soft text-ok", dot: "bg-ok" },
};

function Status({ aviso }: { aviso: Aviso }) {
  const t = tons[aviso.tom];
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[13px] font-semibold ${t.chip}`}>
      <span className="relative flex size-2">
        {aviso.tom === "mudanca" && <span className={`absolute inset-0 animate-ping rounded-full opacity-60 motion-reduce:hidden ${t.dot}`} />}
        <span className={`relative size-2 rounded-full ${t.dot}`} />
      </span>
      {aviso.status}
    </span>
  );
}

function Card({ aviso, index, big }: { aviso: Aviso; index: number; big?: boolean }) {
  const reduce = useReducedMotion();
  const Icone = icones[aviso.id] ?? CheckCircle;
  return (
    <motion.article
      className={`flex flex-col rounded-[1.5rem] bg-surface p-6 ring-1 ring-line md:p-7 ${big ? "md:col-span-2" : ""}`}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease: EASE_OUT, delay: (index % 3) * 0.08 }}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-bg-2 text-wine">
          <Icone size={24} weight="duotone" />
        </span>
        <Status aviso={aviso} />
      </div>
      <h3 className="mt-5 font-display text-[1.75rem] leading-tight font-semibold">{aviso.titulo}</h3>
      <p className="mt-2 max-w-[56ch] text-[16px] leading-relaxed text-ink-2">{aviso.texto}</p>
      {aviso.detalhe ? (
        <p className="mt-4 rounded-xl bg-bg-2 px-4 py-3 text-[15px] font-medium text-ink">{aviso.detalhe}</p>
      ) : null}

      {aviso.id === "endereco" && (
        <div className="mt-6 grid gap-4 border-t border-line pt-5 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <p className="text-[13px] font-semibold tracking-wide text-mute uppercase">Endereço atual</p>
            <p className="mt-1 text-[16px] leading-snug">
              {site.address.street}, {site.address.label}
              <br />
              {site.address.city}, CEP {site.address.cep}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href={waLink("Olá! Onde vocês estão atendendo hoje? Vou passar na loja.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-wine px-4 text-[14px] font-semibold text-wine-ink transition-transform active:scale-[0.97]"
            >
              <ChatCircleDots size={18} weight="bold" /> Confirmar antes de ir
            </a>
            <a
              href={site.address.maps}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-[14px] font-semibold ring-1 ring-line transition-colors hover:bg-bg-2"
            >
              Mapa <ArrowSquareOut size={16} weight="bold" />
            </a>
          </div>
        </div>
      )}
    </motion.article>
  );
}

export function Avisos() {
  return (
    <section id="avisos" className="relative scroll-mt-28 bg-bg-2 py-20 md:py-28">
      <div className="mx-auto max-w-[1240px] px-4 md:px-8">
        <p className="text-[14px] font-semibold text-mute">Atualizado em {avisosAtualizadosEm}</p>
        <RiseTitle
          text="O que você precisa saber agora"
          className="mt-2 max-w-[18ch] font-display text-[clamp(2.4rem,5vw,4rem)] leading-[1.02] font-semibold"
        />
        <p className="mt-4 max-w-[58ch] text-lg leading-relaxed text-ink-2">
          A loja está passando por mudanças. Enquanto isso, o jeito mais seguro de pedir ou confirmar qualquer informação é o WhatsApp{" "}
          <strong className="font-semibold whitespace-nowrap text-ink">{site.whatsappDisplay}</strong>.
        </p>

        <div className="mt-12 grid gap-4 md:grid-cols-3 md:gap-5">
          {avisos.map((a, i) => (
            <Card key={a.id} aviso={a} index={i} big={i === 0} />
          ))}
        </div>
      </div>
    </section>
  );
}
