"use client";

import { useState } from "react";
import { Check, Copy, FacebookLogo, InstagramLogo, MapPin, Phone, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { site, waLink } from "@/lib/site";
import { Logo } from "./logo";
import { Reveal, RiseTitle } from "./ui";

function Copiar({ valor }: { valor: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(valor).then(
          () => {
            setOk(true);
            setTimeout(() => setOk(false), 1600);
          },
          () => {},
        );
      }}
      className="inline-flex size-9 items-center justify-center rounded-full text-mute ring-1 ring-line transition-colors hover:text-wine"
      aria-label={ok ? "Copiado" : `Copiar ${valor}`}
    >
      {ok ? <Check size={16} weight="bold" /> : <Copy size={16} weight="bold" />}
    </button>
  );
}

const canais = [
  { icon: WhatsappLogo, rotulo: "WhatsApp", valor: site.whatsappDisplay, href: waLink(), nota: "Pedidos, encomendas e avisos" },
  { icon: Phone, rotulo: "Telefone", valor: site.phoneDisplay, href: `tel:+${site.phone}`, nota: "Fixo da loja" },
  { icon: InstagramLogo, rotulo: "Instagram", valor: site.instagramHandle, href: site.instagram, nota: "Fotos e novidades" },
  { icon: FacebookLogo, rotulo: "Facebook", valor: "Brigadeiria & Algo Mais", href: site.facebook, nota: "Página da loja" },
];

export function Contato() {
  return (
    <section id="contato" className="relative scroll-mt-28 pt-6 md:pt-10">
      <div className="mx-auto max-w-[1240px] px-4 md:px-8">
        <RiseTitle text="Fale com a gente" className="font-display text-[clamp(2.4rem,5vw,4rem)] leading-[1.02] font-semibold" />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {canais.map((c, i) => (
            <Reveal key={c.rotulo} delay={i * 0.06}>
              <div className="flex h-full flex-col rounded-[1.5rem] bg-surface p-6 ring-1 ring-line">
                <c.icon size={28} weight="duotone" className="text-wine" />
                <p className="mt-4 text-[14px] font-semibold text-mute">{c.rotulo}</p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <a
                    href={c.href}
                    target={c.href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="min-w-0 text-[1.15rem] leading-tight font-semibold tabular-nums [overflow-wrap:anywhere] hover:text-wine"
                  >
                    {c.valor}
                  </a>
                  {(c.rotulo === "WhatsApp" || c.rotulo === "Telefone") && <Copiar valor={c.valor} />}
                </div>
                <p className="mt-2 text-[14px] text-ink-2">{c.nota}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-4">
          <div className="flex flex-col gap-4 rounded-[1.5rem] bg-alert-soft p-6 text-ink sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <MapPin size={26} weight="duotone" className="mt-0.5 shrink-0 text-alert" />
              <p className="text-[16px] leading-relaxed">
                <strong className="font-semibold">Endereço atual:</strong> {site.address.street}, {site.address.label}, {site.address.city}.
                <br className="hidden sm:block" /> Estamos de mudança: confirme pelo WhatsApp antes de ir.
              </p>
            </div>
            <a
              href={site.address.maps}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-surface px-5 text-[14px] font-semibold ring-1 ring-line"
            >
              Abrir no mapa
            </a>
          </div>
        </Reveal>
      </div>

      <footer className="mt-20 border-t border-line">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between md:px-8">
          <Logo />
          <p className="text-[14px] text-mute">
            Confeitaria em Campos dos Goytacazes desde {site.since}. © {new Date().getFullYear()} {site.name}.
          </p>
        </div>
      </footer>
    </section>
  );
}
