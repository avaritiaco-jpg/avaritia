import { ArrowUp, Envelope, InstagramLogo, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { Logo } from "@/components/logo";
import { container } from "@/components/ui";
import { nav, site, whatsappLink } from "@/lib/site";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden border-t border-line pt-20">
      <div className={`${container} grid gap-12 md:grid-cols-12`}>
        <div className="md:col-span-5">
          <Logo />
          <p className="mt-5 max-w-[30ch] text-lg leading-relaxed text-mute">
            Sites feitos para quem quer mais. Design, código e suporte em um só lugar.
          </p>
        </div>
        <nav aria-label="Rodapé" className="md:col-span-3 md:col-start-7">
          <p className="text-sm font-medium text-paper">Navegação</p>
          <ul className="mt-5 space-y-3">
            {nav.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="text-mute transition-colors hover:text-paper">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="md:col-span-3">
          <p className="text-sm font-medium text-paper">Contato</p>
          <ul className="mt-5 space-y-3">
            <li>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-mute transition-colors hover:text-paper"
              >
                <WhatsappLogo size={18} /> WhatsApp
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="inline-flex items-center gap-2 text-mute transition-colors hover:text-paper">
                <Envelope size={18} /> {site.email}
              </a>
            </li>
            <li>
              <a
                href={site.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-mute transition-colors hover:text-paper"
              >
                <InstagramLogo size={18} /> {site.instagramHandle}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <p
        aria-hidden
        className="pointer-events-none mt-16 select-none text-center text-[23vw] font-semibold leading-[0.8] tracking-[-0.07em] text-ink-3 md:mt-20"
      >
        avaritia
      </p>

      <div className="relative border-t border-line">
        <div className={`${container} flex flex-col gap-4 py-7 text-sm text-mute sm:flex-row sm:items-center sm:justify-between`}>
          <p>© {year} Avaritia. Todos os direitos reservados.</p>
          <a href="#top" className="inline-flex items-center gap-2 transition-colors hover:text-paper">
            Voltar ao topo <ArrowUp size={16} />
          </a>
        </div>
      </div>
    </footer>
  );
}
