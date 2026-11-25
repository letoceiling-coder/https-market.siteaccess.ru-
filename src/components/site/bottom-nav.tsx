"use client";

import { Heart, House, Plus, Search, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";

const items = [
  { href: "/", label: "Главная", icon: House, match: (path: string) => path === "/" },
  { href: "/search", label: "Поиск", icon: Search, match: (path: string) => path.startsWith("/search") || path.startsWith("/catalog") || path.startsWith("/map") },
  { href: "/account/partner/listings/new", label: "Разместить", icon: Plus, match: (path: string) => path.includes("/listings") },
  { href: "/favorites", label: "Избранное", icon: Heart, match: (path: string) => path.startsWith("/favorites") },
  { href: "/account", label: "Профиль", icon: UserRound, match: (path: string) => path.startsWith("/account") && !path.includes("/listings") },
];

export function BottomNav() {
  const pathname = usePathname();
  // Detail listing keeps its own sticky action bar; map keeps nav but content accounts for it.
  if (pathname.startsWith("/samples/") || pathname.startsWith("/messages/")) return null;

  return (
    <nav
      aria-label="Мобильные разделы"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[#ededed] bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="grid h-14 grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;
          const current = item.match(pathname);
          const post = item.label === "Разместить";
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={current ? "page" : undefined}
                className={cn("flex h-14 flex-col items-center justify-center gap-0.5 text-[11px]", current ? "text-primary" : "text-[#767676]")}
              >
                <span className={cn(post && "grid size-8 place-items-center rounded-full bg-primary text-white")}>
                  <Icon className={post ? "size-4" : "size-5"} />
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
