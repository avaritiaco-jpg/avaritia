import type { Foto } from "@/lib/fotos";
import { asset } from "@/lib/site";

/** Foto real da loja, sempre com proporção reservada (sem pulo de layout enquanto carrega) */
export function Photo({
  foto,
  className = "",
  eager,
  fill,
}: {
  foto: Foto;
  className?: string;
  eager?: boolean;
  /** Preenche o contêiner (object-cover) em vez de manter a proporção original */
  fill?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={asset(foto.src)}
      alt={foto.alt}
      width={foto.w}
      height={foto.h}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
      className={`${fill ? "h-full w-full object-cover" : "h-auto w-full"} select-none ${className}`}
    />
  );
}
