# Brigadeiria e Algo Mais

Site da **Brigadeiria e Algo Mais**, confeitaria fina em Campos dos Goytacazes (RJ), no Centro de Compras da Pelinca desde julho de 2015: entremets em forma de fruta, torres de macarons, bolos espatulados, tortas e docinhos finos.

A loja está passando por **mudanças de cardápio, estrutura e localização**. O site existe principalmente para deixar isso claro para o cliente e levar todo pedido e toda dúvida para o WhatsApp.

Fonte do conteúdo: perfil público do Instagram [@brigadeiriaealgomais](https://www.instagram.com/brigadeiriaealgomais/) (bio, destaques, post fixado e fotos). Nada de cardápio, preço ou horário foi inventado.

## O que tem no site

- **Faixa de aviso fixa no topo**: "Estamos em mudança", sempre visível, leva aos avisos.
- **Topo**: três fotos reais em camadas que seguem o mouse em profundidades diferentes.
- **O que você precisa saber agora** (`#avisos`): um card por assunto (endereço, cardápio, loja e atendimento, clientes de outras cidades, contatos), cada um com uma etiqueta de status colorida pelo significado: âmbar = mudando, vinho = atenção, verde = continua igual. O card de endereço tem o endereço atual e o botão "Confirmar antes de ir", que abre o WhatsApp com a pergunta pronta.
- **O que sai da nossa cozinha** (`#doces`): abas por categoria (entremets, macarons, bolos, tortas, docinhos finos, datas especiais) com as fotos reais. A foto cresce ao clicar e dá para navegar com as setas do teclado. Cada categoria tem um botão "Perguntar sobre..." com a mensagem pronta.
- **Encomendas** (`#encomendas`): os três passos com uma linha que se desenha na rolagem.
- **Instagram**: faixa de fotos que corre devagar e pausa com o mouse.
- **Fale com a gente** (`#contato`): WhatsApp, telefone (com botão de copiar), Instagram, Facebook e o endereço atual com o aviso de mudança.

Funciona no modo claro e no escuro e respeita "reduzir movimento".

## Atualizando os avisos (o mais importante)

Tudo fica em **`lib/site.ts`**, na lista `avisos`:

- Quando a dona confirmar um detalhe (novo endereço, data da mudança, cardápio novo), escreva em `detalhe` do aviso correspondente. Ele aparece em destaque dentro do card.
- Para mudar a etiqueta, edite `status` (texto) e `tom`: `"mudanca"` (âmbar), `"atencao"` (vinho) ou `"ok"` (verde).
- Atualize `avisosAtualizadosEm` sempre que mexer.
- Quando o endereço novo estiver valendo, troque `site.address` e o texto da faixa do topo em `components/nav.tsx`.

## Fotos

As fotos em `public/fotos/` foram **recortadas de prints do Instagram**, então estão em resolução baixa (cerca de 180 a 330 px). Para deixá-las nítidas, salve o arquivo original de cada post com **o mesmo nome** em `public/fotos/` e atualize `w` e `h` em `lib/fotos.ts`. A lista de fotos, o texto alternativo e a categoria de cada uma também ficam em `lib/fotos.ts`.

Fotos em que aparecem clientes ou a equipe não foram usadas.

## Antes de publicar

- [ ] Preencher os avisos com o que a dona confirmar (endereço novo, cardápio, horário).
- [ ] Confirmar o WhatsApp: a bio traz "22 9996-66400", lido como **(22) 99966-6400**.
- [ ] Trocar as fotos pelos originais em alta resolução.
- [ ] Endereço do site (SEO): defina `NEXT_PUBLIC_SITE_URL` com o domínio próprio, se houver.

## Stack

- [Next.js 16](https://nextjs.org) (App Router) com exportação estática (`out/`)
- [Tailwind CSS v4](https://tailwindcss.com), [Motion](https://motion.dev) e [Lenis](https://lenis.darkroom.engineering)
- Cinzel e Great Vibes (as letras do logo), Cormorant Garamond (títulos), Figtree (texto), [Phosphor](https://phosphoricons.com) (ícones)

## Rodando localmente

```bash
cd brigadeiria
npm install
npm run dev      # http://localhost:3000
npm run build    # gera o site estático em ./out
```

No GitHub Pages, o workflow **"Publica a brigadeiria"** publica em `https://<usuário>.github.io/<repositório>/brigadeiria/`.
