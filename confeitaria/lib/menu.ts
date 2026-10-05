// Cardápio 2026 da Cianinha Confeitaria: sabores, tamanhos, valores e a ilustração de cada item.
// Os valores são os do cardápio impresso. Para mudar um preço, mude aqui e publique de novo.

/* ------------------------------------------------------------ ilustrações */

// Cores dos ingredientes, usadas nos desenhos dos bolos e doces
export const C = {
  cacau: "#5b3526",
  branca: "#f0d49c",
  iogurte: "#ecc68a",
  redVelvet: "#a42b3d",
  milho: "#f2c94c",
  fuba: "#eec564",
  cenoura: "#f0a04b",
  laranja: "#f4b860",
  limaoMassa: "#f1dc8c",
  chocolateMassa: "#6a3d29",

  beijinho: "#faf3e6",
  brigadeiro: "#6e3f28",
  meioAmargo: "#3d2219",
  brigBranco: "#f5ead6",
  ninho: "#fbf5e8",
  mousseNinho: "#fdf8ef",
  tresLeites: "#f8ecd0",
  trufaLeite: "#7d4b2f",
  trufaBranca: "#f3e5c6",
  trufaLimao: "#e5ecb4",
  trufaMaracuja: "#f3c84b",
  creme: "#fcf6ec",
  doceDeLeite: "#c88b4c",
  geleia: "#8e1c35",
  limaoSiciliano: "#f4ebab",

  chantininho: "#fffaf4",
  chantiDoceLeite: "#efd0a2",
  ganache: "#3a1f16",
  ganacheMeio: "#2e1812",
  merengue: "#fff7ea",

  morango: "#e0384b",
  framboesa: "#b0203f",
  mirtilo: "#3f3a6e",
  abacaxi: "#f7d548",
  banana: "#f6e7a8",
  nozes: "#9a6237",
  limao: "#a8c93c",
  maracuja: "#f2b632",
  coco: "#fffdf8",
  paçoca: "#d9b07c",
  canela: "#a8642e",
  castanha: "#d8b17c",
} as const;

export type Bits = "morango" | "abacaxi" | "coco" | "choco" | "nozes" | "banana" | "geleia";

export type Topping =
  | "morangos"
  | "coco"
  | "granulado"
  | "raspas"
  | "raspasBrancas"
  | "frutasVermelhas"
  | "banana"
  | "nozes"
  | "limao"
  | "maracuja"
  | "farofa"
  | "ninho";

export type SliceArt = {
  kind: "slice";
  sponge: string;
  /** recheios de baixo para cima (o bolo tem duas camadas de recheio) */
  fillings: [{ color: string; bits?: Bits }, { color: string; bits?: Bits }];
  frosting: { color: string; finish: "chantininho" | "ganache" | "brigadeiro" | "merengue" | "macaricado" };
  toppings: Topping[];
};

export type BonbonArt = {
  kind: "bonbon";
  shape: "ball" | "trufa" | "caju" | "morango" | "olho" | "camafeu";
  body: string;
  coat?: "granulado" | "po" | "coco" | "farofa" | "acucar" | "liso";
  coatColor?: string;
  topper?: "morango" | "castanha" | "nozes" | "cravo" | "raspas" | "sementes" | "amendoim" | "fio" | "meio";
  topperColor?: string;
  cup?: string;
};

export type GeladoArt = { kind: "gelado"; cream: string; top: Topping | "nutella" | "liso"; sponge: string };

export type BundtArt = {
  kind: "bundt";
  sponge: string;
  pattern?: "mesclado" | "formigueiro" | "raspas";
  glaze?: "brigadeiro" | "ganache";
  cremoso?: boolean;
};

export type Art = SliceArt | BonbonArt | GeladoArt | BundtArt;

/* ---------------------------------------------------------------- tipos */

export type CategoryId = "classicos" | "especiais" | "gelado" | "docinhos" | "caseirinhos";

export const categories: { id: CategoryId; label: string; note: string }[] = [
  { id: "classicos", label: "Bolos clássicos", note: "Massa molhadinha, recheio generoso e a decoração padrão de cada sabor." },
  { id: "especiais", label: "Bolos especiais", note: "Trufados, frutas, merengue suíço e combinações exclusivas da casa." },
  { id: "gelado", label: "Bolo gelado", note: "No pedaço, na forma inteira ou cortado em tamanho festa." },
  { id: "docinhos", label: "Docinhos", note: "Mínimo de 25 unidades por sabor. Quanto mais, menor o valor da unidade." },
  { id: "caseirinhos", label: "Caseirinhos", note: "Os bolos do café da tarde, com ou sem cobertura." },
];

