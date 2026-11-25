"use client";

import Link from "next/link";
import { useState } from "react";
import type { MessageThreadPreview } from "@/domain/api-contract";

const DEMO_THREADS: MessageThreadPreview[] = [
  {
    id: "demo-thread-1",
    listingId: "demo-job-sales",
    listingTitle: "Менеджер по продажам",
    listingHref: "/samples/job-sales",
    peerName: "DEMO · Работодатель",
    preview: "Здравствуйте! Расскажите о опыте продаж.",
    updatedAt: "Сегодня, 12:40",
    unread: 1,
  },
  {
    id: "demo-thread-2",
    listingId: "demo-flat-2k",
    listingTitle: "2-к. квартира, 54 м²",
    listingHref: "/samples/flat-2k",
    peerName: "DEMO · Продавец",
    preview: "Квартира ещё свободна. Могу показать завтра.",
    updatedAt: "Вчера",
    unread: 0,
  },
];

/**
 * Local DEMO inbox only. Does not send messages and is never shown when UI_DEMO_MODE is off.
 */
export function DemoInbox() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = DEMO_THREADS.find((thread) => thread.id === activeId) ?? null;

  if (active) {
    return (
      <div className="overflow-hidden rounded-2xl border border-[#ededed] bg-white">
        <div className="flex items-center gap-2 border-b border-[#ededed] px-3 py-2">
          <button type="button" className="h-10 rounded-lg px-2 text-sm text-primary" onClick={() => setActiveId(null)}>
            ← К диалогам
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-semibold">{active.peerName}</p>
            <Link href={active.listingHref} className="truncate text-[12px] text-primary">
              {active.listingTitle}
            </Link>
          </div>
        </div>
        <div className="space-y-2 bg-[#f7f7f7] px-3 py-4">
          <p className="mx-auto max-w-[85%] rounded-2xl rounded-bl-md bg-white px-3 py-2 text-[14px] leading-5 shadow-sm">
            {active.preview}
          </p>
          <p className="text-center text-[11px] text-[#767676]">DEMO-переписка. Сообщения никуда не отправляются.</p>
        </div>
        <form
          className="flex gap-2 border-t border-[#ededed] p-2"
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          <label className="sr-only" htmlFor="demo-message">
            Сообщение
          </label>
          <input
            id="demo-message"
            name="body"
            disabled
            placeholder="Отправка недоступна без Backend"
            className="h-11 min-w-0 flex-1 rounded-xl border border-[#e4e4e4] bg-[#f2f1f0] px-3 text-[14px] text-[#767676]"
          />
          <button type="submit" disabled className="h-11 rounded-xl bg-[#cfcfcf] px-4 text-[14px] font-semibold text-white">
            Отправить
          </button>
        </form>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-[#f0f0f0] overflow-hidden rounded-2xl border border-[#ededed] bg-white">
      {DEMO_THREADS.map((thread) => (
        <li key={thread.id}>
          <button type="button" onClick={() => setActiveId(thread.id)} className="flex w-full gap-3 px-3 py-3 text-left hover:bg-[#fafafa]">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#e8f1ff] text-[12px] font-bold text-primary">
              {thread.peerName.slice(0, 1)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2">
                <span className="truncate text-[14px] font-semibold">{thread.peerName}</span>
                <span className="shrink-0 text-[11px] text-[#a0a0a0]">{thread.updatedAt}</span>
              </span>
              <span className="mt-0.5 block truncate text-[12px] text-primary">{thread.listingTitle}</span>
              <span className="mt-0.5 block truncate text-[13px] text-[#555]">{thread.preview}</span>
            </span>
            {thread.unread > 0 ? (
              <span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-primary text-[11px] font-semibold text-white">
                {thread.unread}
              </span>
            ) : null}
          </button>
        </li>
      ))}
    </ul>
  );
}
