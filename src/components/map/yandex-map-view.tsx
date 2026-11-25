"use client";

import { useEffect, useRef, useState } from "react";
import { createClusterElement } from "@/components/map/map-cluster";
import { markerHtml } from "@/components/map/map-listing-marker";
import { MapSetupState } from "@/components/map/map-setup-state";
import { fromYandexCoords, hasYandexMapsKey, loadYandexMaps, toYandexCoords, YANDEX_MAPS_KEY, type LngLat } from "@/lib/yandex-maps";
import type { MapPoint } from "@/services/map-data";

export type MapView = { lat: number; lng: number; zoom: number };
export type MapBounds = { south: number; west: number; north: number; east: number };

type MapHandle = {
  setLocation: (view: MapView, duration?: number) => void;
  zoomBy: (delta: number) => void;
  setScheme: (satellite: boolean) => void;
};

export function YandexMapView({
  points,
  selectedId,
  initialView,
  flyTo,
  onSelect,
  onMoved,
  onReady,
}: {
  points: MapPoint[];
  selectedId: string | null;
  initialView: MapView;
  flyTo?: (MapView & { nonce: number }) | null;
  onSelect: (id: string) => void;
  onMoved: (view: MapView, bounds: MapBounds) => void;
  onReady?: (handle: MapHandle) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const apiRef = useRef<any>(null);
  const clustererRef = useRef<any>(null);
  const schemeRef = useRef<any>(null);
  const satelliteRef = useRef<any>(null);
  const usingSatellite = useRef(false);
  const onSelectRef = useRef(onSelect);
  const onMovedRef = useRef(onMoved);
  const [loadError, setLoadError] = useState(false);
  onSelectRef.current = onSelect;
  onMovedRef.current = onMoved;

  useEffect(() => {
    if (!hasYandexMapsKey || !containerRef.current) return;
    let disposed = false;
    loadYandexMaps(YANDEX_MAPS_KEY)
      .then(async (readyApi) => {
        if (disposed) return;
        setLoadError(false);
        if (disposed || !containerRef.current || mapRef.current) return;
        const ymaps3 = readyApi as any;
        apiRef.current = ymaps3;
        const {
          YMap,
          YMapDefaultSchemeLayer,
          YMapDefaultFeaturesLayer,
          YMapListener,
          YMapDefaultSatelliteLayer,
        } = ymaps3;
        const map = new YMap(containerRef.current, {
          location: {
            center: toYandexCoords(initialView.lat, initialView.lng),
            zoom: initialView.zoom,
          },
        });
        schemeRef.current = new YMapDefaultSchemeLayer();
        map.addChild(schemeRef.current);
        map.addChild(new YMapDefaultFeaturesLayer());
        if (YMapDefaultSatelliteLayer) satelliteRef.current = new YMapDefaultSatelliteLayer();
        let timer: ReturnType<typeof setTimeout> | null = null;
        map.addChild(
          new YMapListener({
            onUpdate: ({ location }: { location?: { center: LngLat; zoom: number } }) => {
              if (!location) return;
              if (timer) clearTimeout(timer);
              timer = setTimeout(() => {
                const center = fromYandexCoords(location.center);
                const bounds = readBounds(map);
                onMovedRef.current({ ...center, zoom: location.zoom }, bounds);
              }, 400);
            },
          }),
        );
        mapRef.current = map;
        await attachClusterer(ymaps3, map, points, selectedId, (id) => onSelectRef.current(id));
        onReady?.({
          setLocation: (view, duration = 300) => {
            map.update({ location: { center: toYandexCoords(view.lat, view.lng), zoom: view.zoom, duration } });
          },
          zoomBy: (delta) => {
            const zoom = (map.zoom ?? initialView.zoom) + delta;
            map.update({ location: { zoom, duration: 200 } });
          },
          setScheme: (satellite) => {
            if (!satelliteRef.current) return;
            if (satellite === usingSatellite.current) return;
            usingSatellite.current = satellite;
            if (satellite) {
              map.removeChild(schemeRef.current);
              map.addChild(satelliteRef.current);
            } else {
              map.removeChild(satelliteRef.current);
              map.addChild(schemeRef.current);
            }
          },
        });
      })
      .catch(() => {
        mapRef.current = null;
        if (!disposed) setLoadError(true);
      });
    return () => {
      disposed = true;
      if (mapRef.current?.destroy) mapRef.current.destroy();
      mapRef.current = null;
      clustererRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const ymaps3 = apiRef.current;
    const map = mapRef.current;
    if (!ymaps3 || !map) return;
    attachClusterer(ymaps3, map, points, selectedId, (id) => onSelectRef.current(id));
  }, [points, selectedId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !flyTo) return;
    map.update({ location: { center: toYandexCoords(flyTo.lat, flyTo.lng), zoom: flyTo.zoom, duration: 400 } });
  }, [flyTo?.nonce]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId) return;
    const point = points.find((item) => item.id === selectedId);
    if (point) map.update({ location: { center: toYandexCoords(point.lat, point.lng), duration: 250 } });
  }, [selectedId, points]);

  if (!hasYandexMapsKey) return <MapSetupState compact />;
  if (loadError) return <MapSetupState compact reason="rejected" />;

  return <div ref={containerRef} className="h-full w-full" role="application" aria-label="Интерактивная карта объявлений" />;
}

async function attachClusterer(ymaps3: any, map: any, points: MapPoint[], selectedId: string | null, onSelect: (id: string) => void) {
  const { YMapMarker } = ymaps3;
  const clusterPkg = await ymaps3.import("@yandex/ymaps3-clusterer");
  const { YMapClusterer, clusterByGrid } = clusterPkg;
  if (map.__hhClusterer) {
    map.removeChild(map.__hhClusterer);
    map.__hhClusterer = null;
  }
  const features = points.map((point) => ({
    type: "Feature",
    id: point.id,
    geometry: { type: "Point", coordinates: toYandexCoords(point.lat, point.lng) },
    properties: point,
  }));
  const clusterer = new YMapClusterer({
    method: clusterByGrid({ gridSize: 64 }),
    features,
    marker: (feature: { id: string; geometry: { coordinates: LngLat }; properties: MapPoint }) => {
      const node = document.createElement("div");
      node.innerHTML = markerHtml(feature.properties, feature.id === selectedId);
      const button = node.firstElementChild as HTMLElement;
      button.addEventListener("click", () => onSelect(feature.id));
      return new YMapMarker({ coordinates: feature.geometry.coordinates }, button);
    },
    cluster: (coordinates: LngLat, clustered: { length: number }[]) =>
      new YMapMarker({ coordinates }, createClusterElement(clustered.length)),
  });
  map.addChild(clusterer);
  map.__hhClusterer = clusterer;
}

function readBounds(map: any): MapBounds {
  const bounds = map.bounds ?? map.location?.bounds;
  if (bounds?.[0] && bounds?.[1]) {
    const sw = fromYandexCoords(bounds[0]);
    const ne = fromYandexCoords(bounds[1]);
    return {
      south: Math.min(sw.lat, ne.lat),
      west: Math.min(sw.lng, ne.lng),
      north: Math.max(sw.lat, ne.lat),
      east: Math.max(sw.lng, ne.lng),
    };
  }
  const center = fromYandexCoords(map.center ?? [90, 61.5]);
  return { south: center.lat - 1, west: center.lng - 1, north: center.lat + 1, east: center.lng + 1 };
}
