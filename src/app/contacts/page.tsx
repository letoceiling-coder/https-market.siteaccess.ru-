import type { Metadata } from "next";
import { PreviewForm } from "@/components/site/preview-form";

export const metadata: Metadata = { title: "Контакты", description: "Форма обращения в режиме предпросмотра." };

export default function ContactsPage() {
  return (
    <div className="mx-auto grid max-w-[1100px] gap-8 px-4 py-4 pb-10 lg:grid-cols-2">
      <div>
        <h1 className="text-2xl font-bold">Контакты</h1>
        <p className="mt-4 leading-7 text-muted-foreground">
          Телефон, почта, адрес и ИНН не публикуются: реквизиты не переданы. Сайт не принимает аварийные вызовы.
          Форма справа собирает обращение только для просмотра.
        </p>
        <dl className="mt-6 space-y-3 text-sm">
          <div><dt className="text-muted-foreground">Телефон</dt><dd>не опубликован</dd></div>
          <div><dt className="text-muted-foreground">Почта</dt><dd>не опубликована</dd></div>
          <div><dt className="text-muted-foreground">Адрес</dt><dd>не опубликован</dd></div>
        </dl>
      </div>
      <PreviewForm subject="Контакты — не отправлено" />
    </div>
  );
}
