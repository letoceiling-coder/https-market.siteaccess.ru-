"use client";

import { useMemo, useSyncExternalStore } from "react";

const snapshots = new Map<string, string>();

function subscribe(onStoreChange: () => void) {
  window.addEventListener("hh-storage", onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener("hh-storage", onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function snapshot(key: string) {
  const raw = localStorage.getItem(key) ?? "[]";
  const previous = snapshots.get(key);
  if (previous === raw) return previous;
  snapshots.set(key, raw);
  return raw;
}

function publish(key: string, raw: string) {
  localStorage.setItem(key, raw);
  snapshots.set(key, raw);
  window.dispatchEvent(new Event("hh-storage"));
}

export function useClientReady() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function useStoredJson<T>(key: string, parse: (raw: string) => T, fallback: T) {
  const ready = useClientReady();
  const raw = useSyncExternalStore(subscribe, () => snapshot(key), () => "[]");
  const value = useMemo(() => parse(raw), [parse, raw]);
  return { ready, value: ready ? value : fallback };
}

export function useStoredIds(key: string) {
  const stored = useStoredJson(key, parseIds, [] as string[]);

  function toggle(id: string) {
    const next = stored.value.includes(id) ? stored.value.filter((item) => item !== id) : [...stored.value, id];
    publish(key, JSON.stringify(next));
  }

  return {
    ids: stored.value,
    ready: stored.ready,
    toggle,
    has: (id: string) => stored.value.includes(id),
  };
}

export function readIds(key: string) {
  if (typeof window === "undefined") return [];
  return parseIds(localStorage.getItem(key) ?? "[]");
}

export function rememberRecent(id: string) {
  const next = [id, ...readIds("hh.recent").filter((item) => item !== id)].slice(0, 8);
  publish("hh.recent", JSON.stringify(next));
}

function parseIds(raw: string) {
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}
