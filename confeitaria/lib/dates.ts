import { site } from "./site";

// Datas de retirada: de terça a sábado, com 2 dias de antecedência (cardápio 2026).
// Tudo no fuso do aparelho de quem encomenda, sem horário.

const DAY = 24 * 60 * 60 * 1000;

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const sameDay = (a: Date, b: Date) => a.getTime() === b.getTime();

export const isOpenDay = (d: Date) => site.openDays.includes(d.getDay());

/** Primeiro dia que pode ser escolhido para retirada */
export function firstPickup(now = new Date()) {
  let d = addDays(startOfDay(now), site.leadDays);
  while (!isOpenDay(d)) d = addDays(d, 1);
  return d;
}

export function isPickupAllowed(d: Date, now = new Date()) {
  return isOpenDay(d) && d.getTime() >= firstPickup(now).getTime();
}

/** "2026-10-17" ⇄ Date (local) */
export const toKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function fromKey(key: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!m) return null;
  const d = new Date(+m[1], +m[2] - 1, +m[3]);
  return toKey(d) === key ? d : null;
}

const longFmt = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" });
const shortFmt = new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" });
const monthFmt = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" });

/** "sábado, 17 de outubro" */
export const longDate = (d: Date) => longFmt.format(d);
/** "sáb., 17/10" */
export const shortDate = (d: Date) => shortFmt.format(d);
/** "outubro de 2026" */
export const monthLabel = (d: Date) => monthFmt.format(d);

export const weekdays = ["D", "S", "T", "Q", "Q", "S", "S"];
export const weekdayNames = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

/** Semanas (domingo a sábado) do mês de `month`, com null nos dias de fora */
export function monthGrid(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = Array.from({ length: first.getDay() }, () => null);
  for (let i = 1; i <= days; i++) cells.push(new Date(month.getFullYear(), month.getMonth(), i));
  while (cells.length % 7) cells.push(null);
  return cells;
}

export const daysBetween = (a: Date, b: Date) => Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / DAY);
