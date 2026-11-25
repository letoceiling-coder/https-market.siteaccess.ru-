"use client";

import { Heart, House, Plus, Search, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStoredIds } from "@/hooks/storage";
import { cn } from "cn";

const items = [
  { href: "/", label: "Главная", icon: House, match: (path: string) => path === "/" },
  { href: "/search", label: "Поиск", icon: Search, match: (path: string) => path.startsWith("/search") || path.startsWith("/catalog") || path.startsWith("/map") },
  { href: "/account/partner/listings/new", label: "Разместить", icon: Plus, match: (path: string) => path.includes("/listings") },
  { href: "/favorites", label: "Избранное", icon: Heart, match: (path: string) => path.startsWith("/favorites") },
  { href: "/account", label: "Профиль", icon: UserRound, match: (path: string) => path.startsWith("/account") && !path.includes("/listings") },
];

/** Floating app tab bar for phones. The centre action is raised so posting is always one thumb-tap away. */
export function BottomNav() {
  const pathname = usePathname();
  const favorites = useStoredIds("hh.favorites");
  // Listing and chat screens keep their own sticky action bar.
  if (pathname.startsWith("/samples/") || pathname.startsWith("/messages/")) return null;

  return (
    <nav
      aria-label="Мобильные разделы"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(0.5rem+env(safe-area-inset-bottom))] lg:hidden"
    >
      <ul className="pointer-events-auto mx-auto grid h-[62px] max-w-md grid-cols-5 items-center rounded-[22px] border border-white/60 bg-card/92 shadow-float backdrop-blur-xl">
        {items.map((item) => {
          const Icon = item.icon;
          const current = item.match(pathname);
          const post = item.label === "Разместить";
          const count = item.href === "/favorites" ? favorites.ids.length : 0;
          if (post) {
            return (
              <li key={item.href} className="flex justify-center">
                <Link
                  href={item.href}
                  aria-label="Разместить объявление"
                  aria-current={current ? "page" : undefined}
                  className="press -mt-6 grid size-14 place-items-center rounded-[20px] bg-primary text-white shadow-[0_10px_20px_-8px_rgb(13_107_87/0.7)] ring-4 ring-background"
                >
                  <Plus className="size-6" strokeWidth={2.5} aria-hidden="true" />
                </Link>
              </li>
            );
          }
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "press relative flex h-[62px] flex-col items-center justify-center gap-1 text-[10.5px] font-medium",
                  current ? "text-primary" : "text-muted-foreground",
                )}
              >
                <span className={cn("relative grid h-7 w-12 place-items-center rounded-full transition-colors", current && "bg-accent")}>
                  <Icon className={cn("size-[21px]", current && item.icon === Heart && "fill-primary")} strokeWidth={current ? 2.3 : 1.9} aria-hidden="true" />
                  {count > 0 ? (
                    <span className="absolute -top-1 right-1 grid min-w-[18px] place-items-center rounded-full bg-signal px-1 text-[10px] leading-[18px] font-bold text-signal-foreground">
                      {count}
                    </span>
                  ) : null}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
