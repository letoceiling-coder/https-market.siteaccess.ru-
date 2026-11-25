import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Помощь", description: "Как устроен справочник HELP HOMES." };

const items = [
  ["Как искать", "Строка в шапке предлагает совпадения по названию. Страница поиска смотрит ещё и в описания. Буквы ё и й приводятся к е и и."],
  ["Фильтры недвижимости", "Форма отправляется обычным адресом. Ссылку с фильтрами можно сохранить. Цена у образцов пустая, поэтому ценовой фильтр честно очищает список."],
  ["Избранное", "Сердечко пишет идентификатор в localStorage этого браузера. На сервер ничего не уходит."],
  ["Формы", "Кнопка показывает JSON обращения и пишет, что отправки нет. Это не заявка и не заявка «успешно принята»."],
  ["Цены и отзывы", "Прайс не утверждён, отзывов и реализованных объектов на сайте нет. Демонстрационные карточки подписаны."],
  ["Аварийные работы", "Сайт не является аварийной службой и не публикует телефон."],
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-4 pb-10">
      <h1 className="text-2xl font-bold">Помощь</h1>
      <div className="mt-8 space-y-6">
        {items.map(([title, text]) => (
          <section key={title}>
            <h2 className="text-2xl font-semibold">{title}</h2>
            <p className="mt-2 leading-7 text-muted-foreground">{text}</p>
          </section>
        ))}
      </div>
      <p className="mt-8"><Link href="/contacts" className="text-primary">Контакты</Link></p>
    </div>
  );
}
