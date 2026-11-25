"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { MapControls } from "@/components/map/map-controls";
import { MapFilterBar } from "@/components/map/map-filter-bar";
import { MapListToggle } from "@/components/map/map-list-toggle";
import { MapListingPreview } from "@/components/map/map-listing-preview";
import { MapResultsSheet, plural, type SheetState } from "@/components/map/map-results-sheet";
import { MapSearchArea } from "@/components/map/map-search-area";
import { YandexMapProvider } from "@/components/map/yandex-map-provider";
import type { MapBounds, MapView } from "@/components/map/yandex-map-view";
import { ListingImage } from "@/components/classified/listing-image";
import type { ListingKind } from "@/domain/classified";
import { useRegion } from "@/hooks/region";
import { pointInBounds } from "@/lib/yandex-maps";
import { MAP_KIND_LABEL, type MapPoint } from "@/services/map-data";
import { getRegionCentre, matchesRegion } from "@/services/region";
import { cn } from "cn";

const YandexMapView = dynamic(() => import("@/components/map/yandex-map-view").then((mod) => mod.YandexMapView), {
  ssr: false,
  loading: () => <div className="grid h-full w-full place-items-center bg-tile text-sm text-muted-foreground">Загрузка карты…</div>,
});

const VIEW_KEY = "hh.map.view";

