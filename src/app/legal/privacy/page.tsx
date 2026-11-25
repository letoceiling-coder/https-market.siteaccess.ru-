import type { Metadata } from "next";

export const metadata: Metadata = { title: "Конфиденциальность" };

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-4 pb-10">
      <h1 className="text-2xl font-bold">Конфиденциальность</h1>
      <p className="mt-4 leading-7">Формы не отправляют данные на сервер. Имя, телефон и почта остаются в памяти страницы до обновления и в предпросмотре на экране.</p>
      <p className="mt-4 leading-7">Избранное, недавние карточки и черновики объявлений записываются в localStorage браузера под ключами hh.favorites, hh.recent и hh.listings. Их можно удалить в настройках браузера.</p>
      <p className="mt-4 leading-7">Политика оператора персональных данных появится вместе с реквизитами и сервером. Этот текст не заменяет юридический документ.</p>
    </article>
  );
}
