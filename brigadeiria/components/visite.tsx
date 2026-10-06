"use client";

import { AnimatePresence, animate, motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Clock, InstagramLogo, MapPin, NavigationArrow, Phone, Plus } from "@phosphor-icons/react/dist/ssr";
import { faq, site } from "@/lib/site";
import { EASE_OUT, GhostButton, Reveal, RiseTitle, useReducedMotion } from "./ui";

/** Aberto ou fechado agora, no horário de Brasília */
function useOpenNow() {
  const [state, setState] = useState<null | { open: boolean; text: string }>(null);
  useEffect(() => {
    const check = () => {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Sao_Paulo",
        weekday: "short",
        hour: "numeric",
        minute: "numeric",
        hourCycle: "h23",
      }).formatToParts(new Date());
      const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
      const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
      const mins = Number(get("hour")) * 60 + Number(get("minute"));
      const { days, open, close } = site.hours;
      const isOpen = days.includes(day) && mins >= open && mins < close;
      const fmt = (m: number) => `${Math.floor(m / 60)}h${m % 60 ? String(m % 60).padStart(2, "0") : ""}`;
      if (isOpen) setState({ open: true, text: `Aberto agora, até as ${fmt(close)}` });
      else if (days.includes(day) && mins < open) setState({ open: false, text: `Fechado agora. Abre hoje às ${fmt(open)}` });
      else {
        let d = (day + 1) % 7;
        while (!days.includes(d)) d = (d + 1) % 7;
        const name = d === (day + 1) % 7 ? "amanhã" : ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"][d];
        setState({ open: false, text: `Fechado agora. Abre ${name} às ${fmt(open)}` });
      }
    };
    check();
    const t = setInterval(check, 60_000);
    return () => clearInterval(t);
  }, []);
  return state;
}

function Count({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.8 });
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!inView || !ref.current) return;
    if (reduce) {
      ref.current.textContent = `${to}${suffix}`;
      return;
    }
    const from = to > 1000 ? to - 40 : 0;
    const c = animate(from, to, {
      duration: 1.6,
      ease: EASE_OUT,
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = `${Math.round(v)}${suffix}`;
      },
    });
    return () => c.stop();
  }, [inView, to, suffix, reduce]);
  return (
    <span ref={ref} className="tabular-nums">
      {to}
      {suffix}
    </span>
  );
}

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-line border-y border-line">
      {faq.map((f, i) => {
        const on = open === i;
        return (
          <div key={f.q}>
            <h3>
              <button
                type="button"
                aria-expanded={on}
                aria-controls={`faq-${i}`}
                onClick={() => setOpen(on ? null : i)}
                className="flex w-full items-center justify-between gap-4 py-5 text-left font-display text-[1.2rem] font-semibold tracking-tight"
              >
                {f.q}
                <motion.span animate={{ rotate: on ? 45 : 0 }} transition={{ type: "spring", stiffness: 400, damping: 22 }} className="shrink-0">
                  <Plus size={20} weight="bold" />
                </motion.span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {on && (
                <motion.div
                  id={`faq-${i}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: EASE_OUT }}
                  className="overflow-hidden"
                >
                  <p className="max-w-[52ch] pb-5 text-[16px] leading-relaxed text-ink-2">{f.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

export function Visite() {
  const status = useOpenNow();
  const year = new Date().getFullYear();
  return (
    <section id="visite" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-[1320px] px-4 md:px-8">
        <div className="grid gap-14 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <div>
            <RiseTitle
              text="Passa aqui no centro"
              className="font-display text-[clamp(2.4rem,5.4vw,4.6rem)] leading-[1] font-extrabold tracking-[-0.035em]"
            />

            <div className="mt-6 h-10">
              <AnimatePresence>
                {status && (
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2.5 rounded-full bg-surface px-4 py-2 text-[14px] font-semibold ring-1 ring-line"
                  >
                    <span className="relative flex size-2.5">
                      {status.open && <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500 opacity-60 motion-reduce:hidden" />}
                      <span className={`relative size-2.5 rounded-full ${status.open ? "bg-emerald-500" : "bg-mute"}`} />
                    </span>
                    {status.text}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <Reveal delay={0.1}>
              <dl className="mt-8 grid gap-6 text-[17px] sm:grid-cols-2">
                <div className="flex gap-3">
                  <MapPin size={24} weight="duotone" className="mt-0.5 shrink-0 text-accent" />
                  <div>
                    <dt className="sr-only">Endereço</dt>
                    <dd className="leading-snug">
                      {site.address.street}
                      <br />
                      {site.address.district}, {site.address.city} ({site.address.state})
                    </dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Clock size={24} weight="duotone" className="mt-0.5 shrink-0 text-accent" />
                  <div>
                    <dt className="sr-only">Horário</dt>
                    <dd className="leading-snug">{site.hours.label}</dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Phone size={24} weight="duotone" className="mt-0.5 shrink-0 text-accent" />
                  <div>
                    <dt className="sr-only">Telefone</dt>
                    <dd>
                      <a href={`tel:+${site.phone}`} className="underline decoration-line underline-offset-4 hover:decoration-accent">
                        {site.phoneDisplay}
                      </a>
                    </dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <InstagramLogo size={24} weight="duotone" className="mt-0.5 shrink-0 text-accent" />
                  <div>
                    <dt className="sr-only">Instagram</dt>
                    <dd>
                      <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="underline decoration-line underline-offset-4 hover:decoration-accent">
                        {site.instagramHandle}
                      </a>
                    </dd>
                  </div>
                </div>
              </dl>
            </Reveal>

            <Reveal delay={0.2} className="mt-9 flex flex-wrap gap-3">
              <GhostButton href={site.address.maps}>
                <NavigationArrow size={18} weight="bold" /> Como chegar
              </GhostButton>
              <GhostButton href={site.instagram}>
                <InstagramLogo size={18} weight="bold" /> Ver o Instagram
              </GhostButton>
            </Reveal>

            {/* números reais da casa */}
            <div className="mt-14 grid grid-cols-3 gap-4 border-t border-line pt-8">
              <div>
                <p className="font-display text-[clamp(2rem,4vw,3.2rem)] leading-none font-extrabold tracking-tight">
                  <Count to={site.since} />
                </p>
                <p className="mt-2 text-[14px] text-mute">abrimos as portas</p>
              </div>
              <div>
                <p className="font-display text-[clamp(2rem,4vw,3.2rem)] leading-none font-extrabold tracking-tight">
                  <Count to={40} suffix="+" />
                </p>
                <p className="mt-2 text-[14px] text-mute">sabores de brigadeiro</p>
              </div>
              <div>
                <p className="font-display text-[clamp(2rem,4vw,3.2rem)] leading-none font-extrabold tracking-tight">
                  <Count to={year - site.since} />
                </p>
                <p className="mt-2 text-[14px] text-mute">anos de tacho</p>
              </div>
            </div>
          </div>

          <div className="lg:pt-4">
            <h3 className="mb-4 font-display text-2xl font-bold tracking-tight">Perguntas rápidas</h3>
            <Faq />
          </div>
        </div>
      </div>
    </section>
  );
}
