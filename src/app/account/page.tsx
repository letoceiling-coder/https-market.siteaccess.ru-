import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Профиль", description: "Выбор кабинета. Серверные роли ещё не выдаются." };

const roles = [
  ["private", "Частный пользователь"],
  ["seller", "Продавец"],
  ["company", "Компания"],
  ["agency", "Агентство недвижимости"],
  ["dealer", "Автодилер"],
  ["employer", "Работодатель"],
  ["partner", "Партнёр"],
  ["moderator", "Администратор и модератор"],
];

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-4 pb-10">
      <h1 className="text-2xl font-bold">Кабинеты</h1>
      <p className="mt-2 text-sm text-muted-foreground">Это оболочки интерфейса. Вход, роли и статистика заработают с API. Цифры не подставляются.</p>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {roles.map(([id, name]) => (
          <li key={id}>
            <Link href={`/account/cabinet?role=${id}`} className="block rounded-xl bg-white p-4 hover:shadow-sm">{name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
