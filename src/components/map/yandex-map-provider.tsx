"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { hasYandexMapsKey, YANDEX_MAPS_KEY } from "@/lib/yandex-maps";

type MapApi = {
  ready: boolean;
  key: string;
};

const MapApiContext = createContext<MapApi>({ ready: false, key: "" });

export function YandexMapProvider({ children }: { children: ReactNode }) {
  const value = useMemo(() => ({ ready: hasYandexMapsKey, key: YANDEX_MAPS_KEY }), []);
  return <MapApiContext.Provider value={value}>{children}</MapApiContext.Provider>;
}

export function useYandexMapApi() {
  return useContext(MapApiContext);
}
