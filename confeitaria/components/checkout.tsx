"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Basket,
  Check,
  DeviceMobile,
  Money,
  PencilSimple,
  QrCode,
  Storefront,
  WhatsappLogo,
} from "@phosphor-icons/react/dist/ssr";
import { fromKey, isPickupAllowed, longDate } from "@/lib/dates";
import { maskPhone, money } from "@/lib/format";
import { isUnits, lineArt, lineDetail, lineKey, lineTitle, lineTotal, type Line } from "@/lib/menu";
import {
  canPayHere,
  deposit,
  emptyForm,
  hasPicpay,
  hasPix,
  loadForm,
  loadOrder,
  methodLabel,
  newCode,
  orderLink,
  payNow,
  periodLabel,
  picpayLink,
  pickupText,
  pixCode,
  saveForm,
  saveOrder,
  validate,
  type Errors,
  type Form,
  type Method,
  type Order,
} from "@/lib/order";
import { site } from "@/lib/site";
import { cart, clearCart, openDrawer, selectTotal, useStore, type CartLine } from "@/lib/store";
import { Art } from "./art";
import { PickupCalendar } from "./calendar";
import { CartRow } from "./cart";
import { Options } from "./controls";
import { CopyButton, PixQr } from "./pix";
import { EASE_OUT, PillButton, Price, ScriptTitle, gentle } from "./ui";

/* ---------------------------------------------------------- peças do form */

function Section({
  id,
  step,
  title,
  done,
  children,
}: {
  id: string;
  step: number;
  title: string;
  done: boolean;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-28 rounded-[1.75rem] bg-card p-5 ring-1 ring-line sm:p-7">
      <header className="mb-6 flex items-center gap-3">
        <span
          className={`relative flex size-9 items-center justify-center overflow-hidden rounded-full text-[14px] font-bold transition-colors duration-300 ${
            done ? "bg-rose-deep text-white" : "bg-blush-2 text-cocoa-2"
          }`}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={done ? "ok" : "n"}
              initial={{ opacity: 0, transform: "scale(0.5) rotate(-30deg)" }}
              animate={{ opacity: 1, transform: "scale(1) rotate(0deg)" }}
              exit={{ opacity: 0, transform: "scale(0.5)" }}
              transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
              className="flex"
            >
              {done ? <Check size={16} weight="bold" /> : step}
            </motion.span>
          </AnimatePresence>
        </span>
        <h2 id={`${id}-title`} className="text-xl font-bold text-cocoa">
          {title}
        </h2>
      </header>
      <div className="flex flex-col gap-6">{children}</div>
    </section>
  );
}

function ErrorText({ id, error }: { id: string; error?: string }) {
  return (
    <AnimatePresence initial={false}>
      {error ? (
        <motion.p
          id={id}
          role="alert"
          className="overflow-hidden text-[13px] font-semibold text-danger"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2, ease: EASE_OUT }}
        >
          <span className="block pt-1.5">{error}</span>
        </motion.p>
      ) : null}
    </AnimatePresence>
  );
}

function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[14px] font-bold text-cocoa-2">
        {label}
      </label>
      {children}
      {hint && !error ? <p className="text-[13px] font-medium text-mute">{hint}</p> : null}
      <ErrorText id={`${id}-erro`} error={error} />
    </div>
  );
}

const inputCls = (error?: string) =>
  `h-12 w-full rounded-full bg-white px-5 text-[16px] font-semibold text-cocoa ring-1 outline-none transition-shadow duration-200 placeholder:font-medium placeholder:text-mute/80 focus:ring-2 focus:ring-rose-deep ${
    error ? "ring-danger/70" : "ring-line-strong"
  }`;