export type Option = { id: string; label: string };
export type Selection = Record<string, string>;

type Base = {
  id: string;
  category: CategoryId;
  name: string;
  description: string;
  /** destaque real do cardápio (ex.: "Top 1 de vendas") */
  badge?: string;
  /** foto real do produto em public/fotos (ex.: "/fotos/prestigio.webp"). Sem foto, aparece a ilustração. */
  photo?: string;
};

export type Tier = "classico" | "especial";

export type CakeProduct = Base & {
  kind: "cake";
  tier: Tier;
  /** escolha extra do sabor (ex.: brigadeiro ao leite, meio amargo ou dois amores) */
  variant?: { label: string; options: Option[] };
  art: (sel: Selection) => SliceArt;
};

export type GeladoProduct = Base & { kind: "gelado"; art: GeladoArt };

export type CaseiroProduct = Base & {
  kind: "caseiro";
  /** fubá cremoso e milho: só tamanho M, sem cobertura */
  cremoso: boolean;
  art: (sel: Selection) => BundtArt;
};

export type Flavor = Option & { art: BonbonArt };

export type DoceProduct = Base & {
  kind: "doce";
  /** valores para 25, 50 e 100 unidades do mesmo sabor */
  tiers: [number, number, number];
  flavors: Flavor[];
  /** escolha que vale para todos os sabores (ex.: chocolate ao leite ou branco nas trufas) */
  base?: { label: string; options: Option[] };
};

export type Product = CakeProduct | GeladoProduct | CaseiroProduct | DoceProduct;

/* ----------------------------------------------------- bolos confeitados */

export type CakeSize = {
  id: string;
  shape: "circular" | "retangular";
  label: string;
  serves: string;
  /** fatias (máximo do rendimento), usado no guia de tamanhos */
  slices: number;
  price: Record<Tier, number>;
};

export const cakeSizes: CakeSize[] = [
  { id: "c-mini", shape: "circular", label: "Mini", serves: "6 fatias", slices: 6, price: { classico: 95, especial: 100 } },
  { id: "c-pp", shape: "circular", label: "PP", serves: "10 a 15 fatias", slices: 15, price: { classico: 190, especial: 205 } },
  { id: "c-p", shape: "circular", label: "P", serves: "15 a 20 fatias", slices: 20, price: { classico: 250, especial: 265 } },
  { id: "c-m", shape: "circular", label: "M", serves: "25 a 30 fatias", slices: 30, price: { classico: 320, especial: 340 } },
  { id: "r-p", shape: "retangular", label: "P", serves: "30 fatias", slices: 30, price: { classico: 320, especial: 340 } },
  { id: "r-m", shape: "retangular", label: "M", serves: "40 fatias", slices: 40, price: { classico: 360, especial: 380 } },
  { id: "r-g", shape: "retangular", label: "G", serves: "60 fatias", slices: 60, price: { classico: 460, especial: 490 } },
];

export const shapeLabel = { circular: "Circular", retangular: "Retangular" } as const;

const slice = (
  sponge: string,
  fillings: SliceArt["fillings"],
  frosting: SliceArt["frosting"],
  toppings: Topping[],
): SliceArt => ({ kind: "slice", sponge, fillings, frosting, toppings });

const same = (color: string, bits?: Bits): SliceArt["fillings"] => [
  { color, bits },
  { color, bits },
];

