import type { Metadata } from "next";
import { PreviewForm } from "@/components/site/preview-form";

export const metadata: Metadata = { title: "Профиль партнёра" };

export default function ProfilePage() {
  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold">Профиль</h1>
      <p className="mt-4 leading-7 text-muted-foreground">
        Компания не создана. Поля ниже не сохраняются на сервере и не проходят модерацию. После заполнения виден только предпросмотр.
      </p>
      <div className="mt-6"><PreviewForm subject="Профиль партнёра — не отправлено" /></div>
    </div>
  );
}
