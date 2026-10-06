// Todo o conteúdo editável do site. Procure por TODO antes de publicar.
//
// Dados levantados em perfis públicos da loja (Instagram @brigadeiriaealgomais, Facebook e TripAdvisor):
// endereço, telefone, WhatsApp, horário, "desde 2015", brigadeiros de chocolate belga em mais de 40 sabores,
// brownie, alfajor, pão de mel, bolo de cenoura com brigadeiro, tortas, café orgânico, cappuccino,
// chocolate quente e presentes.

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
  (process.env.NETLIFY === "true" && process.env.URL ? process.env.URL : "") ||
  "https://brigadeiriaealgomais.com.br"
).replace(/\/$/, "");

export const site = {
  name: "Brigadeiria & Algo Mais",
  title: "Brigadeiria & Algo Mais · Brigadeiros de chocolate belga em Campos dos Goytacazes",
  description:
    "Mais de 40 sabores de brigadeiro feitos com chocolate belga, brownie, alfajor, pão de mel, bolos, tortas e café orgânico no centro de Campos dos Goytacazes.",
  url: siteUrl,
  since: 2015,

  // TODO: confirme o número. As fontes públicas trazem "(22) 99966-6400".
  whatsapp: "5522999666400",
  whatsappDisplay: "(22) 99966-6400",
  phone: "552227264444",
  phoneDisplay: "(22) 2726-4444",
  instagram: "https://instagram.com/brigadeiriaealgomais",
  instagramHandle: "@brigadeiriaealgomais",

  address: {
    street: "Rua Conselheiro José Fernandes, 458, loja 3",
    district: "Centro",
    city: "Campos dos Goytacazes",
    state: "RJ",
    maps: "https://www.google.com/maps/search/?api=1&query=Brigadeiria+%26+Algo+Mais+Rua+Conselheiro+Jos%C3%A9+Fernandes+458+Campos+dos+Goytacazes",
  },

  // TODO: confirme o horário. 0 = domingo. Horários em minutos desde a meia-noite.
  hours: {
    label: "Segunda a sábado, das 10h30 às 19h30",
    days: [1, 2, 3, 4, 5, 6] as number[],
    open: 10 * 60 + 30,
    close: 19 * 60 + 30,
  },

  nav: [
    { label: "Sabores", href: "#sabores" },
    { label: "Monte sua caixa", href: "#caixa" },
    { label: "Algo mais", href: "#algo-mais" },
    { label: "Visite", href: "#visite" },
  ],
};

export const waLink = (text = "Olá! Vim pelo site e queria fazer um pedido.") =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;

/* ------------------------------------------------------------------ sabores */

/** Finalização que cobre o brigadeiro: decide como ele é desenhado */
export type Topping =
  | "granulado" // granulado de chocolate
  | "crocante" // castanhas, pistache, paçoca, biscoito
  | "po" // leite em pó, cacau, açúcar e canela
  | "coco" // coco ralado
  | "brulee" // casquinha de açúcar queimado
  | "liso"; // banhado, com um detalhe por cima

export type Flavor = {
  id: string;
  name: string;
  note: string;
  base: string; // cor da massa
  topping: Topping;
  bits: string[]; // cores da finalização
  cup: string; // cor da forminha
  detail?: "folha" | "fio" | "coracao"; // detalhe no topo
};

