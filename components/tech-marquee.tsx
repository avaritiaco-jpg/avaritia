import {
  siCloudflare,
  siFigma,
  siGoogleanalytics,
  siNextdotjs,
  siNodedotjs,
  siReact,
  siShopify,
  siSupabase,
  siTailwindcss,
  siTypescript,
  siVercel,
  siWordpress,
} from "simple-icons";
import { container } from "@/components/ui";

const logos = [
  siNextdotjs,
  siReact,
  siTypescript,
  siTailwindcss,
  siFigma,
  siWordpress,
  siShopify,
  siVercel,
  siNodedotjs,
  siSupabase,
  siCloudflare,
  siGoogleanalytics,
];

export function TechMarquee() {
  return (
    <section aria-labelledby="tecnologias" className="border-y border-line bg-ink-2/60">
      <div className={`${container} flex flex-col gap-6 py-9 md:flex-row md:items-center md:gap-12`}>
        <p id="tecnologias" className="shrink-0 text-sm leading-snug text-mute md:max-w-[13rem]">
          Tecnologias que usamos para entregar sites rápidos e seguros
        </p>
        <div className="marquee relative min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
          <ul className="marquee-track flex w-max items-center gap-12 pr-12">
            {[...logos, ...logos].map((logo, i) => (
              <li
                key={`${logo.slug}-${i}`}
                aria-hidden={i >= logos.length}
                className="flex items-center gap-3 text-paper/55 transition-colors duration-300 hover:text-paper"
              >
                <svg viewBox="0 0 24 24" className="size-6 fill-current" role="img" aria-label={logo.title}>
                  <path d={logo.path} />
                </svg>
                <span className="whitespace-nowrap text-[15px] font-medium tracking-tight">{logo.title}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
