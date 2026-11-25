"use client";

import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="mx-auto max-w-xl px-4 py-24" role="alert">
      <h1 className="text-3xl font-semibold">Страница не открылась</h1>
      <p className="mt-4 text-muted-foreground">Можно повторить загрузку этого экрана. Данные формы при этом не отправляются.</p>
      <Button type="button" className="mt-8 h-11 px-5" onClick={() => reset()}>
        Повторить
      </Button>
    </section>
  );
}
