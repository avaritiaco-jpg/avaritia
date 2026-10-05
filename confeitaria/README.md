# Cianinha Confeitaria

Cardápio online da **Cianinha Confeitaria**, montado a partir do cardápio 2026: bolos clássicos e especiais, bolo gelado, docinhos (doces clássicos, camafeu, brigadeiros gourmet e especiais, trufas) e caseirinhos, com os valores e as regras de encomenda do cardápio impresso.

O cliente monta o carrinho, vai para a **página de pagamento** (`/pagamento/`), informa nome e WhatsApp, escolhe a data de retirada e a forma de pagamento e confirma. Na tela seguinte ele paga o sinal e envia o pedido pronto pelo WhatsApp. Não precisa de backend nem de banco de dados.

## O que tem no site

- **Topo** com a fatia do bolo mais vendido se montando camada por camada. Os sabores em destaque se alternam sozinhos (ou pelos botões) e os docinhos em volta acompanham o mouse em profundidades diferentes.
- **Faixa de sabores** que corre sozinha e acelera ou inverte com a velocidade da rolagem.
- **Cardápio** em abas (clássicos, especiais, gelado, docinhos, caseirinhos) que ficam grudadas no topo enquanto a lista passa. No celular os cards ficam na horizontal, como em app de delivery.
- **Configurador** de cada item: o desenho sai do card e cresce até o painel; formato, tamanho, recheio, cobertura e quantidade, com o valor correndo até o novo número. No celular abre como gaveta que fecha arrastando para baixo.
  - Bolos: circular (Mini, PP, P, M) ou retangular (P, M, G), e a variação do sabor quando existe (ex.: brigadeiro ao leite, meio amargo ou dois amores).
  - Bolo gelado: pedaço ou forma inteira, com corte tradicional (20) ou tamanho festa (30).
  - Docinhos: vários sabores de uma vez, de 25 em 25 unidades. Cada sabor é cobrado pela faixa de 25, 50 e 100 unidades do cardápio (75 unidades = 50 + 25).
  - Caseirinhos: com cobertura de brigadeiro, de ganache ou sem cobertura, tamanho P ou M. Fubá cremoso e milho só no M.
- **Carrinho** salvo no aparelho; o doce voa até o ícone do carrinho ao adicionar.
- **Guia de tamanhos**: arrastando o número de convidados, o bolo recomendado acende e se divide em fatias.
- **Página de pagamento** com calendário que só libera terça a sábado, com 2 dias de antecedência; Pix, PicPay ou dinheiro; sinal de 50% ou valor total.
- **Confirmação** com o código do pedido, o **QR Code e o Pix copia e cola já com o valor** (quando a chave Pix está configurada) e o botão que abre o WhatsApp com o pedido completo.

Tudo respeita a opção "reduzir movimento" do sistema: nada se desloca, só aparece com um fade curto.

### Ilustrações

Os bolos e doces são desenhados pelo próprio site a partir do cardápio: cada fatia mostra a massa, os recheios, a cobertura e a finalização do sabor (morangos, granulado, merengue maçaricado, nozes...). Assim nenhuma foto de outro lugar aparece como se fosse da confeitaria.

Para usar **fotos reais**, salve a foto em `public/fotos/` (de preferência `.webp`, quadrada ou 5:4) e preencha `photo` no produto em `lib/menu.ts`, por exemplo `photo: "/fotos/prestigio.webp"`. A foto passa a aparecer no card e no configurador.

## Como funciona o pagamento

O site é estático: ele **não cobra cartão nem confirma pagamento sozinho**. O que ele faz:

1. Calcula o pedido com os valores do cardápio, o sinal de 50% e o restante na retirada.
2. Gera o **Pix copia e cola e o QR Code** (padrão BR Code do Banco Central) com a chave da confeitaria, o valor exato e o código do pedido. O app do banco do cliente já abre com tudo preenchido.
3. Abre o WhatsApp com a mensagem do pedido pronta (itens, tamanhos, data, valores, forma de pagamento e observações). O cliente anexa o comprovante na conversa e a confeitaria confirma por lá.

Sem chave Pix configurada, a tela de confirmação inverte a ordem: o cliente envia o pedido primeiro e a confeitaria responde com os dados do Pix. O mesmo vale para o PicPay.

## Stack

