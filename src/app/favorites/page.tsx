import type { Metadata } from "next";
import { FavoritesScreen } from "@/components/catalog/favorites-screen";
import { getProperties, getServices } from "@/services/catalog";
import { demoCardData, propertyCardData, serviceCardData } from "@/services/card-data";
import { getDemos } from "@/services/classified";

export const metadata: Metadata = { title: "Избранное", description: "Сохранённые в браузере карточки." };

export default function FavoritesPage() {
  const items = [
    ...getServices().map(serviceCardData),
    ...getProperties().map((item) => propertyCardData(item)),
    ...getDemos().map(demoCardData),
  ];
  return (
    <div className="mx-auto max-w-[1348px] px-4 py-4 pb-10">
      <h1 className="text-[24px] leading-8 font-bold">Избранное</h1>
      <p className="mt-1 text-sm text-[#767676]">Список хранится в этом браузере. Другое устройство его не увидит.</p>
      <FavoritesScreen items={items} />
    </div>
  );
}