const cakes: CakeProduct[] = [
  /* clássicos */
  {
    kind: "cake",
    tier: "classico",
    category: "classicos",
    id: "prestigio",
    name: "Prestígio",
    description:
      "Um clássico atemporal. Massa de cacau 50%, recheio de beijinho, coberto com nosso delicioso brigadeiro ao leite.",
    art: () => slice(C.cacau, same(C.beijinho, "coco"), { color: C.brigadeiro, finish: "brigadeiro" }, ["coco"]),
  },
  {
    kind: "cake",
    tier: "classico",
    category: "classicos",
    id: "abacaxi-com-coco",
    name: "Abacaxi com coco",
    description:
      "Esse bolo é surpreendentemente maravilhoso. Massa branca amanteigada, leve e molhadinha, com recheio três leites com pedaços de abacaxi e coco em flocos, coberto com merengue maçaricado.",
    art: () => slice(C.branca, same(C.tresLeites, "abacaxi"), { color: C.merengue, finish: "macaricado" }, ["coco"]),
  },
  {
    kind: "cake",
    tier: "classico",
    category: "classicos",
    id: "brigadeiro",
    name: "Brigadeiro",
    description:
      "Um bolo que nunca sai de moda. Massa de cacau 50%, com recheio de brigadeiro ao leite, meio amargo ou dois amores (brigadeiro branco e preto).",
    variant: {
      label: "Recheio",
      options: [
        { id: "ao-leite", label: "Ao leite" },
        { id: "meio-amargo", label: "Meio amargo" },
        { id: "dois-amores", label: "Dois amores" },
      ],
    },
    art: (sel) =>
      slice(
        C.cacau,
        sel.variant === "dois-amores"
          ? [{ color: C.brigadeiro }, { color: C.brigBranco }]
          : same(sel.variant === "meio-amargo" ? C.meioAmargo : C.brigadeiro),
        { color: C.brigadeiro, finish: "brigadeiro" },
        ["granulado"],
      ),
  },
  {
    kind: "cake",
    tier: "classico",
    category: "classicos",
    id: "flocos",
    name: "Flocos",
    description:
      "Uma receita de família que agrada demais. Massa branca amanteigada, molhadinha, com recheio de mousse de leite ninho leve e pedaços de chocolate ao leite ou meio amargo, coberto com chantininho.",
    variant: {
      label: "Chocolate",
      options: [
        { id: "ao-leite", label: "Ao leite" },
        { id: "meio-amargo", label: "Meio amargo" },
      ],
    },
    art: () => slice(C.branca, same(C.mousseNinho, "choco"), { color: C.chantininho, finish: "chantininho" }, ["raspas"]),
  },
  {
    kind: "cake",
    tier: "classico",
    category: "classicos",
    id: "leite-ninho",
    name: "Leite Ninho",
    description:
      "Popular e delicioso. Massa branca amanteigada, molhadinha, com recheio de brigadeiro de leite ninho e coberto com chantininho.",
    art: () => slice(C.branca, same(C.ninho), { color: C.chantininho, finish: "chantininho" }, ["ninho"]),
  },
  {
    kind: "cake",
    tier: "classico",
    category: "classicos",
    id: "ninho-com-morango",
    name: "Leite Ninho com morango",
    badge: "Top 1 de vendas",
    description:
      "Nosso top 1 de vendas. Massa branca, recheio de brigadeiro de leite ninho e morangos frescos, coberto com chantininho.",
    art: () => slice(C.branca, same(C.ninho, "morango"), { color: C.chantininho, finish: "chantininho" }, ["morangos"]),
  },

  /* especiais */
  {
    kind: "cake",
    tier: "especial",
    category: "especiais",
    id: "trufado-ao-leite",
    name: "Trufado ao leite",
    description:
      "Um chocolatudo de verdade. Massa de cacau 50%, molhadinha, com recheio de trufa de chocolate ao leite, coberto com nossa ganache perfeita.",
    art: () => slice(C.cacau, same(C.trufaLeite), { color: C.ganache, finish: "ganache" }, ["raspas"]),
  },
  {
    kind: "cake",
    tier: "especial",
    category: "especiais",
    id: "trufado-preto-e-branco",
    name: "Trufado preto e branco",
    description:
      "Para os amantes de chocolate branco. Massa de cacau 50%, um recheio de trufa ao leite e um de trufa branca, coberto com nossa ganache perfeita.",
    art: () =>
      slice(C.cacau, [{ color: C.trufaLeite }, { color: C.trufaBranca }], { color: C.ganache, finish: "ganache" }, [
        "raspasBrancas",
      ]),
  },
  {
    kind: "cake",
    tier: "especial",
    category: "especiais",
    id: "trufado-meio-amargo",
    name: "Trufado meio amargo",
    description:
      "Para quem prefere um chocolatudo mais potente. Massa de cacau 50%, com recheio de trufa de chocolate meio amargo, coberto com nossa ganache perfeita.",
    art: () => slice(C.cacau, same(C.meioAmargo), { color: C.ganacheMeio, finish: "ganache" }, ["raspas"]),
  },
  {
    kind: "cake",
    tier: "especial",
    category: "especiais",
    id: "trufado-de-limao",
    name: "Trufado de limão",
    description:
      "O azedinho do limão. Massa de cacau 50%, molhadinha, um recheio de trufa de limão e um de trufa ao leite, coberto com nossa ganache perfeita.",
    art: () =>
      slice(C.cacau, [{ color: C.trufaLeite }, { color: C.trufaLimao }], { color: C.ganache, finish: "ganache" }, [
        "limao",
      ]),
  },
  {
    kind: "cake",
    tier: "especial",
    category: "especiais",
    id: "trufado-de-maracuja",
    name: "Trufado de maracujá",
    description:
      "Um sabor exclusivo. Massa de cacau 50%, um recheio de trufa meio amargo e um de trufa de maracujá, coberto com ganache meio amargo.",
    art: () =>
      slice(C.cacau, [{ color: C.meioAmargo }, { color: C.trufaMaracuja }], { color: C.ganacheMeio, finish: "ganache" }, [
        "maracuja",
      ]),
  },
  {
    kind: "cake",
    tier: "especial",
    category: "especiais",
    id: "choconinho-com-morango",
    name: "Choconinho com morango",
    description:
      "A versão chocolate do nosso top 1. Massa de cacau 50%, com recheio de brigadeiro de leite ninho e pedaços de morangos frescos, coberto com a nossa ganache perfeita.",
    art: () => slice(C.cacau, same(C.ninho, "morango"), { color: C.ganache, finish: "ganache" }, ["morangos"]),
  },
  {
    kind: "cake",
    tier: "especial",
    category: "especiais",
    id: "ninho-com-frutas-vermelhas",
    name: "Leite Ninho com geleia de frutas vermelhas",
    description:
      "Um bolo elegante e saboroso na medida. Massa branca amanteigada, com recheio de brigadeiro de leite ninho e geleia de frutas vermelhas, coberto com merengue suíço.",
    art: () =>
      slice(C.branca, same(C.ninho, "geleia"), { color: C.merengue, finish: "merengue" }, ["frutasVermelhas"]),
  },
  {
    kind: "cake",
    tier: "especial",
    category: "especiais",
    id: "limao-siciliano-com-frutas-vermelhas",
    name: "Limão siciliano com geleia de frutas vermelhas",
    description:
      "O equilíbrio entre o ácido e o doce. Massa branca, com recheio de brigadeiro de limão siciliano e geleia de frutas vermelhas, coberto com merengue suíço maçaricado.",
    art: () =>
      slice(C.branca, same(C.limaoSiciliano, "geleia"), { color: C.merengue, finish: "macaricado" }, [
        "frutasVermelhas",
      ]),
  },
  {
    kind: "cake",
    tier: "especial",
    category: "especiais",
    id: "banoffe",
    name: "Banoffe",
    description:
      "Nossa versão deliciosa da torta. Massa de iogurte com toque de canela, recheio de creme de leite fresco, doce de leite e bananas frescas, coberto com chantininho de doce de leite.",
    art: () =>
      slice(C.iogurte, [{ color: C.doceDeLeite }, { color: C.creme, bits: "banana" }], {
        color: C.chantiDoceLeite,
        finish: "chantininho",
      }, ["banana"]),
  },
  {
    kind: "cake",
    tier: "especial",
    category: "especiais",
    id: "red-velvet",
    name: "Red velvet",
    description:
      "O clássico americano. Massa vermelha aveludada, levemente umedecida, com recheio de creme de leite fresco e cream cheese, coberto com chantininho.",
    art: () => slice(C.redVelvet, same(C.creme), { color: C.chantininho, finish: "chantininho" }, ["farofa"]),
  },
  {
    kind: "cake",
    tier: "especial",
    category: "especiais",
    id: "nozes",
    name: "Nozes",
    description: "Maravilhoso. Massa branca, recheio de doce de leite e nozes picadas, coberto com chantininho.",
    art: () => slice(C.branca, same(C.doceDeLeite, "nozes"), { color: C.chantininho, finish: "chantininho" }, ["nozes"]),
  },
];

