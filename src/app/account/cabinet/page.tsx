import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/site/states";
import { getPolicy } from "@/services/classified";

export const metadata: Metadata = { title: "Кабинет", robots: { index: false, follow: false } };

type Search = Promise<Record<string, string | string[] | undefined>>;

const names: Record<string, string> = {
  private: "Частный пользователь",
  seller: "Продавец",
  company: "Компания",
  agency: "Агентство недвижимости",
  dealer: "Автодилер",
  employer: "Работодатель",
  partner: "Партнёр",
  moderator: "Администратор и модератор",
};

const sections = [
  ["Объявления", "/account/partner/listings"],
  ["Черновики", "/account/partner/listings"],
  ["Избранное", "/favorites"],
  ["Сообщения", "/messages"],
  ["Уведомления", "/notifications"],
  ["Обращения", "/contacts"],
  ["Реклама", "/advertising"],
  ["Тарифы", "/advertising"],
  ["Профиль", "/account/partner/profile"],
  ["Настройки", "/account/partner/settings"],
];

export default function CabinetPage({ searchParams }: { searchParams: Search }) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Cabinet searchParams={searchParams} />
    </Suspense>
  );
}

async function Cabinet({ searchParams }: { searchParams: Search }) {
  const roleRaw = (await searchParams).role;
  const role = Array.isArray(roleRaw) ? roleRaw[0] ?? "private" : roleRaw ?? "private";
  const title = names[role] ?? names.private;
  const policy = getPolicy();
  return (
    <div className="mx-auto max-w-3xl px-4 py-4 pb-10">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Кабинет не авторизован. Статистика показана прочерком, потому что показов и сделок нет.</p>
      <dl className="mt-4 grid grid-cols-3 gap-2">
        {["Показы", "Обращения", "Сделки"].map((label) => (
          <div key={label} className="rounded-xl bg-white p-3">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="text-xl font-bold">—</dd>
          </div>
        ))}
      </dl>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {sections.map(([label, href]) => (
          <li key={label}><Link href={href} className="block rounded-xl border border-border bg-white px-3 py-3 text-sm">{label}</Link></li>
        ))}
      </ul>
      {role === "moderator" ? (
        <section className="mt-6 rounded-xl bg-white p-4">
          <h2 className="font-semibold">Правила категорий</h2>
          <p className="mt-2 text-sm text-muted-foreground">{policy.note}</p>
          <ul className="mt-3 space-y-1 text-sm">{policy.banned.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
      ) : null}
    </div>
  );
}
