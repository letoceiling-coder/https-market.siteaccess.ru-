import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle, Search } from "lucide-react";
import { EmptyState } from "@/components/site/states";
import { isDemoMode } from "@/services/demo-mode";
import { DemoInbox } from "@/components/messages/demo-inbox";

export const metadata: Metadata = {
  title: "Сообщения",
  description: "Переписка с продавцами появится после подключения API.",
};

export default function MessagesPage() {
  const demo = isDemoMode();

  return (
    <div className="mx-auto max-w-3xl px-3 py-4 pb-10 sm:px-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-[22px] leading-7 font-bold">Сообщения</h1>
        {demo ? (
          <span className="rounded-md bg-foreground/80 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-white">DEMO</span>
        ) : null}
      </div>

      <label className="relative mt-3 block">
        <span className="sr-only">Поиск по диалогам</span>
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input
          type="search"
          name="q"
          disabled
          placeholder="Поиск по диалогам"
          className="h-11 w-full rounded-xl border border-border bg-tile pr-3 pl-10 text-[15px] text-muted-foreground"
        />
      </label>

      {demo ? (
        <div className="mt-4">
          <DemoInbox />
        </div>
      ) : (
        <div className="mt-4">
          <EmptyState
            title="Диалогов нет"
            text="Сервер сообщений не подключён. Письма продавцам не отправляются и не имитируются."
            action={
              <Link href="/catalog" className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white">
                <MessageCircle className="size-4" aria-hidden="true" />
                К объявлениям
              </Link>
            }
          />
        </div>
      )}
    </div>
  );
}