/* ------------------------------------------------------------ bolo gelado */

export const gelado = {
  slice: 14,
  pan: 265,
  cuts: [
    { id: "tradicional", label: "20 pedaços", hint: "Corte tradicional" },
    { id: "festa", label: "30 pedaços", hint: "Tamanho festa" },
  ],
};

const geladoFlavors: { id: string; name: string; art: GeladoArt }[] = [
  { id: "leite-ninho", name: "Leite Ninho", art: { kind: "gelado", cream: C.ninho, top: "ninho", sponge: C.branca } },
  {
    id: "ninho-com-frutas-vermelhas",
    name: "Leite Ninho com geleia de frutas vermelhas",
    art: { kind: "gelado", cream: C.ninho, top: "frutasVermelhas", sponge: C.branca },
  },
  { id: "prestigio", name: "Prestígio", art: { kind: "gelado", cream: C.beijinho, top: "coco", sponge: C.cacau } },
  { id: "coco", name: "Coco", art: { kind: "gelado", cream: C.beijinho, top: "coco", sponge: C.branca } },
  { id: "brigadeiro", name: "Brigadeiro", art: { kind: "gelado", cream: C.brigadeiro, top: "granulado", sponge: C.cacau } },
  {
    id: "brigadeiro-dois-amores",
    name: "Brigadeiro dois amores",
    art: { kind: "gelado", cream: C.brigBranco, top: "granulado", sponge: C.cacau },
  },
  { id: "ninho-com-nutella", name: "Ninho com Nutella", art: { kind: "gelado", cream: C.ninho, top: "nutella", sponge: C.branca } },
  { id: "nozes", name: "Nozes", art: { kind: "gelado", cream: C.doceDeLeite, top: "nozes", sponge: C.branca } },
];

