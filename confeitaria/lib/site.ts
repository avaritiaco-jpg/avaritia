// Contatos, regras de encomenda e textos editáveis. Procure por TODO antes de publicar.

// Endereço público do site (SEO, sitemap e prévia de links). Na Vercel e na Netlify ele vem do próprio
// deploy; com domínio próprio, defina NEXT_PUBLIC_SITE_URL no painel da hospedagem.
const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
  (process.env.NETLIFY === "true" && process.env.URL ? process.env.URL : "") ||
  "https://cianinhaconfeitaria.com.br"
).replace(/\/$/, "");

export const site = {
  name: "Cianinha",
  fullName: "Cianinha Confeitaria",
  title: "Cianinha Confeitaria · Bolos, docinhos e brigadeiros por encomenda",
  description:
    "Bolos confeitados, bolo gelado, brigadeiros gourmet, trufas e caseirinhos por encomenda. Monte o pedido no site, pague o sinal por Pix e retire na data marcada.",
  url: siteUrl,

  // WhatsApp que recebe os pedidos: DDI + DDD + número, só dígitos
  whatsapp: "5535987035253",
  whatsappDisplay: "(35) 98703-5253",
  instagram: "https://instagram.com/cianinhaconfeitaria",
  instagramHandle: "@cianinhaconfeitaria",

  // TODO: endereço de retirada (aparece na confirmação do pedido). Vazio: "enviado pelo WhatsApp".
  address: "" as string,

  // Pagamento do sinal na tela de confirmação.
  // TODO: chave Pix (CPF, CNPJ, e-mail, celular com +55 ou chave aleatória) e a cidade do recebedor.
  // Com a chave preenchida, o site gera o QR Code e o "copia e cola" já com o valor do sinal.
  pix: {
    key: "" as string,
    receiver: "Cianinha Confeitaria",
    city: "" as string,
  },
  // TODO: usuário do PicPay, sem o @. Preenchido, o site mostra o link de pagamento com o valor.
  picpay: "" as string,

  // Regras do cardápio 2026
  leadDays: 2, // encomendas com 2 dias de antecedência
  openDays: [2, 3, 4, 5, 6] as number[], // terça (2) a sábado (6)
  deposit: 0.5, // 50% do valor no ato da encomenda

  nav: [
    { label: "Cardápio", href: "#cardapio" },
    { label: "Tamanhos", href: "#tamanhos" },
    { label: "Como encomendar", href: "#como-encomendar" },
    { label: "Dúvidas", href: "#duvidas" },
  ],

  steps: [
    {
      title: "Escolha",
      text: "Monte o carrinho com o sabor, o tamanho e a quantidade de cada item.",
    },
    {
      title: "Marque a data",
      text: "Encomendas com 2 dias de antecedência, para retirar de terça a sábado.",
    },
    {
      title: "Pague o sinal",
      text: "50% do valor no ato da encomenda, por Pix, PicPay ou dinheiro.",
    },
    {
      title: "Retire",
      text: "Seu pedido fica pronto na data combinada. O restante você acerta na retirada.",
    },
  ],

  faq: [
    {
      q: "Com quanto tempo de antecedência preciso encomendar?",
      a: "Com 2 dias de antecedência. O calendário da página de pagamento já mostra só as datas disponíveis.",
    },
    {
      q: "Quais dias posso retirar?",
      a: "Atendemos de terça a sábado. Encomendas para domingo são retiradas no sábado, às 16h.",
    },
    {
      q: "Vocês entregam?",
      a: "Não fazemos entrega de bolos confeitados, apenas retirada. Para outros itens, pergunte no WhatsApp.",
    },
    {
      q: "Como funciona o pagamento?",
      a: "Pedimos 50% do valor no ato da encomenda, por Pix, PicPay ou dinheiro. Pagando por Pix ou PicPay, envie o comprovante antes da retirada.",
    },
    {
      q: "Posso mudar a decoração ou a cobertura do bolo?",
      a: "A decoração segue o padrão de cada sabor. Para detalhes, troca de cobertura, topper, flores naturais, brigadeiros na decoração ou ganaches especiais, conte nas observações do pedido: pode haver alteração de valor.",
    },
    {
      q: "Qual a quantidade mínima de docinhos?",
      a: "25 unidades por sabor. Os valores de 25, 50 e 100 unidades valem para doces do mesmo sabor.",
    },
  ],
} as const;

export function whatsappLink(message?: string) {
  const base = `https://wa.me/${site.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
