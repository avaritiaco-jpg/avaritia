"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { CaretDown, MagnifyingGlass, SlidersHorizontal, X } from "@phosphor-icons/react/dist/ssr";
import {
  brands,
  categories,
  concentrations,
  defaultFilters,
  filterProducts,
  genders,
  products,
  sorts,
  type Filters,
} from "@/lib/catalog";
import { filters as filtersStore, resetFilters, setFilters, ui, useStore } from "@/lib/store";
import { scrollToId } from "@/lib/scroll";
import { Drawer } from "./drawer";
import { ProductCard } from "./product-card";
import { EASE_DRAWER, EASE_OUT, Eyebrow, PillButton, SplitReveal } from "./ui";

const PAGE = 24;

/* ----------------------------------------------------- número que rola */

function RollingNumber({ value }: { value: number }) {
  const reduce = useReducedMotion();
  return (
    <span className="relative inline-flex overflow-hidden align-bottom tabular-nums">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={reduce ? { opacity: 0 } : { transform: "translateY(100%)", opacity: 0 }}
          animate={reduce ? { opacity: 1 } : { transform: "translateY(0%)", opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { transform: "translateY(-100%)", opacity: 0 }}
          transition={{ duration: 0.35, ease: EASE_OUT }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/* ------------------------------------------------- abas de categoria */

function CategoryTabs({ value }: { value: Filters["category"] }) {
  return (
    <div className="no-scrollbar -mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
      <div role="tablist" aria-label="Categorias" className="inline-flex gap-1 rounded-full bg-white/[0.03] p-1 ring-1 ring-line">
        {categories.map((c) => {
          const active = value === c.id;
          const count = c.id === "todos" ? products.length : products.filter((p) => p.category === c.id).length;
          return (
            <button
              key={c.id}
              role="tab"
              aria-selected={active}
              type="button"
              onClick={() => setFilters({ category: c.id })}
              className={`relative whitespace-nowrap rounded-full px-4 py-2.5 text-sm transition-colors duration-200 ease-out ${
                active ? "text-noir" : "text-mute hover:text-ivory"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="category-pill"
                  className="absolute inset-0 rounded-full bg-ivory"
                  transition={{ type: "spring", duration: 0.5, bounce: 0.15 }}
                />
              )}
              <span className="relative">
                {c.short}
                <span className={`ml-1.5 font-mono text-[10px] ${active ? "text-noir/50" : "text-faint"}`}>{count}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------- chips de filtro */

function Chip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-full px-3.5 py-2 text-[13px] ring-1 transition-[background-color,color,box-shadow] duration-200 ease-out active:scale-[0.97] ${
        active ? "bg-amber text-noir ring-amber" : "bg-white/[0.03] text-mute ring-line hover:text-ivory hover:ring-line-strong"
      }`}
    >
      {children}
    </button>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-b border-line py-6 first:pt-1 last:border-0">
      <legend className="mb-4 text-[10px] uppercase tracking-[0.24em] text-faint">{title}</legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

function FilterPanel({ open, onClose, f, total }: { open: boolean; onClose: () => void; f: Filters; total: number }) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Filtros"
      subtitle={`${total} ${total === 1 ? "resultado" : "resultados"}`}
      footer={
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => resetFilters()}
            className="rounded-full px-4 py-3 text-sm text-mute transition-colors duration-200 ease-out hover:text-ivory"
          >
            Limpar tudo
          </button>
          <PillButton onClick={onClose}>Ver {total} resultados</PillButton>
        </div>
      }
    >
      <Group title="Gênero">
        {genders.map((g) => (
          <Chip key={g.id} active={f.gender === g.id} onClick={() => setFilters({ gender: g.id })}>
            {g.label}
          </Chip>
        ))}
      </Group>
      <Group title="Concentração">
        {concentrations.map((c) => (
          <Chip key={c.id} active={f.concentration === c.id} onClick={() => setFilters({ concentration: c.id })}>
            {c.label}
          </Chip>
        ))}
      </Group>
      <Group title="Marca">
        <Chip active={f.brand === "todas"} onClick={() => setFilters({ brand: "todas" })}>
          Todas
        </Chip>
        {brands.map((b) => (
          <Chip key={b.name} active={f.brand === b.name} onClick={() => setFilters({ brand: b.name })}>
            {b.name} <span className="ml-1 font-mono text-[10px] opacity-60">{b.count}</span>
          </Chip>
        ))}
      </Group>
    </Drawer>
  );
}

/* ------------------------------------------------------ filtros ativos */

function activeChips(f: Filters) {
  const chips: { key: keyof Filters; label: string }[] = [];
  if (f.query) chips.push({ key: "query", label: `“${f.query}”` });
  if (f.brand !== "todas") chips.push({ key: "brand", label: f.brand });
  if (f.gender !== "todos") chips.push({ key: "gender", label: genders.find((g) => g.id === f.gender)!.label });
  if (f.concentration !== "todas")
    chips.push({ key: "concentration", label: concentrations.find((c) => c.id === f.concentration)!.label });
  return chips;
}

/* ------------------------------------------------------------- catálogo */

export function Catalog() {
  const f = useStore(filtersStore, (s) => s);
  const navHidden = useStore(ui, (s) => s.navHidden);
  const [panel, setPanel] = useState(false);
  const [limit, setLimit] = useState(PAGE);
  const [query, setQuery] = useState(f.query);
  const sentinel = useRef<HTMLDivElement>(null);
  const stickSentinel = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);

  // a barra só "gruda" depois que o marcador logo acima dela sai pelo topo
  useEffect(() => {
    const el = stickSentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setStuck(!e.isIntersecting && e.boundingClientRect.top < 0), {
      rootMargin: "8px 0px 0px 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // busca com "respiro": a lista filtra enquanto você digita sem travar o campo
  const deferred = useDeferredValue(f);
  const list = useMemo(() => filterProducts(deferred), [deferred]);
  const visible = list.slice(0, limit);
  const chips = activeChips(f);
  const extraCount = chips.filter((c) => c.key !== "query").length;

  // filtros aplicados de fora (coleções, marcas, guia) atualizam o campo de busca
  useEffect(() => setQuery(f.query), [f.query]);
  // ao trocar o filtro com a grade já rolada, volta para o começo dela
  const gridTop = useRef<HTMLDivElement>(null);
  const firstRun = useRef(true);
  useEffect(() => {
    setLimit(PAGE);
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const top = gridTop.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) scrollToId("catalogo-grade");
  }, [deferred]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (query !== filtersStore.get().query) setFilters({ query });
    }, 120);
    return () => clearTimeout(t);
  }, [query]);

  // carrega mais ao chegar perto do fim da grade
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setLimit((l) => (l < list.length ? l + PAGE : l)),
      { rootMargin: "800px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [list.length]);

  return (
    <section id="catalogo" className="relative mx-auto max-w-7xl px-4 pb-32 pt-28 md:px-8 md:pt-40">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <Eyebrow>Catálogo completo</Eyebrow>
          <SplitReveal
            text="Todas as *fragrâncias.*"
            className="mt-6 font-display text-[clamp(2.8rem,6vw,5.6rem)] font-light leading-[0.95] text-ivory"
          />
        </div>
        <p className="max-w-[38ch] text-base leading-relaxed text-mute">
          {products.length} itens de {brands.length} casas. Busque pelo nome, pela marca ou pelo código.
        </p>
      </div>

      <div ref={gridTop} id="catalogo-grade" className="mt-12 scroll-mt-4">
        <CategoryTabs value={f.category} />
      </div>

      {/* barra fixa: busca, filtros e ordenação (desce para baixo do menu quando ele aparece) */}
      <div ref={stickSentinel} aria-hidden className="h-0" />
      <div
        className={`sticky top-3 z-30 mt-5 transition-transform duration-500 ease-drawer ${
          stuck && !navHidden ? "translate-y-[76px]" : "translate-y-0"
        }`}
      >
        <div className="flex items-center gap-2 rounded-[1.6rem] bg-noir/85 p-1.5 ring-1 ring-line backdrop-blur-xl">
          <label className="relative flex min-w-0 flex-1 items-center">
            <span className="sr-only">Buscar perfume, marca ou código</span>
            <MagnifyingGlass size={18} weight="light" className="pointer-events-none absolute left-4 text-mute" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar: Khamrah, Yara, Club de Nuit, 7237-3…"
              className="h-12 w-full min-w-0 rounded-[1.2rem] bg-white/[0.04] pl-11 pr-10 text-[15px] text-ivory placeholder:text-faint focus:bg-white/[0.06] focus:outline-none"
              enterKeyHint="search"
              autoComplete="off"
            />
            <AnimatePresence>
              {query && (
                <motion.button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Limpar busca"
                  className="absolute right-2 flex size-8 items-center justify-center rounded-full text-mute hover:text-ivory"
                  initial={{ opacity: 0, transform: "scale(0.8)" }}
                  animate={{ opacity: 1, transform: "scale(1)" }}
                  exit={{ opacity: 0, transform: "scale(0.8)" }}
                  transition={{ duration: 0.15, ease: EASE_OUT }}
                >
                  <X size={14} weight="bold" />
                </motion.button>
              )}
            </AnimatePresence>
          </label>

          <label className="relative hidden h-12 items-center sm:flex">
            <span className="sr-only">Ordenar</span>
            <select
              value={f.sort}
              onChange={(e) => setFilters({ sort: e.target.value as Filters["sort"] })}
              className="h-full appearance-none rounded-[1.2rem] bg-white/[0.04] pl-4 pr-10 text-sm text-ivory focus:outline-none"
            >
              {sorts.map((s) => (
                <option key={s.id} value={s.id} className="bg-noir-2">
                  {s.label}
                </option>
              ))}
            </select>
            <CaretDown size={14} className="pointer-events-none absolute right-4 text-mute" />
          </label>

          <button
            type="button"
            onClick={() => setPanel(true)}
            className="relative flex h-12 shrink-0 items-center gap-2 rounded-[1.2rem] bg-ivory px-4 text-sm font-medium text-noir transition-transform duration-150 ease-out active:scale-[0.97]"
          >
            <SlidersHorizontal size={18} weight="regular" />
            <span className="hidden sm:inline">Filtros</span>
            <AnimatePresence>
              {extraCount > 0 && (
                <motion.span
                  className="flex size-5 items-center justify-center rounded-full bg-amber font-mono text-[10px] text-noir"
                  initial={{ opacity: 0, transform: "scale(0.6)" }}
                  animate={{ opacity: 1, transform: "scale(1)" }}
                  exit={{ opacity: 0, transform: "scale(0.6)" }}
                  transition={{ duration: 0.2, ease: EASE_OUT }}
                >
                  {extraCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* resumo + filtros ativos */}
      <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-mute">
        <span className="mr-2">
          <span className="font-display text-xl text-ivory">
            <RollingNumber value={list.length} />
          </span>{" "}
          {list.length === 1 ? "fragrância" : "fragrâncias"}
        </span>
        <AnimatePresence initial={false}>
          {chips.map((c) => (
            <motion.button
              key={c.key}
              layout
              type="button"
              onClick={() => setFilters({ [c.key]: defaultFilters[c.key] } as Partial<Filters>)}
              className="flex items-center gap-1.5 rounded-full bg-white/[0.05] py-1.5 pl-3 pr-2 text-xs text-ivory ring-1 ring-line hover:ring-line-strong"
              initial={{ opacity: 0, transform: "scale(0.9)" }}
              animate={{ opacity: 1, transform: "scale(1)" }}
              exit={{ opacity: 0, transform: "scale(0.9)" }}
              transition={{ duration: 0.2, ease: EASE_OUT }}
              aria-label={`Remover filtro ${c.label}`}
            >
              {c.label}
              <X size={11} weight="bold" className="text-mute" />
            </motion.button>
          ))}
        </AnimatePresence>
        {chips.length > 1 && (
          <button type="button" onClick={() => resetFilters()} className="ml-1 text-xs text-amber-soft hover:underline">
            Limpar
          </button>
        )}
        <label className="relative ml-auto flex items-center sm:hidden">
          <span className="sr-only">Ordenar</span>
          <select
            value={f.sort}
            onChange={(e) => setFilters({ sort: e.target.value as Filters["sort"] })}
            className="appearance-none bg-transparent pr-5 text-xs text-ivory focus:outline-none"
          >
            {sorts.map((s) => (
              <option key={s.id} value={s.id} className="bg-noir-2">
                {s.label}
              </option>
            ))}
          </select>
          <CaretDown size={11} className="pointer-events-none absolute right-0 text-mute" />
        </label>
      </div>

      {/* grade */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((p, i) => (
            <ProductCard key={p.code} product={p} order={i % PAGE} />
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {list.length === 0 && (
          <motion.div
            className="mx-auto mt-10 flex max-w-md flex-col items-center gap-5 py-16 text-center"
            initial={{ opacity: 0, transform: "translateY(12px)" }}
            animate={{ opacity: 1, transform: "translateY(0px)" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE_DRAWER }}
          >
            <p className="font-display text-4xl font-light text-ivory">Nada por aqui.</p>
            <p className="text-sm text-mute">
              Nenhuma fragrância com esses filtros. Tente outro nome ou limpe os filtros. Também dá para perguntar direto
              no WhatsApp.
            </p>
            <PillButton variant="ghost" onClick={() => resetFilters()}>
              Limpar filtros
            </PillButton>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={sentinel} aria-hidden className="h-px" />
      {limit < list.length && (
        <div className="mt-12 flex justify-center">
          <PillButton variant="ghost" onClick={() => setLimit((l) => l + PAGE)}>
            Mostrar mais ({list.length - limit})
          </PillButton>
        </div>
      )}
      {limit >= list.length && list.length > PAGE && (
        <div className="mt-14 flex justify-center">
          <button
            type="button"
            onClick={() => scrollToId("catalogo")}
            className="text-xs uppercase tracking-[0.24em] text-faint transition-colors duration-200 ease-out hover:text-ivory"
          >
            Voltar ao topo do catálogo ↑
          </button>
        </div>
      )}

      <FilterPanel open={panel} onClose={() => setPanel(false)} f={f} total={list.length} />
    </section>
  );
}
