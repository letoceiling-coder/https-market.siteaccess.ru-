"use client";

import "leaflet/dist/leaflet.css";
import type * as L from "leaflet";
import { useEffect, useRef } from "react";
import type { MapPoint } from "@/services/map-data";

type View = { lat: number; lng: number; zoom: number };

/**
 * The actual Leaflet instance. Loaded only through next/dynamic (ssr:false) from
 * MapScreen, so the Leaflet SDK never ships on pages that don't need it.
 * Markers are custom price pills (divIcon), which also sidesteps the bundler
 * image-path issue with Leaflet's default icons.
 */
export default function MapCanvas({
  points,
  selectedId,
  initialView,
  flyTo,
  onSelect,
  onMoved,
}: {
  points: MapPoint[];
  selectedId: string | null;
  initialView: View;
  flyTo?: (View & { nonce: number }) | null;
  onSelect: (id: string) => void;
  onMoved: (view: View) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const leafletRef = useRef<typeof L | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const onSelectRef = useRef(onSelect);
  const onMovedRef = useRef(onMoved);
  onSelectRef.current = onSelect;
  onMovedRef.current = onMoved;

  // Create the map once.
  useEffect(() => {
    let disposed = false;
    const markers = markersRef.current;
    import("leaflet").then((mod) => {
      if (disposed || !containerRef.current || mapRef.current) return;
      const leaflet = mod.default ?? (mod as unknown as typeof L);
      leafletRef.current = leaflet;
      const map = leaflet.map(containerRef.current, { zoomControl: true, attributionControl: true }).setView(
        [initialView.lat, initialView.lng],
        initialView.zoom,
      );
      leaflet
        .tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        })
        .addTo(map);
      let timer: ReturnType<typeof setTimeout> | null = null;
      map.on("moveend", () => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          const c = map.getCenter();
          onMovedRef.current({ lat: c.lat, lng: c.lng, zoom: map.getZoom() });
        }, 400);
      });
      mapRef.current = map;
      // Invalidate once after mount so tiles fill the container.
      setTimeout(() => map.invalidateSize(), 50);
      renderMarkers();
    });
    return () => {
      disposed = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markers.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function renderMarkers() {
    const leaflet = leafletRef.current;
    const map = mapRef.current;
    if (!leaflet || !map) return;
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();
    points.forEach((point) => {
      const selected = point.id === selectedId;
      const icon = leaflet.divIcon({
        className: "",
        html: `<span class="hh-pin ${selected ? "hh-pin-active" : ""}">${point.priceShort}</span>`,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });
      const marker = leaflet.marker([point.lat, point.lng], { icon, title: point.title }).addTo(map);
      marker.on("click", () => onSelectRef.current(point.id));
      markersRef.current.set(point.id, marker);
    });
  }

  // Re-render markers when points or selection change.
  useEffect(() => {
    renderMarkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, selectedId]);

  // Imperative recenter (geolocation / reset).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !flyTo) return;
    map.flyTo([flyTo.lat, flyTo.lng], flyTo.zoom, { animate: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flyTo?.nonce]);

  // Keep tiles sized correctly when the container is shown/resized.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const timer = setTimeout(() => map.invalidateSize(), 60);
    return () => clearTimeout(timer);
  }, [points.length]);

  // Pan to the selected point.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId) return;
    const point = points.find((item) => item.id === selectedId);
    if (point) map.panTo([point.lat, point.lng], { animate: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  return <div ref={containerRef} className="h-full w-full" role="application" aria-label="Интерактивная карта объявлений" />;
}
