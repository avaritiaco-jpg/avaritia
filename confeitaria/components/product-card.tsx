"use client";

import { useRef } from "react";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import { money } from "@/lib/format";
import { defaultSelection, fromPrice, gelado, productArt, type Product } from "@/lib/menu";
import { withBase } from "@/lib/site";
import { openSheet, origin } from "@/lib/store";
import { Art } from "./art";

function PriceLine({ product }: { product: Product }) {
  switch (product.kind) {
    case "doce":
      return (
        <>
          <span className="text-mute">25 un.</span> {money(product.tiers[0])}
        </>
      );
    case "gelado":
      return (
        <>
          <span className="text-mute">pedaço</span> {money(gelado.slice)}
        </>
      );
    default:
      return (
        <>
          <span className="text-mute">a partir de</span> {money(fromPrice(product))}
        </>
      );
  }
}

export function ProductCard({ product }: { product: Product }) {
  const plate = useRef<HTMLDivElement>(null);
  const art = productArt(product, defaultSelection(product));
  const flavors = product.kind === "doce" && product.flavors.length > 1 ? product.flavors.length : 0;

  const open = () => {
    origin.rect = plate.current?.getBoundingClientRect() ?? null;
    openSheet(product.id);
  };

  // card inteiro clicável: um botão cobre o card, e o título continua sendo um título de verdade
  return (
    <div className="group relative flex h-full w-full gap-1 rounded-[1.5rem] bg-card p-2 text-left ring-1 ring-line transition-[box-shadow,transform] duration-300 ease-out hover:shadow-[0_24px_50px_-30px_rgba(122,63,70,0.45)] has-[button:active]:scale-[0.99] min-[480px]:flex-col min-[480px]:gap-0 min-[480px]:rounded-[1.75rem]">
      <button
        type="button"
        onClick={open}
        aria-label={`${product.name}: escolher e adicionar ao carrinho`}
        className="absolute inset-0 z-10 rounded-[inherit]"
      />
      <div
        ref={plate}
        data-plate={product.id}
        className="plate relative aspect-square w-[40%] shrink-0 overflow-hidden rounded-[1.1rem] min-[480px]:aspect-[5/4] min-[480px]:w-full min-[480px]:rounded-[1.35rem]"
      >
        <div
          className={`absolute transition-transform duration-500 ease-out pointer-fine:group-hover:-translate-y-1.5 pointer-fine:group-hover:scale-[1.04] ${
            product.kind === "cake" ? "inset-[4%] min-[480px]:inset-[6%_4%_2%_4%]" : "inset-[10%] min-[480px]:inset-[12%_14%_8%_14%]"
          }`}
        >
          {product.photo ? null : <Art art={art} />}
        </div>
        {product.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={withBase(product.photo)}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out pointer-fine:group-hover:scale-[1.04]"
          />
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col px-2.5 py-1.5 min-[480px]:px-3 min-[480px]:pb-2 min-[480px]:pt-4">
        {product.badge ? (
          <span className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-rose-ink">{product.badge}</span>
        ) : null}
        <h3 className="text-[16px] font-bold leading-snug text-cocoa text-balance min-[480px]:text-[17px]">{product.name}</h3>
        <p className="mt-1 line-clamp-2 text-[13px] font-medium leading-relaxed text-mute min-[480px]:mt-1.5 min-[480px]:text-[14px]">
          {flavors ? `${flavors} sabores. ` : ""}
          {product.description}
        </p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2 min-[480px]:pt-4">
          <p className="nums text-[14px] font-bold text-cocoa min-[480px]:text-[15px]">
            <PriceLine product={product} />
          </p>
          <span
            aria-hidden
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blush-2 min-[480px]:size-10 text-cocoa transition-colors duration-200 ease-out group-hover:bg-rose-deep group-hover:text-white"
          >
            <Plus size={17} weight="bold" />
          </span>
        </div>
      </div>
    </div>
  );
}
