// Todo o conteúdo editável do site fica aqui. Procure por TODO antes de publicar.

export const site = {
  name: "Lorvè",
  fullName: "Lorvè",
  tagline: "Perfumaria árabe, nicho e importados",
  title: "Lorvè · Perfumes árabes, nicho e importados",
  description:
    "Mais de 490 fragrâncias de Lattafa, Armaf, Maison Alhambra, Afnan, Xerjoff e outras casas. Monte sua sacola e consulte valores e disponibilidade pelo WhatsApp.",
  // TODO: domínio definitivo (SEO, sitemap e prévia de links)
  url: "https://lorve.com.br",
  // WhatsApp que recebe as consultas: DDI + DDD + número, só dígitos
  whatsapp: "5522999225146",
  // TODO: perfil oficial
  instagram: "https://instagram.com/lorve",
  instagramHandle: "@lorve",

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
      text: "Filtre por marca, categoria, gênero ou concentração e abra cada fragrância para ver os detalhes.",
    },
    {
      title: "Monte a sacola",
      text: "Adicione quantas unidades quiser. A sacola fica salva neste aparelho enquanto você navega.",
    },
    {
      title: "Consulte pelo WhatsApp",
      text: "Um toque e a sua lista chega pronta, com códigos e quantidades. Sem cadastro.",
    },
    {
      title: "Receba",
      text: "A gente responde com os valores e confirma disponibilidade, pagamento e entrega, do jeito que for melhor pra você.",
    },
  ],

  // TODO: revise conforme a política comercial (frete, pagamento, prazos)
  faq: [
    {
      q: "Como sei o valor de cada produto?",
      a: "Os valores são passados pelo WhatsApp. Monte a sacola com o que te interessa e toque em “Consultar pelo WhatsApp”: a mensagem já vai com os códigos e as quantidades, e a gente responde com o preço de cada item.",
    },
    {
      q: "Como faço o pedido?",
      a: "Adicione os produtos à sacola e toque em “Consultar pelo WhatsApp”. A mensagem já vai com os códigos e as quantidades. Depois é só combinar valores, pagamento e entrega na conversa.",
    },
    {
      q: "Todos os produtos estão disponíveis?",
      a: "Como o estoque gira rápido, confirmamos a disponibilidade de cada item na conversa, antes de fechar o pedido.",
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
