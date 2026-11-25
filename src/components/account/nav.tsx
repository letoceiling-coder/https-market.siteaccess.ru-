"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";

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
    <nav aria-label="Кабинет" className="flex gap-2 overflow-auto lg:flex-col">
      {links.map(([href, label]) => {
        const current = href === "/account/partner" ? pathname === href : pathname === href;
        return (
          <Link key={href} href={href} aria-current={current ? "page" : undefined} className={cn("rounded-lg px-3 py-2 text-sm whitespace-nowrap", current ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
