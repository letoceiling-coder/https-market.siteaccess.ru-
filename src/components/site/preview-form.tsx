"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { cloneElement, isValidElement, useId, useState, type ReactElement, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  name: z.string().trim().min(2, "Укажите имя"),
  phone: z.string().trim().min(10, "Укажите телефон"),
  email: z.string().trim().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Укажите почту"),
  message: z.string().trim().min(10, "Опишите задачу хотя бы в десяти символах"),
  consent: z.boolean().refine((value) => value, "Нужно согласие, чтобы в будущем передать обращение"),
});

type FormValues = z.infer<typeof schema>;

export function PreviewForm({
  subject,
  compact = false,
}: {
  subject: string;
  compact?: boolean;
}) {
  const [preview, setPreview] = useState<FormValues | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", phone: "", email: "", message: "", consent: false },
  });

  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={form.handleSubmit((values) => setPreview(values))}
    >
      <p className="text-sm leading-6 text-muted-foreground">
        Режим предпросмотра. Сообщение останется на экране и не будет отправлено: API ещё не подключён.
      </p>
      <Field label="Имя" error={form.formState.errors.name?.message}>
        <Input className="h-11" autoComplete="name" {...form.register("name")} />
      </Field>
      <Field label="Телефон" error={form.formState.errors.phone?.message}>
        <Input className="h-11" autoComplete="tel" inputMode="tel" {...form.register("phone")} />
      </Field>
      <Field label="Почта" error={form.formState.errors.email?.message}>
        <Input className="h-11" autoComplete="email" inputMode="email" {...form.register("email")} />
      </Field>
      {!compact ? (
        <Field label="Задача" error={form.formState.errors.message?.message}>
          <Textarea rows={5} {...form.register("message")} />
        </Field>
      ) : (
        <input type="hidden" value={subject} readOnly />
      )}
      {compact ? (
        <Field label="Коротко о задаче" error={form.formState.errors.message?.message}>
          <Textarea rows={4} {...form.register("message")} />
        </Field>
      ) : null}
      <label className="flex items-start gap-3 text-sm leading-6">
        <input className="mt-1 size-4 accent-primary" type="checkbox" {...form.register("consent")} />
        <span>Согласен на обработку данных, когда появится сервер. Сейчас данные никуда не уходят.</span>
      </label>
      {form.formState.errors.consent ? (
        <p className="text-sm text-destructive">{form.formState.errors.consent.message}</p>
      ) : null}
      <Button type="submit" className="h-11 px-5">
        Показать обращение
      </Button>
      {preview ? (
        <div className="rounded-xl border border-border bg-secondary p-4" role="status">
          <h3 className="font-semibold">Предпросмотр, не отправлено</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Тема: {subject}</p>
          <pre className="mt-3 overflow-auto text-xs leading-5">{JSON.stringify(preview, null, 2)}</pre>
        </div>
      ) : null}
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  const id = useId();
  const control = isValidElement(children)
    ? cloneElement(children as ReactElement<{ id?: string }>, { id })
    : children;
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {control}
      {error ? <p className="text-sm text-destructive" id={`${id}-error`}>{error}</p> : null}
    </div>
  );
}
