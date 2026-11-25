import type { Metadata } from "next";
import Link from "next/link";
import { DraftCount } from "@/components/account/listings-board";

export const metadata: Metadata = { title: "Кабинет партнёра", description: "Локальный кабинет без серверных показателей." };

const kpis = [
  ["Просмотры", "—"],
  ["Обращения", "—"],
  ["Опубликовано", "—"],
];

export default function PartnerHomePage() {
  return (
    <div>
      <h1 className="text-[24px] leading-8 font-bold">Кабинет партнёра</h1>
      <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
        Показатели появятся из API. Пока вместо чисел стоит прочерк: выдуманной статистики нет. Черновики живут в localStorage.
      </p>
      <dl className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-tile p-4">
            <dt className="text-[13px] text-muted-foreground">{label}</dt>
            <dd className="mt-1 text-[28px] leading-9 font-bold">{value}</dd>
          </div>
        ))}
        <div className="rounded-2xl bg-tile p-4">
          <dt className="text-[13px] text-muted-foreground">Черновики в браузере</dt>
          <dd className="mt-1 text-[28px] leading-9 font-bold"><DraftCount /></dd>
        </div>
      </dl>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href="/account/partner/listings/new" className="inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-semibold text-white">Новое объявление</Link>
        <Link href="/advertising" className="inline-flex h-11 items-center rounded-xl bg-tile px-5 text-sm font-medium">Рекламные форматы</Link>
      </div>
    </div>
  );
}