const geladoProducts: GeladoProduct[] = geladoFlavors.map((f) => ({
  kind: "gelado",
  category: "gelado",
  id: `gelado-${f.id}`,
  name: f.name,
  description: "Bolo gelado molhadinho, servido no pedaço ou na forma inteira com 20 pedaços (ou 30 no tamanho festa).",
  art: f.art,
}));

/* --------------------------------------------------------------- docinhos */

const ball = (body: string, coat?: BonbonArt["coat"], extra: Partial<BonbonArt> = {}): BonbonArt => ({
  kind: "bonbon",
  shape: "ball",
  body,
  coat,
  ...extra,
});

const docinhos: DoceProduct[] = [
  {
    kind: "doce",
    category: "docinhos",
    id: "doces-classicos",
    name: "Doces clássicos",
    description: "Os docinhos de festa de sempre, do jeitinho que a gente lembra.",
    tiers: [65, 125, 240],
    flavors: [
      {
        id: "cajuzinho",
        label: "Cajuzinho",
        art: { kind: "bonbon", shape: "caju", body: "#b8773f", coat: "acucar", topper: "amendoim" },
      },
      {
        id: "moranguinho",
        label: "Moranguinho",
        art: { kind: "bonbon", shape: "morango", body: "#e85a6c", coat: "acucar" },
      },
      {
        id: "olho-de-sogra",
        label: "Olho de sogra",
        art: { kind: "bonbon", shape: "olho", body: "#4a2230", coat: "acucar", topperColor: "#f7e3a3" },
      },
      { id: "beijinho", label: "Beijinho", art: ball(C.beijinho, "acucar", { topper: "cravo" }) },
    ],
  },
  {
    kind: "doce",
    category: "docinhos",
    id: "camafeu",
    name: "Camafeu",
    description: "Doce de nozes com cobertura lisinha e meia noz por cima. Elegante em qualquer mesa.",
    tiers: [100, 200, 380],
    flavors: [
      {
        id: "camafeu",
        label: "Camafeu",
        art: { kind: "bonbon", shape: "camafeu", body: "#f6ead3", coat: "liso", topper: "nozes" },
      },
    ],
  },
  {
    kind: "doce",
    category: "docinhos",
    id: "brigadeiros-gourmet",
    name: "Brigadeiros gourmet",
    description: "Para montar a mesa de doces do seu jeito, misturando os sabores.",
    tiers: [70, 135, 260],
    flavors: [
      { id: "leite-ninho", label: "Leite Ninho", art: ball(C.ninho, "po") },
      { id: "coco", label: "Coco", art: ball(C.beijinho, "coco") },
      { id: "pacoca", label: "Paçoca", art: ball("#c99a63", "farofa", { coatColor: C.paçoca }) },
      { id: "churros", label: "Churros", art: ball("#d9a46a", "acucar", { coatColor: "#c98a4e", topper: "fio", topperColor: C.doceDeLeite }) },
      { id: "limao", label: "Limão", art: ball("#eef0c2", "acucar", { topper: "raspas", topperColor: C.limao }) },
      { id: "maracuja", label: "Maracujá", art: ball("#f6d670", "acucar", { topper: "sementes" }) },
      { id: "morango", label: "Morango", art: ball("#f2a5b0", "acucar", { topper: "morango" }) },
      { id: "prestigio", label: "Prestígio", art: ball(C.brigadeiro, "coco") },
      { id: "casadinho", label: "Casadinho", art: ball(C.brigadeiro, "liso", { topper: "meio", topperColor: C.brigBranco }) },
      {
        id: "crocante-de-castanha",
        label: "Crocante de castanha de caju",
        art: ball("#c99a63", "farofa", { coatColor: C.castanha, topper: "castanha" }),
      },
    ],
  },
  {
    kind: "doce",
    category: "docinhos",
    id: "brigadeiros-especiais",
    name: "Brigadeiros especiais",
    description: "Ao leite, meio amargo, branco e as combinações da casa.",
    tiers: [90, 175, 340],
    flavors: [
      { id: "ao-leite", label: "Brigadeiro ao leite", art: ball(C.brigadeiro, "granulado", { coatColor: C.trufaLeite }) },
      { id: "meio-amargo", label: "Brigadeiro meio amargo", art: ball(C.meioAmargo, "granulado", { coatColor: "#2a1610" }) },
      { id: "branco", label: "Brigadeiro branco", art: ball(C.brigBranco, "granulado", { coatColor: "#fbf4e6" }) },
      {
        id: "ninho-com-nutella",
        label: "Leite Ninho com Nutella",
        art: ball(C.ninho, "po", { topper: "fio", topperColor: "#5a2f1d" }),
      },
      { id: "limao-siciliano", label: "Limão siciliano", art: ball(C.limaoSiciliano, "acucar", { topper: "raspas", topperColor: "#e8c93a" }) },
    ],
  },
  {
    kind: "doce",
    category: "docinhos",
    id: "trufas",
    name: "Trufas",
    description: "Recheio cremoso com casca de chocolate ao leite ou branco.",
    tiers: [112.5, 220, 430],
    base: {
      label: "Casca",
      options: [
        { id: "ao-leite", label: "Chocolate ao leite" },
        { id: "branco", label: "Chocolate branco" },
      ],
    },
    flavors: [
      { id: "tradicional", label: "Tradicional", art: { kind: "bonbon", shape: "trufa", body: C.trufaLeite, topper: "fio", topperColor: C.brigBranco } },
      { id: "coco", label: "Coco", art: { kind: "bonbon", shape: "trufa", body: C.trufaLeite, topper: "fio", topperColor: C.coco } },
      { id: "maracuja", label: "Maracujá", art: { kind: "bonbon", shape: "trufa", body: C.trufaLeite, topper: "fio", topperColor: C.maracuja } },
      { id: "limao", label: "Limão", art: { kind: "bonbon", shape: "trufa", body: C.trufaLeite, topper: "fio", topperColor: C.limao } },
      { id: "morango", label: "Morango", art: { kind: "bonbon", shape: "trufa", body: C.trufaLeite, topper: "fio", topperColor: "#ee7d8f" } },
      { id: "nozes", label: "Nozes", art: { kind: "bonbon", shape: "trufa", body: C.trufaLeite, topper: "fio", topperColor: C.nozes } },
    ],
  },
];

