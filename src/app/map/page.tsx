import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { MapScreen } from "@/components/map/map-screen";
import { EmptyState } from "@/components/site/states";
import { MAP_DEFAULT, getMapPoints } from "@/services/map-data";

export const metadata: Metadata = { title: "Карта объявлений", description: "Объявления на интерактивной карте." };

type Search = Promise<Record<string, string | string[] | undefined>>;

export default function MapPage({ searchParams }: { searchParams: Search }) {
  return (
    <Suspense fallback={<div className="grid h-[70vh] place-items-center text-sm text-[#767676]">Загрузка карты…</div>}>
      <MapRoute searchParams={searchParams} />
    </Suspense>
  );
}

function num(value: string | string[] | undefined, fallback: number) {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);
  return raw !== undefined && !Number.isNaN(parsed) ? parsed : fallback;
}

async function MapRoute({ searchParams }: { searchParams: Search }) {
  const params = await searchParams;
  const points = getMapPoints();

  if (points.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="text-[22px] leading-7 font-bold">Карта объявлений</h1>
        <div className="mt-4">
          <EmptyState
            title="На карте пока нет объявлений"
            text="Карта показывает только опубликованные объявления с координатами. Как только появятся живые объявления, они отобразятся здесь."
            action={<Link href="/catalog/nedvizhimost" className="inline-flex h-10 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-white">К недвижимости</Link>}
          />
        </div>
      </div>
    );
  }

  const initialView = {
    lat: num(params.lat, MAP_DEFAULT.lat),
    lng: num(params.lng, MAP_DEFAULT.lng),
    zoom: num(params.z, MAP_DEFAULT.zoom),
  };

  return (
    <>
      <h1 className="sr-only">Карта объявлений HELP HOMES</h1>
      <MapScreen points={points} initialView={initialView} />
    </>
  );
}
