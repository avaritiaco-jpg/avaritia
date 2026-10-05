import data from "./catalogo.json";
import { site } from "./site";

export type Category = "perfume" | "body" | "kit" | "cuidados";
export type Gender = "feminino" | "masculino" | "unissex";

export type Product = {
  code: string;
  brand: string;
  name: string;
  image: string | null;
  /** cor dominante da foto, usada no brilho do card */
  tone: string;
  /** foto em fundo claro (recorte de estúdio) */
  cutout: boolean;
  size: string | null;
  concentration: string | null;
  gender: Gender | null;
  category: Category;
};

export const products = data as Product[];

const byCode = new Map(products.map((p) => [p.code, p]));
export const getProduct = (code: string) => byCode.get(code);

export const categories: { id: Category | "todos"; label: string; short: string }[] = [
  { id: "todos", label: "Tudo", short: "Tudo" },
  { id: "perfume", label: "Perfumes", short: "Perfumes" },
  { id: "body", label: "Body splash & mists", short: "Body splash" },
  { id: "kit", label: "Kits & presentes", short: "Kits" },
  { id: "cuidados", label: "Corpo & cabelo", short: "Cuidados" },
];

export const genders: { id: Gender | "todos"; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "feminino", label: "Feminino" },
  { id: "masculino", label: "Masculino" },
  { id: "unissex", label: "Unissex" },
];

export const concentrations = [
  { id: "todas", label: "Toda concentração", match: () => true },
  {
    id: "extrait",
    label: "Extrait & Parfum",
    match: (c: string | null) => c === "Extrait de Parfum" || c === "Parfum",
  },
  { id: "edp", label: "Eau de Parfum", match: (c: string | null) => c === "Eau de Parfum" },
  { id: "edt", label: "Eau de Toilette", match: (c: string | null) => c === "Eau de Toilette" },
] as const;
export type ConcentrationId = (typeof concentrations)[number]["id"];

export const sorts = [
  { id: "relevancia", label: "Destaques" },
  { id: "nome", label: "Nome (A–Z)" },
] as const;
export type SortId = (typeof sorts)[number]["id"];

// Marcas em ordem de tamanho do portfólio
export const brands = Object.entries(
  products.reduce<Record<string, number>>((acc, p) => {
    acc[p.brand] = (acc[p.brand] ?? 0) + 1;
    return acc;
  }, {}),
)
  .map(([name, count]) => ({ name, count }))
  .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

export const genderLabel: Record<Gender, string> = {
  feminino: "Feminino",
  masculino: "Masculino",
  unissex: "Unissex",
};

export const categoryLabel: Record<Category, string> = {
  perfume: "Perfume",
  body: "Body splash",
  kit: "Kit",
  cuidados: "Cuidados",
};

const shortNames: Record<string, string> = {
  "Eau de Parfum": "EDP",
  "Eau de Toilette": "EDT",
  "Extrait de Parfum": "Extrait",
  Parfum: "Parfum",
};
export const shortConcentration = (c: string | null) => (c ? (shortNames[c] ?? c) : null);

/** Texto sem acentos e em minúsculas, para a busca */
export function normalize(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

const searchIndex = new Map(
  products.map((p) => [
    p.code,
    normalize(
      [p.brand, p.name, p.code, p.concentration, p.size, p.gender, categoryLabel[p.category]].join(" "),
    ),
  ]),
);

export type Filters = {
  query: string;
  category: Category | "todos";
  gender: Gender | "todos";
  brand: string;
  concentration: ConcentrationId;
  sort: SortId;
};

export const defaultFilters: Filters = {
  query: "",
  category: "todos",
  gender: "todos",
  brand: "todas",
  concentration: "todas",
  sort: "relevancia",
};

const featuredRank = new Map<string, number>(site.featured.map((f, i) => [f.code, i]));

export function filterProducts(f: Filters) {
  const terms = normalize(f.query).split(/\s+/).filter(Boolean);
  const level = concentrations.find((c) => c.id === f.concentration) ?? concentrations[0];

  const list = products.filter((p) => {
    if (f.category !== "todos" && p.category !== f.category) return false;
    if (f.gender !== "todos" && p.gender !== f.gender) return false;
    if (f.brand !== "todas" && p.brand !== f.brand) return false;
    if (!level.match(p.concentration)) return false;
    if (terms.length) {
      const hay = searchIndex.get(p.code) ?? "";
      return terms.every((t) => hay.includes(t));
    }
    return true;
  });

  switch (f.sort) {
    case "nome":
      return list.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    default:
      // Destaques primeiro, depois perfumes com foto de estúdio, mantendo a ordem da lista
      return list
        .map((p, i) => ({ p, i }))
        .sort((a, b) => score(a.p, a.i) - score(b.p, b.i))
        .map(({ p }) => p);
  }
}

function score(p: Product, index: number) {
  const featured = featuredRank.get(p.code);
  if (featured !== undefined) return featured - 10_000;
  return index + (p.category === "perfume" ? 0 : 2_000);
}

/** Sugestões para o modal: mesma marca e categoria, depois mesmo gênero */
export function related(p: Product, limit = 4) {
  const line = normalize(p.name).split(" ")[0];
  return products
    .filter((o) => o.code !== p.code && o.category === p.category)
    .map((o) => ({
      o,
      s:
        (o.brand === p.brand ? 4 : 0) +
        (normalize(o.name).startsWith(line) ? 3 : 0) +
        (o.gender === p.gender ? 2 : 0) +
        (o.cutout ? 1 : 0) +
        (o.size === p.size ? 1 : 0),
    }))
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map(({ o }) => o);
}

export function productTitle(p: Product) {
  return `${p.brand} ${p.name}${p.size ? ` ${p.size}` : ""}`;
}
