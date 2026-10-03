/**
 * Todo o conteúdo editável do site fica neste arquivo.
 * Itens marcados com TODO precisam ser trocados pelos dados reais da Avaritia antes de publicar.
 */

export const site = {
  name: "Avaritia",
  // TODO: domínio definitivo (usado no SEO, sitemap e cartões de compartilhamento)
  url: "https://avaritia.com.br",
  title: "Avaritia | Criação de sites profissionais",
  description:
    "Agência de desenvolvimento de sites. Criamos sites institucionais, landing pages e lojas virtuais rápidos, bonitos e pensados para vender.",
  // TODO: número do WhatsApp com DDI + DDD, só dígitos (ex.: 5511912345678)
  whatsapp: "5500000000000",
  whatsappGreeting: "Olá, Avaritia! Vim pelo site e quero um orçamento.",
  // TODO: e-mail e Instagram oficiais
  email: "contato@avaritia.com.br",
  instagram: "https://instagram.com/avaritia",
  instagramHandle: "@avaritia",
  cta: "Quero meu site",
};

export function whatsappLink(message: string = site.whatsappGreeting) {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}

export const nav = [
  { label: "Serviços", href: "#servicos" },
  { label: "Projetos", href: "#projetos" },
  { label: "Processo", href: "#processo" },
  { label: "Dúvidas", href: "#duvidas" },
];

export const manifesto = {
  text: "Seu site é o primeiro vendedor que o cliente conhece. Quando ele é lento, confuso ou genérico, o cliente fecha a aba antes de ouvir o que você tem a dizer. Nós construímos o contrário: sites que carregam rápido, passam confiança e",
  highlight: "transformam visitas em clientes.",
};

export type Project = {
  name: string;
  type: string;
  segment: string;
  image: string;
  mobile: string;
  // true = projeto conceito criado pela Avaritia (exibe o selo "Projeto conceito")
  concept: boolean;
  url?: string;
};

// TODO: substitua ou complemente com projetos reais de clientes (concept: false e url do site no ar)
export const projects: Project[] = [
  {
    name: "Lumière Odontologia",
    type: "Site institucional",
    segment: "Saúde",
    image: "/projects/lumiere-desktop.webp",
    mobile: "/projects/lumiere-mobile.webp",
    concept: true,
  },
  {
    name: "Brasa & Lenha",
    type: "Site com cardápio digital",
    segment: "Gastronomia",
    image: "/projects/brasa-desktop.webp",
    mobile: "/projects/brasa-mobile.webp",
    concept: true,
  },
  {
    name: "Verdê Cosméticos",
    type: "Loja virtual",
    segment: "Beleza",
    image: "/projects/verde-desktop.webp",
    mobile: "/projects/verde-mobile.webp",
    concept: true,
  },
  {
    name: "Moreira Castro Advocacia",
    type: "Site institucional",
    segment: "Jurídico",
    image: "/projects/moreira-desktop.webp",
    mobile: "/projects/moreira-mobile.webp",
    concept: true,
  },
  {
    name: "Pulso Academia",
    type: "Landing page",
    segment: "Fitness",
    image: "/projects/pulso-desktop.webp",
    mobile: "/projects/pulso-mobile.webp",
    concept: true,
  },
];

export const steps = [
  {
    title: "Conversa",
    time: "1 a 2 dias",
    text: "Entendemos seu negócio, seu público e seus objetivos. Você sai com escopo, prazo e valor definidos.",
  },
  {
    title: "Design",
    time: "Semana 1",
    text: "Desenhamos o layout no Figma e ajustamos com você até ficar com a cara da sua marca.",
  },
  {
    title: "Desenvolvimento",
    time: "Semanas 2 e 3",
    text: "Transformamos o design em código: responsivo, rápido e otimizado para aparecer no Google.",
  },
  {
    title: "Lançamento",
    time: "Semana 4",
    text: "Publicamos, configuramos domínio e métricas e mostramos como atualizar o conteúdo.",
  },
];

// TODO: EXEMPLOS. Substitua por depoimentos reais de clientes antes de publicar.
export const testimonials = [
  {
    quote:
      "Entregaram antes do prazo e o site ficou exatamente com a cara da clínica. Hoje os pacientes chegam dizendo que nos encontraram pelo Google.",
    name: "Helena Prado",
    role: "Diretora clínica, Odontologia Prado",
  },
  {
    quote:
      "Eu não entendia nada de site e eles explicaram tudo sem enrolação. O suporte pelo WhatsApp responde rápido de verdade.",
    name: "Marcos Tavares",
    role: "Proprietário, Tavares Auto Center",
  },
  {
    quote:
      "A loja virtual ficou leve e bonita. Em poucos meses as vendas pelo site viraram uma parte importante do faturamento.",
    name: "Juliana Reis",
    role: "Fundadora, Ateliê Reis",
  },
];

// TODO: revise prazos e condições para refletir a política comercial da Avaritia
export const faq = [
  {
    q: "Quanto custa um site?",
    a: "Depende do tamanho do projeto e das funcionalidades. Depois de uma conversa rápida, enviamos um orçamento fechado, sem surpresas no meio do caminho.",
  },
  {
    q: "Quanto tempo leva para ficar pronto?",
    a: "Uma landing page fica pronta em cerca de 1 a 2 semanas. Sites institucionais e lojas virtuais levam de 3 a 6 semanas, de acordo com o escopo.",
  },
  {
    q: "Preciso já ter domínio e hospedagem?",
    a: "Não. Cuidamos de tudo: registro do domínio, hospedagem, certificado de segurança (SSL) e e-mail profissional, se você quiser.",
  },
  {
    q: "Vou conseguir atualizar o site sozinho?",
    a: "Sim. Quando faz sentido, entregamos um painel simples para editar textos, imagens e produtos, com um treinamento rápido. Se preferir, fazemos as alterações por você.",
  },
  {
    q: "O site vai aparecer no Google?",
    a: "Todo projeto sai com SEO técnico configurado: velocidade, estrutura de títulos, metadados e cadastro no Google Search Console. É a base para ser encontrado.",
  },
  {
    q: "Vocês fazem manutenção depois da entrega?",
    a: "Sim. Temos planos mensais com hospedagem, backups, atualizações de segurança e ajustes de conteúdo, tudo com atendimento pelo WhatsApp.",
  },
];

export const projectTypes = [
  "Site institucional",
  "Landing page",
  "Loja virtual",
  "Sistema sob medida",
  "Ainda não sei",
];