/* ------------------------------------------------------------ caseirinhos */

export const caseiro = {
  coatings: [
    { id: "sem", label: "Sem cobertura" },
    { id: "brigadeiro", label: "Brigadeiro" },
    { id: "ganache", label: "Ganache" },
  ],
  sizes: [
    { id: "p", label: "P", serves: "10 fatias" },
    { id: "m", label: "M", serves: "20 fatias" },
  ],
  price: {
    sem: { p: 38, m: 53 },
    com: { p: 45, m: 60 },
    cremoso: 55,
  },
};

const caseiroFlavors: { id: string; name: string; sponge: string; pattern?: BundtArt["pattern"]; cremoso?: boolean }[] = [
  { id: "cenoura", name: "Cenoura", sponge: C.cenoura },
  { id: "laranja", name: "Laranja", sponge: C.laranja },
  { id: "limao", name: "Limão", sponge: C.limaoMassa },
  { id: "mesclado", name: "Mesclado", sponge: C.branca, pattern: "mesclado" },
  { id: "formigueiro", name: "Formigueiro", sponge: C.branca, pattern: "formigueiro" },
  { id: "chocolate", name: "Chocolate", sponge: C.chocolateMassa },
  { id: "iogurte", name: "Iogurte", sponge: "#f3dfb4" },
  { id: "fuba", name: "Fubá", sponge: C.fuba },
  { id: "fuba-cremoso", name: "Fubá cremoso", sponge: C.fuba, cremoso: true },
  { id: "milho", name: "Milho", sponge: C.milho, cremoso: true },
];

