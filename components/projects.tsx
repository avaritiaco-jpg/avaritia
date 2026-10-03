"use client";

import { useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { container, h2 } from "@/components/ui";
import { projects, type Project } from "@/lib/site";

const query = "(min-width: 1024px)";
function useIsDesktop() {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

function Heading({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <h2 className={h2}>Trabalho que fala por si.</h2>
      <p className="mt-6 max-w-[40ch] text-lg leading-relaxed text-mute">
        Cada site é desenhado do zero para o negócio, o público e o jeito de vender de cada cliente.
      </p>
    </div>
  );
}

export function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const isDesktop = useIsDesktop();
  const pinned = isDesktop && !reduce;
  const [distance, setDistance] = useState(0);

  // Rolagem vertical vira deslocamento horizontal enquanto a seção está fixada.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);

  useLayoutEffect(() => {
    if (!pinned || !trackRef.current) return;
    const el = trackRef.current;
    const measure = () => setDistance(Math.max(0, el.scrollWidth - window.innerWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [pinned]);

  return (
    <section
      id="projetos"
      ref={sectionRef}
      aria-label="Projetos"
      className="relative scroll-mt-0"
      style={pinned ? { height: `calc(100dvh + ${distance}px)` } : undefined}
    >
      <div className={pinned ? "sticky top-0 flex h-[100dvh] flex-col justify-center overflow-hidden" : "py-20 md:py-28"}>
        {!pinned && <Heading className={`${container} mb-12`} />}

        <motion.div
          ref={trackRef}
          style={pinned ? { x } : undefined}
          className={
            pinned
              ? "flex w-max items-center gap-10 pl-[max(2rem,calc((100vw-1320px)/2+2rem))] pr-[8vw] pt-10"
              : "no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-5 px-5 pb-4 md:scroll-px-[max(2rem,calc((100vw-1320px)/2+2rem))] md:px-[max(2rem,calc((100vw-1320px)/2+2rem))]"
          }
        >
          {pinned && <Heading className="w-[400px] shrink-0 self-center xl:w-[440px]" />}
          {projects.map((p, i) => (
            <ProjectCard key={p.name} project={p} index={i} />
          ))}
        </motion.div>

        {pinned && (
          <div className={`${container} mt-10`} aria-hidden>
            <div className="h-px w-full overflow-hidden">
              <motion.div style={{ scaleX: scrollYProgress }} className="h-px origin-left bg-gold" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function ProjectCard({ project: p, index }: { project: Project; index: number }) {
  const Wrapper = p.url ? "a" : "div";
  const linkProps = p.url ? { href: p.url, target: "_blank", rel: "noopener noreferrer" } : {};
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.9, delay: (index % 3) * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="w-[84vw] shrink-0 snap-start sm:w-[70vw] lg:w-[min(62vw,760px)]"
    >
      <Wrapper {...linkProps} className="group block">
        <div className="relative overflow-hidden rounded-3xl border border-line bg-ink-3">
          <Image
            src={p.image}
            alt={`Página inicial do projeto ${p.name}`}
            width={1800}
            height={1125}
            sizes="(min-width: 1024px) 760px, 84vw"
            className="block aspect-[16/10] h-auto w-full object-cover object-top transition-transform duration-[1.2s] ease-out-expo group-hover:scale-[1.03]"
          />
          <div className="absolute bottom-4 right-4 w-[18%] min-w-[64px] overflow-hidden rounded-[0.9rem] border-[3px] border-[#22211e] shadow-[0_20px_40px_-12px_rgb(0_0_0/0.8)] transition-transform duration-700 ease-out-expo group-hover:-translate-y-2 md:bottom-6 md:right-6 md:rounded-[1.2rem] md:border-4">
            <Image
              src={p.mobile}
              alt={`Versão para celular do projeto ${p.name}`}
              width={780}
              height={1688}
              sizes="140px"
              className="block aspect-[390/760] h-auto w-full object-cover object-top"
            />
          </div>
        </div>
        <div className="mt-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="flex items-center gap-2 text-xl font-semibold tracking-[-0.03em] text-paper md:text-2xl">
              {p.name}
              {p.url && (
                <ArrowUpRight
                  size={18}
                  className="text-gold transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              )}
            </h3>
            <p className="mt-1 text-mute">
              {p.segment} · {p.type}
            </p>
          </div>
          {p.concept && (
            <span className="mt-1 shrink-0 whitespace-nowrap rounded-full border border-line-strong px-3 py-1 text-xs text-mute">
              Projeto conceito
            </span>
          )}
        </div>
      </Wrapper>
    </motion.article>
  );
}
