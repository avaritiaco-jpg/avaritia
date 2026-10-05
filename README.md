# Avaritia

Site institucional da **Avaritia**, agência de desenvolvimento de sites. Uma landing page escura e premium, focada em conversão: cada seção leva o visitante para o pedido de orçamento pelo WhatsApp.

## Stack

- [Next.js 16](https://nextjs.org) (App Router) com exportação estática (`out/`)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Motion](https://motion.dev) para as animações (respeita "reduzir movimento" do sistema)
- [Geist](https://vercel.com/font) como tipografia, [Phosphor](https://phosphoricons.com) nos ícones e [Simple Icons](https://simpleicons.org) nos logos de tecnologia

## Rodando localmente

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # gera o site estático em ./out
npm start        # serve a pasta ./out
```

## Editando o conteúdo

Todo o texto do site fica em **`lib/site.ts`**: contatos, menu, manifesto, projetos, etapas do processo, depoimentos e perguntas frequentes. Não é preciso mexer nos componentes para trocar conteúdo.

### Antes de publicar (obrigatório)

Procure por `TODO` em `lib/site.ts` e troque:

- [ ] `whatsapp`: número real com DDI + DDD, só dígitos (ex.: `5511912345678`). Hoje está `5500000000000`.
- [ ] `email`, `instagram` e `instagramHandle` oficiais.
- [ ] `url`: domínio definitivo (usado no SEO, sitemap e prévia de links).
- [ ] `testimonials`: os depoimentos atuais são **exemplos**. Substitua por depoimentos reais (ou deixe a lista vazia, que a seção some).
- [ ] `projects`: os 5 projetos atuais são **projetos conceito** criados para o portfólio (exibem o selo "Projeto conceito"). Adicione projetos reais com `concept: false` e `url` do site no ar.
- [ ] `faq` e `steps`: revise prazos e condições conforme a política comercial.

### Imagens do portfólio

Ficam em `public/projects/` no formato `nome-desktop.webp` (1800×1125) e `nome-mobile.webp` (780×1688). Para um projeto real, tire um print da página inicial no desktop (1440×900) e no celular (390×844) e salve com esses tamanhos.

A imagem de compartilhamento (WhatsApp, Instagram, LinkedIn) é `public/og.jpg` (1200×630).

## Publicando

O build gera HTML estático em `out/`, então funciona em qualquer hospedagem:

- **Vercel** (recomendado): importe o repositório em [vercel.com/new](https://vercel.com/new). Nenhuma configuração extra.
- **Netlify**: comando de build `npm run build`, pasta de publicação `out`.
- **Hostinger, Locaweb ou cPanel**: rode `npm run build` e envie o conteúdo da pasta `out/` para `public_html`.

## Estrutura

```
app/            layout, página, SEO (sitemap, robots, ícone)
components/     uma seção por arquivo (hero, serviços, projetos, processo...)
lib/site.ts     todo o conteúdo editável
public/         imagens do portfólio e og.jpg
```

O formulário de contato não precisa de backend: ele valida os campos e abre o WhatsApp com a mensagem já preenchida.

## Outros projetos neste repositório

- **[`perfumes/`](perfumes/README.md)**: Lorvè, catálogo de 496 perfumes gerado a partir da lista do fornecedor em PDF, sem preços, com sacola e consulta pelo WhatsApp. É um projeto Next.js independente: rode os comandos de dentro da pasta `perfumes/`.
