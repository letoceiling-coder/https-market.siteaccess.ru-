import type { Metadata } from "next";
import { EmptyState } from "@/components/site/states";

export const metadata: Metadata = { title: "Уведомления", description: "Лента уведомлений ждёт серверных событий." };

export default function NotificationsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-4 pb-10">
      <h1 className="text-2xl font-bold">Уведомления</h1>
      <div className="mt-4">
        <EmptyState title="Событий нет" text="Модерация, ответы и продвижение появятся здесь, когда их начнёт присылать API." />
      </div>
    </div>
  );
}
