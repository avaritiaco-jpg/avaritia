# Brigadeiria & Algo Mais

Site da **Brigadeiria & Algo Mais**, brigaderia e café no centro de Campos dos Goytacazes (RJ), aberta desde 2015. Tem mais de 40 sabores de brigadeiro feitos com chocolate belga, além de brownie, alfajor, pão de mel, bolos, tortas, café orgânico, cappuccino e chocolate quente.

Os dados vieram dos perfis públicos da loja (Instagram [@brigadeiriaealgomais](https://instagram.com/brigadeiriaealgomais), Facebook e TripAdvisor): endereço, telefone, WhatsApp, horário, ano de abertura e linha de produtos.

## O que tem no site

- **Topo**: o brigadeiro do centro troca de sabor sozinho, caindo com efeito de "squash & stretch". Ele gira seguindo o mouse (o granulado se mexe e o brilho fica parado) e, quando clicado, espirra granulado e mostra o próximo sabor. Os brigadeiros em volta flutuam em profundidades diferentes e um anel de texto gira atrás.
- **Faixa de sabores**: corre sozinha e acelera ou inverte com a velocidade da rolagem.
- **Vitrine** (`#sabores`): no desktop a seção fica presa na tela e a rolagem vertical empurra a prateleira para o lado. Os brigadeiros **rolam de verdade**, girando na proporção do caminho andado. No celular vira uma faixa com rolagem lateral nativa. O botão "+ caixa" separa o sabor para a caixa.
- **Monte sua caixa** (`#caixa`): a pessoa escolhe o tamanho (4, 6, 9 ou 12) e toca nos sabores. Cada brigadeiro voa em arco até a próxima casinha. Quando a caixa enche, a tampa fecha, a fita se amarra e o botão envia pelo WhatsApp a lista pronta ("2x Pistache, 1x Morango..."). No celular, um resumo fixo embaixo mostra quantos já entraram.
- **Do tacho à forminha**: o único bloco cor de chocolate, com bordas de chocolate derretido. A seção fica presa enquanto a rolagem passa pelas quatro etapas (barra de chocolate belga, tacho mexendo, bolinha sendo enrolada, chuva de granulado na forminha).
- **E o "algo mais"?** (`#algo-mais`): mosaico com os outros doces e o café. Cada card inclina em 3D seguindo o mouse, com uma luz que acompanha o ponteiro.
- **Passa aqui no centro** (`#visite`): endereço, horário com o aviso de **aberto agora / fechado agora** (no fuso de Brasília), telefone, Instagram, botão "Como chegar" e perguntas rápidas.
- **Final**: "Bateu vontade?" com brigadeiros caindo e se amontoando sobre o rodapé.

Tudo funciona no **modo claro e no escuro** (segue o sistema) e respeita a opção **"reduzir movimento"**: nada se desloca, só aparece com um fade curto, e a vitrine e o processo viram blocos comuns.

### Ilustrações

Não existe nenhuma foto de terceiros no site. Os brigadeiros são desenhados pelo próprio código a partir de cada sabor (`components/brigadeiro.tsx`): massa, finalização (granulado, crocante, pó, coco, casquinha brûlée ou banhado), detalhe no topo e a forminha plissada. Os outros doces e o café estão em `components/treats.tsx`.

Quando a loja tiver fotos próprias, elas podem entrar no lugar dos desenhos.

## Antes de publicar (obrigatório)

Em **`lib/site.ts`**, procure por `TODO`:

- [ ] **WhatsApp**: as fontes públicas trazem `(22) 99966-6400`. Confirme o número, porque é para ele que vão os pedidos.
- [ ] **Horário**: está "segunda a sábado, das 10h30 às 19h30". Uma das fontes dizia 11h às 20h. O aviso de "aberto agora" usa estes valores.
- [ ] **Sabores**: os 12 da vitrine são sabores clássicos de brigaderia escolhidos para abrir o site (pistache e crème brûlée aparecem nas avaliações da loja). Troque pela lista real do balcão. Cada sabor tem as cores do desenho e o tipo de finalização.
- [ ] **Tamanhos de caixa**: 4, 6, 9 e 12 unidades. Ajuste para os tamanhos que a loja vende.
- [ ] **Endereço do site** (SEO e prévia de links): na Vercel e na Netlify ele vem do próprio deploy. Com domínio próprio, defina a variável `NEXT_PUBLIC_SITE_URL`.

O site não mostra preços: o valor é confirmado pela equipe no WhatsApp.

## Stack

- [Next.js 16](https://nextjs.org) (App Router) com exportação estática (`out/`)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Motion](https://motion.dev) nas animações e [Lenis](https://lenis.darkroom.engineering) na rolagem suave
- Bricolage Grotesque (títulos), Figtree (texto) e [Phosphor](https://phosphoricons.com) (ícones)

## Rodando localmente

```bash
cd brigadeiria
npm install
npm run dev      # http://localhost:3000
npm run build    # gera o site estático em ./out
npm start        # serve a pasta ./out
```

## Publicando

O build gera HTML estático em `out/`, então funciona em qualquer hospedagem (Vercel, Netlify, Hostinger, cPanel). No GitHub Pages, o workflow **"Publica a brigadeiria"** (`.github/workflows/brigadeiria-pages.yml`) publica em `https://<usuário>.github.io/<repositório>/brigadeiria/` a cada mudança no branch principal, ou à mão em Actions.

## Estrutura

```
app/                    layout, página, SEO (sitemap, robots, ícone)
components/brigadeiro   o desenho de cada brigadeiro
components/treats       brownie, alfajor, pão de mel, bolo, café, torta e presente
components/             uma seção por arquivo (hero, vitrine, caixa, processo...)
lib/site.ts             todo o conteúdo editável
lib/box.ts              a caixa montada (compartilhada entre vitrine e "Monte sua caixa")
```