- [Next.js 16](https://nextjs.org) (App Router) com exportação estática (`out/`)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Motion](https://motion.dev) nas animações e [Lenis](https://lenis.darkroom.engineering) na rolagem suave
- [uqr](https://github.com/unjs/uqr) para o QR Code do Pix, gerado no navegador
- Satisfy (a letra cursiva do cardápio impresso), Quicksand (texto) e [Phosphor](https://phosphoricons.com) (ícones)

## Rodando localmente

```bash
cd confeitaria
npm install
npm run dev      # http://localhost:3000
npm run build    # gera o site estático em ./out
npm start        # serve a pasta ./out
```

## Antes de publicar (obrigatório)

Em **`lib/site.ts`**, procure por `TODO`:

- [ ] `pix.key` e `pix.city`: chave Pix da confeitaria (CPF, CNPJ, e-mail, celular no formato `+5535900000000` ou chave aleatória) e a cidade do recebedor. Com isso a confirmação mostra o QR Code e o copia e cola com o valor. **Confira a chave com cuidado: é para ela que o dinheiro vai.**
- [ ] `picpay`: usuário do PicPay, sem o @ (opcional). Preenchido, a confirmação mostra o link de pagamento com o valor.
- [ ] `address`: endereço de retirada (opcional). Vazio, o site diz que o endereço vai na confirmação pelo WhatsApp.
- [ ] Endereço do site (SEO, sitemap e prévia de links): na Vercel e na Netlify ele vem do próprio deploy. Com domínio próprio, defina a variável `NEXT_PUBLIC_SITE_URL` (ex.: `https://www.cianinhaconfeitaria.com.br`) no painel da hospedagem.

O WhatsApp `(35) 98703-5253` e o Instagram `@cianinhaconfeitaria` já estão configurados.

## Mudando preços e sabores

Tudo fica em **`lib/menu.ts`**:

- `cakeSizes`: tamanhos e valores dos bolos clássicos e especiais.
- `cakes`: sabores de bolo, descrições e o desenho de cada um (massa, recheios, cobertura, finalização).
- `gelado`, `caseiro`: valores do bolo gelado e dos caseirinhos.
- `docinhos`: cada linha com os valores de 25, 50 e 100 unidades e os sabores.

As regras de encomenda (2 dias de antecedência, terça a sábado, sinal de 50%) e as perguntas frequentes ficam em `lib/site.ts`. Carrinhos salvos com itens que deixaram de existir são limpos sozinhos.

## Publicando

O site já está no ar pelo **GitHub Pages**: https://avaritiaco-jpg.github.io/avaritia/confeitaria/

A cada mudança em `confeitaria/` no branch principal, o workflow `.github/workflows/confeitaria-pages.yml` gera o site de novo e atualiza a pasta `confeitaria/` do branch `gh-pages` (leva uns 2 minutos). Para publicar à mão: aba **Actions** → *Publica a confeitaria* → *Run workflow*. No GitHub Pages o site fica numa subpasta, por isso o build usa `NEXT_PUBLIC_BASE_PATH`.

Para usar um domínio próprio ou outra hospedagem, o build gera HTML estático em `out/` e funciona em qualquer lugar:

- **Vercel** (recomendado): em [vercel.com/new](https://vercel.com/new), importe o repositório, defina **Root Directory = `confeitaria`** e clique em Deploy. O domínio próprio se conecta depois em Settings → Domains.
- **Netlify**: base directory `confeitaria`, comando `npm run build`, pasta de publicação `confeitaria/out`.
- **Hostinger, Locaweb ou cPanel**: rode `npm run build` e envie o conteúdo de `out/` para `public_html`.

## Estrutura

```
app/                  layout, página inicial, /pagamento, SEO (sitemap, robots, ícone)
components/           uma seção por arquivo (topo, cardápio, configurador, carrinho, pagamento...)
components/art.tsx    os desenhos dos bolos e doces
lib/menu.ts           cardápio: sabores, tamanhos, valores e cálculo do carrinho
lib/site.ts           contatos, Pix, regras de encomenda e perguntas frequentes
lib/order.ts          pedido, validação e mensagem do WhatsApp
lib/pix.ts            Pix copia e cola (BR Code)
lib/store.ts          carrinho e estado da interface
public/og.jpg         imagem de compartilhamento (1200×630)
```
