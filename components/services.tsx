import {
  Browser,
  Check,
  Gauge,
  Lifebuoy,
  PuzzlePiece,
  Storefront,
  Target,
} from "@phosphor-icons/react/dist/ssr";
import { siGoogleanalytics, siGooglesheets, siHubspot, siMercadopago, siStripe, siWhatsapp } from "simple-icons";
import { Reveal, SpotlightCard } from "@/components/reveal";
import { ScoreRing } from "@/components/score-ring";
import { BrowserFrame, PhoneFrame, container, h2 } from "@/components/ui";

const cell =
  "overflow-hidden rounded-3xl border border-line bg-ink-2 p-7 md:p-8 shadow-[inset_0_1px_0_rgb(243_241_236/0.04)]";

function CellHead({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="relative z-10">
      <span className="grid size-11 place-items-center rounded-full border border-gold/25 bg-gold/10 text-gold">
        {icon}
      </span>
      <h3 className="mt-6 text-2xl font-semibold tracking-[-0.035em] text-paper md:text-[1.7rem]">{title}</h3>
      <p className="mt-3 max-w-[38ch] leading-relaxed text-mute">{text}</p>
    </div>
  );
}

const integrations = [siWhatsapp, siMercadopago, siGooglesheets, siStripe, siHubspot, siGoogleanalytics];
const support = ["Hospedagem e domínio", "Backups e segurança", "Ajustes de conteúdo", "Suporte no WhatsApp"];

export function Services() {
  return (
    <section id="servicos" className="scroll-mt-20 py-20 md:py-28">
      <div className={container}>
        <Reveal className="max-w-3xl">
          <h2 className={h2}>Tudo para a sua empresa vender online.</h2>
          <p className="mt-6 max-w-[56ch] text-lg leading-relaxed text-mute">
            Do site institucional ao sistema sob medida, cuidamos do design, do código e de tudo o que vem depois
            da entrega.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-4 md:mt-20 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-[minmax(300px,auto)_minmax(300px,auto)_auto]">
          {/* Sites institucionais: destaque 2x2 */}
          <SpotlightCard className={`${cell} group relative min-h-[460px] md:col-span-2 lg:row-span-2 lg:min-h-0`}>
            <CellHead
              icon={<Browser size={22} />}
              title="Sites institucionais"
              text="Apresente sua empresa com um site profissional, rápido e fácil de atualizar, que passa confiança logo no primeiro clique."
            />
            <div className="absolute -bottom-6 -right-10 w-[88%] transition-transform duration-700 ease-out-expo group-hover:-translate-y-2 md:-right-14">
              <BrowserFrame
                src="/projects/lumiere-desktop.webp"
                alt="Exemplo de site institucional para clínica odontológica"
                domain="lumiereodonto.com.br"
                sizes="(min-width: 1024px) 40vw, 90vw"
              />
            </div>
          </SpotlightCard>

          {/* Landing pages */}
          <SpotlightCard
            delay={0.08}
            className={`${cell} bg-[linear-gradient(150deg,rgb(233_180_76/0.2),rgb(233_180_76/0.03)_55%,transparent)]`}
          >
            <CellHead
              icon={<Target size={22} />}
              title="Landing pages"
              text="Páginas de alta conversão para campanhas, lançamentos e anúncios no Google e no Instagram."
            />
          </SpotlightCard>

          {/* Lojas virtuais: alta */}
          <SpotlightCard delay={0.16} className={`${cell} group relative min-h-[520px] lg:row-span-2 lg:min-h-0`}>
            <CellHead
              icon={<Storefront size={22} />}
              title="Lojas virtuais"
              text="Catálogo, carrinho, frete e pagamento por Pix e cartão, prontos para vender."
            />
            <div className="absolute -bottom-24 left-1/2 w-[62%] max-w-[240px] -translate-x-1/2 transition-transform duration-700 ease-out-expo group-hover:-translate-y-3">
              <PhoneFrame src="/projects/verde-mobile.webp" alt="Exemplo de loja virtual de cosméticos no celular" />
            </div>
          </SpotlightCard>

          {/* Performance e SEO */}
          <SpotlightCard delay={0.1} className={`${cell} flex flex-col md:col-span-2 lg:col-span-1`}>
            <div className="flex items-start justify-between gap-4">
              <span className="grid size-11 place-items-center rounded-full border border-gold/25 bg-gold/10 text-gold">
                <Gauge size={22} />
              </span>
              <ScoreRing />
            </div>
            <h3 className="mt-auto pt-6 text-2xl font-semibold tracking-[-0.035em] text-paper md:text-[1.7rem]">
              Performance e SEO
            </h3>
            <p className="mt-3 leading-relaxed text-mute">
              Buscamos nota máxima no Google PageSpeed para o seu site carregar rápido e aparecer nas buscas.
            </p>
          </SpotlightCard>

          {/* Sistemas sob medida */}
          <SpotlightCard
            delay={0.05}
            className={`${cell} grid gap-8 md:col-span-2 md:grid-cols-[1.2fr_1fr] md:items-center`}
          >
            <CellHead
              icon={<PuzzlePiece size={22} />}
              title="Sistemas sob medida"
              text="Áreas de cliente, agendamentos, painéis e integrações com as ferramentas que você já usa."
            />
            <ul className="grid grid-cols-3 gap-3" aria-label="Exemplos de integrações">
              {integrations.map((logo) => (
                <li
                  key={logo.slug}
                  className="grid aspect-square place-items-center rounded-2xl border border-line bg-ink-3 text-paper/70 transition-colors duration-300 hover:text-paper"
                >
                  <svg viewBox="0 0 24 24" className="size-7 fill-current" role="img" aria-label={logo.title}>
                    <path d={logo.path} />
                  </svg>
                </li>
              ))}
            </ul>
          </SpotlightCard>

          {/* Manutenção e suporte */}
          <SpotlightCard delay={0.12} className={`${cell} dot-grid relative md:col-span-2`}>
            <div className="grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-end">
              <CellHead
                icon={<Lifebuoy size={22} />}
                title="Manutenção e suporte"
                text="Seu site sempre no ar, atualizado e seguro, com gente de verdade cuidando dele."
              />
              <ul className="relative z-10 space-y-3">
                {support.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-[15px] text-paper">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-gold text-ink">
                      <Check size={13} weight="bold" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </SpotlightCard>
        </div>
      </div>
    </section>
  );
}
