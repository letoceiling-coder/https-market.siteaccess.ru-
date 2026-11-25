"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const columns = [
  {
    title: "Объявления",
    links: [
      ["Авто", "/catalog/transport"],
      ["Недвижимость", "/catalog/nedvizhimost"],
      ["Работа", "/catalog/rabota"],
      ["Услуги", "/catalog/uslugi"],
      ["Электроника", "/catalog/elektronika"],
      ["Все категории", "/catalog"],
    ],
  },
  {
    title: "Компания",
    links: [
      ["О платформе", "/about"],
      ["Помощь", "/help"],
      ["Контакты", "/contacts"],
      ["Журнал", "/articles"],
      ["Реклама", "/advertising"],
    ],
  },
  {
    title: "Кабинет",
    links: [
      ["Подать объявление", "/account/partner/listings/new"],
      ["Мои объявления", "/account/partner"],
      ["Избранное", "/favorites"],
      ["Компании", "/partners"],
    ],
  },
];

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname.startsWith("/map")) return null;

  return (
    <footer className="mt-auto border-t border-[#ededed] bg-white">
      <div className="mx-auto grid max-w-[1348px] gap-6 px-4 py-6 md:grid-cols-4">
        <div>
          <p className="text-[20px] leading-none font-extrabold tracking-tight">
            HELP<span className="text-primary">HOMES</span>
          </p>
          <p className="mt-3 max-w-xs text-[13px] leading-5 text-[#767676]">
            Объявления о недвижимости, транспорте, работе, услугах и товарах.
          </p>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <h2 className="text-sm font-semibold">{column.title}</h2>
            <ul className="mt-2 space-y-1.5">
              {column.links.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-[13px] text-[#767676] hover:text-foreground">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-[#ededed]">
        <div className="mx-auto flex max-w-[1348px] flex-wrap gap-x-5 gap-y-1 px-4 py-3 text-[13px] text-[#767676]">
          <Link href="/legal/privacy">Конфиденциальность</Link>
          <Link href="/legal/terms">Условия использования</Link>
          <Link href="/legal/advertising">Правила рекламы</Link>
          <span className="ml-auto">© HELP HOMES</span>
        </div>
      </div>
    </footer>
  );
}
