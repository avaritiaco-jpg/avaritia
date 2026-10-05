"use client";

import { fromKey, longDate } from "./dates";
import { money } from "./format";
import { isUnits, lineDetail, lineTitle, lineTotal, validLine, type Line } from "./menu";
import { pixPayload } from "./pix";
import { site, whatsappLink } from "./site";

/* --------------------------------------------------------------- tipos */

export type Method = "pix" | "picpay" | "dinheiro";
export type Pay = "sinal" | "total";
export type Period = "manha" | "tarde" | "";

export type Form = {
  name: string;
  phone: string;
  /** data de retirada "2026-10-17" */
  date: string;
  period: Period;
  method: Method | "";
  pay: Pay;
  notes: string;
};

export const emptyForm: Form = { name: "", phone: "", date: "", period: "", method: "", pay: "sinal", notes: "" };

export type Order = {
  code: string;
  form: Form & { method: Method };
  lines: Line[];
  total: number;
  /** a pessoa já tocou em "Enviar pelo WhatsApp" */
  sent: boolean;
};

export const methodLabel: Record<Method, string> = { pix: "Pix", picpay: "PicPay", dinheiro: "dinheiro" };
export const periodLabel: Record<Exclude<Period, "">, string> = { manha: "Manhã", tarde: "Tarde" };
const periodPhrase: Record<Exclude<Period, "">, string> = { manha: "de manhã", tarde: "à tarde" };

/* ------------------------------------------------------------ cálculos */

export const deposit = (total: number) => Math.round(total * site.deposit * 100) / 100;

/** Quanto a pessoa paga agora (sinal ou total) */
export const payNow = (o: Pick<Order, "total"> & { form: Pick<Form, "pay"> }) =>
  o.form.pay === "total" ? o.total : deposit(o.total);

export const hasPix = () => site.pix.key.trim().length > 0;
export const hasPicpay = () => site.picpay.trim().length > 0;

/** Dá para pagar na própria tela de confirmação (Pix com chave ou PicPay com usuário configurados) */
export const canPayHere = (o: { form: Pick<Form, "method"> }) =>
  (o.form.method === "pix" && hasPix()) || (o.form.method === "picpay" && hasPicpay());

/* ------------------------------------------------------------- validação */

export type Errors = Partial<Record<"name" | "phone" | "date" | "method", string>>;

export function validate(f: Form, isAllowed: (key: string) => boolean): Errors {
  const e: Errors = {};
  if (f.name.trim().length < 2) e.name = "Conta pra gente o seu nome.";
  const digits = f.phone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 11) e.phone = "Informe o WhatsApp com DDD, ex.: (35) 98765-4321.";
  if (!f.date) e.date = "Escolha a data de retirada.";
  else if (!isAllowed(f.date)) e.date = "Essa data não está mais disponível. Escolha outra.";
  if (!f.method) e.method = "Escolha como vai pagar.";
  return e;
}

/* ----------------------------------------------------------- pedido */

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function newCode() {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  return `CIA-${Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("")}`;
}

export function pickupText(f: Pick<Form, "date" | "period">) {
  const d = fromKey(f.date);
  if (!d) return "";
  return `${longDate(d)}${f.period ? `, ${periodPhrase[f.period]}` : ""}`;
}

/** Mensagem que chega pronta no WhatsApp da confeitaria */
export function orderMessage(o: Order) {
  const f = o.form;
  const now = payNow(o);
  const rest = Math.max(0, Math.round((o.total - now) * 100) / 100);
  const items = o.lines.map((l) => {
    const qty = isUnits(l) ? `${l.qty} un.` : `${l.qty}×`;
    return `• ${qty} ${lineTitle(l)}\n   ${lineDetail(l)}: ${money(lineTotal(l))}`;
  });

  const payment =
    f.method === "dinheiro"
      ? `Pagamento em dinheiro: sinal de ${money(deposit(o.total))} no ato da encomenda`
      : f.pay === "total"
        ? `Pagamento: valor total de ${money(o.total)} via ${methodLabel[f.method]}`
        : `Sinal (50%): ${money(now)} via ${methodLabel[f.method]}`;

  return [
    `Olá, ${site.name}! Quero fazer uma encomenda pelo site.`,
    "",
    `*Pedido ${o.code}*`,
    `Nome: ${f.name.trim()}`,
    `WhatsApp: ${f.phone}`,
    `Retirada: ${pickupText(f)}`,
    "",
    "*Itens*",
    ...items,
    "",
    `*Total: ${money(o.total)}*`,
    payment,
    ...(f.method !== "dinheiro" && rest > 0 ? [`Restante na retirada: ${money(rest)}`] : []),
    ...(f.method === "dinheiro" ? [`Restante na retirada: ${money(o.total - deposit(o.total))}`] : []),
    ...(f.notes.trim() ? ["", `Observações: ${f.notes.trim()}`] : []),
    ...(f.method === "dinheiro"
      ? []
      : canPayHere(o)
        ? ["", "Segue o comprovante do pagamento."]
        : ["", `Pode me passar os dados do ${methodLabel[f.method]}?`]),
  ].join("\n");
}

export const orderLink = (o: Order) => whatsappLink(orderMessage(o));

export function pixCode(o: Order) {
  return pixPayload({
    key: site.pix.key,
    receiver: site.pix.receiver,
    city: site.pix.city,
    amount: payNow(o),
    txid: o.code,
  });
}

export function picpayLink(o: Order) {
  const user = site.picpay.replace(/^@/, "").trim();
  return `https://picpay.me/${encodeURIComponent(user)}/${payNow(o).toFixed(2)}`;
}

/* ---------------------------------------------------------- armazenamento */

// O pedido confirmado e o rascunho do formulário ficam na sessão do navegador:
// sobrevivem a um recarregar da página, mas não ficam guardados para sempre.
const ORDER_KEY = "cianinha:pedido";
const FORM_KEY = "cianinha:formulario";

export function loadOrder(): Order | null {
  try {
    const raw = sessionStorage.getItem(ORDER_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as Order;
    if (!o?.code || !Array.isArray(o.lines) || !o.lines.every(validLine)) return null;
    return o;
  } catch {
    return null;
  }
}

export function saveOrder(o: Order | null) {
  try {
    if (o) sessionStorage.setItem(ORDER_KEY, JSON.stringify(o));
    else sessionStorage.removeItem(ORDER_KEY);
  } catch {}
}

export function loadForm(): Form {
  try {
    const raw = sessionStorage.getItem(FORM_KEY);
    if (raw) return { ...emptyForm, ...(JSON.parse(raw) as Partial<Form>) };
  } catch {}
  return emptyForm;
}

export function saveForm(f: Form) {
  try {
    sessionStorage.setItem(FORM_KEY, JSON.stringify(f));
  } catch {}
}
