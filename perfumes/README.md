# Lorvè

Catálogo online de perfumes árabes, nicho e importados, montado a partir da lista de preços do fornecedor (`LISTA DE PERFUMES Y COSMETICOS 15-06.pdf`): **496 produtos de 20 marcas**, cada um com foto, código, preço, concentração, tamanho e gênero.

O cliente monta a sacola no site e finaliza pelo **WhatsApp**: a mensagem já chega pronta, com códigos, quantidades e total. Não precisa de backend nem de banco de dados.

## O que tem no site

- **Abertura** com o nome se formando e a cortina subindo (uma vez por sessão).
- **Topo** com arco que alterna os frascos, círculos em profundidade que seguem o mouse e poeira dourada subindo (canvas).
- **Faixa de marcas** que acelera e inverte com a velocidade da rolagem. Clicar numa marca filtra o catálogo.
- **Ícones da casa**: vitrine que rola na horizontal enquanto a página desce (no celular vira carrossel com encaixe).
- **Coleções** em grade assimétrica, com os frascos abrindo em leque.
- **Guia de concentração** com frascos que se enchem de líquido.
- **Catálogo** com busca (sem acento, por nome, marca ou código), categorias, filtros (gênero, preço, concentração, marca), ordenação e carregamento contínuo.
- **Ficha do produto**: a foto sai do card e cresce até o modal; no celular abre como gaveta que fecha arrastando. Cada produto tem link próprio (`?p=CODIGO`), bom para mandar no WhatsApp.
- **Sacola** salva no aparelho; a foto do produto voa até o ícone da sacola ao adicionar.

Tudo respeita a opção "reduzir movimento" do sistema: nada se desloca, só aparece com um fade curto.

## Stack

- [Next.js 16](https://nextjs.org) (App Router) com exportação estática (`out/`)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Motion](https://motion.dev) nas animações e [Lenis](https://lenis.darkroom.engineering) na rolagem suave
- Cormorant Garamond (títulos), [Geist](https://vercel.com/font) (texto) e [Phosphor](https://phosphoricons.com) (ícones)

## Rodando localmente

```bash
cd perfumes
npm install
npm run dev      # http://localhost:3000
npm run build    # gera o site estático em ./out
npm start        # serve a pasta ./out
```

## Antes de publicar (obrigatório)

Abra **`lib/site.ts`** e procure por `TODO`:

- [ ] `whatsapp`: número real com DDI + DDD, só dígitos (ex.: `5511912345678`). Hoje está `5500000000000`.
- [ ] `instagram` e `instagramHandle`: perfil oficial. Hoje estão `instagram.com/lorve` e `@lorve`, só de exemplo.
- [ ] `url`: domínio definitivo (SEO, sitemap e prévia de links). Hoje está `https://lorve.com.br`, só de exemplo.
- [ ] `priceMultiplier`: a lista vem com o preço do fornecedor. Use `1.3` para +30%, por exemplo. Todos os preços do site mudam juntos.
- [ ] `priceNote` e `faq`: revise moeda, frete, pagamento e prazos conforme a política comercial.

Também dá para trocar ali os produtos do topo (`heroSlides`, `heroOrbs`) e da vitrine "Ícones da casa" (`featured`), sempre pelo código da lista.

## Atualizando a lista de preços

Quando chegar um PDF novo do fornecedor:

```bash
pip install pymupdf pillow
python scripts/extrair_catalogo.py caminho/para/LISTA.pdf
```

O script lê cada linha da tabela (código, descrição, foto e preço), separa marca, nome, tamanho, concentração e gênero, recorta a foto de cada produto e regrava `lib/catalogo.json` e `public/produtos/*.webp`. Depois é só atualizar `listDate` em `lib/site.ts` e publicar de novo.

Correções de digitação da lista e nomes reescritos à mão ficam nos dicionários `FIXES` e `OVERRIDES` no começo do script.

## Publicando

O build gera HTML estático em `out/`, então funciona em qualquer hospedagem:

- **Vercel** (recomendado): importe o repositório em [vercel.com/new](https://vercel.com/new) e defina **Root Directory = `perfumes`**.
- **Netlify**: base directory `perfumes`, comando `npm run build`, pasta de publicação `perfumes/out`.
- **Hostinger, Locaweb ou cPanel**: rode `npm run build` e envie o conteúdo de `out/` para `public_html`.

## Estrutura

```
app/                  layout, página, SEO (sitemap, robots, ícone)
components/           uma seção por arquivo (hero, vitrine, catálogo, sacola...)
lib/site.ts           textos, contatos e configurações editáveis
lib/catalogo.json     os 496 produtos (gerado pelo script)
lib/catalog.ts        busca, filtros e formatação de preço
lib/store.ts          sacola, filtros e estado da interface
scripts/              extração do catálogo a partir do PDF
public/produtos/      fotos dos produtos (geradas pelo script)
```

As fotos e marcas pertencem aos respectivos fabricantes e foram extraídas da lista do fornecedor.