const methods: { id: Method; title: string; hint: () => string; icon: React.ReactNode }[] = [
  {
    id: "pix",
    title: "Pix",
    hint: () => (hasPix() ? "QR Code ou copia e cola" : "Chave enviada no WhatsApp"),
    icon: <QrCode size={22} weight="duotone" />,
  },
  {
    id: "picpay",
    title: "PicPay",
    hint: () => (hasPicpay() ? "Link com o valor certinho" : "Dados enviados no WhatsApp"),
    icon: <DeviceMobile size={22} weight="duotone" />,
  },
  {
    id: "dinheiro",
    title: "Dinheiro",
    hint: () => "Pago pessoalmente",
    icon: <Money size={22} weight="duotone" />,
  },
];

function MethodPicker({ value, onChange, error }: { value: Form["method"]; onChange: (m: Method) => void; error?: string }) {
  const reduce = useReducedMotion();
  return (
    <fieldset aria-describedby={error ? "metodo-erro" : undefined}>
      <legend className="mb-2.5 text-[14px] font-bold text-cocoa-2">Forma de pagamento</legend>
      <div className="grid gap-2 sm:grid-cols-3">
        {methods.map((m) => {
          const checked = value === m.id;
          return (
            <label key={m.id} className="relative cursor-pointer select-none">
              <input
                type="radio"
                name="metodo"
                value={m.id}
                checked={checked}
                onChange={() => onChange(m.id)}
                className="peer sr-only"
              />
              <span
                className={`relative flex h-full items-center gap-3 rounded-[1.2rem] px-4 py-3.5 ring-1 transition-colors duration-200 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-rose-deep sm:flex-col sm:items-start sm:gap-2 ${
                  checked ? "bg-white ring-transparent" : `bg-white/60 hover:bg-white ${error ? "ring-danger/60" : "ring-line"}`
                }`}
              >
                {checked && (
                  <motion.span
                    layoutId="method-ring"
                    className="absolute inset-0 rounded-[1.2rem] ring-2 ring-rose-deep"
                    transition={reduce ? { duration: 0 } : { type: "spring", duration: 0.4, bounce: 0.15 }}
                  />
                )}
                <span className={`relative transition-colors ${checked ? "text-rose-deep" : "text-cocoa-2"}`}>{m.icon}</span>
                <span className="relative">
                  <span className="block text-[15px] font-bold text-cocoa">{m.title}</span>
                  <span className="block text-[13px] font-medium text-mute">{m.hint()}</span>
                </span>
              </span>
            </label>
          );
        })}
      </div>
      <ErrorText id="metodo-erro" error={error} />
    </fieldset>
  );
}

/* --------------------------------------------------------- resumo lateral */

function Totals({ total, pay, method }: { total: number; pay: Form["pay"]; method: Form["method"] }) {
  const now = method === "dinheiro" || pay === "sinal" ? deposit(total) : total;
  return (
    <dl className="flex flex-col gap-2 text-[14px] font-semibold">
      <div className="flex items-baseline justify-between">
        <dt className="text-cocoa-2">Total do pedido</dt>
        <dd>
          <Price value={total} className="text-xl font-bold text-cocoa" />
        </dd>
      </div>
      <div className="flex items-baseline justify-between text-rose-ink">
        <dt>{pay === "total" && method !== "dinheiro" ? "A pagar agora" : `Sinal de ${site.deposit * 100}% agora`}</dt>
        <dd>
          <Price value={now} className="font-bold" />
        </dd>
      </div>
      <div className="flex items-baseline justify-between text-mute">
        <dt>Na retirada</dt>
        <dd>
          <Price value={Math.max(0, total - now)} />
        </dd>
      </div>
    </dl>
  );
}

