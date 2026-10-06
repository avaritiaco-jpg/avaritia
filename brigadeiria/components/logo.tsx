/*
 * O selo da vitrine redesenhado em SVG: anel vinho, "BRIGADEIRIA" em maiúsculas romanas e
 * "e algo mais" em cursiva entre dois fios. Fica nítido em qualquer tamanho.
 */
export function Seal({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} role="img" aria-label="Brigadeiria e Algo Mais">
      <circle cx="60" cy="60" r="58" fill="var(--surface)" />
      <circle cx="60" cy="60" r="55" fill="none" stroke="var(--wine)" strokeWidth="7" />
      <circle cx="60" cy="60" r="49.5" fill="none" stroke="var(--gold)" strokeWidth="0.8" strokeDasharray="1.2 2.2" />
      <text x="60" y="60" textAnchor="middle" fill="var(--wine)" style={{ font: "600 13.5px var(--font-caps)", letterSpacing: "0.04em" }}>
        BRIGADEIRIA
      </text>
      <path d="M22 67 H44 M76 67 H98" stroke="var(--wine)" strokeWidth="0.8" />
      <text x="60" y="72" textAnchor="middle" fill="var(--wine)" style={{ font: "400 13px var(--font-script)" }}>
        e algo mais
      </text>
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <Seal className="size-11 shrink-0 drop-shadow-[0_4px_10px_rgba(90,31,26,0.18)]" />
      <span className="flex flex-col leading-none">
        <span className="font-caps text-[17px] font-semibold tracking-[0.06em] text-wine">BRIGADEIRIA</span>
        <span className="-mt-0.5 font-script text-[19px] text-ink-2">e algo mais</span>
      </span>
    </span>
  );
}
