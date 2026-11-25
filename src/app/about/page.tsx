import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "О платформе", description: "Что уже есть в интерфейсе HELP HOMES и чего ещё нет." };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-4 pb-10">
      <h1 className="text-2xl font-bold">О платформе</h1>
      <p className="mt-4 leading-7">
        HELP HOMES собирает справочник услуг для дома, инженерных систем, строительства и будущую площадку недвижимости с партнёрами.
        Сейчас работает только интерфейс. Организация, ИНН, адрес и телефон не опубликованы, потому что эти реквизиты в проект не переданы.
      </p>
      <h2 className="mt-8 text-2xl font-semibold">Что можно смотреть</h2>
      <ul className="mt-3 space-y-2 leading-7">
        <li>— двенадцать направлений и вложенные работы;</li>
        <li>— образцы домов, коттеджей и участков без цены и адреса;</li>
        <li>— черновики статей и словарь;</li>
        <li>— прикидки калькуляторов;</li>
        <li>— кабинет партнёра, который хранит черновик только в браузере.</li>
      </ul>
      <h2 className="mt-8 text-2xl font-semibold">Чего здесь нет</h2>
      <ul className="mt-3 space-y-2 leading-7">
        <li>— прайс-листа и коммерческих предложений;</li>
        <li>— отзывов, рейтингов и выполненных объектов;</li>
        <li>— проверенных компаний;</li>
        <li>— отправки заявок на сервер.</li>
      </ul>
      <p className="mt-8"><Link href="/services" className="text-primary">Перейти в каталог</Link></p>
    </div>
  );
}
