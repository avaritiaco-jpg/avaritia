// Todo o conteúdo editável do site. Procure por TODO antes de publicar.
//
// Fonte: perfil público do Instagram @brigadeiriaealgomais (bio, destaques, post fixado e fotos).
// A loja está passando por mudanças de cardápio, estrutura e localização: os avisos ficam em `avisos`
// e devem ser atualizados assim que a dona confirmar cada detalhe.

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
  (process.env.NETLIFY === "true" && process.env.URL ? process.env.URL : "") ||
  "https://brigadeiriaealgomais.com.br"
).replace(/\/$/, "");

// Subpasta onde o site é servido (ex.: "/avaritia/brigadeiria" no GitHub Pages). Vazio na raiz do domínio.
export const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");
/** Caminho de arquivo em public/ com a subpasta do site */
export const asset = (path: string) => `${basePath}${path}`;

export const site = {
  name: "Brigadeiria e Algo Mais",
  title: "Brigadeiria e Algo Mais · Confeitaria fina em Campos dos Goytacazes",
  description:
    "Entremets, macarons, bolos, tortas e docinhos finos em Campos dos Goytacazes desde 2015. Veja os avisos sobre as mudanças da loja e encomende pelo WhatsApp.",
  url: siteUrl,
  since: "julho de 2015",

  // Bio do Instagram: "22 9996-66400" (WhatsApp) e "22 2726-4444" (fixo)
  whatsapp: "5522999666400",
  whatsappDisplay: "(22) 99966-6400",
  phone: "552227264444",
  phoneDisplay: "(22) 2726-4444",
  instagram: "https://www.instagram.com/brigadeiriaealgomais/",
  instagramHandle: "@brigadeiriaealgomais",
  facebook: "https://www.facebook.com/brigadeiriaealgomais/",

  // Endereço que está hoje na bio do Instagram. TODO: trocar pelo novo quando a mudança for confirmada.
  address: {
    label: "Centro de Compras da Pelinca",
    street: "Rua Conselheiro José Fernandes, 458",
    city: "Campos dos Goytacazes (RJ)",
    cep: "28035-232",
    maps: "https://www.google.com/maps/search/?api=1&query=Rua+Conselheiro+Jos%C3%A9+Fernandes+458+Campos+dos+Goytacazes+28035-232",
  },

  nav: [
    { label: "Avisos", href: "#avisos" },
    { label: "Doces", href: "#doces" },
    { label: "Encomendas", href: "#encomendas" },
    { label: "Contato", href: "#contato" },
  ],
};

export const waLink = (text = "Olá! Vim pelo site da Brigadeiria e Algo Mais.") =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;

/* ------------------------------------------------------------------- avisos */

export type Aviso = {
  id: string;
  titulo: string;
  status: string; // etiqueta curta e visível
  tom: "mudanca" | "atencao" | "ok";
  texto: string;
  /** Quando a dona confirmar o detalhe (novo endereço, data, cardápio novo), preencha aqui */
  detalhe?: string;
};

// TODO: atualize a data e os detalhes sempre que algo mudar.
export const avisosAtualizadosEm = "outubro de 2026";

export const avisos: Aviso[] = [
  {
    id: "endereco",
    titulo: "Endereço",
    status: "Em mudança",
    tom: "mudanca",
    texto:
      "Vamos mudar de endereço. O novo local será anunciado aqui e no Instagram. Antes de vir, confirme pelo WhatsApp onde estamos atendendo.",
    detalhe: "",
  },
  {
    id: "cardapio",
    titulo: "Cardápio",
    status: "Em renovação",
    tom: "mudanca",
    texto:
      "O cardápio está sendo renovado: alguns doces podem mudar ou sair. Pergunte pelo WhatsApp o que está disponível na semana.",
    detalhe: "",
  },
  {
    id: "estrutura",
    titulo: "Loja e atendimento",
    status: "Em ajuste",
    tom: "mudanca",
    texto:
      "A estrutura da loja está passando por mudanças. Horários e forma de atendimento podem variar nesse período.",
    detalhe: "",
  },
  {
    id: "entremets",
    titulo: "Vem de outra cidade?",
    status: "Avise antes",
    tom: "atencao",
    texto:
      "Clientes que vêm de outras cidades para comprar entremet: entrem em contato com antecedência para garantir o seu.",
  },
  {
    id: "contato",
    titulo: "Telefones e Instagram",
    status: "Continuam iguais",
    tom: "ok",
    texto: "O WhatsApp, o telefone e o Instagram continuam os mesmos. É por eles que avisamos cada novidade.",
  },
];

/* ------------------------------------------------------------------ doces */

export const categorias = [
  {
    id: "entremets",
    nome: "Entremets",
    texto: "Sobremesas de mousse em forma de fruta: tangerina, limão siciliano, morango, maçã, manga.",
  },
  { id: "macarons", nome: "Macarons", texto: "Em caixa ou em torres decoradas com flores, nas cores da festa." },
  { id: "bolos", nome: "Bolos", texto: "Espatulados, com frutas vermelhas ou de chocolate, para aniversários e celebrações." },
  { id: "tortas", nome: "Tortas", texto: "Pistache com morango, crocante de castanhas e outras para a mesa de doces." },
  { id: "docinhos", nome: "Docinhos finos", texto: "Brigadeiros e docinhos nas forminhas, brownies e sobremesas individuais." },
  { id: "datas", nome: "Datas especiais", texto: "Natal, festa junina e outras datas ganham doces temáticos." },
] as const;

/* ------------------------------------------------------------- encomendas */

export const passos = [
  { titulo: "Mande uma mensagem", texto: "Pelo WhatsApp, diga o que deseja, a quantidade e a data." },
  { titulo: "A equipe confirma", texto: "Você recebe a disponibilidade, o valor e como fica a retirada." },
  { titulo: "Retire no dia", texto: "No local e horário combinados. Durante as mudanças, confirme o endereço antes de sair." },
];
