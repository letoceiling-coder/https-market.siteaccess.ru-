"use client";

import { ChevronDown, Heart, LayoutGrid, MapPin, MessageCircle, Search, UserRound, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDeferredValue, useEffect, useId, useMemo, useState, type FormEvent, type KeyboardEvent } from "react";
import { TaxonIcon } from "@/components/classified/icon";
import { startNav } from "@/components/site/nav-progress";
import type { SearchDocument } from "@/domain/types";
import { normalize } from "@/domain/text";
import { useStoredIds } from "@/hooks/storage";
import { useRegion } from "@/hooks/region";
import { cn } from "cn";

const serviceLinks = [
  { href: "/catalog/biznes", label: "Для бизнеса" },
  { href: "/services", label: "Услуги" },
  { href: "/articles", label: "Журнал" },
  { href: "/advertising", label: "Реклама" },
  { href: "/help", label: "Помощь" },
];

const iconLinks = [
  { href: "/favorites", label: "Избранное", icon: Heart },
  { href: "/messages", label: "Сообщения", icon: MessageCircle },
];

export type HeaderNode = {
  name: string;
  path: string;
  icon: string;
  children: { name: string; path: string }[];
};

export function SiteHeader({
  index,
  menu,
  regions,
}: {
  index: SearchDocument[];
  menu: HeaderNode[];
  regions: { id: string; name: string }[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const region = useRegion();
  const favorites = useStoredIds("hh.favorites");
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [regionOpen, setRegionOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [activeRoot, setActiveRoot] = useState(menu[0]?.path ?? "");
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [openSuggest, setOpenSuggest] = useState(false);
  const [seenPath, setSeenPath] = useState(pathname);
  const listId = useId();
  const deferredQuery = useDeferredValue(query);
  const suggestions = useMemo(() => suggest(index, deferredQuery), [index, deferredQuery]);
  const regionName = regions.find((item) => item.id === region.id)?.name ?? "Россия";
  const regionShort = region.id ? regionName : "Россия";
  const currentRoot = menu.find((item) => item.path === activeRoot) ?? menu[0];

  if (pathname !== seenPath) {
    setSeenPath(pathname);
    setCatalogOpen(false);
    setRegionOpen(false);
    setOpenSuggest(false);
    setMobileSearch(false);
  }

  useEffect(() => {
    if (!mobileSearch) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileSearch]);

  function go(href: string) {
    setOpenSuggest(false);
    startNav();
    router.push(href);
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = query.trim();
    setOpenSuggest(false);
    setMobileSearch(false);
    startNav();
    router.push(text ? `/search?q=${encodeURIComponent(text)}` : "/search");
  }

  function chooseRegion(id: string) {
    region.setRegion(id);
    setRegionOpen(false);
  }

  function onSearchKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpenSuggest(false);
      setMobileSearch(false);
    }
    if (!openSuggest || suggestions.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((value) => (value + 1) % suggestions.length);
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((value) => (value - 1 + suggestions.length) % suggestions.length);
    }
    if (event.key === "Enter" && suggestions[active]) {
      event.preventDefault();
      go(suggestions[active].href);
    }
  }

  const searchInput = (id: string, className: string, autoFocus = false) => (
    <input
      id={id}
      name="q"
      value={query}
      role="combobox"
      aria-expanded={openSuggest}
      aria-controls={`${listId}-${id}`}
      aria-autocomplete="list"
      autoComplete="off"
      autoFocus={autoFocus}
      className={className}
      placeholder="Поиск по объявлениям"
      onChange={(event) => {
        setQuery(event.target.value);
        setOpenSuggest(true);
        setActive(0);
      }}
      onFocus={() => setOpenSuggest(true)}
      onKeyDown={onSearchKey}
    />
  );

  const mapRoute = pathname.startsWith("/map");

  return (
    <header className={cn("sticky top-0 z-40 border-b border-[#ededed] bg-white", mapRoute && "hidden lg:block")}>
      <div className="mx-auto hidden h-10 max-w-[1348px] items-center gap-5 px-4 text-[14px] text-[#767676] lg:flex">
        {serviceLinks.map((link) => (
          <Link key={link.href} href={link.href} className="hover:text-foreground">{link.label}</Link>
        ))}
        <div className="relative ml-auto">
          <button
            type="button"
            className="flex h-10 max-w-[200px] items-center gap-1.5 hover:text-foreground"
            aria-expanded={regionOpen}
            aria-haspopup="listbox"
            aria-label={`Регион: ${regionName}`}
            onClick={() => {
              setRegionOpen((value) => !value);
              setCatalogOpen(false);
            }}
          >
            <MapPin className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{regionShort}</span>
            <ChevronDown className="size-4 shrink-0" aria-hidden="true" />
          </button>
          {regionOpen ? <RegionList regions={regions} onChoose={chooseRegion} className="top-full right-0" /> : null}
        </div>
        <Link href="/notifications" className="hover:text-foreground">Уведомления</Link>
        <Link href="/account/partner" className="hover:text-foreground">Мои объявления</Link>
      </div>

      <div className="mx-auto hidden h-[76px] max-w-[1348px] items-center gap-3 px-4 pb-3 lg:flex">
        <Link href="/" className="shrink-0 pr-2 text-[22px] leading-none font-extrabold tracking-tight">
          HELP<span className="text-primary">HOMES</span>
        </Link>
        <button
          type="button"
          className="flex h-[52px] shrink-0 items-center gap-2 rounded-xl bg-[#e8f1ff] px-4 text-[15px] font-semibold text-primary hover:bg-[#d9e8ff]"
          aria-expanded={catalogOpen}
          aria-controls="catalog-panel"
          onClick={() => {
            setCatalogOpen((value) => !value);
            setRegionOpen(false);
          }}
        >
          <LayoutGrid className="size-5" aria-hidden="true" />
          Все категории
        </button>
        <form action="/search" method="get" role="search" onSubmit={submitSearch} className="relative flex h-[52px] min-w-0 flex-1 items-stretch rounded-xl border border-[#cfcfcf] bg-white focus-within:border-primary">
          <label className="sr-only" htmlFor="header-search">Поиск по объявлениям</label>
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-[#8b8b8b]" aria-hidden="true" />
          {searchInput("header-search", "min-w-0 flex-1 bg-transparent pr-3 pl-11 text-[16px] outline-none placeholder:text-[#8b8b8b]")}
          <button type="submit" className="m-[3px] shrink-0 rounded-[9px] bg-primary px-6 text-[15px] font-semibold text-white hover:bg-[#0a5fe0]">Найти</button>
          {openSuggest && suggestions.length > 0 ? <SuggestList id={`${listId}-header-search`} items={suggestions} active={active} onActive={setActive} /> : null}
        </form>
        <nav aria-label="Кабинет" className="flex shrink-0 items-center gap-0.5">
          {iconLinks.map((item) => {
            const Icon = item.icon;
            const count = item.href === "/favorites" ? favorites.ids.length : 0;
            return (
              <Link key={item.href} href={item.href} aria-label={item.label} title={item.label} className="relative grid size-11 place-items-center rounded-xl text-[#222] hover:bg-[#f2f1f0] hover:text-primary">
                <Icon className="size-[22px]" aria-hidden="true" />
                {count > 0 ? (
                  <span className="absolute top-1 right-0.5 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] leading-4 font-semibold text-white">{count}</span>
                ) : null}
              </Link>
            );
          })}
          <Link href="/account" aria-label="Профиль" title="Профиль" className="grid size-11 place-items-center rounded-xl hover:bg-[#f2f1f0] hover:text-primary">
            <UserRound className="size-[22px]" aria-hidden="true" />
          </Link>
          <Link href="/account/partner/listings/new" className="ml-1.5 flex h-[52px] items-center gap-1.5 rounded-xl bg-primary px-4 text-[15px] font-semibold whitespace-nowrap text-white hover:bg-[#0a5fe0]">
            <span className="xl:hidden">Разместить</span>
            <span className="hidden xl:inline">Разместить объявление</span>
          </Link>
        </nav>
      </div>

      <div className="lg:hidden">
        <div className="relative flex h-11 items-center gap-1.5 px-3">
          <Link href="/" className="shrink-0 text-[16px] leading-none font-extrabold tracking-tight">
            HELP<span className="text-primary">HOMES</span>
          </Link>
          <button
            type="button"
            className="flex min-h-11 min-w-0 items-center gap-1 text-[13px]"
            aria-expanded={regionOpen}
            aria-label={`Регион: ${regionName}`}
            onClick={() => setRegionOpen((value) => !value)}
          >
            <MapPin className="size-4 shrink-0 text-primary" aria-hidden="true" />
            <span className="max-w-[88px] truncate">{regionShort}</span>
          </button>
          {regionOpen ? <RegionList regions={regions} onChoose={chooseRegion} className="top-11 left-3" /> : null}
          <div className="ml-auto flex items-center">
            <Link href="/favorites" aria-label="Избранное" className="relative grid size-11 place-items-center">
              <Heart className="size-[22px]" aria-hidden="true" />
              {favorites.ids.length > 0 ? <span className="absolute top-1 right-0.5 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] leading-4 font-semibold text-white">{favorites.ids.length}</span> : null}
            </Link>
            <Link href="/messages" aria-label="Сообщения" className="grid size-11 place-items-center"><MessageCircle className="size-[22px]" aria-hidden="true" /></Link>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 pb-2">
          <button
            type="button"
            className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-xl bg-[#f2f1f0] px-3 text-left text-[15px] text-[#767676]"
            onClick={() => setMobileSearch(true)}
          >
            <Search className="size-5 shrink-0" aria-hidden="true" />
            <span className="truncate">Поиск по объявлениям</span>
          </button>
          <Link
            href="/catalog"
            aria-label="Все категории"
            className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#e8f1ff] text-primary"
          >
            <LayoutGrid className="size-5" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {mobileSearch ? (
        <div className="fixed inset-0 z-[60] flex flex-col bg-white lg:hidden" role="dialog" aria-modal="true" aria-label="Поиск">
          <form action="/search" method="get" role="search" onSubmit={submitSearch} className="relative flex items-center gap-2 border-b border-[#ededed] p-3">
            <label className="sr-only" htmlFor="mobile-search">Поиск по объявлениям</label>
            <Search className="pointer-events-none absolute left-6 size-5 text-[#8b8b8b]" aria-hidden="true" />
            {searchInput("mobile-search", "h-11 min-w-0 flex-1 rounded-xl bg-[#f2f1f0] pr-3 pl-10 text-[16px] outline-none", true)}
            <button type="button" className="h-11 shrink-0 px-1 text-[15px] text-primary" onClick={() => setMobileSearch(false)}>Отмена</button>
          </form>
          <div className="flex-1 overflow-y-auto p-3">
            {suggestions.length > 0 ? (
              <ul id={`${listId}-mobile-search`} role="listbox">
                {suggestions.map((item) => (
                  <li key={item.id} role="option" aria-selected={false}>
                    <Link href={item.href} className="block border-b border-[#f0f0f0] py-3 text-[15px]">
                      <span className="block text-[11px] text-[#767676]">{labelOf(item.type)}</span>
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <>
                <p className="mb-2 text-[13px] font-semibold text-[#767676]">Разделы</p>
                <ul className="grid grid-cols-2 gap-2">
                  {menu.map((item) => (
                    <li key={item.path}>
                      <Link href={`/catalog/${item.path}`} className="flex h-12 items-center gap-2 rounded-xl bg-[#f2f1f0] px-3 text-[14px] font-medium">
                        <TaxonIcon name={item.icon} className="size-4 shrink-0 text-primary" />
                        <span className="truncate">{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      ) : null}

      {catalogOpen ? (
        <div id="catalog-panel" className="absolute inset-x-0 border-t border-[#ededed] bg-white shadow-lg" onKeyDown={(event) => event.key === "Escape" && setCatalogOpen(false)}>
          <div className="mx-auto grid max-h-[70vh] max-w-[1348px] grid-cols-1 overflow-auto px-4 py-3 lg:grid-cols-[260px_1fr]">
            <div className="mb-2 flex justify-end lg:col-span-2">
              <button type="button" className="inline-flex h-9 items-center gap-1 rounded-lg px-2 text-sm hover:bg-[#f2f1f0]" onClick={() => setCatalogOpen(false)}>
                <X className="size-4" aria-hidden="true" /> Закрыть
              </button>
            </div>
            <ul className="lg:border-r lg:border-[#ededed] lg:pr-2">
              {menu.map((item) => (
                <li key={item.path}>
                  <button
                    type="button"
                    className={cn("flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm", currentRoot?.path === item.path && "bg-[#f2f1f0] font-medium")}
                    onMouseEnter={() => setActiveRoot(item.path)}
                    onFocus={() => setActiveRoot(item.path)}
                    onClick={() => setActiveRoot(item.path)}
                  >
                    <TaxonIcon name={item.icon} className="size-4 text-primary" />
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
            {currentRoot ? (
              <div className="pt-2 lg:pt-0 lg:pl-4">
                <Link href={`/catalog/${currentRoot.path}`} className="text-sm font-semibold hover:text-primary" onClick={() => setCatalogOpen(false)}>
                  {currentRoot.name}
                </Link>
                <ul className="mt-3 grid gap-1 sm:grid-cols-2 xl:grid-cols-3">
                  {currentRoot.children.map((child) => (
                    <li key={child.path}>
                      <Link href={`/catalog/${child.path}`} className="block rounded-lg px-2 py-1.5 text-sm hover:bg-[#f2f1f0]" onClick={() => setCatalogOpen(false)}>
                        {child.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}

function SuggestList({
  id,
  items,
  active,
  onActive,
}: {
  id: string;
  items: SearchDocument[];
  active: number;
  onActive: (index: number) => void;
}) {
  return (
    <ul id={id} role="listbox" className="absolute top-[56px] z-50 max-h-80 w-full overflow-auto rounded-xl border border-[#ededed] bg-white p-1 shadow-lg">
      {items.map((item, index) => (
        <li key={item.id} role="option" aria-selected={index === active}>
          <Link
            href={item.href}
            className={cn("block rounded-lg px-3 py-2 text-sm hover:bg-[#f2f1f0]", index === active && "bg-[#f2f1f0]")}
            onMouseEnter={() => onActive(index)}
          >
            <span className="text-[11px] text-[#767676]">{labelOf(item.type)}</span>
            <span className="block">{item.title}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function RegionList({ regions, onChoose, className }: { regions: { id: string; name: string }[]; onChoose: (id: string) => void; className?: string }) {
  return (
    <ul role="listbox" className={cn("absolute z-50 mt-1 max-h-80 w-64 overflow-auto rounded-xl border border-[#ededed] bg-white p-1 shadow-lg", className)}>
      <li>
        <button type="button" className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-[#f2f1f0]" onClick={() => onChoose("")}>Вся Россия</button>
      </li>
      {regions.map((item) => (
        <li key={item.id}>
          <button type="button" className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-[#f2f1f0]" onClick={() => onChoose(item.id)}>{item.name}</button>
        </li>
      ))}
    </ul>
  );
}

function suggest(index: SearchDocument[], query: string) {
  const needle = normalize(query);
  if (needle.length < 2) return [];
  return index.filter((item) => normalize(item.title).includes(needle)).slice(0, 6);
}

function labelOf(type: SearchDocument["type"]) {
  if (type === "category") return "Направление";
  if (type === "service") return "Услуга";
  if (type === "article") return "Статья";
  if (type === "property") return "Образец";
  if (type === "calculator") return "Калькулятор";
  if (type === "listing") return "Объявление";
  return "Раздел";
}
