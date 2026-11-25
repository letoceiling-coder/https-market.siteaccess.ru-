"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function SettingsForm() {
  const [notice, setNotice] = useState("");
  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold">Настройки</h1>
      <p className="mt-4 leading-7 text-muted-foreground">Уведомления и доступ появятся вместе с учётной записью. Сейчас переключатели ничего не включают.</p>
      <form
        className="mt-6 space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          setNotice("Настройки не сохранены: учётной записи и API нет.");
        }}
      >
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="size-4 accent-primary" /> Письма о модерации</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="size-4 accent-primary" /> Письма о рекламе</label>
        <Button type="submit" className="h-11">Сохранить</Button>
      </form>
      {notice ? <p role="status" className="mt-4 rounded-xl bg-secondary p-4 text-sm">{notice}</p> : null}
    </div>
  );
}
