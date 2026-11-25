import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/site/states";
import { getCompanies } from "@/services/catalog";

export const metadata: Metadata = {
  title: "Партнёры",
  description: "Проверенных компаний пока нет. Показан один макет профиля.",
};

export default function PartnersPage() {
  const demos = getCompanies().filter((item) => item.status === "demo");
  return (
    <div className="mx-auto max-w-[1348px] px-4 py-4 pb-10">
      <h1 className="text-2xl font-bold">Компании</h1>
      <div className="mt-6">
        <EmptyState
          title="Проверенных компаний нет"
          text="Каталог партнёров откроется после модерации. Сейчас список намеренно пуст, чтобы не выдавать макет за организацию."
          action={<Link href="/account/partner" className="text-primary">Открыть кабинет</Link>}
        />
      </div>
      <h2 className="mt-12 text-2xl font-semibold">Макет карточки</h2>
      <ul className="mt-4 grid gap-4 md:grid-cols-2">
        {demos.map((company) => (
          <li key={company.id} className="rounded-2xl border border-dashed border-border bg-card p-5">
            <p className="text-xs tracking-wide text-primary uppercase">Не компания · образец интерфейса</p>
            <h3 className="mt-2 text-xl font-semibold">
              <Link href={`/partners/${company.slug}`} className="hover:text-primary">{company.name}</Link>
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{company.summary}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
