"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Check, CheckCircle, Envelope, InstagramLogo, WhatsappLogo } from "@phosphor-icons/react";
import { container } from "@/components/ui";
import { projectTypes, site, whatsappLink } from "@/lib/site";

type Errors = Partial<Record<"name" | "phone" | "type", string>>;

const perks = [
  "Orçamento sem compromisso",
  "Resposta em até 1 dia útil",
  "Prazo e valor fechados antes de começar",
];

function maskPhone(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

const field =
  "h-14 w-full rounded-2xl border bg-ink px-5 text-[16px] text-paper placeholder:text-faint transition-[border-color,box-shadow] duration-300 focus:outline-none focus:ring-4 focus:ring-gold/15";

export function Contact() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [sentLink, setSentLink] = useState<string | null>(null);

  function validate(): Errors {
    const e: Errors = {};
    if (name.trim().length < 2) e.name = "Conte como podemos chamar você.";
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) e.phone = "Informe um WhatsApp com DDD, por exemplo (11) 91234-5678.";
    if (!type) e.type = "Escolha o tipo de projeto, mesmo que seja “Ainda não sei”.";
    return e;
  }

  function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      const first = Object.keys(e)[0];
      document.getElementById(`campo-${first}`)?.focus();
      return;
    }
    const lines = [
      "Olá, Avaritia! Vim pelo site e quero um orçamento.",
      "",
      `Nome: ${name.trim()}`,
      `WhatsApp: ${phone}`,
      `Projeto: ${type}`,
    ];
    if (message.trim()) lines.push(`Sobre o projeto: ${message.trim()}`);
    const text = lines.join("\n");
    const link = whatsappLink(text);
    window.open(link, "_blank", "noopener,noreferrer");
    setSentLink(link);
  }

  return (
    <section id="contato" className="scroll-mt-20 py-20 md:py-32">
      <div className={container}>
        <div className="relative isolate overflow-hidden rounded-[2rem] border border-line bg-ink-2 px-6 py-12 md:px-12 md:py-16 lg:px-16 lg:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_70%_at_0%_0%,rgb(233_180_76/0.16),transparent_65%)]"
          />
          <div className="grid gap-14 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
            <div className="flex flex-col">
              <h2 className="text-[clamp(2.5rem,5.2vw,4.6rem)] font-semibold leading-[0.98] tracking-[-0.05em] text-balance text-paper">
                Vamos tirar seu site do <span className="text-gold">papel?</span>
              </h2>
              <p className="mt-6 max-w-[40ch] text-lg leading-relaxed text-mute">
                Conte um pouco sobre o projeto. A gente responde pelo WhatsApp com os próximos passos.
              </p>
              <ul className="mt-10 space-y-4">
                {perks.map((p) => (
                  <li key={p} className="flex items-center gap-3 text-paper">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-gold text-ink">
                      <Check size={13} weight="bold" />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
              <div className="mt-12 lg:mt-auto lg:pt-12">
                <div className="flex flex-wrap gap-x-8 gap-y-4 border-t border-line pt-8 text-mute">
                  <a href={`mailto:${site.email}`} className="inline-flex items-center gap-2 transition-colors hover:text-paper">
                    <Envelope size={20} />
                    {site.email}
                  </a>
                  <a
                    href={site.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 transition-colors hover:text-paper"
                  >
                    <InstagramLogo size={20} />
                    {site.instagramHandle}
                  </a>
                </div>
              </div>
            </div>

            <div className="relative">
              <AnimatePresence mode="wait" initial={false}>
                {sentLink ? (
                  <motion.div
                    key="ok"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="flex h-full flex-col items-start justify-center rounded-3xl border border-line bg-ink p-8 md:p-10"
                    role="status"
                  >
                    <CheckCircle size={44} weight="fill" className="text-gold" />
                    <h3 className="mt-6 text-3xl font-semibold tracking-[-0.04em] text-paper">Mensagem pronta!</h3>
                    <p className="mt-4 max-w-[40ch] text-lg leading-relaxed text-mute">
                      Abrimos o WhatsApp com os seus dados preenchidos. É só tocar em enviar que a gente continua a
                      conversa por lá.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                      <a
                        href={sentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-12 items-center gap-2 rounded-full bg-gold px-6 text-[15px] font-semibold text-ink transition-colors hover:bg-gold-soft"
                      >
                        <WhatsappLogo size={20} weight="fill" />
                        Abrir o WhatsApp de novo
                      </a>
                      <button
                        type="button"
                        onClick={() => setSentLink(null)}
                        className="inline-flex h-12 items-center rounded-full border border-line-strong px-6 text-[15px] text-paper transition-colors hover:border-paper/35"
                      >
                        Editar dados
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    noValidate
                    onSubmit={onSubmit}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid gap-6"
                    aria-label="Pedido de orçamento"
                  >
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <label htmlFor="campo-name" className="text-sm font-medium text-paper">
                          Seu nome
                        </label>
                        <input
                          id="campo-name"
                          name="name"
                          autoComplete="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          aria-invalid={!!errors.name}
                          aria-describedby={errors.name ? "erro-name" : undefined}
                          className={`${field} ${errors.name ? "border-[#e8806a]" : "border-line-strong focus:border-gold"}`}
                        />
                        {errors.name && (
                          <p id="erro-name" className="text-sm text-[#f0a08e]">
                            {errors.name}
                          </p>
                        )}
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="campo-phone" className="text-sm font-medium text-paper">
                          WhatsApp
                        </label>
                        <input
                          id="campo-phone"
                          name="phone"
                          type="tel"
                          inputMode="numeric"
                          autoComplete="tel-national"
                          placeholder="(11) 91234-5678"
                          value={phone}
                          onChange={(e) => setPhone(maskPhone(e.target.value))}
                          aria-invalid={!!errors.phone}
                          aria-describedby={errors.phone ? "erro-phone" : undefined}
                          className={`${field} ${errors.phone ? "border-[#e8806a]" : "border-line-strong focus:border-gold"}`}
                        />
                        {errors.phone && (
                          <p id="erro-phone" className="text-sm text-[#f0a08e]">
                            {errors.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    <fieldset className="grid gap-3" aria-describedby={errors.type ? "erro-type" : undefined}>
                      <legend className="mb-3 text-sm font-medium text-paper">Tipo de projeto</legend>
                      <div className="flex flex-wrap gap-2">
                        {projectTypes.map((opt, i) => (
                          <label key={opt} className="cursor-pointer">
                            <input
                              id={i === 0 ? "campo-type" : undefined}
                              type="radio"
                              name="type"
                              value={opt}
                              checked={type === opt}
                              onChange={() => setType(opt)}
                              className="peer sr-only"
                            />
                            <span className="inline-flex h-11 items-center rounded-full border border-line-strong bg-ink px-5 text-[15px] text-mute transition-colors duration-300 hover:border-paper/30 hover:text-paper peer-checked:border-gold peer-checked:bg-gold peer-checked:text-ink peer-focus-visible:ring-2 peer-focus-visible:ring-gold peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-ink-2">
                              {opt}
                            </span>
                          </label>
                        ))}
                      </div>
                      {errors.type && (
                        <p id="erro-type" className="text-sm text-[#f0a08e]">
                          {errors.type}
                        </p>
                      )}
                    </fieldset>

                    <div className="grid gap-2">
                      <label htmlFor="campo-message" className="text-sm font-medium text-paper">
                        Conte sobre o projeto <span className="font-normal text-mute">(opcional)</span>
                      </label>
                      <textarea
                        id="campo-message"
                        name="message"
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Ex.: preciso de um site para a minha clínica, com agendamento online."
                        className={`${field} h-auto resize-none border-line-strong py-4 leading-relaxed focus:border-gold`}
                      />
                      <p className="text-sm text-mute">Ao enviar, abrimos o WhatsApp com a mensagem pronta.</p>
                    </div>

                    <button
                      type="submit"
                      className="group inline-flex h-14 w-full items-center justify-between gap-4 rounded-full bg-gold pl-7 pr-2 text-[15px] font-semibold text-ink transition-[background-color,transform] duration-300 ease-out-expo hover:bg-gold-soft active:scale-[0.98] sm:w-auto sm:justify-self-start"
                    >
                      {site.cta}
                      <span className="grid size-10 place-items-center rounded-full bg-ink text-gold transition-transform duration-500 ease-out-expo group-hover:rotate-45">
                        <ArrowUpRight size={18} weight="bold" />
                      </span>
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
