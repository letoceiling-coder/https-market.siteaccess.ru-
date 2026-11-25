"use client";

import { useRouter } from "next/navigation";
import type { FormEvent, ReactNode } from "react";
import { startNav } from "@/components/site/nav-progress";

/**
 * A GET form that navigates client-side instead of doing a full document reload.
 * Keeps `action`/`method="get"` so it still works without JS (progressive enhancement),
 * but on submit it serialises the fields and uses the App Router for an SPA transition.
 */
export function ClientForm({
  action,
  className,
  children,
  role,
}: {
  action: string;
  className?: string;
  children: ReactNode;
  role?: string;
}) {
  const router = useRouter();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const params = new URLSearchParams();
    for (const [key, value] of data.entries()) {
      if (typeof value === "string" && value.trim() !== "") params.set(key, value);
    }
    const query = params.toString();
    startNav();
    router.push(query ? `${action}?${query}` : action);
  }

  return (
    <form action={action} method="get" role={role} className={className} onSubmit={onSubmit}>
      {children}
    </form>
  );
}
