"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";
import { ScrollRail } from "@/components/site/scroll-rail";

const links = [
  ["/account/partner", "Обзор"],
  ["/account/partner/listings", "Объявления"],
  ["/account/partner/listings/new", "Новое"],
  ["/account/partner/profile", "Профиль"],
  ["/account/partner/settings", "Настройки"],
];

export function AccountNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Кабинет">
      <ScrollRail arrows={false} trackClassName="gap-2 lg:flex-col">
      {links.map(([href, label]) => {
        const current = href === "/account/partner" ? pathname === href : pathname === href;
        return (
          <Link key={href} href={href} aria-current={current ? "page" : undefined} className={cn("shrink-0 rounded-lg px-3 py-2 text-sm whitespace-nowrap", current ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>
            {label}
          </Link>
        );
      })}
      </ScrollRail>
    </nav>
  );
}