const caseiros: CaseiroProduct[] = caseiroFlavors.map((f) => ({
  kind: "caseiro",
  category: "caseirinhos",
  id: `caseiro-${f.id}`,
  name: `Bolo de ${f.name.toLowerCase()}`,
  description: f.cremoso
    ? "Receita cremosa de forno, do jeito da roça. Só no tamanho M, com 20 fatias."
    : "Bolo caseiro fofinho, com cobertura de brigadeiro, de ganache ou sem cobertura.",
  cremoso: Boolean(f.cremoso),
  art: (sel) => ({
    kind: "bundt",
    sponge: f.sponge,
    pattern: f.pattern,
    cremoso: f.cremoso,
    glaze: sel.cobertura === "brigadeiro" || sel.cobertura === "ganache" ? sel.cobertura : undefined,
  }),
}));

/* --------------------------------------------------------------- consulta */

export const products: Product[] = [...cakes, ...geladoProducts, ...docinhos, ...caseiros];
const byId = new Map(products.map((p) => [p.id, p]));

export const getProduct = (id: string) => byId.get(id);
export const productsIn = (category: CategoryId) => products.filter((p) => p.category === category);

/** Valor total de N unidades de um mesmo sabor, combinando as faixas de 100, 50 e 25. */
export function doceTotal(tiers: DoceProduct["tiers"], units: number) {
  let rest = units;
  let total = 0;
  const hundreds = Math.floor(rest / 100);
  total += hundreds * tiers[2];
  rest -= hundreds * 100;
  if (rest >= 50) {
    total += tiers[1];
    rest -= 50;
  }
  if (rest >= 25) {
    total += tiers[0];
    rest -= 25;
  }
  return Math.round(total * 100) / 100;
}

export const DOCE_STEP = 25;

/** Menor valor do item, para o "a partir de" dos cards */
export function fromPrice(p: Product) {
  switch (p.kind) {
    case "cake":
      return cakeSizes[0].price[p.tier];
    case "gelado":
      return gelado.slice;
    case "caseiro":
      return p.cremoso ? caseiro.price.cremoso : caseiro.price.sem.p;
    case "doce":
      return p.tiers[0];
  }
}

/** Seleção inicial do configurador */
export function defaultSelection(p: Product): Selection {
  switch (p.kind) {
    case "cake":
      return { size: "c-p", ...(p.variant ? { variant: p.variant.options[0].id } : {}) };
    case "gelado":
      return { formato: "pedaco" };
    case "caseiro":
      return p.cremoso ? { size: "m", cobertura: "sem" } : { size: "p", cobertura: "brigadeiro" };
    case "doce":
      return { flavor: p.flavors[0].id, ...(p.base ? { base: p.base.options[0].id } : {}) };
  }
}

/* ------------------------------------------------------------ carrinho */

export type Line = { productId: string; sel: Selection; qty: number };

export const lineKey = (productId: string, sel: Selection) =>
  `${productId}|${Object.keys(sel)
    .sort()
    .map((k) => `${k}=${sel[k]}`)
    .join("&")}`;

const has = (options: readonly { id: string }[], id: string | undefined) => options.some((o) => o.id === id);

/** Confere se uma linha salva ainda corresponde ao cardápio (preços e sabores podem mudar entre visitas). */
export function validLine(l: Line): boolean {
  const p = getProduct(l.productId);
  if (!p || !l.sel || !Number.isInteger(l.qty) || l.qty <= 0) return false;
  const s = l.sel;
  switch (p.kind) {
    case "cake":
      return has(cakeSizes, s.size) && (!p.variant || has(p.variant.options, s.variant));
    case "gelado":
      return s.formato === "pedaco" || (s.formato === "forma" && has(gelado.cuts, s.corte));
    case "caseiro":
      return p.cremoso
        ? s.size === "m" && s.cobertura === "sem"
        : has(caseiro.sizes, s.size) && has(caseiro.coatings, s.cobertura);
    case "doce":
      return has(p.flavors, s.flavor) && (!p.base || has(p.base.options, s.base)) && l.qty % DOCE_STEP === 0;
  }
}

/** Valor total da linha (para docinhos, `qty` é o número de unidades) */
export function lineTotal(l: Line): number {
  const p = getProduct(l.productId);
  if (!p) return 0;
  const s = l.sel;
  switch (p.kind) {
    case "cake": {
      const size = cakeSizes.find((z) => z.id === s.size);
      return (size?.price[p.tier] ?? 0) * l.qty;
    }
    case "gelado":
      return (s.formato === "forma" ? gelado.pan : gelado.slice) * l.qty;
    case "caseiro": {
      if (p.cremoso) return caseiro.price.cremoso * l.qty;
      const table = s.cobertura === "sem" ? caseiro.price.sem : caseiro.price.com;
      return (s.size === "m" ? table.m : table.p) * l.qty;
    }
    case "doce":
      return doceTotal(p.tiers, l.qty);
  }
}

