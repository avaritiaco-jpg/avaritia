# Lorvè

Catálogo online de perfumes árabes, nicho e importados, montado a partir da lista do fornecedor (`LISTA DE PERFUMES Y COSMETICOS 15-06.pdf`): **496 produtos de 20 marcas**, cada um com foto, código, concentração, tamanho e gênero.

**O site não mostra preços.** O cliente monta a sacola e toca em *Consultar pelo WhatsApp*: a mensagem já chega pronta, com códigos e quantidades, e os valores são passados na conversa. Não precisa de backend nem de banco de dados.

Os preços da lista também ficam fora do código: o script de extração não os lê, então não vão para o `catalogo.json` nem para o JavaScript do site.

## O que tem no site

- **Abertura** com o nome se formando e a cortina subindo (uma vez por sessão).
- **Topo** com arco que alterna os frascos, círculos em profundidade que seguem o mouse e poeira dourada subindo (canvas).
- **Faixa de marcas** que acelera e inverte com a velocidade da rolagem. Clicar numa marca filtra o catálogo.
- **Ícones da casa**: vitrine que rola na horizontal enquanto a página desce (no celular vira carrossel com encaixe).
- **Coleções** em grade assimétrica, com os frascos abrindo em leque.
- **Guia de concentração** com frascos que se enchem de líquido.
- **Catálogo** com busca (sem acento, por nome, marca ou código), categorias, filtros (gênero, concentração, marca), ordenação e carregamento contínuo.
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

O WhatsApp que recebe as consultas já está configurado em `whatsapp` (`lib/site.ts`). Ainda em **`lib/site.ts`**, procure por `TODO`:

- [ ] `instagram` e `instagramHandle`: perfil oficial (ex.: `https://instagram.com/seuperfil` e `@seuperfil`). Enquanto estiverem vazios, o link do Instagram não aparece no site.
- [ ] Endereço do site (SEO, sitemap e prévia de links): na Vercel e na Netlify ele vem do próprio deploy. Com domínio próprio, defina a variável `NEXT_PUBLIC_SITE_URL` (ex.: `https://www.seudominio.com.br`) no painel da hospedagem.
- [ ] `faq` e `steps`: revise frete, pagamento e prazos conforme a política comercial.

Também dá para trocar ali os produtos do topo (`heroSlides`, `heroOrbs`) e da vitrine "Ícones da casa" (`featured`), sempre pelo código da lista.

## Atualizando o catálogo

Quando chegar um PDF novo do fornecedor:

```bash
pip install pymupdf pillow
python scripts/extrair_catalogo.py caminho/para/LISTA.pdf
```

O script lê cada linha da tabela (código, descrição e foto), separa marca, nome, tamanho, concentração e gênero, recorta a foto de cada produto e regrava `lib/catalogo.json` e `public/produtos/*.webp`. A coluna de preço é ignorada de propósito. Depois é só publicar de novo.

Correções de digitação da lista e nomes reescritos à mão ficam nos dicionários `FIXES` e `OVERRIDES` no começo do script.

## Publicando

O build gera HTML estático em `out/`, então funciona em qualquer hospedagem:

- **Vercel** (recomendado): em [vercel.com/new](https://vercel.com/new), importe o repositório, defina **Root Directory = `perfumes`** e clique em Deploy. O endereço (`*.vercel.app`) sai em cerca de um minuto; o domínio próprio se conecta depois em Settings → Domains.
- **Netlify**: base directory `perfumes`, comando `npm run build`, pasta de publicação `perfumes/out`.
- **Hostinger, Locaweb ou cPanel**: rode `npm run build` e envie o conteúdo de `out/` para `public_html`.

## Estrutura

```
app/                  layout, página, SEO (sitemap, robots, ícone)
components/           uma seção por arquivo (hero, vitrine, catálogo, sacola...)
lib/site.ts           textos, contatos e configurações editáveis
lib/catalogo.json     os 496 produtos (gerado pelo script)
lib/catalog.ts        busca, filtros e ordenação
lib/store.ts          sacola, filtros e estado da interface
scripts/              extração do catálogo a partir do PDF
public/produtos/      fotos dos produtos (geradas pelo script)
```

As fotos e marcas pertencem aos respectivos fabricantes e foram extraídas da lista do fornecedor.