function subscribeDesktop(onStoreChange: () => void) {
  const media = window.matchMedia("(min-width: 1024px)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function desktopSnapshot() {
  return window.matchMedia("(min-width: 1024px)").matches;
}

export function MapScreen({ points, initialView, demo = false }: { points: MapPoint[]; initialView: MapView; demo?: boolean }) {
  const router = useRouter();
  const region = useRegion();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [kind, setKind] = useState<ListingKind | "all">("all");
  const [query, setQuery] = useState("");
  const [mobileList, setMobileList] = useState(false);
  const [sheet, setSheet] = useState<SheetState>("collapsed");
  const [flyTo, setFlyTo] = useState<(MapView & { nonce: number }) | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const isDesktop = useSyncExternalStore(subscribeDesktop, desktopSnapshot, () => false);
  const [bounds, setBounds] = useState<MapBounds | null>(null);
  const [searchInView, setSearchInView] = useState(false);
  const [areaPrompt, setAreaPrompt] = useState(false);
  const [satellite, setSatellite] = useState(false);
  const viewRef = useRef<MapView>(initialView);
  const handleRef = useRef<{ setLocation: (view: MapView, duration?: number) => void; zoomBy: (delta: number) => void; setScheme: (satellite: boolean) => void } | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const flyNonceRef = useRef(0);
  const restoredViewRef = useRef(false);

  const bumpFly = useCallback((view: MapView) => {
    flyNonceRef.current += 1;
    setFlyTo({ ...view, nonce: flyNonceRef.current });
  }, []);

  useEffect(() => {
    if (!region.id) return;
    const centre = getRegionCentre(region.id);
    viewRef.current = centre;
    startTransition(() => {
      bumpFly(centre);
      setSearchInView(false);
      setSelectedId(null);
    });
  }, [region.id, bumpFly]);

  const kinds = useMemo(() => {
    const present = new Set(points.map((point) => point.kind));
    return (Object.keys(MAP_KIND_LABEL) as ListingKind[]).filter((item) => present.has(item));
  }, [points]);

  const regional = useMemo(() => matchesRegion(points, region.id), [points, region.id]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return regional.filter((point) => {
      if (kind !== "all" && point.kind !== kind) return false;
      if (needle && ![point.title, point.place, MAP_KIND_LABEL[point.kind] ?? ""].some((value) => value.toLowerCase().includes(needle))) return false;
      if (searchInView && bounds && !pointInBounds(point.lat, point.lng, bounds)) return false;
      return true;
    });
  }, [regional, kind, query, searchInView, bounds]);

  const selected = filtered.find((point) => point.id === selectedId) ?? null;

  const syncUrl = useCallback((view: MapView, nextKind: ListingKind | "all") => {
    const params = new URLSearchParams(window.location.search);
    params.set("lat", view.lat.toFixed(4));
    params.set("lng", view.lng.toFixed(4));
    params.set("z", String(view.zoom));
    if (nextKind === "all") params.delete("kind");
    else params.set("kind", nextKind);
    if (region.id) params.set("region", region.id);
    else params.delete("region");
    window.history.replaceState(null, "", `/map?${params.toString()}`);
    sessionStorage.setItem(VIEW_KEY, JSON.stringify(view));
  }, [region.id]);

  const onMoved = useCallback(
    (view: MapView, nextBounds: MapBounds) => {
      viewRef.current = view;
      setBounds(nextBounds);
      setAreaPrompt(true);
      syncUrl(view, kind);
    },
    [kind, syncUrl],
  );

  function locate() {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError("Геолокация недоступна в этом браузере");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => bumpFly({ lat: position.coords.latitude, lng: position.coords.longitude, zoom: 12 }),
      () => setGeoError("Не удалось определить местоположение. Разрешите доступ в браузере."),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  function selectFromList(id: string) {
    setSelectedId(id);
    if (sheet === "expanded") setSheet("half");
    setMobileList(false);
    const point = filtered.find((item) => item.id === id);
    if (point) bumpFly({ lat: point.lat, lng: point.lng, zoom: Math.max(viewRef.current.zoom, 12) });
  }

  useEffect(() => {
    if (!selectedId || !listRef.current) return;
    const active = listRef.current.querySelector(`[data-point="${selectedId}"]`);
    active?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selectedId]);

  useEffect(() => {
    function onPop() {
      if (mobileList) {
        setMobileList(false);
        return;
      }
      if (sheet !== "collapsed") {
        setSheet(sheet === "expanded" ? "half" : "collapsed");
        return;
      }
      router.back();
    }
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [mobileList, router, sheet]);

  const resultsList = (
    <ul ref={listRef} className="space-y-2">
      {filtered.map((point) => (
        <li key={point.id} data-point={point.id}>
          <ResultCard point={point} active={point.id === selectedId} onSelect={() => selectFromList(point.id)} />
        </li>
      ))}
      {filtered.length === 0 ? (
        <li className="px-1 py-6 text-center text-sm text-muted-foreground">
          {region.id ? "В выбранном регионе нет объявлений с координатами." : "Нет объявлений по текущим фильтрам."}
        </li>
      ) : null}
    </ul>
  );

  const canvas = (
    <YandexMapView
      points={filtered.slice(0, 80)}
      selectedId={selectedId}
      initialView={initialView}
      flyTo={flyTo}
      onSelect={(id) => {
        setSelectedId(id);
        setSheet((current) => (current === "collapsed" ? "half" : current));
      }}
      onMoved={onMoved}
      onReady={(handle) => {
        handleRef.current = handle;
        if (restoredViewRef.current || region.id) return;
        restoredViewRef.current = true;
        try {
          const stored = sessionStorage.getItem(VIEW_KEY);
          if (!stored) return;
          const parsed = JSON.parse(stored) as MapView;
          if (Number.isFinite(parsed.lat) && Number.isFinite(parsed.lng)) {
            viewRef.current = parsed;
            handle.setLocation(parsed, 0);
          }
        } catch {
          /* ignore */
        }
      }}
    />
  );

  const filters = (
    <MapFilterBar
      kinds={kinds}
      kind={kind}
      onKind={(next) => {
        setKind(next);
        setSelectedId(null);
        syncUrl(viewRef.current, next);
      }}
      onLocate={locate}
      query={query}
      onQuery={setQuery}
    />
  );

  if (isDesktop) {
    return (
      <YandexMapProvider>
        <div className="mx-auto max-w-[1348px] px-4 py-4">
          <div className="grid grid-cols-[380px_1fr] gap-4">
            <div className="flex max-h-[calc(100vh-180px)] flex-col">
              <div className="mb-3">{filters}</div>
              <p className="mb-2 text-sm font-semibold">
                Найдено {filtered.length} {plural(filtered.length)}
                {demo ? <span className="font-normal text-muted-foreground"> (DEMO)</span> : null}
              </p>
              {geoError ? <p className="mb-2 text-xs text-destructive">{geoError}</p> : null}
              <div className="min-h-0 flex-1 overflow-y-auto pr-1">{resultsList}</div>
            </div>
            <div className="relative h-[calc(100vh-180px)] overflow-hidden rounded-2xl border border-border">
              {canvas}
              <div className="absolute top-3 right-3 z-10">
                <MapControls
                  onZoomIn={() => handleRef.current?.zoomBy(1)}
                  onZoomOut={() => handleRef.current?.zoomBy(-1)}
                  onLocate={locate}
                  onToggleType={() => {
                    const next = !satellite;
                    setSatellite(next);
                    handleRef.current?.setScheme(next);
                  }}
                />
              </div>
              {selected ? (
                <div className="absolute right-3 bottom-3 left-3 z-10 max-w-md">
                  <MapListingPreview point={selected} onClose={() => setSelectedId(null)} />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </YandexMapProvider>
    );
  }

  return (
    <YandexMapProvider>
      <div className="fixed inset-x-0 top-0 bottom-0 z-30 pb-[calc(4.75rem+env(safe-area-inset-bottom))] lg:pb-0 flex flex-col bg-white lg:static lg:inset-auto lg:z-0 lg:bg-transparent">
        <div className="z-10 shrink-0 border-b border-border bg-white px-3 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2">
          <div className="mb-2 flex items-center gap-2">
            <Link href="/catalog" className="flex h-10 shrink-0 items-center gap-1 text-[14px] font-medium text-foreground">
              ← Назад
            </Link>
            <p className="min-w-0 flex-1 truncate text-center text-[13px] font-semibold text-foreground">Карта</p>
            <MapListToggle list={mobileList} onToggle={() => setMobileList((value) => !value)} />
          </div>
          {filters}
          {geoError ? <p className="mt-1 text-xs text-destructive">{geoError}</p> : null}
        </div>
        <div className="relative min-h-0 flex-1">
          {mobileList ? (
            <div className="absolute inset-0 z-20 overflow-y-auto bg-white p-3">{resultsList}</div>
          ) : (
            <>
              {canvas}
              {sheet !== "expanded" ? (
                <div className="absolute top-3 right-3 z-10">
                  <MapControls
                    onZoomIn={() => handleRef.current?.zoomBy(1)}
                    onZoomOut={() => handleRef.current?.zoomBy(-1)}
                    onLocate={locate}
                    onToggleType={() => {
                      const next = !satellite;
                      setSatellite(next);
                      handleRef.current?.setScheme(next);
                    }}
                  />
                </div>
              ) : null}
              <div className="absolute top-3 left-3 z-10">
                <MapSearchArea
                  count={filtered.length}
                  visible={areaPrompt}
                  onSearch={() => {
                    setSearchInView(true);
                    setAreaPrompt(false);
                  }}
                />
              </div>
              {selected && sheet === "collapsed" ? (
                <div className="absolute inset-x-3 bottom-[7.5rem] z-10">
                  <MapListingPreview point={selected} onClose={() => setSelectedId(null)} />
                </div>
              ) : null}
              <MapResultsSheet state={sheet} onState={setSheet} count={filtered.length} demo={demo}>
                {resultsList}
              </MapResultsSheet>
            </>
          )}
        </div>
      </div>
    </YandexMapProvider>
  );
}

function ResultCard({ point, active, onSelect }: { point: MapPoint; active: boolean; onSelect: () => void }) {
  return (
    <div className={cn("flex gap-3 rounded-xl border bg-white p-2", active ? "border-primary ring-1 ring-primary" : "border-border")}>
      <button type="button" onClick={onSelect} className="flex min-w-0 flex-1 gap-3 text-left">
        <span className="relative block size-[72px] shrink-0 overflow-hidden rounded-lg bg-tile">
          {point.media ? <ListingImage src={point.media.src} alt={point.media.alt} sizes="72px" /> : null}
        </span>
        <span className="min-w-0 flex-1">
          <span className="rounded bg-foreground/80 px-1 py-0.5 text-[9px] font-semibold tracking-wide text-white">DEMO</span>
          <span className="mt-0.5 line-clamp-2 block text-[14px] leading-[18px] text-foreground">{point.title}</span>
          <span className="mt-0.5 block text-[15px] font-bold">{point.priceShort}</span>
          <span className="block truncate text-[12px] text-muted-foreground">{point.place}</span>
        </span>
      </button>
      <Link href={`/samples/${point.slug}`} className="self-center rounded-lg bg-tile px-3 py-2 text-[12px] font-medium text-primary">
        Открыть
      </Link>
    </div>
  );
}
