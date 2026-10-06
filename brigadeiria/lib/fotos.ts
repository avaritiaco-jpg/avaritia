// Fotos recortadas do Instagram @brigadeiriaealgomais (posts públicos da loja).
// Estão em resolução baixa porque vieram de prints: troque pelos arquivos originais em public/fotos/
// mantendo o mesmo nome, e o site passa a usar a versão nítida sem mexer em código.

export type Categoria = "entremets" | "macarons" | "bolos" | "tortas" | "docinhos" | "datas";
export type Foto = { src: string; alt: string; cat: Categoria; w: number; h: number };

export const fotos: Foto[] = [
  { src: "/fotos/entremet-tangerina.webp", alt: "Entremet em forma de tangerina, com folhas, sobre base dourada", cat: "entremets", w: 274, h: 334 },
  { src: "/fotos/entremet-laranja-prato.webp", alt: "Entremet de laranja servido no prato", cat: "entremets", w: 275, h: 275 },
  { src: "/fotos/entremet-limao-aberto.webp", alt: "Entremet de limão siciliano aberto, mostrando o recheio cremoso", cat: "entremets", w: 180, h: 180 },
  { src: "/fotos/entremets-limao-caixa.webp", alt: "Entremets de limão siciliano na caixa, com folhas", cat: "entremets", w: 180, h: 180 },
  { src: "/fotos/entremet-morango.webp", alt: "Entremet em forma de morango, vermelho brilhante com sementes", cat: "entremets", w: 171, h: 180 },
  { src: "/fotos/entremet-manga.webp", alt: "Entremet em forma de manga", cat: "entremets", w: 156, h: 157 },
  { src: "/fotos/entremets-maca.webp", alt: "Entremets vermelhos em forma de maçã na vitrine", cat: "entremets", w: 171, h: 180 },
  { src: "/fotos/entremet-ovo.webp", alt: "Entremet em forma de ovo, cortado ao meio", cat: "entremets", w: 180, h: 180 },
  { src: "/fotos/torre-macarons-natal.webp", alt: "Torre de macarons verdes e brancos com flores vermelhas", cat: "macarons", w: 276, h: 346 },
  { src: "/fotos/torre-macarons-lilas.webp", alt: "Torre de macarons em tons de lilás com flores", cat: "macarons", w: 276, h: 300 },
  { src: "/fotos/torre-macarons-rosa.webp", alt: "Torre de macarons rosa e lilás com girassóis", cat: "macarons", w: 180, h: 179 },
  { src: "/fotos/macarons-vermelhos.webp", alt: "Macarons vermelhos recheados", cat: "macarons", w: 179, h: 180 },
  { src: "/fotos/bolo-frutas-vermelhas.webp", alt: "Bolo branco coberto de morangos e amoras", cat: "bolos", w: 271, h: 259 },
  { src: "/fotos/bolo-espatulado-hello.webp", alt: "Bolo espatulado branco com florzinhas coloridas e \"Hello 28\"", cat: "bolos", w: 179, h: 180 },
  { src: "/fotos/bolo-espatulado-branco.webp", alt: "Bolo espatulado branco com detalhes dourados", cat: "bolos", w: 157, h: 156 },
  { src: "/fotos/bolo-chocolate-morangos.webp", alt: "Bolo de chocolate com brigadeiros, morangos e folhas de chocolate", cat: "bolos", w: 275, h: 370 },
  { src: "/fotos/bolo-chocolate-rosas.webp", alt: "Bolo de chocolate com rosas de brigadeiro", cat: "bolos", w: 174, h: 180 },
  { src: "/fotos/torta-pistache-morango.webp", alt: "Torta de pistache com morangos e pistache picado", cat: "tortas", w: 256, h: 370 },
  { src: "/fotos/torta-crocante-fisalis.webp", alt: "Torta com crocante de castanhas e fisális", cat: "tortas", w: 180, h: 179 },
  { src: "/fotos/mesa-bolos-tortas.webp", alt: "Mesa com bolos, tortas e torre de macarons", cat: "tortas", w: 256, h: 300 },
  { src: "/fotos/docinhos-sortidos.webp", alt: "Caixa de docinhos finos sortidos em fileiras", cat: "docinhos", w: 156, h: 157 },
  { src: "/fotos/docinhos-pistache-granulado.webp", alt: "Brigadeiros de pistache, granulado e coco nas forminhas", cat: "docinhos", w: 156, h: 156 },
  { src: "/fotos/docinhos-brulee.webp", alt: "Docinhos com casquinha maçaricada", cat: "docinhos", w: 157, h: 157 },
  { src: "/fotos/docinhos-coco.webp", alt: "Docinhos de coco nas forminhas", cat: "docinhos", w: 153, h: 156 },
  { src: "/fotos/brownies-frutas.webp", alt: "Brownies com morango, mirtilo e fisális", cat: "docinhos", w: 180, h: 179 },
  { src: "/fotos/coracao-red-velvet.webp", alt: "Sobremesa de red velvet em forma de coração", cat: "docinhos", w: 180, h: 180 },
  { src: "/fotos/casinha-gengibre.webp", alt: "Casinha de biscoito de gengibre com bonequinhos, para o Natal", cat: "datas", w: 276, h: 300 },
  { src: "/fotos/bolo-casinha-natal.webp", alt: "Bolo branco com casinha de biscoito no topo", cat: "datas", w: 274, h: 334 },
  { src: "/fotos/cupcakes.webp", alt: "Cupcakes de chocolate e baunilha", cat: "docinhos", w: 180, h: 180 },
];

export const foto = (nome: string) => fotos.find((f) => f.src.endsWith(`/${nome}.webp`))!;
