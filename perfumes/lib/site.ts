// Todo o conteúdo editável do site fica aqui. Procure por TODO antes de publicar.

export const site = {
  name: "Âmbar",
  fullName: "Âmbar Perfumaria",
  tagline: "Perfumaria árabe, nicho e importados",
  title: "Âmbar Perfumaria · Perfumes árabes, nicho e importados",
  description:
    "Mais de 490 fragrâncias de Lattafa, Armaf, Maison Alhambra, Afnan, Xerjoff e outras casas. Monte sua sacola e finalize o pedido pelo WhatsApp.",
  // TODO: domínio definitivo (SEO, sitemap e prévia de links)
  url: "https://ambarperfumaria.com.br",
  // TODO: número real com DDI + DDD, só dígitos (ex.: 5511912345678)
  whatsapp: "5500000000000",
  // TODO: perfil oficial
  instagram: "https://instagram.com/ambarperfumaria",
  instagramHandle: "@ambarperfumaria",

  // Preços: a lista do fornecedor vem em dólar, sem IVA.
  currency: "USD",
  // Multiplicador aplicado a todos os preços da lista (1 = preço da lista; 1.3 = +30%).
  priceMultiplier: 1,
  priceNote: "Valores em dólar (US$), sem IVA de 10%.",
  listDate: "15/06",

  nav: [
    { label: "Ícones", href: "#icones" },
    { label: "Coleções", href: "#colecoes" },
    { label: "Catálogo", href: "#catalogo" },
    { label: "Como comprar", href: "#como-comprar" },
  ],

  // Topo da página: o arco central alterna entre estes produtos; os círculos mostram os outros dois
  heroSlides: ["8678-3", "9664-5", "7239-7", "8019-4"],
  heroOrbs: ["9709-3", "7468-1"],

  // Vitrine "Ícones da casa" (rolagem horizontal)
  featured: [
    { code: "7468-1", note: "O clássico amadeirado-defumado que virou referência." },
    { code: "7237-3", note: "Tâmaras, canela e baunilha. Doce, quente, inesquecível." },
    { code: "9664-5", note: "Cítrico frutado de nicho italiano, assinado por Xerjoff." },
    { code: "8678-3", note: "Âmbar dourado em frasco de joalheria." },
    { code: "7239-7", note: "Cremoso e frutal, num frasco rosa que virou ícone." },
    { code: "9709-3", note: "Intenso e marcante, com a serpente dourada no frasco." },
    { code: "8019-4", note: "A edição dourada do Amber Oud, doce e luminosa." },
    { code: "7242-7", note: "Especiado, com pimenta-preta, tabaco e baunilha." },
  ],

  steps: [
    {
      title: "Escolha",
      text: "Filtre por marca, família, gênero ou faixa de preço e abra cada fragrância para ver os detalhes.",
    },
    {
      title: "Monte a sacola",
      text: "Adicione quantas unidades quiser. A sacola fica salva neste aparelho enquanto você navega.",
    },
    {
      title: "Envie pelo WhatsApp",
      text: "Um toque e o pedido chega pronto, com códigos, quantidades e total. Sem cadastro.",
    },
    {
      title: "Receba",
      text: "Confirmamos disponibilidade, pagamento e entrega na conversa, do jeito que for melhor pra você.",
    },
  ],

  // TODO: revise conforme a política comercial (frete, pagamento, prazos)
  faq: [
    {
      q: "Os preços estão em qual moeda?",
      a: "Em dólar (US$), conforme a lista de preços vigente, sem IVA de 10%. O valor final é confirmado na conversa pelo WhatsApp.",
    },
    {
      q: "Como faço o pedido?",
      a: "Adicione os produtos à sacola e toque em “Finalizar pelo WhatsApp”. A mensagem já vai com os códigos, as quantidades e o total. É só enviar.",
    },
    {
      q: "Todos os produtos estão disponíveis?",
      a: "O catálogo segue a lista mais recente do fornecedor. Como o estoque gira rápido, confirmamos a disponibilidade de cada item antes de fechar o pedido.",
    },
    {
      q: "Qual a diferença entre Extrait, Parfum, EDP e EDT?",
      a: "É a concentração de essência. Quanto maior, mais intenso e duradouro: Extrait e Parfum ficam no topo, depois Eau de Parfum (EDP) e Eau de Toilette (EDT). Body splash e mists são mais leves, ideais para reaplicar ao longo do dia.",
    },
    {
      q: "Posso comprar para revender?",
      a: "Pode. Chame no WhatsApp com a lista do que precisa e as quantidades que montamos o orçamento.",
    },
  ],
} as const;

export function whatsappLink(message?: string) {
  const base = `https://wa.me/${site.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
