import { Suspense, type ReactNode } from "react";
import { AccountNav } from "@/components/account/nav";

export default function PartnerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto grid max-w-[1348px] gap-8 px-4 py-4 pb-10 lg:grid-cols-[220px_1fr]">
      <Suspense fallback={<div className="h-40 rounded-xl bg-secondary" />}>
        <AccountNav />
      </Suspense>
      <div>{children}</div>
    </div>
  );
}