/** Nome curto da linha no carrinho e na mensagem do pedido */
export function lineTitle(l: Line): string {
  const p = getProduct(l.productId);
  if (!p) return "";
  switch (p.kind) {
    case "cake":
      return `Bolo ${p.name}`;
    case "gelado":
      return `Bolo gelado de ${lowerFirst(p.name)}`;
    case "caseiro":
      return p.name;
    case "doce": {
      const flavor = p.flavors.find((f) => f.id === l.sel.flavor)?.label ?? "";
      if (p.id === "camafeu" || p.id === "doces-classicos") return flavor;
      const name = singular[p.id] ?? p.name;
      if (flavor.startsWith("Brigadeiro ")) return `${name} ${flavor.slice("Brigadeiro ".length)}`;
      if (flavor === "Tradicional") return `${name} tradicional`;
      return `${name} de ${flavor.charAt(0).toLowerCase()}${flavor.slice(1)}`;
    }
  }
}

export const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

const singular: Record<string, string> = {
  "brigadeiros-gourmet": "Brigadeiro gourmet",
  "brigadeiros-especiais": "Brigadeiro especial",
  trufas: "Trufa",
};

/** Detalhes da escolha: tamanho, formato, cobertura... */
export function lineDetail(l: Line): string {
  const p = getProduct(l.productId);
  if (!p) return "";
  const s = l.sel;
  switch (p.kind) {
    case "cake": {
      const size = cakeSizes.find((z) => z.id === s.size);
      const variant = p.variant?.options.find((o) => o.id === s.variant);
      return [
        size ? `${shapeLabel[size.shape]} ${size.label} (${size.serves})` : "",
        variant ? `${p.variant!.label.toLowerCase()} ${variant.label.toLowerCase()}` : "",
      ]
        .filter(Boolean)
        .join(", ");
    }
    case "gelado": {
      if (s.formato !== "forma") return "Pedaço";
      const cut = gelado.cuts.find((c) => c.id === s.corte);
      return `Forma inteira, ${cut?.label ?? ""}${s.corte === "festa" ? " (tamanho festa)" : ""}`;
    }
    case "caseiro": {
      const size = caseiro.sizes.find((z) => z.id === s.size);
      const coat = caseiro.coatings.find((c) => c.id === s.cobertura);
      return [`Tamanho ${size?.label} (${size?.serves})`, p.cremoso ? "" : coat?.label.toLowerCase()].filter(Boolean).join(", ");
    }
    case "doce": {
      const base = p.base?.options.find((o) => o.id === s.base);
      const each = (doceTotal(p.tiers, l.qty) / l.qty).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
      return [base ? `Casca de ${base.label.toLowerCase()}` : "", `${each} cada`].filter(Boolean).join(", ");
    }
  }
}

/** Ilustração da linha */
export function lineArt(l: Line): Art | null {
  const p = getProduct(l.productId);
  if (!p) return null;
  return productArt(p, l.sel);
}

export function productArt(p: Product, sel: Selection): Art {
  switch (p.kind) {
    case "cake":
      return p.art(sel);
    case "gelado":
      return p.art;
    case "caseiro":
      return p.art(sel);
    case "doce": {
      const flavor = p.flavors.find((f) => f.id === sel.flavor) ?? p.flavors[0];
      return withBase(p, flavor.art, sel.base);
    }
  }
}

// Cor da forminha de papel de cada linha de docinhos
const cups: Record<string, string> = {
  "doces-classicos": "#e9b4bb",
  camafeu: "#c9a24f",
  "brigadeiros-gourmet": "#7a5136",
  "brigadeiros-especiais": "#c9a24f",
  trufas: "#d8c3a5",
};

/** Desenho do docinho com a forminha da linha (e a casca escolhida, nas trufas) */
export function withBase(p: DoceProduct, art: BonbonArt, base?: string): BonbonArt {
  return { ...art, cup: art.cup ?? cups[p.id], ...(p.id === "trufas" && base === "branco" ? { body: C.trufaBranca } : {}) };
}

/** Quantidade exibida na linha ("2×" para bolos, "50 un." para docinhos) */
export const isUnits = (l: Line) => getProduct(l.productId)?.kind === "doce";
