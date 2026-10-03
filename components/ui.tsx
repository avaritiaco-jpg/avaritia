import Image from "next/image";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";

export const container = "mx-auto w-full max-w-[1320px] px-5 md:px-8";

export const h2 =
  "text-[clamp(2.25rem,4.6vw,4rem)] font-semibold leading-[1.02] tracking-[-0.045em] text-balance text-paper";

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
  external?: boolean;
};

export function ButtonLink({ href, children, variant = "primary", className = "", external }: ButtonProps) {
  const ext = external ? { target: "_blank", rel: "noopener noreferrer" } : {};
  if (variant === "ghost") {
    return (
      <a
        href={href}
        {...ext}
        className={`inline-flex h-14 items-center justify-center whitespace-nowrap rounded-full border border-line-strong px-7 text-[15px] font-medium text-paper transition-[background-color,border-color,transform] duration-300 ease-out-expo hover:border-paper/35 hover:bg-paper/[0.04] active:scale-[0.98] ${className}`}
      >
        {children}
      </a>
    );
  }
  return (
    <a
      href={href}
      {...ext}
      className={`group inline-flex h-14 items-center justify-between gap-4 whitespace-nowrap rounded-full bg-gold pl-7 pr-2 text-[15px] font-semibold text-ink transition-[background-color,transform] duration-300 ease-out-expo hover:bg-gold-soft active:scale-[0.98] ${className}`}
    >
      {children}
      <span className="grid size-10 place-items-center rounded-full bg-ink text-gold transition-transform duration-500 ease-out-expo group-hover:rotate-45">
        <ArrowUpRight size={18} weight="bold" />
      </span>
    </a>
  );
}

export function BrowserFrame({
  src,
  alt,
  domain,
  priority,
  className = "",
  sizes = "(min-width: 1024px) 50vw, 90vw",
}: {
  src: string;
  alt: string;
  domain: string;
  priority?: boolean;
  className?: string;
  sizes?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-[14px] border border-paper/10 bg-ink-3 shadow-[0_40px_80px_-30px_rgb(0_0_0/0.8)] ${className}`}
    >
      <div className="flex h-8 items-center gap-3 border-b border-paper/[0.06] px-3.5">
        <div className="flex gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-paper/15" />
          <span className="size-2.5 rounded-full bg-paper/15" />
          <span className="size-2.5 rounded-full bg-paper/15" />
        </div>
        <span className="mx-auto truncate rounded-md bg-paper/[0.06] px-3 py-0.5 font-mono text-[10px] text-mute">
          {domain}
        </span>
        <span className="w-[42px]" aria-hidden />
      </div>
      <Image
        src={src}
        alt={alt}
        width={1800}
        height={1125}
        priority={priority}
        sizes={sizes}
        className="block h-auto w-full"
      />
    </div>
  );
}

export function PhoneFrame({
  src,
  alt,
  priority,
  className = "",
}: {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-[1.6rem] border-[5px] border-[#22211e] bg-ink shadow-[0_30px_60px_-20px_rgb(0_0_0/0.85)] ring-1 ring-paper/10 ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        width={780}
        height={1688}
        priority={priority}
        sizes="240px"
        className="block aspect-[390/780] h-auto w-full object-cover object-top"
      />
    </div>
  );
}