// TODO: confira a lista com o cardápio do balcão. São 40+ sabores na loja; aqui ficam os que abrem a vitrine.
export const flavors: Flavor[] = [
  { id: "belga", name: "Tradicional belga", note: "Chocolate belga ao leite e granulado belga", base: "#4a2418", topping: "granulado", bits: ["#2a120b", "#3b1c12", "#5a2e1f"], cup: "#2b1510" },
  { id: "meio-amargo", name: "Meio amargo", note: "Chocolate 54% e cacau em pó", base: "#3a1a10", topping: "po", bits: ["#5b3426", "#6e4231"], cup: "#1f0f0b", detail: "folha" },
  { id: "pistache", name: "Pistache", note: "Creme de pistache e pistache picado", base: "#b9c27a", topping: "crocante", bits: ["#7f9a3f", "#a5b85a", "#c9d48c"], cup: "#e9e3d2" },
  { id: "creme-brulee", name: "Crème brûlée", note: "Baunilha com casquinha maçaricada", base: "#ecd3a0", topping: "brulee", bits: ["#c27a2c", "#9c5a1c"], cup: "#f3ead8" },
  { id: "ninho", name: "Leite Ninho", note: "Brigadeiro branco e leite em pó", base: "#f2e6cf", topping: "po", bits: ["#fffaf0", "#f7eedd"], cup: "#ffffff" },
  { id: "churros", name: "Churros", note: "Doce de leite, açúcar e canela", base: "#c08a52", topping: "po", bits: ["#e8c48f", "#a8703e", "#f3dcb4"], cup: "#e5c79f" },
  { id: "cafe", name: "Café", note: "Café orgânico passado na hora", base: "#5c3523", topping: "granulado", bits: ["#2b170e", "#e9d9c3", "#3d2316"], cup: "#c9a46b" },
  { id: "morango", name: "Morango", note: "Brigadeiro branco com morango", base: "#f2a7b4", topping: "liso", bits: ["#e45a76"], cup: "#ffd9e0", detail: "coracao" },
  { id: "pacoca", name: "Paçoca", note: "Amendoim torrado e paçoca esfarelada", base: "#cfa36a", topping: "crocante", bits: ["#e4c290", "#b98a52", "#f0d9b3"], cup: "#d8b98b" },
  { id: "coco", name: "Beijinho", note: "Coco fresco ralado", base: "#f6efe3", topping: "coco", bits: ["#ffffff", "#f1e7d6"], cup: "#ffffff" },
  { id: "maracuja", name: "Maracujá", note: "Brigadeiro branco com calda de maracujá", base: "#f5d36a", topping: "liso", bits: ["#3a2a12"], cup: "#fff2c4", detail: "fio" },
  { id: "dourado", name: "Belga com ouro", note: "Chocolate belga banhado e folha de ouro", base: "#3b1b12", topping: "liso", bits: ["#d8b04c"], cup: "#c9a24f", detail: "folha" },
];

export const flavorById = Object.fromEntries(flavors.map((f) => [f.id, f])) as Record<string, Flavor>;

// TODO: confirme os tamanhos de caixa vendidos na loja.
export const boxSizes = [4, 6, 9, 12] as const;

/* --------------------------------------------------------------- algo mais */

export type Treat = {
  id: "brownie" | "alfajor" | "pao-de-mel" | "bolo-cenoura" | "torta" | "cafe" | "presente";
  name: string;
  text: string;
};

export const treats: Treat[] = [
  { id: "bolo-cenoura", name: "Bolo de cenoura com brigadeiro", text: "Massa fofinha e uma camada generosa de brigadeiro belga por cima." },
  { id: "cafe", name: "Café, cappuccino e chocolate quente", text: "Café orgânico feito na hora para acompanhar o doce." },
  { id: "brownie", name: "Brownie", text: "Casquinha que quebra e miolo úmido." },
  { id: "alfajor", name: "Alfajor", text: "Doce de leite entre biscoitos, banhado no chocolate." },
  { id: "pao-de-mel", name: "Pão de mel", text: "Especiarias, recheio e cobertura de chocolate." },
  { id: "torta", name: "Bolos e tortas", text: "Inteiros por encomenda ou em fatia na vitrine." },
  { id: "presente", name: "Presentes", text: "Caixas montadas para aniversário, agradecimento ou só porque sim." },
];

/* ---------------------------------------------------------------- processo */

export const steps = [
  { title: "Chocolate belga", text: "Tudo começa com chocolate belga de verdade, em vez de achocolatado." },
  { title: "Ponto no tacho", text: "Mexido sem pressa até soltar do fundo da panela." },
  { title: "Enrolado à mão", text: "Cada bolinha é enrolada uma a uma, no tamanho certo." },
  { title: "Na forminha", text: "Finalizado com granulado, pistache, coco ou casquinha e direto para a vitrine." },
];

export const faq = [
  {
    q: "Vocês fazem encomenda para festa?",
    a: "Sim. Mande pelo WhatsApp a data, a quantidade e os sabores e a equipe confirma a disponibilidade e o valor.",
  },
  {
    q: "Dá para escolher os sabores da caixa?",
    a: "Dá. Use o \"Monte sua caixa\" aqui no site: ele já envia a lista de sabores pronta pelo WhatsApp.",
  },
  {
    q: "Posso tomar café aí na loja?",
    a: "Pode. Tem café orgânico, cappuccino e chocolate quente para acompanhar os doces, no centro de Campos.",
  },
];