function Summary({
  lines,
  total,
  form,
  submitting,
}: {
  lines: CartLine[];
  total: number;
  form: Form;
  submitting: boolean;
}) {
  return (
    <div className="rounded-[1.75rem] bg-card p-5 ring-1 ring-line sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-cocoa">Seu pedido</h2>
        <button
          type="button"
          onClick={openDrawer}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-bold text-rose-ink transition-colors hover:bg-blush-2"
        >
          <PencilSimple size={14} weight="bold" /> Editar
        </button>
      </div>
      <ul data-lenis-prevent className="mt-2 max-h-[38vh] divide-y divide-line overflow-y-auto overscroll-contain pr-1">
        {lines.map((l) => (
          <li key={l.key}>
            <CartRow line={l} compact />
          </li>
        ))}
      </ul>
      <div className="mt-2 border-t border-line pt-4">
        <Totals total={total} pay={form.pay} method={form.method} />
      </div>
      <PillButton
        type="submit"
        form="checkout"
        variant="rose"
        className="mt-5 w-full"
        disabled={submitting}
        icon={<Check size={18} weight="bold" />}
      >
        Confirmar encomenda
      </PillButton>
      <p className="mt-3 text-center text-[13px] font-medium leading-relaxed text-mute">
        Na próxima tela você paga o sinal e envia o pedido pelo WhatsApp.
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------- form */

function CheckoutForm({ lines, total, onConfirm }: { lines: CartLine[]; total: number; onConfirm: (o: Order) => void }) {
  const [form, setForm] = useState<Form>(emptyForm);
  const [tried, setTried] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    setForm(loadForm());
    loaded.current = true;
  }, []);
  useEffect(() => {
    if (loaded.current) saveForm(form);
  }, [form]);

  const allowed = (key: string) => {
    const d = fromKey(key);
    return Boolean(d && isPickupAllowed(d));
  };
  const all = validate(form, allowed);
  const errors: Errors = tried ? all : {};
  const set = (patch: Partial<Form>) => setForm((f) => ({ ...f, ...patch }));

  const done = {
    dados: !all.name && !all.phone,
    retirada: !all.date,
    pagamento: !all.method,
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    const errs = validate(form, allowed);
    const first = (["name", "phone", "date", "method"] as const).find((k) => errs[k]);
    if (first) {
      const target = { name: "nome", phone: "whatsapp", date: "retirada", method: "pagamento" }[first];
      const el = document.getElementById(target);
      el?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
      if (el instanceof HTMLInputElement) el.focus({ preventScroll: true });
      return;
    }
    setSubmitting(true);
    onConfirm({
      code: newCode(),
      form: { ...form, method: form.method as Method },
      lines: lines.map(({ productId, sel, qty }) => ({ productId, sel, qty })),
      total,
      sent: false,
    });
  };

  const selectedDate = form.date ? fromKey(form.date) : null;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-28 md:px-8 md:pt-32">
      <ScriptTitle as="h1" text="Finalizar encomenda" play className="text-[clamp(2.8rem,6vw,4.6rem)]" />
      {/* progresso: cada etapa ganha um ✓ quando está completa */}
      <ol className="mt-4 flex flex-wrap gap-2" aria-label="Etapas">
        {(
          [
            ["dados", "Seus dados"],
            ["retirada", "Retirada"],
            ["pagamento", "Pagamento"],
          ] as const
        ).map(([k, label]) => (
          <li
            key={k}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-bold transition-colors duration-300 ${
              done[k] ? "bg-rose-deep text-white" : "bg-card text-cocoa-2 ring-1 ring-line"
            }`}
          >
            {done[k] ? <Check size={13} weight="bold" /> : null}
            {label}
          </li>
        ))}
      </ol>

      <div className="mt-8 grid gap-6 lg:grid-cols-12 lg:items-start">
        <form id="checkout" noValidate onSubmit={submit} className="flex flex-col gap-5 lg:col-span-7">
          <Section id="dados" step={1} title="Seus dados" done={done.dados}>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="nome" label="Nome" error={errors.name}>
                <input
                  id="nome"
                  name="nome"
                  autoComplete="name"
                  value={form.name}
                  onChange={(e) => set({ name: e.target.value })}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "nome-erro" : undefined}
                  placeholder="Como podemos te chamar"
                  className={inputCls(errors.name)}
                />
              </Field>
              <Field id="whatsapp" label="WhatsApp" error={errors.phone}>
                <input
                  id="whatsapp"
                  name="whatsapp"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel-national"
                  value={form.phone}
                  onChange={(e) => set({ phone: maskPhone(e.target.value) })}
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={errors.phone ? "whatsapp-erro" : undefined}
                  placeholder="(35) 90000-0000"
                  className={inputCls(errors.phone)}
                />
              </Field>
            </div>
          </Section>

          <Section id="retirada" step={2} title="Retirada" done={done.retirada}>
            <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
              <div>
                <p className="mb-2.5 text-[14px] font-bold text-cocoa-2">Data</p>
                <PickupCalendar
                  value={form.date}
                  onChange={(date) => set({ date })}
                  invalid={Boolean(errors.date)}
                  describedBy={errors.date ? "data-erro" : undefined}
                />
                <ErrorText id="data-erro" error={errors.date} />
              </div>
              <div className="flex flex-col gap-5">
                <div className="rounded-[1.2rem] bg-blush px-4 py-3.5">
                  <p className="text-[13px] font-semibold text-mute">Retirada em</p>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.p
                      key={form.date || "nada"}
                      className="text-[16px] font-bold text-cocoa first-letter:uppercase"
                      initial={{ opacity: 0, transform: "translateY(6px)" }}
                      animate={{ opacity: 1, transform: "translateY(0px)" }}
                      exit={{ opacity: 0, transform: "translateY(-6px)" }}
                      transition={{ duration: 0.2, ease: EASE_OUT }}
                    >
                      {selectedDate ? longDate(selectedDate) : "Escolha no calendário"}
                    </motion.p>
                  </AnimatePresence>
                </div>
                <Options
                  label="Período (opcional)"
                  size="chip"
                  value={form.period || undefined}
                  onChange={(period) => set({ period })}
                  options={[
                    { id: "manha", title: periodLabel.manha },
                    { id: "tarde", title: periodLabel.tarde },
                  ]}
                />
                <ul className="flex flex-col gap-2 text-[13px] font-medium leading-relaxed text-mute">
                  <li>Encomendas com {site.leadDays} dias de antecedência, de terça a sábado.</li>
                  <li>Para domingo, a retirada é no sábado às 16h.</li>
                  <li className="flex gap-2">
                    <Storefront size={16} weight="bold" className="mt-0.5 shrink-0 text-rose-deep" />
                    <span>
                      Bolos confeitados são só para retirada.
                      {site.address ? ` Endereço: ${site.address}.` : " O endereço vai na confirmação."}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </Section>

          <Section id="pagamento" step={3} title="Pagamento" done={done.pagamento}>
            <MethodPicker value={form.method} onChange={(method) => set({ method })} error={errors.method} />
            <AnimatePresence initial={false} mode="wait">
              {form.method === "dinheiro" ? (
                <motion.p
                  key="dinheiro"
                  className="rounded-[1.2rem] bg-blush px-4 py-3.5 text-[14px] font-medium leading-relaxed text-cocoa-2"
                  initial={{ opacity: 0, transform: "translateY(6px)" }}
                  animate={{ opacity: 1, transform: "translateY(0px)" }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, ease: EASE_OUT }}
                >
                  O sinal de <strong className="nums">{money(deposit(total))}</strong> é pago em dinheiro no ato da
                  encomenda, e o restante na retirada.
                </motion.p>
              ) : form.method ? (
                <motion.div
                  key="online"
                  initial={{ opacity: 0, transform: "translateY(6px)" }}
                  animate={{ opacity: 1, transform: "translateY(0px)" }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, ease: EASE_OUT }}
                >
                  <Options
                    label="Quanto pagar agora"
                    value={form.pay}
                    onChange={(pay) => set({ pay })}
                    options={[
                      { id: "sinal", title: `Sinal de ${site.deposit * 100}%`, aside: money(deposit(total)), hint: "O restante na retirada" },
                      { id: "total", title: "Valor total", aside: money(total), hint: "Já fica tudo pago" },
                    ]}
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </Section>

          <section className="rounded-[1.75rem] bg-card p-5 ring-1 ring-line sm:p-7">
            <Field
              id="observacoes"
              label="Observações (opcional)"
              hint="Frase no bolo, topper, alergias ou qualquer detalhe. Mudanças na decoração podem alterar o valor."
            >
              <textarea
                id="observacoes"
                name="observacoes"
                rows={3}
                value={form.notes}
                onChange={(e) => set({ notes: e.target.value })}
                placeholder="Ex.: escrever “Feliz aniversário, Ju” no bolo"
                className="w-full resize-y rounded-[1.2rem] bg-white px-5 py-3.5 text-[16px] font-semibold text-cocoa ring-1 ring-line-strong outline-none transition-shadow placeholder:font-medium placeholder:text-mute/80 focus:ring-2 focus:ring-rose-deep"
              />
            </Field>
          </section>
        </form>

        <aside className="lg:sticky lg:top-24 lg:col-span-5">
          <Summary lines={lines} total={total} form={form} submitting={submitting} />
        </aside>
      </div>
    </div>
  );
}

/* --------------------------------------------------------- confirmação */

const burstColors = ["#a14f5c", "#d9a3a7", "#c9a24f", "#5f4438", "#f0d3d4"];

/** Granulado que estoura em volta do ✓ (só na primeira vez que a tela aparece) */
function Burst() {
  const reduce = useReducedMotion();
  const pieces = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => {
        const angle = (i / 30) * Math.PI * 2 + Math.random() * 0.3;
        const dist = 64 + Math.random() * 70;
        return {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist,
          rot: Math.random() * 360,
          color: burstColors[i % burstColors.length],
          delay: Math.random() * 0.08,
        };
      }),
    [],
  );
  if (reduce) return null;
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          className="absolute left-1/2 top-1/2 -ml-[5px] -mt-[2px] h-1 w-2.5 rounded-full"
          style={{ background: p.color }}
          initial={{ opacity: 1, transform: "translate(0px, 0px) rotate(0deg) scale(0.6)" }}
          animate={{
            opacity: [1, 1, 0],
            transform: `translate(${p.x}px, ${p.y}px) rotate(${p.rot}deg) scale(1)`,
          }}
          transition={{ duration: 0.9, delay: 0.15 + p.delay, ease: EASE_OUT, opacity: { duration: 0.9, times: [0, 0.6, 1] } }}
        />
      ))}
    </div>
  );
}

function PayPanel({ order, step }: { order: Order; step: number }) {
  const m = order.form.method;
  const amount = m === "dinheiro" ? deposit(order.total) : payNow(order);
  const code = useMemo(() => (m === "pix" && hasPix() ? pixCode(order) : ""), [m, order]);

  return (
    <div className="flex h-full flex-col rounded-[1.75rem] bg-card p-6 ring-1 ring-line">
      <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-rose-ink">
        {step}. {m === "dinheiro" ? "Sinal em dinheiro" : `Pague com ${methodLabel[m]}`}
      </p>
      <p className="nums mt-2 text-4xl font-bold text-cocoa">{money(amount)}</p>
      <p className="mt-1 text-[14px] font-medium text-mute">
        {order.form.pay === "total" && m !== "dinheiro" ? "Valor total do pedido" : `Sinal de ${site.deposit * 100}% do pedido`}
      </p>

      {m === "pix" && code ? (
        <div className="mt-5 flex flex-col gap-4">
          <div className="mx-auto w-full max-w-[240px] rounded-[1.4rem] bg-white p-3 ring-1 ring-line">
            <PixQr payload={code} label={`QR Code Pix de ${money(amount)} para ${site.pix.receiver}`} />
          </div>
          <div>
            <p className="mb-1.5 text-[13px] font-bold text-cocoa-2">Pix copia e cola</p>
            <p className="line-clamp-2 break-all rounded-[1rem] bg-blush px-4 py-3 font-mono text-[12px] text-cocoa-2">{code}</p>
          </div>
          <CopyButton text={code} label="Copiar código Pix" />
          <p className="text-[13px] font-medium text-mute">Recebedor: {site.pix.receiver}. Depois de pagar, guarde o comprovante.</p>
        </div>
      ) : m === "picpay" && hasPicpay() ? (
        <div className="mt-5 flex flex-col gap-3">
          <PillButton href={picpayLink(order)} target="_blank" rel="noopener noreferrer" className="w-full" icon={<DeviceMobile size={18} weight="bold" />}>
            Pagar no PicPay
          </PillButton>
          <p className="text-[13px] font-medium text-mute">Abre o PicPay com o valor preenchido. Depois de pagar, guarde o comprovante.</p>
        </div>
      ) : m === "dinheiro" ? (
        <p className="mt-5 text-[15px] font-medium leading-relaxed text-cocoa-2">
          Pague o sinal em dinheiro no ato da encomenda. O restante, {money(order.total - deposit(order.total))}, fica para a
          retirada.
        </p>
      ) : (
        <p className="mt-5 text-[15px] font-medium leading-relaxed text-cocoa-2">
          Assim que receber o seu pedido, a {site.name} responde no WhatsApp com os dados do {methodLabel[m]} para o pagamento.
          Depois é só mandar o comprovante na mesma conversa.
        </p>
      )}
    </div>
  );
}

function SendPanel({ order, step, onSent }: { order: Order; step: number; onSent: () => void }) {
  const online = canPayHere(order);
  return (
    <div className="flex h-full flex-col rounded-[1.75rem] bg-rose p-6">
      <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-cocoa">{step}. Envie o pedido</p>
      <AnimatePresence mode="wait" initial={false}>
        {order.sent ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, transform: "translateY(8px)" }}
            animate={{ opacity: 1, transform: "translateY(0px)" }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            className="mt-3 flex flex-1 flex-col"
          >
            <p className="font-script text-4xl leading-[1.2] text-cocoa">Pedido enviado!</p>
            <p className="mt-2 text-[15px] font-semibold leading-relaxed text-cocoa/80">
              A {site.name} confirma a encomenda por lá. Se o WhatsApp não abriu, toque de novo abaixo.
            </p>
            <a
              href={orderLink(order)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto inline-flex items-center gap-2 self-start pt-5 text-[15px] font-bold text-cocoa underline decoration-2 underline-offset-4"
            >
              <WhatsappLogo size={18} weight="bold" /> Abrir o WhatsApp de novo
            </a>
          </motion.div>
        ) : (
          <motion.div key="send" exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="mt-3 flex flex-1 flex-col">
            <p className="text-[15px] font-semibold leading-relaxed text-cocoa/85">
              A mensagem já vai pronta com os itens, a data e o valor{online ? ". Anexe o comprovante na conversa" : ""}.
              A {site.name} confirma por lá.
            </p>
            <div className="mt-auto pt-6">
              <PillButton
                href={orderLink(order)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onSent}
                className="w-full"
                icon={<WhatsappLogo size={19} weight="bold" />}
              >
                Enviar pelo WhatsApp
              </PillButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Recap({ order }: { order: Order }) {
  const f = order.form;
  const rows: [string, string][] = [
    ["Nome", f.name.trim()],
    ["WhatsApp", f.phone],
    ["Retirada", pickupText(f)],
    ["Pagamento", f.method === "dinheiro" ? "Dinheiro" : `${methodLabel[f.method]}, ${f.pay === "total" ? "valor total" : "sinal de 50%"}`],
    ...(f.notes.trim() ? ([["Observações", f.notes.trim()]] as [string, string][]) : []),
  ];
  return (
    <div className="rounded-[1.75rem] bg-card p-6 ring-1 ring-line">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-xl font-bold text-cocoa">Resumo</h2>
        <p className="nums text-[14px] font-bold text-rose-ink">{order.code}</p>
      </div>
      <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
        {rows.map(([k, v]) => (
          <div key={k} className={k === "Observações" ? "sm:col-span-2" : ""}>
            <dt className="text-[13px] font-semibold text-mute">{k}</dt>
            <dd className="text-[15px] font-bold first-letter:uppercase text-cocoa">{v}</dd>
          </div>
        ))}
      </dl>
      <ul className="mt-5 divide-y divide-line border-t border-line">
        {order.lines.map((l, i) => {
          const art = lineArt(l);
          return (
            <li key={i} className="flex items-center gap-3 py-3">
              <span className="plate relative size-12 shrink-0 overflow-hidden rounded-[0.8rem]">
                {art ? (
                  <span className="absolute inset-[8%]">
                    <Art art={art} />
                  </span>
                ) : null}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-bold text-cocoa">
                  {isUnits(l) ? `${l.qty} un.` : `${l.qty}×`} {lineTitle(l)}
                </span>
                <span className="block text-[13px] font-medium text-mute">{lineDetail(l)}</span>
              </span>
              <span className="nums text-[14px] font-bold text-cocoa">{money(lineTotal(l))}</span>
            </li>
          );
        })}
      </ul>
      <div className="border-t border-line pt-4">
        <Totals total={order.total} pay={f.pay} method={f.method} />
      </div>
    </div>
  );
}

function Confirmation({
  order,
  onEdit,
  onSent,
  onNew,
}: {
  order: Order;
  onEdit: () => void;
  onSent: () => void;
  onNew: () => void;
}) {
  const reduce = useReducedMotion();
  // pagar antes só quando dá para pagar aqui mesmo (Pix com chave ou PicPay com usuário)
  const payHere = canPayHere(order);

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-28 md:px-8 md:pt-32">
      <div className="flex flex-col items-center text-center">
        <div className="relative flex size-24 items-center justify-center">
          <Burst />
          <motion.span
            className="flex size-20 items-center justify-center rounded-full bg-rose-deep text-white shadow-[0_20px_40px_-18px_rgba(161,79,92,0.8)]"
            initial={{ opacity: 0, transform: "scale(0.6) rotate(-25deg)" }}
            animate={{ opacity: 1, transform: "scale(1) rotate(0deg)" }}
            transition={gentle(reduce, { type: "spring", duration: 0.6, bounce: 0.45 })}
          >
            <Check size={36} weight="bold" />
          </motion.span>
        </div>
        <ScriptTitle as="h1" play text={order.sent ? "Pedido enviado!" : "Quase pronto!"} className="mt-4 text-[clamp(3rem,7vw,4.8rem)]" />
        <p className="mt-2 max-w-[46ch] text-lg font-semibold leading-relaxed text-cocoa-2">
          {payHere
            ? "Pague o sinal e envie o pedido pelo WhatsApp. A confirmação chega por lá."
            : "Envie o pedido pelo WhatsApp. A confirmação e o pagamento são combinados por lá."}
        </p>
      </div>

      <motion.div
        className="mt-10 grid gap-4 md:grid-cols-2"
        initial={{ opacity: 0, transform: "translateY(16px)" }}
        animate={{ opacity: 1, transform: "translateY(0px)" }}
        transition={gentle(reduce, { duration: 0.6, delay: 0.3, ease: EASE_OUT })}
      >
        {payHere ? (
          <>
            <PayPanel order={order} step={1} />
            <SendPanel order={order} step={2} onSent={onSent} />
          </>
        ) : (
          <>
            <SendPanel order={order} step={1} onSent={onSent} />
            <PayPanel order={order} step={2} />
          </>
        )}
      </motion.div>

      <motion.div
        className="mt-4"
        initial={{ opacity: 0, transform: "translateY(16px)" }}
        animate={{ opacity: 1, transform: "translateY(0px)" }}
        transition={gentle(reduce, { duration: 0.6, delay: 0.42, ease: EASE_OUT })}
      >
        <Recap order={order} />
      </motion.div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {order.sent ? (
          <PillButton variant="ghost" onClick={onNew} icon={<Basket size={18} weight="bold" />}>
            Fazer outro pedido
          </PillButton>
        ) : (
          <PillButton variant="ghost" onClick={onEdit} icon={<PencilSimple size={18} weight="bold" />}>
            Editar pedido
          </PillButton>
        )}
        <a href="/#cardapio" className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-[15px] font-semibold text-cocoa-2 hover:text-cocoa">
          <ArrowLeft size={16} weight="bold" /> Voltar ao cardápio
        </a>
      </div>
    </div>
  );
}

/* ------------------------------------------------------- estados vazios */

function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-28 md:px-8 md:pt-32" aria-busy="true" aria-label="Carregando o pedido">
      <div className="h-16 w-80 max-w-full animate-pulse rounded-full bg-blush-2" />
      <div className="mt-10 grid gap-6 lg:grid-cols-12">
        <div className="flex flex-col gap-5 lg:col-span-7">
          {[180, 420, 220].map((h) => (
            <div key={h} className="animate-pulse rounded-[1.75rem] bg-blush-2" style={{ height: h }} />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-[1.75rem] bg-blush-2 lg:col-span-5" />
      </div>
    </div>
  );
}

function Empty() {
  return (
    <div className="mx-auto flex min-h-[80dvh] max-w-xl flex-col items-center justify-center px-4 pb-16 pt-28 text-center">
      <span className="flex size-20 items-center justify-center rounded-full bg-card text-rose-deep ring-1 ring-line">
        <Basket size={32} weight="duotone" />
      </span>
      <ScriptTitle as="h1" play text="Seu carrinho está vazio" className="mt-5 text-[clamp(2.8rem,6vw,4rem)]" />
      <p className="mt-3 max-w-[36ch] text-lg font-medium text-cocoa-2">
        Escolha um bolo ou docinhos no cardápio e volte aqui para finalizar.
      </p>
      <PillButton href="/#cardapio" className="mt-8">
        Ver o cardápio
      </PillButton>
    </div>
  );
}

/* ------------------------------------------------------------- página */

export function Checkout() {
  const ready = useStore(cart, (s) => s.ready);
  const lines = useStore(cart, (s) => s.lines);
  const total = useStore(cart, selectTotal);
  const [order, setOrder] = useState<Order | null>(null);
  const [loaded, setLoaded] = useState(false);

  // um pedido confirmado só vale enquanto o carrinho for o mesmo dele
  useEffect(() => {
    if (!ready) return;
    const saved = loadOrder();
    const sig = (ls: Line[]) =>
      ls
        .map((l) => `${lineKey(l.productId, l.sel)}:${l.qty}`)
        .sort()
        .join(",");
    const current = cart.get().lines;
    if (saved && current.length && sig(saved.lines) !== sig(current)) {
      saveOrder(null);
      setOrder(null);
    } else {
      setOrder(saved);
    }
    setLoaded(true);
  }, [ready]);

  const update = (o: Order | null) => {
    saveOrder(o);
    setOrder(o);
    window.scrollTo({ top: 0 });
  };

  const view = !ready || !loaded ? "loading" : order ? "confirm" : lines.length ? "form" : "empty";

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={view}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: EASE_OUT }}
      >
        {view === "loading" && <Loading />}
        {view === "empty" && <Empty />}
        {view === "form" && <CheckoutForm lines={lines} total={total} onConfirm={(o) => update(o)} />}
        {view === "confirm" && order && (
          <Confirmation
            order={order}
            onEdit={() => update(null)}
            onSent={() => {
              const sent = { ...order, sent: true };
              saveOrder(sent);
              setOrder(sent);
              clearCart();
              try {
                sessionStorage.removeItem("cianinha:formulario");
              } catch {}
            }}
            onNew={() => update(null)}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}

